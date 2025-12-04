;; =============================================================================
;; REAL ESTATE REGISTRY CONTRACT
;; =============================================================================

(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-OWNER-ONLY (err u100))
(define-constant ERR-NOT-FOUND (err u101))
(define-constant ERR-ALREADY-EXISTS (err u102))
(define-constant ERR-INVALID-CALLER (err u103))
(define-constant ERR-ESCROW-ACTIVE (err u104))
(define-constant ERR-UNAUTHORIZED (err u105))

;; Data structures
(define-map parcel-registry 
  {property-id: (string-ascii 128)} 
  {
    escrow-contract: (optional principal),
    status: (string-ascii 32),
    owner: principal,
    last-updated: uint,
    coordinates: {lat: int, lng: int},
    parcel-id: (string-ascii 64)
  }
)

(define-map escrow-contracts
  principal
  {
    property-id: (string-ascii 128),
    buyer: principal,
    seller: principal,
    amount: uint,
    status: (string-ascii 32),
    creation-height: uint,
    expiry-height: uint
  }
)

(define-data-var next-parcel-id uint u1)

;; Registry functions
(define-public (register-parcel (property-id (string-ascii 128)) 
                               (coordinates {lat: int, lng: int})
                               (parcel-id (string-ascii 64)))
  (let ((existing (map-get? parcel-registry {property-id: property-id})))
    (if (is-some existing)
        ERR-ALREADY-EXISTS
        (begin
          (map-set parcel-registry 
            {property-id: property-id}
            {
              escrow-contract: none,
              status: "available",
              owner: tx-sender,
              last-updated: block-height,
              coordinates: coordinates,
              parcel-id: parcel-id
            }
          )
          (ok true)
        )
    )
  )
)

(define-public (set-escrow-contract (property-id (string-ascii 128)) 
                                   (escrow-contract principal))
  (let ((parcel-data (map-get? parcel-registry {property-id: property-id})))
    (match parcel-data
      parcel (if (is-eq (get owner parcel) tx-sender)
                 (begin
                   (map-set parcel-registry
                     {property-id: property-id}
                     (merge parcel {
                       escrow-contract: (some escrow-contract),
                       status: "in-escrow",
                       last-updated: block-height
                     })
                   )
                   (ok true)
                 )
                 ERR-UNAUTHORIZED)
      ERR-NOT-FOUND
    )
  )
)

(define-public (clear-escrow-contract (property-id (string-ascii 128)))
  (let ((parcel-data (map-get? parcel-registry {property-id: property-id})))
    (match parcel-data
      parcel (if (is-eq (get owner parcel) tx-sender)
                 (begin
                   (map-set parcel-registry
                     {property-id: property-id}
                     (merge parcel {
                       escrow-contract: none,
                       status: "available",
                       last-updated: block-height
                     })
                   )
                   (ok true)
                 )
                 ERR-UNAUTHORIZED)
      ERR-NOT-FOUND
    )
  )
)

(define-public (transfer-ownership (property-id (string-ascii 128))
                                  (new-owner principal))
  (let ((parcel-data (map-get? parcel-registry {property-id: property-id})))
    (match parcel-data
      parcel (if (is-eq (get owner parcel) tx-sender)
                 (begin
                   (map-set parcel-registry
                     {property-id: property-id}
                     (merge parcel {
                       owner: new-owner,
                       escrow-contract: none,
                       status: "available",
                       last-updated: block-height
                     })
                   )
                   (ok true)
                 )
                 ERR-UNAUTHORIZED)
      ERR-NOT-FOUND
    )
  )
)

;; Read-only functions
(define-read-only (get-parcel-info (property-id (string-ascii 128)))
  (map-get? parcel-registry {property-id: property-id})
)

(define-read-only (is-escrow-active (property-id (string-ascii 128)))
  (let ((parcel-data (get-parcel-info property-id)))
    (match parcel-data
      parcel (is-some (get escrow-contract parcel))
      false
    )
  )
)

(define-read-only (get-escrow-contract (property-id (string-ascii 128)))
  (let ((parcel-data (get-parcel-info property-id)))
    (match parcel-data
      parcel (get escrow-contract parcel)
      none
    )
  )
)
