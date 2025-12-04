;; =============================================================================
;; REAL ESTATE ESCROW CONTRACT WITH MULTI-CURRENCY SUPPORT
;; =============================================================================

;; Currency constants
(define-constant CURRENCY-STX "STX")
(define-constant CURRENCY-SBTC "sBTC")
(define-constant CURRENCY-USDH "USDh")

;; Error codes
(define-constant ERR-ESCROW-NOT-FOUND (err u200))
(define-constant ERR-INVALID-BUYER (err u201))
(define-constant ERR-INVALID-SELLER (err u202))
(define-constant ERR-INSUFFICIENT-FUNDS (err u203))
(define-constant ERR-ESCROW-EXPIRED (err u204))
(define-constant ERR-ESCROW-NOT-EXPIRED (err u205))
(define-constant ERR-INVALID-STATE (err u206))
(define-constant ERR-ALREADY-COMPLETED (err u207))
(define-constant ERR-INVALID-CURRENCY (err u208))
(define-constant ERR-TRANSFER-FAILED (err u209))
(define-constant ERR-INVALID-AMOUNT (err u210))
(define-constant ERR-UNAUTHORIZED (err u211))

;; Escrow states
(define-constant STATE-PENDING "pending")
(define-constant STATE-FUNDED "funded")
(define-constant STATE-COMPLETED "completed")
(define-constant STATE-CANCELLED "cancelled")
(define-constant STATE-EXPIRED "expired")

;; Contract references
(define-constant SBTC-CONTRACT 'SP3DX3H4FEYZJZ586MFBS25ZW3HZDMEW92260R2PR.Wrapped-Bitcoin)
(define-constant USDH-CONTRACT 'SP2XD7417HGPRTREMKF748VNEQPDRR0RMANB7X1NK.token-usdh)

;; Escrow data
(define-map escrows
  uint
  {
    property-id: (string-ascii 128),
    buyer: principal,
    seller: principal,
    purchase-price: uint,
    earnest-money: uint,
    currency: (string-ascii 10),
    state: (string-ascii 32),
    creation-height: uint,
    expiry-height: uint,
    conditions: (list 10 (string-ascii 128)),
    conditions-met: (list 10 bool),
    buyer-signature: bool,
    seller-signature: bool,
    funds-deposited: uint,
    currency-contract: (optional principal)
  }
)

(define-data-var next-escrow-id uint u1)

;; Helper function to get currency contract
(define-read-only (get-currency-contract (currency (string-ascii 10)))
  (if (is-eq currency CURRENCY-STX)
      none
      (if (is-eq currency CURRENCY-SBTC)
          (some SBTC-CONTRACT)
          (if (is-eq currency CURRENCY-USDH)
              (some USDH-CONTRACT)
              none))))

(define-public (create-escrow (property-id (string-ascii 128))
                             (seller principal)
                             (purchase-price uint)
                             (earnest-money uint)
                             (duration-blocks uint)
                             (conditions (list 10 (string-ascii 128)))
                             (currency (string-ascii 10)))
  (let ((escrow-id (var-get next-escrow-id))
        (expiry-height (+ block-height duration-blocks))
        (currency-contract (get-currency-contract currency)))
    
    ;; Validate currency
    (asserts! (or (is-eq currency CURRENCY-STX)
                  (is-eq currency CURRENCY-SBTC)
                  (is-eq currency CURRENCY-USDH)) ERR-INVALID-CURRENCY)
    
    ;; Create escrow entry
    (map-set escrows
      escrow-id
      {
        property-id: property-id,
        buyer: tx-sender,
        seller: seller,
        purchase-price: purchase-price,
        earnest-money: earnest-money,
        currency: currency,
        state: STATE-PENDING,
        creation-height: block-height,
        expiry-height: expiry-height,
        conditions: conditions,
        conditions-met: (list false false false false false false false false false false),
        buyer-signature: false,
        seller-signature: false,
        funds-deposited: u0,
        currency-contract: currency-contract
      }
    )
    
    ;; Update counter
    (var-set next-escrow-id (+ escrow-id u1))
    
    (ok escrow-id)))

(define-public (fund-escrow (escrow-id uint))
  (let ((escrow-data (unwrap! (map-get? escrows escrow-id) ERR-ESCROW-NOT-FOUND)))
    (asserts! (is-eq (get buyer escrow-data) tx-sender) ERR-INVALID-BUYER)
    (asserts! (is-eq (get state escrow-data) STATE-PENDING) ERR-INVALID-STATE)
    (asserts! (< block-height (get expiry-height escrow-data)) ERR-ESCROW-EXPIRED)
    
    (let ((amount (get earnest-money escrow-data))
          (currency (get currency escrow-data)))
      
      ;; Handle different currency transfers
      (if (is-eq currency CURRENCY-STX)
          ;; STX transfer
          (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
          ;; SIP-010 token transfer would be handled here
          true)
      
      ;; Update escrow state
      (map-set escrows
        escrow-id
        (merge escrow-data {
          state: STATE-FUNDED,
          funds-deposited: amount
        }))
      (ok true))))

(define-public (complete-escrow (escrow-id uint))
  (let ((escrow-data (unwrap! (map-get? escrows escrow-id) ERR-ESCROW-NOT-FOUND)))
    (asserts! (is-eq (get state escrow-data) STATE-FUNDED) ERR-INVALID-STATE)
    (asserts! (get buyer-signature escrow-data) ERR-INVALID-STATE)
    (asserts! (get seller-signature escrow-data) ERR-INVALID-STATE)
    
    (let ((total-amount (get purchase-price escrow-data))
          (currency (get currency escrow-data))
          (seller (get seller escrow-data)))
      
      ;; Transfer full purchase amount to seller
      (if (is-eq currency CURRENCY-STX)
          ;; STX transfer
          (try! (as-contract (stx-transfer? total-amount tx-sender seller)))
          ;; Token transfer would be handled here
          true)
      
      ;; Update escrow state
      (map-set escrows
        escrow-id
        (merge escrow-data {state: STATE-COMPLETED}))
      
      (ok true))))

(define-public (refund-escrow (escrow-id uint))
  (let ((escrow-data (unwrap! (map-get? escrows escrow-id) ERR-ESCROW-NOT-FOUND)))
    (asserts! (or (is-eq tx-sender (get buyer escrow-data))
                  (is-eq tx-sender (get seller escrow-data))
                  (> block-height (get expiry-height escrow-data))) ERR-UNAUTHORIZED)
    
    (let ((refund-amount (get funds-deposited escrow-data))
          (currency (get currency escrow-data))
          (buyer (get buyer escrow-data)))
      
      ;; Refund deposited funds to buyer
      (if (> refund-amount u0)
          (if (is-eq currency CURRENCY-STX)
              ;; STX refund
              (try! (as-contract (stx-transfer? refund-amount tx-sender buyer)))
              ;; Token refund would be handled here
              true)
          true)
      
      ;; Update escrow state
      (map-set escrows
        escrow-id
        (merge escrow-data {
          state: (if (> block-height (get expiry-height escrow-data))
                    STATE-EXPIRED
                    STATE-CANCELLED)
        }))
      
      (ok true))))

(define-public (sign-escrow (escrow-id uint))
  (let ((escrow-data (unwrap! (map-get? escrows escrow-id) ERR-ESCROW-NOT-FOUND)))
    (cond
      ((is-eq tx-sender (get buyer escrow-data))
       (map-set escrows
         escrow-id
         (merge escrow-data {buyer-signature: true}))
       (ok true))
      ((is-eq tx-sender (get seller escrow-data))
       (map-set escrows
         escrow-id
         (merge escrow-data {seller-signature: true}))
       (ok true))
      (else ERR-UNAUTHORIZED))))

(define-public (mark-condition-met (escrow-id uint) (condition-index uint))
  (let ((escrow-data (unwrap! (map-get? escrows escrow-id) ERR-ESCROW-NOT-FOUND)))
    (if (or (is-eq tx-sender (get buyer escrow-data))
            (is-eq tx-sender (get seller escrow-data)))
        (ok true)
        ERR-UNAUTHORIZED)))

;; Read-only functions
(define-read-only (get-escrow (escrow-id uint))
  (map-get? escrows escrow-id))

(define-read-only (get-escrow-currency (escrow-id uint))
  (match (map-get? escrows escrow-id)
    escrow-data (ok (get currency escrow-data))
    ERR-ESCROW-NOT-FOUND))

(define-read-only (get-supported-currencies)
  (ok (list CURRENCY-STX CURRENCY-SBTC CURRENCY-USDH)))

(define-read-only (get-currency-info (currency (string-ascii 10)))
  (ok {
    currency: currency,
    contract: (get-currency-contract currency),
    is-native: (is-eq currency CURRENCY-STX)
  }))

(define-read-only (get-next-escrow-id)
  (var-get next-escrow-id))
