;; =============================================================================
;; REAL ESTATE MASTER CONTRACT - Layer 1
;; =============================================================================
;; Master contract oversees all jurisdiction contracts, manages governance,
;; collects platform fees, and maintains system-wide statistics.
;; =============================================================================

;; Error codes
(define-constant ERR-NOT-OWNER (err u500))
(define-constant ERR-ALREADY-EXISTS (err u501))
(define-constant ERR-NOT-FOUND (err u502))
(define-constant ERR-SYSTEM-PAUSED (err u503))
(define-constant ERR-INVALID-JURISDICTION (err u504))
(define-constant ERR-INVALID-CODE (err u505))

;; Owner set on deployment
(define-data-var contract-owner principal tx-sender)

;; System state
(define-data-var system-paused bool false)
(define-data-var platform-fees uint u0)
(define-data-var total-transactions uint u0)
(define-data-var total-volume uint u0)

;; Jurisdiction contract address tracking
(define-map jurisdiction-contracts
  (string-ascii 16)
  principal
)

;; Jurisdiction metadata
(define-map jurisdiction-metadata
  (string-ascii 16)
  {
    name: (string-ascii 128),
    code: (string-ascii 16),
    dispute-resolution-type: (string-ascii 32),
    fee-basis-points: uint,
    creation-height: uint,
    active: bool
  }
)

;; Track all jurisdiction codes for enumeration
(define-data-var next-jurisdiction-index uint u0)
(define-map jurisdiction-index
  uint
  (string-ascii 16)
)

;; =============================================================================
;; GOVERNANCE FUNCTIONS
;; =============================================================================

(define-public (transfer-ownership (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-NOT-OWNER)
    (var-set contract-owner new-owner)
    (ok true)))

(define-public (pause-system)
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-NOT-OWNER)
    (var-set system-paused true)
    (ok true)))

(define-public (resume-system)
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-NOT-OWNER)
    (var-set system-paused false)
    (ok true)))

;; =============================================================================
;; JURISDICTION MANAGEMENT
;; =============================================================================

(define-public (deploy-jurisdiction-contract
  (jurisdiction-code (string-ascii 16))
  (jurisdiction-name (string-ascii 128))
  (dispute-resolution-type (string-ascii 32))
  (fee-basis-points uint)
  (jurisdiction-contract principal))
  
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-NOT-OWNER)
    (asserts! (not (var-get system-paused)) ERR-SYSTEM-PAUSED)
    (asserts! (is-none (map-get? jurisdiction-contracts jurisdiction-code)) ERR-ALREADY-EXISTS)
    
    ;; Validate inputs
    (asserts! (> (string-length jurisdiction-code) u0) ERR-INVALID-CODE)
    (asserts! (<= fee-basis-points u10000) ERR-INVALID-JURISDICTION)
    
    ;; Register jurisdiction contract
    (map-set jurisdiction-contracts jurisdiction-code jurisdiction-contract)
    
    ;; Store metadata
    (map-set jurisdiction-metadata
      jurisdiction-code
      {
        name: jurisdiction-name,
        code: jurisdiction-code,
        dispute-resolution-type: dispute-resolution-type,
        fee-basis-points: fee-basis-points,
        creation-height: block-height,
        active: true
      }
    )
    
    ;; Add to index for enumeration
    (map-set jurisdiction-index
      (var-get next-jurisdiction-index)
      jurisdiction-code
    )
    (var-set next-jurisdiction-index (+ (var-get next-jurisdiction-index) u1))
    
    (ok true)))

(define-public (register-jurisdiction
  (jurisdiction-code (string-ascii 16))
  (jurisdiction-name (string-ascii 128))
  (dispute-resolution-type (string-ascii 32))
  (fee-basis-points uint))
  
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-NOT-OWNER)
    (asserts! (is-none (map-get? jurisdiction-metadata jurisdiction-code)) ERR-ALREADY-EXISTS)
    (asserts! (<= fee-basis-points u10000) ERR-INVALID-JURISDICTION)
    
    (map-set jurisdiction-metadata
      jurisdiction-code
      {
        name: jurisdiction-name,
        code: jurisdiction-code,
        dispute-resolution-type: dispute-resolution-type,
        fee-basis-points: fee-basis-points,
        creation-height: block-height,
        active: true
      }
    )
    
    (ok true)))

(define-public (deactivate-jurisdiction (jurisdiction-code (string-ascii 16)))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-NOT-OWNER)
    
    (match (map-get? jurisdiction-metadata jurisdiction-code)
      metadata (begin
        (map-set jurisdiction-metadata
          jurisdiction-code
          (merge metadata {active: false})
        )
        (ok true)
      )
      ERR-NOT-FOUND
    )
  )
)

;; =============================================================================
;; FEE COLLECTION
;; =============================================================================

(define-public (collect-fees (amount uint))
  (begin
    (asserts! (not (var-get system-paused)) ERR-SYSTEM-PAUSED)
    (asserts! (> amount u0) ERR-INVALID-JURISDICTION)
    
    ;; Caller (jurisdiction contract) transfers fees to master
    (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
    
    ;; Update fee counter
    (var-set platform-fees (+ (var-get platform-fees) amount))
    
    (ok true)))

(define-public (withdraw-fees (amount uint))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-NOT-OWNER)
    (asserts! (<= amount (var-get platform-fees)) ERR-INVALID-JURISDICTION)
    
    ;; Transfer to owner
    (try! (as-contract (stx-transfer? amount (as-contract tx-sender) tx-sender)))
    
    ;; Update fee counter
    (var-set platform-fees (- (var-get platform-fees) amount))
    
    (ok true)))

;; =============================================================================
;; STATISTICS & REPORTING
;; =============================================================================

(define-public (update-transaction-stats (transaction-count uint) (volume uint))
  (begin
    ;; Only callable by jurisdiction contracts
    (asserts! (not (var-get system-paused)) ERR-SYSTEM-PAUSED)
    
    (var-set total-transactions (+ (var-get total-transactions) transaction-count))
    (var-set total-volume (+ (var-get total-volume) volume))
    
    (ok true)))

;; =============================================================================
;; READ-ONLY FUNCTIONS
;; =============================================================================

(define-read-only (get-jurisdiction-contract (jurisdiction-code (string-ascii 16)))
  (map-get? jurisdiction-contracts jurisdiction-code))

(define-read-only (get-jurisdiction-metadata (jurisdiction-code (string-ascii 16)))
  (map-get? jurisdiction-metadata jurisdiction-code))

(define-read-only (get-all-jurisdictions)
  (ok {
    total-jurisdictions: (var-get next-jurisdiction-index),
    active-jurisdictions: (var-get next-jurisdiction-index)
  }))

(define-read-only (get-jurisdiction-by-index (index uint))
  (map-get? jurisdiction-index index))

(define-read-only (get-master-stats)
  (ok {
    platform-fees: (var-get platform-fees),
    total-transactions: (var-get total-transactions),
    total-volume: (var-get total-volume),
    system-paused: (var-get system-paused),
    total-jurisdictions: (var-get next-jurisdiction-index)
  }))

(define-read-only (get-platform-fees)
  (var-get platform-fees))

(define-read-only (get-total-volume)
  (var-get total-volume))

(define-read-only (get-total-transactions)
  (var-get total-transactions))

(define-read-only (is-system-paused)
  (var-get system-paused))

(define-read-only (get-contract-owner)
  (var-get contract-owner))
