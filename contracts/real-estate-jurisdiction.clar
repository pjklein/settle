;; =============================================================================
;; REAL ESTATE JURISDICTION CONTRACT - Layer 2
;; =============================================================================
;; Jurisdiction contract manages year-specific contracts, jurisdiction-level
;; settings, and maintains cumulative statistics for a jurisdiction.
;; =============================================================================

;; Error codes
(define-constant ERR-NOT-OWNER (err u600))
(define-constant ERR-ALREADY-EXISTS (err u601))
(define-constant ERR-NOT-FOUND (err u602))
(define-constant ERR-INVALID-YEAR (err u603))
(define-constant ERR-UNAUTHORIZED (err u604))

;; Contract owner (set by deployer)
(define-data-var contract-owner principal tx-sender)

;; Jurisdiction identification
(define-data-var jurisdiction-code (string-ascii 16) "")
(define-data-var jurisdiction-name (string-ascii 128) "")
(define-data-var master-contract (optional principal) none)

;; Settings
(define-data-var fee-basis-points uint u100)
(define-data-var dispute-resolution-type (string-ascii 32) "mediation")

;; Year-specific contract tracking
(define-map year-contracts
  uint
  principal
)

;; Year contract metadata
(define-map year-metadata
  uint
  {
    year: uint,
    contract-address: principal,
    creation-height: uint,
    active: bool,
    transaction-count: uint,
    completed-transactions: uint,
    disputed-transactions: uint,
    total-volume: uint
  }
)

;; Cumulative statistics
(define-data-var total-sales uint u0)
(define-data-var total-volume uint u0)
(define-data-var completed-transactions uint u0)
(define-data-var disputed-transactions uint u0)
(define-data-var current-year uint u0)
(define-data-var next-year-index uint u0)

;; Track all years
(define-map year-index
  uint
  uint
)

;; =============================================================================
;; INITIALIZATION
;; =============================================================================

(define-public (initialize
  (code (string-ascii 16))
  (name (string-ascii 128))
  (dispute-type (string-ascii 32))
  (fee-bp uint)
  (master-principal (optional principal)))
  
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-NOT-OWNER)
    (asserts! (is-eq (var-get jurisdiction-code) "") ERR-ALREADY-EXISTS)
    
    (var-set jurisdiction-code code)
    (var-set jurisdiction-name name)
    (var-set dispute-resolution-type dispute-type)
    (var-set fee-basis-points fee-bp)
    (var-set master-contract master-principal)
    (var-set current-year u2025)
    
    (ok true)))

;; =============================================================================
;; YEAR CONTRACT MANAGEMENT
;; =============================================================================

(define-public (create-year-contract
  (year uint)
  (year-contract-address principal))
  
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-NOT-OWNER)
    (asserts! (>= year u2000) ERR-INVALID-YEAR)
    (asserts! (is-none (map-get? year-contracts year)) ERR-ALREADY-EXISTS)
    
    ;; Register year contract
    (map-set year-contracts year year-contract-address)
    
    ;; Store year metadata
    (map-set year-metadata
      year
      {
        year: year,
        contract-address: year-contract-address,
        creation-height: block-height,
        active: true,
        transaction-count: u0,
        completed-transactions: u0,
        disputed-transactions: u0,
        total-volume: u0
      }
    )
    
    ;; Add to year index
    (map-set year-index
      (var-get next-year-index)
      year
    )
    (var-set next-year-index (+ (var-get next-year-index) u1))
    
    (ok true)))

(define-public (register-year-contract
  (year uint)
  (contract-address principal))
  
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-NOT-OWNER)
    (asserts! (>= year u2000) ERR-INVALID-YEAR)
    
    (match (map-get? year-contracts year)
      _ ERR-ALREADY-EXISTS
      (begin
        (map-set year-contracts year contract-address)
        (ok true)
      )
    )
  )
)

(define-public (deactivate-year (year uint))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-NOT-OWNER)
    
    (match (map-get? year-metadata year)
      metadata (begin
        (map-set year-metadata
          year
          (merge metadata {active: false})
        )
        (ok true)
      )
      ERR-NOT-FOUND
    )
  )
)

;; =============================================================================
;; STATISTICS & UPDATES
;; =============================================================================

(define-public (update-year-stats
  (year uint)
  (transaction-count uint)
  (completed-count uint)
  (disputed-count uint)
  (volume uint))
  
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-NOT-OWNER)
    
    (match (map-get? year-metadata year)
      metadata (begin
        (map-set year-metadata
          year
          (merge metadata {
            transaction-count: transaction-count,
            completed-transactions: completed-count,
            disputed-transactions: disputed-count,
            total-volume: volume
          })
        )
        
        ;; Update jurisdiction totals
        (var-set total-sales (+ (var-get total-sales) completed-count))
        (var-set completed-transactions (+ (var-get completed-transactions) completed-count))
        (var-set disputed-transactions (+ (var-get disputed-transactions) disputed-count))
        (var-set total-volume (+ (var-get total-volume) volume))
        
        (ok true)
      )
      ERR-NOT-FOUND
    )
  )
)

;; =============================================================================
;; JURISDICTION SETTINGS
;; =============================================================================

(define-public (update-jurisdiction-settings
  (new-fee-bp (optional uint))
  (new-dispute-type (optional (string-ascii 32))))
  
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-NOT-OWNER)
    
    ;; Update fee basis points if provided
    (match new-fee-bp
      bp (begin
        (asserts! (<= bp u10000) ERR-UNAUTHORIZED)
        (var-set fee-basis-points bp)
      )
      true
    )
    
    ;; Update dispute resolution type if provided
    (match new-dispute-type
      dt (var-set dispute-resolution-type dt)
      true
    )
    
    (ok true)))

(define-public (transfer-ownership (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-NOT-OWNER)
    (var-set contract-owner new-owner)
    (ok true)))

;; =============================================================================
;; READ-ONLY FUNCTIONS
;; =============================================================================

(define-read-only (get-year-contract (year uint))
  (map-get? year-contracts year))

(define-read-only (get-year-metadata (year uint))
  (map-get? year-metadata year))

(define-read-only (get-all-years)
  (ok {
    total-years: (var-get next-year-index)
  }))

(define-read-only (get-year-by-index (index uint))
  (map-get? year-index index))

(define-read-only (get-jurisdiction-code)
  (var-get jurisdiction-code))

(define-read-only (get-jurisdiction-name)
  (var-get jurisdiction-name))

(define-read-only (get-jurisdiction-stats)
  (ok {
    code: (var-get jurisdiction-code),
    name: (var-get jurisdiction-name),
    total-sales: (var-get total-sales),
    total-volume: (var-get total-volume),
    completed-transactions: (var-get completed-transactions),
    disputed-transactions: (var-get disputed-transactions),
    fee-basis-points: (var-get fee-basis-points),
    dispute-resolution-type: (var-get dispute-resolution-type)
  }))

(define-read-only (get-fee-basis-points)
  (var-get fee-basis-points))

(define-read-only (get-dispute-resolution-type)
  (var-get dispute-resolution-type))

(define-read-only (get-transaction-count)
  (var-get total-sales))

(define-read-only (get-total-volume)
  (var-get total-volume))

(define-read-only (get-current-year)
  (var-get current-year))

(define-read-only (get-contract-owner)
  (var-get contract-owner))
