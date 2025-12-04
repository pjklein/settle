;; =============================================================================
;; REAL ESTATE PARCEL NFT CONTRACT (SIP-009 Implementation)
;; =============================================================================

(define-constant ERR-NOT-AUTHORIZED (err u401))
(define-constant ERR-NOT-FOUND (err u404))
(define-constant ERR-ALREADY-EXISTS (err u409))

(define-non-fungible-token real-estate-parcel uint)

(define-data-var last-token-id uint u0)
(define-data-var token-uri (string-ascii 256) "https://api.realestate.stacks/metadata/{id}")

(define-map token-parcel-data
  uint
  {
    coordinates: {lat: int, lng: int},
    parcel-id: (string-ascii 64),
    legal-description: (string-ascii 512),
    assessed-value: uint,
    property-type: (string-ascii 32),
    zoning: (string-ascii 16),
    square-footage: uint,
    creation-height: uint
  }
)

;; SIP-009 Functions
(define-public (transfer (id uint) (sender principal) (recipient principal))
  (begin
    (asserts! (or (is-eq tx-sender sender)
                  (is-eq contract-caller sender)) ERR-NOT-AUTHORIZED)
    (asserts! (is-eq (unwrap! (nft-get-owner? real-estate-parcel id) ERR-NOT-FOUND) sender) ERR-NOT-AUTHORIZED)
    (nft-transfer? real-estate-parcel id sender recipient)))

(define-read-only (get-owner (id uint))
  (ok (nft-get-owner? real-estate-parcel id)))

(define-read-only (get-last-token-id)
  (ok (var-get last-token-id)))

(define-read-only (get-token-uri (id uint))
  (ok (some (var-get token-uri))))

;; Parcel-specific functions
(define-public (mint-parcel (recipient principal)
                           (coordinates {lat: int, lng: int})
                           (parcel-id (string-ascii 64))
                           (legal-description (string-ascii 512))
                           (assessed-value uint)
                           (property-type (string-ascii 32))
                           (zoning (string-ascii 16))
                           (square-footage uint))
  (let ((token-id (+ (var-get last-token-id) u1)))
    (try! (nft-mint? real-estate-parcel token-id recipient))
    (map-set token-parcel-data
      token-id
      {
        coordinates: coordinates,
        parcel-id: parcel-id,
        legal-description: legal-description,
        assessed-value: assessed-value,
        property-type: property-type,
        zoning: zoning,
        square-footage: square-footage,
        creation-height: block-height
      }
    )
    (var-set last-token-id token-id)
    (ok token-id)))

(define-read-only (get-parcel-data (token-id uint))
  (ok (map-get? token-parcel-data token-id)))

(define-public (update-parcel-data (token-id uint)
                                  (new-data {
                                    coordinates: {lat: int, lng: int},
                                    parcel-id: (string-ascii 64),
                                    legal-description: (string-ascii 512),
                                    assessed-value: uint,
                                    property-type: (string-ascii 32),
                                    zoning: (string-ascii 16),
                                    square-footage: uint
                                  }))
  (let ((owner (unwrap! (nft-get-owner? real-estate-parcel token-id) ERR-NOT-FOUND)))
    (asserts! (is-eq tx-sender owner) ERR-NOT-AUTHORIZED)
    (map-set token-parcel-data
      token-id
      (merge (unwrap! (map-get? token-parcel-data token-id) ERR-NOT-FOUND)
             new-data))
    (ok true)))
