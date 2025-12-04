;; =============================================================================
;; REAL ESTATE TRANSACTION CONTRACT - Layer 4 (Enhanced)
;; =============================================================================
;; Full state machine-based transaction contract managing property listings,
;; offers, term negotiation, contingencies, escrow, and closure.
;; =============================================================================

;; Currency constants
(define-constant CURRENCY-STX "STX")
(define-constant CURRENCY-SBTC "sBTC")
(define-constant CURRENCY-USDH "USDh")

;; Error codes
(define-constant ERR-TRANSACTION-NOT-FOUND (err u800))
(define-constant ERR-INVALID-BUYER (err u801))
(define-constant ERR-INVALID-SELLER (err u802))
(define-constant ERR-INSUFFICIENT-FUNDS (err u803))
(define-constant ERR-INVALID-STATE (err u804))
(define-constant ERR-INVALID-CURRENCY (err u805))
(define-constant ERR-TRANSFER-FAILED (err u806))
(define-constant ERR-INVALID-AMOUNT (err u807))
(define-constant ERR-UNAUTHORIZED (err u808))
(define-constant ERR-OFFER-NOT-FOUND (err u809))
(define-constant ERR-CONTINGENCY-NOT-FOUND (err u810))
(define-constant ERR-INVALID-OFFER (err u811))
(define-constant ERR-CONTINGENCIES-NOT-MET (err u812))
(define-constant ERR-ALREADY-SIGNED (err u813))

;; Transaction states
(define-constant STATE-LISTING "listing")
(define-constant STATE-OFFER-RECEIVED "offer-received")
(define-constant STATE-NEGOTIATING "negotiating")
(define-constant STATE-CONTINGENCY-PENDING "contingency-pending")
(define-constant STATE-READY-TO-CLOSE "ready-to-close")
(define-constant STATE-CLOSED "closed")
(define-constant STATE-COMPLETED "completed")
(define-constant STATE-CANCELLED "cancelled")
(define-constant STATE-DISPUTED "disputed")

;; Contingency states
(define-constant CONTINGENCY-PENDING "pending")
(define-constant CONTINGENCY-COMPLETED "completed")
(define-constant CONTINGENCY-WAIVED "waived")
(define-constant CONTINGENCY-FAILED "failed")

;; Offer states
(define-constant OFFER-PENDING "pending")
(define-constant OFFER-ACCEPTED "accepted")
(define-constant OFFER-REJECTED "rejected")
(define-constant OFFER-COUNTERED "countered")

;; Main transaction data
(define-map transactions
  uint
  {
    transaction-id: uint,
    seller: principal,
    buyer: (optional principal),
    property-id: (string-ascii 128),
    state: (string-ascii 32),
    currency: (string-ascii 10),
    purchase-price: uint,
    earnest-money: uint,
    creation-height: uint,
    last-updated: uint,
    buyer-signed-height: (optional uint),
    seller-signed-height: (optional uint),
    closed-height: (optional uint),
    inspection-period-days: uint,
    possession-date: (optional uint)
  }
)

;; Property listing data
(define-map property-listings
  (string-ascii 128)
  {
    property-id: (string-ascii 128),
    seller: principal,
    legal-description: (string-ascii 512),
    coordinates: {lat: int, lng: int},
    parcel-id: (string-ascii 64),
    assessed-value: uint,
    property-type: (string-ascii 32),
    zoning: (string-ascii 16),
    square-footage: uint,
    creation-height: uint,
    active: bool
  }
)

;; Offers tracking
(define-map offers
  uint
  {
    offer-id: uint,
    transaction-id: uint,
    buyer: principal,
    offered-price: uint,
    proposed-terms: (string-ascii 512),
    state: (string-ascii 16),
    creation-height: uint,
    expiry-height: (optional uint)
  }
)

;; Term change proposals
(define-map term-proposals
  uint
  {
    proposal-id: uint,
    transaction-id: uint,
    proposer: principal,
    term-changes: (string-ascii 512),
    state: (string-ascii 16),
    creation-height: uint
  }
)

;; Contingencies
(define-map contingencies
  uint
  {
    contingency-id: uint,
    transaction-id: uint,
    contingency-type: (string-ascii 64),
    deadline: uint,
    status: (string-ascii 16),
    created-height: uint,
    resolved-height: (optional uint),
    failure-reason: (optional (string-ascii 256))
  }
)

;; Escrow tracking
(define-map escrow-data
  uint
  {
    transaction-id: uint,
    earnest-money-deposited: uint,
    final-funds-deposited: uint,
    total-funds: uint,
    release-authorized-by-buyer: bool,
    release-authorized-by-seller: bool,
    last-updated: uint
  }
)

;; Transaction timeline (event log)
(define-map transaction-timeline
  uint
  {
    transaction-id: uint,
    event: (string-ascii 128),
    timestamp: uint,
    actor: principal
  }
)

;; Data counters
(define-data-var next-transaction-id uint u1)
(define-data-var next-offer-id uint u1)
(define-data-var next-proposal-id uint u1)
(define-data-var next-contingency-id uint u1)
(define-data-var next-timeline-event uint u1)

;; =============================================================================
;; LISTING MANAGEMENT
;; =============================================================================

(define-public (create-listing
  (property-id (string-ascii 128))
  (legal-description (string-ascii 512))
  (coordinates {lat: int, lng: int})
  (parcel-id (string-ascii 64))
  (assessed-value uint)
  (property-type (string-ascii 32))
  (zoning (string-ascii 16))
  (square-footage uint))
  
  (let ((tx-id (var-get next-transaction-id)))
    (begin
      ;; Create transaction record
      (map-set transactions
        tx-id
        {
          transaction-id: tx-id,
          seller: tx-sender,
          buyer: none,
          property-id: property-id,
          state: STATE-LISTING,
          currency: CURRENCY-STX,
          purchase-price: u0,
          earnest-money: u0,
          creation-height: block-height,
          last-updated: block-height,
          buyer-signed-height: none,
          seller-signed-height: none,
          closed-height: none,
          inspection-period-days: u10,
          possession-date: none
        }
      )
      
      ;; Create property listing
      (map-set property-listings
        property-id
        {
          property-id: property-id,
          seller: tx-sender,
          legal-description: legal-description,
          coordinates: coordinates,
          parcel-id: parcel-id,
          assessed-value: assessed-value,
          property-type: property-type,
          zoning: zoning,
          square-footage: square-footage,
          creation-height: block-height,
          active: true
        }
      )
      
      ;; Log event
      (map-set transaction-timeline
        (var-get next-timeline-event)
        {
          transaction-id: tx-id,
          event: "listing-created",
          timestamp: block-height,
          actor: tx-sender
        }
      )
      (var-set next-timeline-event (+ (var-get next-timeline-event) u1))
      (var-set next-transaction-id (+ tx-id u1))
      
      (ok tx-id)
    )
  )
)

(define-public (update-listing
  (property-id (string-ascii 128))
  (legal-description (string-ascii 512))
  (assessed-value uint)
  (property-type (string-ascii 32))
  (zoning (string-ascii 16))
  (square-footage uint))
  
  (match (map-get? property-listings property-id)
    listing (if (is-eq (get seller listing) tx-sender)
      (begin
        (map-set property-listings
          property-id
          (merge listing {
            legal-description: legal-description,
            assessed-value: assessed-value,
            property-type: property-type,
            zoning: zoning,
            square-footage: square-footage
          })
        )
        (ok true)
      )
      ERR-UNAUTHORIZED
    )
    ERR-TRANSACTION-NOT-FOUND
  )
)

(define-public (delist-property (property-id (string-ascii 128)))
  (match (map-get? property-listings property-id)
    listing (if (is-eq (get seller listing) tx-sender)
      (begin
        (map-set property-listings
          property-id
          (merge listing {active: false})
        )
        (ok true)
      )
      ERR-UNAUTHORIZED
    )
    ERR-TRANSACTION-NOT-FOUND
  )
)

(define-read-only (get-listing (property-id (string-ascii 128)))
  (map-get? property-listings property-id))

;; =============================================================================
;; OFFER MANAGEMENT
;; =============================================================================

(define-public (submit-offer
  (transaction-id uint)
  (offered-price uint)
  (proposed-terms (string-ascii 512))
  (offer-validity-blocks uint))
  
  (match (map-get? transactions transaction-id)
    tx (if (is-eq (get state tx) STATE-LISTING)
      (let ((offer-id (var-get next-offer-id)))
        (begin
          ;; Create offer
          (map-set offers
            offer-id
            {
              offer-id: offer-id,
              transaction-id: transaction-id,
              buyer: tx-sender,
              offered-price: offered-price,
              proposed-terms: proposed-terms,
              state: OFFER-PENDING,
              creation-height: block-height,
              expiry-height: (some (+ block-height offer-validity-blocks))
            }
          )
          
          ;; Update transaction
          (map-set transactions
            transaction-id
            (merge tx {
              state: STATE-OFFER-RECEIVED,
              last-updated: block-height
            })
          )
          
          ;; Log event
          (map-set transaction-timeline
            (var-get next-timeline-event)
            {
              transaction-id: transaction-id,
              event: "offer-received",
              timestamp: block-height,
              actor: tx-sender
            }
          )
          (var-set next-timeline-event (+ (var-get next-timeline-event) u1))
          (var-set next-offer-id (+ offer-id u1))
          
          (ok offer-id)
        )
      )
      ERR-INVALID-STATE
    )
    ERR-TRANSACTION-NOT-FOUND
  )
)

(define-public (accept-offer (offer-id uint) (currency (string-ascii 10)))
  (match (map-get? offers offer-id)
    offer (match (map-get? transactions (get transaction-id offer))
      tx (if (is-eq (get seller tx) tx-sender)
        (begin
          ;; Update offer state
          (map-set offers
            offer-id
            (merge offer {state: OFFER-ACCEPTED})
          )
          
          ;; Update transaction
          (map-set transactions
            (get transaction-id offer)
            (merge tx {
              buyer: (some (get buyer offer)),
              state: STATE-CONTINGENCY-PENDING,
              purchase-price: (get offered-price offer),
              currency: currency,
              earnest-money: (/ (get offered-price offer) u10),
              last-updated: block-height
            })
          )
          
          ;; Initialize escrow
          (map-set escrow-data
            (get transaction-id offer)
            {
              transaction-id: (get transaction-id offer),
              earnest-money-deposited: u0,
              final-funds-deposited: u0,
              total-funds: (/ (get offered-price offer) u10),
              release-authorized-by-buyer: false,
              release-authorized-by-seller: false,
              last-updated: block-height
            }
          )
          
          ;; Log event
          (map-set transaction-timeline
            (var-get next-timeline-event)
            {
              transaction-id: (get transaction-id offer),
              event: "offer-accepted",
              timestamp: block-height,
              actor: tx-sender
            }
          )
          (var-set next-timeline-event (+ (var-get next-timeline-event) u1))
          
          (ok true)
        )
        ERR-UNAUTHORIZED
      )
      ERR-TRANSACTION-NOT-FOUND
    )
    ERR-OFFER-NOT-FOUND
  )
)

(define-public (reject-offer (offer-id uint))
  (match (map-get? offers offer-id)
    offer (match (map-get? transactions (get transaction-id offer))
      tx (if (is-eq (get seller tx) tx-sender)
        (begin
          (map-set offers
            offer-id
            (merge offer {state: OFFER-REJECTED})
          )
          (ok true)
        )
        ERR-UNAUTHORIZED
      )
      ERR-TRANSACTION-NOT-FOUND
    )
    ERR-OFFER-NOT-FOUND
  )
)

(define-public (submit-counter-offer
  (offer-id uint)
  (price uint)
  (terms (string-ascii 512)))
  
  (match (map-get? offers offer-id)
    offer (if (is-eq (get state offer) OFFER-PENDING)
      (let ((new-offer-id (var-get next-offer-id)))
        (begin
          (map-set offers
            offer-id
            (merge offer {state: OFFER-COUNTERED})
          )
          
          (map-set offers
            new-offer-id
            {
              offer-id: new-offer-id,
              transaction-id: (get transaction-id offer),
              buyer: tx-sender,
              offered-price: price,
              proposed-terms: terms,
              state: OFFER-PENDING,
              creation-height: block-height,
              expiry-height: (some (+ block-height u1728))
            }
          )
          
          (var-set next-offer-id (+ new-offer-id u1))
          (ok new-offer-id)
        )
      )
      ERR-INVALID-OFFER
    )
    ERR-OFFER-NOT-FOUND
  )
)

(define-public (withdraw-offer (offer-id uint))
  (match (map-get? offers offer-id)
    offer (if (is-eq (get buyer offer) tx-sender)
      (begin
        (map-set offers
          offer-id
          (merge offer {state: OFFER-REJECTED})
        )
        (ok true)
      )
      ERR-UNAUTHORIZED
    )
    ERR-OFFER-NOT-FOUND
  )
)

(define-read-only (get-offers (transaction-id uint))
  (ok {transaction-id: transaction-id}))

(define-read-only (get-offer (offer-id uint))
  (map-get? offers offer-id))

;; =============================================================================
;; TERM NEGOTIATION
;; =============================================================================

(define-public (propose-term-changes
  (transaction-id uint)
  (term-changes (string-ascii 512)))
  
  (match (map-get? transactions transaction-id)
    tx (if (or (is-eq (get seller tx) tx-sender)
               (is-eq (get buyer tx) (some tx-sender)))
      (let ((proposal-id (var-get next-proposal-id)))
        (begin
          (map-set term-proposals
            proposal-id
            {
              proposal-id: proposal-id,
              transaction-id: transaction-id,
              proposer: tx-sender,
              term-changes: term-changes,
              state: OFFER-PENDING,
              creation-height: block-height
            }
          )
          
          (map-set transactions
            transaction-id
            (merge tx {
              state: STATE-NEGOTIATING,
              last-updated: block-height
            })
          )
          
          (var-set next-proposal-id (+ proposal-id u1))
          (ok proposal-id)
        )
      )
      ERR-UNAUTHORIZED
    )
    ERR-TRANSACTION-NOT-FOUND
  )
)

(define-public (accept-term-changes (proposal-id uint))
  (match (map-get? term-proposals proposal-id)
    proposal (match (map-get? transactions (get transaction-id proposal))
      tx (if (and (or (is-eq (get seller tx) tx-sender)
                      (is-eq (get buyer tx) (some tx-sender)))
                  (not (is-eq (get proposer proposal) tx-sender)))
        (begin
          (map-set term-proposals
            proposal-id
            (merge proposal {state: OFFER-ACCEPTED})
          )
          (ok true)
        )
        ERR-UNAUTHORIZED
      )
      ERR-TRANSACTION-NOT-FOUND
    )
    ERR-TRANSACTION-NOT-FOUND
  )
)

(define-public (reject-term-changes (proposal-id uint))
  (match (map-get? term-proposals proposal-id)
    proposal (match (map-get? transactions (get transaction-id proposal))
      tx (if (or (is-eq (get seller tx) tx-sender)
                 (is-eq (get buyer tx) (some tx-sender)))
        (begin
          (map-set term-proposals
            proposal-id
            (merge proposal {state: OFFER-REJECTED})
          )
          (ok true)
        )
        ERR-UNAUTHORIZED
      )
      ERR-TRANSACTION-NOT-FOUND
    )
    ERR-TRANSACTION-NOT-FOUND
  )
)

(define-read-only (get-term-history (transaction-id uint))
  (ok {transaction-id: transaction-id}))

(define-read-only (get-current-terms (transaction-id uint))
  (map-get? transactions transaction-id))

;; =============================================================================
;; CONTINGENCY TRACKING
;; =============================================================================

(define-public (create-contingency
  (transaction-id uint)
  (contingency-type (string-ascii 64))
  (deadline uint))
  
  (match (map-get? transactions transaction-id)
    tx (if (or (is-eq (get seller tx) tx-sender)
               (is-eq (get buyer tx) (some tx-sender)))
      (let ((contingency-id (var-get next-contingency-id)))
        (begin
          (map-set contingencies
            contingency-id
            {
              contingency-id: contingency-id,
              transaction-id: transaction-id,
              contingency-type: contingency-type,
              deadline: deadline,
              status: CONTINGENCY-PENDING,
              created-height: block-height,
              resolved-height: none,
              failure-reason: none
            }
          )
          
          (var-set next-contingency-id (+ contingency-id u1))
          (ok contingency-id)
        )
      )
      ERR-UNAUTHORIZED
    )
    ERR-TRANSACTION-NOT-FOUND
  )
)

(define-public (mark-contingency-complete (contingency-id uint))
  (match (map-get? contingencies contingency-id)
    contingency (match (map-get? transactions (get transaction-id contingency))
      tx (if (or (is-eq (get seller tx) tx-sender)
                 (is-eq (get buyer tx) (some tx-sender)))
        (begin
          (map-set contingencies
            contingency-id
            (merge contingency {
              status: CONTINGENCY-COMPLETED,
              resolved-height: (some block-height)
            })
          )
          (ok true)
        )
        ERR-UNAUTHORIZED
      )
      ERR-TRANSACTION-NOT-FOUND
    )
    ERR-CONTINGENCY-NOT-FOUND
  )
)

(define-public (fail-contingency
  (contingency-id uint)
  (reason (string-ascii 256)))
  
  (match (map-get? contingencies contingency-id)
    contingency (match (map-get? transactions (get transaction-id contingency))
      tx (if (or (is-eq (get seller tx) tx-sender)
                 (is-eq (get buyer tx) (some tx-sender)))
        (begin
          (map-set contingencies
            contingency-id
            (merge contingency {
              status: CONTINGENCY-FAILED,
              resolved-height: (some block-height),
              failure-reason: (some reason)
            })
          )
          
          ;; Mark transaction as disputed
          (map-set transactions
            (get transaction-id contingency)
            (merge tx {
              state: STATE-DISPUTED,
              last-updated: block-height
            })
          )
          
          (ok true)
        )
        ERR-UNAUTHORIZED
      )
      ERR-TRANSACTION-NOT-FOUND
    )
    ERR-CONTINGENCY-NOT-FOUND
  )
)

(define-public (waive-contingency (contingency-id uint))
  (match (map-get? contingencies contingency-id)
    contingency (match (map-get? transactions (get transaction-id contingency))
      tx (if (or (is-eq (get seller tx) tx-sender)
                 (is-eq (get buyer tx) (some tx-sender)))
        (begin
          (map-set contingencies
            contingency-id
            (merge contingency {
              status: CONTINGENCY-WAIVED,
              resolved-height: (some block-height)
            })
          )
          (ok true)
        )
        ERR-UNAUTHORIZED
      )
      ERR-TRANSACTION-NOT-FOUND
    )
    ERR-CONTINGENCY-NOT-FOUND
  )
)

(define-read-only (get-contingencies (transaction-id uint))
  (ok {transaction-id: transaction-id}))

(define-read-only (get-contingency-status (transaction-id uint))
  (ok {transaction-id: transaction-id}))

;; =============================================================================
;; ESCROW MANAGEMENT
;; =============================================================================

(define-public (deposit-earnest-money
  (transaction-id uint)
  (amount uint)
  (currency (string-ascii 10)))
  
  (match (map-get? transactions transaction-id)
    tx (if (is-eq (get buyer tx) (some tx-sender))
      (begin
        ;; Transfer STX
        (if (is-eq currency CURRENCY-STX)
          (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
          true
        )
        
        ;; Update escrow
        (match (map-get? escrow-data transaction-id)
          escrow (map-set escrow-data
            transaction-id
            (merge escrow {
              earnest-money-deposited: (+ (get earnest-money-deposited escrow) amount),
              last-updated: block-height
            })
          )
          true
        )
        
        (ok true)
      )
      ERR-INVALID-BUYER
    )
    ERR-TRANSACTION-NOT-FOUND
  )
)

(define-public (deposit-remaining-funds
  (transaction-id uint)
  (amount uint)
  (currency (string-ascii 10)))
  
  (match (map-get? transactions transaction-id)
    tx (if (is-eq (get buyer tx) (some tx-sender))
      (begin
        (if (is-eq currency CURRENCY-STX)
          (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
          true
        )
        
        (match (map-get? escrow-data transaction-id)
          escrow (map-set escrow-data
            transaction-id
            (merge escrow {
              final-funds-deposited: (+ (get final-funds-deposited escrow) amount),
              last-updated: block-height
            })
          )
          true
        )
        
        (ok true)
      )
      ERR-INVALID-BUYER
    )
    ERR-TRANSACTION-NOT-FOUND
  )
)

(define-read-only (get-escrow-balance (transaction-id uint))
  (map-get? escrow-data transaction-id))

(define-read-only (get-release-conditions (transaction-id uint))
  (map-get? escrow-data transaction-id))

(define-public (check-release-conditions (transaction-id uint))
  (match (map-get? transactions transaction-id)
    tx (match (map-get? escrow-data transaction-id)
      escrow (ok {
        buyer-signed: (is-some (get buyer-signed-height tx)),
        seller-signed: (is-some (get seller-signed-height tx)),
        funds-deposited: (> (get earnest-money-deposited escrow) u0),
        ready-to-release: (and (is-some (get buyer-signed-height tx))
                               (is-some (get seller-signed-height tx))
                               (> (get earnest-money-deposited escrow) u0))
      })
      ERR-TRANSACTION-NOT-FOUND
    )
    ERR-TRANSACTION-NOT-FOUND
  )
)

(define-public (release-funds-to-seller (transaction-id uint))
  (match (map-get? transactions transaction-id)
    tx (if (is-eq (get seller tx) tx-sender)
      (match (map-get? escrow-data transaction-id)
        escrow (begin
          ;; Transfer funds
          (try! (as-contract (stx-transfer?
            (get earnest-money-deposited escrow)
            (as-contract tx-sender)
            (get seller tx))))
          
          ;; Update transaction state
          (map-set transactions
            transaction-id
            (merge tx {
              state: STATE-COMPLETED,
              closed-height: (some block-height),
              last-updated: block-height
            })
          )
          
          ;; Clear escrow
          (map-set escrow-data
            transaction-id
            (merge escrow {
              earnest-money-deposited: u0,
              release-authorized-by-seller: true
            })
          )
          
          (ok true)
        )
        ERR-TRANSACTION-NOT-FOUND
      )
      ERR-UNAUTHORIZED
    )
    ERR-TRANSACTION-NOT-FOUND
  )
)

(define-public (refund-earnest-money
  (transaction-id uint)
  (reason (string-ascii 256)))
  
  (match (map-get? transactions transaction-id)
    tx (if (or (is-eq (get seller tx) tx-sender)
               (is-eq (get buyer tx) (some tx-sender)))
      (match (map-get? escrow-data transaction-id)
        escrow (begin
          ;; Refund to buyer
          (try! (as-contract (stx-transfer?
            (get earnest-money-deposited escrow)
            (as-contract tx-sender)
            (unwrap! (get buyer tx) ERR-INVALID-BUYER))))
          
          ;; Update transaction
          (map-set transactions
            transaction-id
            (merge tx {
              state: STATE-CANCELLED,
              last-updated: block-height
            })
          )
          
          ;; Clear escrow
          (map-set escrow-data
            transaction-id
            (merge escrow {
              earnest-money-deposited: u0
            })
          )
          
          (ok true)
        )
        ERR-TRANSACTION-NOT-FOUND
      )
      ERR-UNAUTHORIZED
    )
    ERR-TRANSACTION-NOT-FOUND
  )
)

;; =============================================================================
;; POSSESSION & SIGNATURES
;; =============================================================================

(define-public (sign-contract (transaction-id uint) (signer-type (string-ascii 10)))
  (match (map-get? transactions transaction-id)
    tx (if (is-eq signer-type "buyer")
      (if (is-eq (get buyer tx) (some tx-sender))
        (begin
          (map-set transactions
            transaction-id
            (merge tx {
              buyer-signed-height: (some block-height),
              state: STATE-READY-TO-CLOSE,
              last-updated: block-height
            })
          )
          (ok true)
        )
        ERR-INVALID-BUYER
      )
      (if (is-eq signer-type "seller")
        (if (is-eq (get seller tx) tx-sender)
          (begin
            (map-set transactions
              transaction-id
              (merge tx {
                seller-signed-height: (some block-height),
                last-updated: block-height
              })
            )
            (ok true)
          )
          ERR-INVALID-SELLER
        )
        ERR-INVALID-STATE
      )
    )
    ERR-TRANSACTION-NOT-FOUND
  )
)

(define-public (set-possession-date
  (transaction-id uint)
  (date uint))
  
  (match (map-get? transactions transaction-id)
    tx (if (or (is-eq (get seller tx) tx-sender)
               (is-eq (get buyer tx) (some tx-sender)))
      (begin
        (map-set transactions
          transaction-id
          (merge tx {possession-date: (some date)})
        )
        (ok true)
      )
      ERR-UNAUTHORIZED
    )
    ERR-TRANSACTION-NOT-FOUND
  )
)

(define-public (set-inspection-period
  (transaction-id uint)
  (days uint))
  
  (match (map-get? transactions transaction-id)
    tx (if (or (is-eq (get seller tx) tx-sender)
               (is-eq (get buyer tx) (some tx-sender)))
      (begin
        (map-set transactions
          transaction-id
          (merge tx {inspection-period-days: days})
        )
        (ok true)
      )
      ERR-UNAUTHORIZED
    )
    ERR-TRANSACTION-NOT-FOUND
  )
)

;; =============================================================================
;; READ-ONLY FUNCTIONS
;; =============================================================================

(define-read-only (get-transaction-state (transaction-id uint))
  (match (map-get? transactions transaction-id)
    tx (ok (get state tx))
    ERR-TRANSACTION-NOT-FOUND
  )
)

(define-read-only (get-transaction (transaction-id uint))
  (map-get? transactions transaction-id))

(define-read-only (get-current-offer (transaction-id uint))
  (ok {transaction-id: transaction-id}))

(define-read-only (get-buyer (transaction-id uint))
  (match (map-get? transactions transaction-id)
    tx (ok (get buyer tx))
    ERR-TRANSACTION-NOT-FOUND
  )
)

(define-read-only (get-seller (transaction-id uint))
  (match (map-get? transactions transaction-id)
    tx (ok (get seller tx))
    ERR-TRANSACTION-NOT-FOUND
  )
)

(define-read-only (get-property-data (property-id (string-ascii 128)))
  (map-get? property-listings property-id))

(define-read-only (get-transaction-timeline (transaction-id uint))
  (ok {transaction-id: transaction-id}))

(define-read-only (get-completion-status (transaction-id uint))
  (match (map-get? transactions transaction-id)
    tx (ok {
      state: (get state tx),
      buyer-signed: (is-some (get buyer-signed-height tx)),
      seller-signed: (is-some (get seller-signed-height tx)),
      closed: (is-some (get closed-height tx)),
      completion-percentage: (let ((total u4))
        (+ (if (is-some (get buyer-signed-height tx)) u25 u0)
           (if (is-some (get seller-signed-height tx)) u25 u0)
           (if (is-some (get closed-height tx)) u25 u0)
           (if (is-eq (get state tx) STATE-COMPLETED) u25 u0)
        )
      )
    })
    ERR-TRANSACTION-NOT-FOUND
  )
)
