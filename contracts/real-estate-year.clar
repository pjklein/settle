;; =============================================================================
;; REAL ESTATE YEAR CONTRACT - Layer 3
;; =============================================================================
;; Year contract manages individual transaction contracts, escrow pools,
;; and year-end settlement for a specific jurisdiction year.
;; =============================================================================

;; Error codes
(define-constant ERR-NOT-OWNER (err u700))
(define-constant ERR-ALREADY-EXISTS (err u701))
(define-constant ERR-NOT-FOUND (err u702))
(define-constant ERR-INVALID-TRANSACTION (err u703))
(define-constant ERR-UNAUTHORIZED (err u704))
(define-constant ERR-INSUFFICIENT-FUNDS (err u705))
(define-constant ERR-YEAR-FINALIZED (err u706))
(define-constant ERR-INVALID-CURRENCY (err u707))

;; Constants
(define-constant CURRENCY-STX "STX")
(define-constant CURRENCY-SBTC "sBTC")
(define-constant CURRENCY-USDH "USDh")

;; Contract owner
(define-data-var contract-owner principal tx-sender)

;; Year identification
(define-data-var jurisdiction-code (string-ascii 16) "")
(define-data-var year uint u0)
(define-data-var parent-jurisdiction (optional principal) none)

;; Transaction contract tracking
(define-map transaction-contracts
  uint
  principal
)

;; Transaction metadata
(define-map transaction-metadata
  uint
  {
    transaction-id: uint,
    contract-address: principal,
    property-id: (string-ascii 128),
    seller: principal,
    buyer: (optional principal),
    purchase-price: uint,
    state: (string-ascii 32),
    creation-height: uint,
    completion-height: (optional uint),
    status: (string-ascii 16)
  }
)

;; Escrow pools per currency
(define-map escrow-pools
  (string-ascii 10)
  uint
)

;; Statistics
(define-data-var next-transaction-id uint u1)
(define-data-var transaction-count uint u0)
(define-data-var pending-transactions uint u0)
(define-data-var completed-transactions uint u0)
(define-data-var disputed-transactions uint u0)
(define-data-var total-volume uint u0)
(define-data-var average-days-to-close uint u30)
(define-data-var finalized bool false)

;; Track transaction IDs for enumeration
(define-data-var next-tx-index uint u0)
(define-map transaction-index
  uint
  uint
)

;; =============================================================================
;; INITIALIZATION
;; =============================================================================

(define-public (initialize
  (code (string-ascii 16))
  (y uint)
  (parent-principal (optional principal)))
  
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-NOT-OWNER)
    (asserts! (is-eq (var-get jurisdiction-code) "") ERR-ALREADY-EXISTS)
    (asserts! (>= y u2000) ERR-INVALID-TRANSACTION)
    
    (var-set jurisdiction-code code)
    (var-set year y)
    (var-set parent-jurisdiction parent-principal)
    
    (ok true)))

;; =============================================================================
;; TRANSACTION MANAGEMENT
;; =============================================================================

(define-public (create-transaction-contract
  (seller principal)
  (property-id (string-ascii 128))
  (purchase-price uint)
  (transaction-contract-address principal))
  
  (begin
    (asserts! (not (var-get finalized)) ERR-YEAR-FINALIZED)
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-NOT-OWNER)
    (asserts! (> purchase-price u0) ERR-INVALID-TRANSACTION)
    
    (let ((tx-id (var-get next-transaction-id)))
      ;; Register transaction contract
      (map-set transaction-contracts tx-id transaction-contract-address)
      
      ;; Store transaction metadata
      (map-set transaction-metadata
        tx-id
        {
          transaction-id: tx-id,
          contract-address: transaction-contract-address,
          property-id: property-id,
          seller: seller,
          buyer: none,
          purchase-price: purchase-price,
          state: "listing",
          creation-height: block-height,
          completion-height: none,
          status: "active"
        }
      )
      
      ;; Add to transaction index
      (map-set transaction-index
        (var-get next-tx-index)
        tx-id
      )
      (var-set next-tx-index (+ (var-get next-tx-index) u1))
      
      ;; Update counters
      (var-set transaction-count (+ (var-get transaction-count) u1))
      (var-set pending-transactions (+ (var-get pending-transactions) u1))
      (var-set next-transaction-id (+ tx-id u1))
      (var-set total-volume (+ (var-get total-volume) purchase-price))
      
      (ok tx-id)
    )
  )
)

(define-public (register-transaction
  (transaction-id uint)
  (contract-address principal))
  
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-NOT-OWNER)
    (asserts! (is-none (map-get? transaction-contracts transaction-id)) ERR-ALREADY-EXISTS)
    
    (map-set transaction-contracts transaction-id contract-address)
    (ok true)))

(define-public (update-transaction-status
  (transaction-id uint)
  (new-state (string-ascii 32))
  (new-status (string-ascii 16))
  (buyer (optional principal)))
  
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-NOT-OWNER)
    
    (match (map-get? transaction-metadata transaction-id)
      metadata (begin
        ;; Update pending/completed counts based on state change
        (if (is-eq (get state metadata) "pending")
            (var-set pending-transactions (- (var-get pending-transactions) u1))
            true
        )
        
        (if (is-eq new-state "completed")
            (begin
              (var-set completed-transactions (+ (var-get completed-transactions) u1))
              (var-set pending-transactions (- (var-get pending-transactions) u1))
            )
            true
        )
        
        (if (is-eq new-state "disputed")
            (var-set disputed-transactions (+ (var-get disputed-transactions) u1))
            true
        )
        
        ;; Update metadata
        (map-set transaction-metadata
          transaction-id
          (merge metadata {
            state: new-state,
            status: new-status,
            buyer: (match buyer buyer-addr (some buyer-addr) (get buyer metadata)),
            completion-height: (if (is-eq new-state "completed")
                                (some block-height)
                                (get completion-height metadata))
          })
        )
        
        (ok true)
      )
      ERR-NOT-FOUND
    )
  )
)

;; =============================================================================
;; ESCROW POOL MANAGEMENT
;; =============================================================================

(define-public (deposit-escrow-funds
  (amount uint)
  (currency (string-ascii 10)))
  
  (begin
    (asserts! (not (var-get finalized)) ERR-YEAR-FINALIZED)
    (asserts! (> amount u0) ERR-INSUFFICIENT-FUNDS)
    (asserts! (or (is-eq currency CURRENCY-STX)
                  (is-eq currency CURRENCY-SBTC)
                  (is-eq currency CURRENCY-USDH)) ERR-INVALID-CURRENCY)
    
    ;; Transfer STX from sender
    (if (is-eq currency CURRENCY-STX)
        (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
        true
    )
    
    ;; Update pool balance
    (let ((current-balance (default-to u0 (map-get? escrow-pools currency))))
      (map-set escrow-pools currency (+ current-balance amount))
    )
    
    (ok true)))

(define-public (withdraw-escrow-funds
  (amount uint)
  (currency (string-ascii 10))
  (recipient principal))
  
  (begin
    (asserts! (not (var-get finalized)) ERR-YEAR-FINALIZED)
    (asserts! (> amount u0) ERR-INSUFFICIENT-FUNDS)
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-NOT-OWNER)
    
    (let ((current-balance (default-to u0 (map-get? escrow-pools currency))))
      (asserts! (>= current-balance amount) ERR-INSUFFICIENT-FUNDS)
      
      ;; Transfer STX to recipient
      (if (is-eq currency CURRENCY-STX)
          (try! (as-contract (stx-transfer? amount (as-contract tx-sender) recipient)))
          true
      )
      
      ;; Update pool balance
      (map-set escrow-pools currency (- current-balance amount))
      
      (ok true)
    )
  )
)

;; =============================================================================
;; YEAR-END SETTLEMENT
;; =============================================================================

(define-public (finalize-year)
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-NOT-OWNER)
    (asserts! (not (var-get finalized)) ERR-YEAR-FINALIZED)
    
    ;; Mark year as finalized
    (var-set finalized true)
    
    (ok {
      jurisdiction-code: (var-get jurisdiction-code),
      year: (var-get year),
      total-transactions: (var-get transaction-count),
      completed-transactions: (var-get completed-transactions),
      disputed-transactions: (var-get disputed-transactions),
      total-volume: (var-get total-volume),
      average-days-to-close: (var-get average-days-to-close),
      finalization-height: block-height
    })))

;; =============================================================================
;; READ-ONLY FUNCTIONS
;; =============================================================================

(define-read-only (get-transaction (transaction-id uint))
  (map-get? transaction-contracts transaction-id))

(define-read-only (get-transaction-metadata (transaction-id uint))
  (map-get? transaction-metadata transaction-id))

(define-read-only (get-all-transactions)
  (ok {
    total-transactions: (var-get transaction-count),
    pending-transactions: (var-get pending-transactions),
    completed-transactions: (var-get completed-transactions),
    disputed-transactions: (var-get disputed-transactions)
  }))

(define-read-only (get-transaction-by-index (index uint))
  (map-get? transaction-index index))

(define-read-only (get-escrow-balance (currency (string-ascii 10)))
  (ok (default-to u0 (map-get? escrow-pools currency))))

(define-read-only (get-year-stats)
  (ok {
    jurisdiction-code: (var-get jurisdiction-code),
    year: (var-get year),
    transaction-count: (var-get transaction-count),
    pending-transactions: (var-get pending-transactions),
    completed-transactions: (var-get completed-transactions),
    disputed-transactions: (var-get disputed-transactions),
    total-volume: (var-get total-volume),
    average-days-to-close: (var-get average-days-to-close),
    finalized: (var-get finalized),
    creation-height: block-height
  }))

(define-read-only (get-escrow-pools)
  (ok {
    stx-balance: (default-to u0 (map-get? escrow-pools CURRENCY-STX)),
    sbtc-balance: (default-to u0 (map-get? escrow-pools CURRENCY-SBTC)),
    usdh-balance: (default-to u0 (map-get? escrow-pools CURRENCY-USDH))
  }))

(define-read-only (get-jurisdiction-code)
  (var-get jurisdiction-code))

(define-read-only (get-year)
  (var-get year))

(define-read-only (is-finalized)
  (var-get finalized))

(define-read-only (get-contract-owner)
  (var-get contract-owner))
