# Multi-Tiered Real Estate Settlement DApp

A comprehensive decentralized application for managing multi-layered real estate transactions on the Stacks blockchain with full jurisdiction hierarchy, contingency tracking, and multi-currency escrow support.

## Architecture Overview

### 4-Layer Smart Contract Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│         Layer 1: MASTER CONTRACT                             │
│  (real-estate-master.clar)                                   │
│  - Jurisdiction deployment & governance                      │
│  - Platform fee collection                                   │
│  - System-wide pause/shutdown                                │
│  - Master statistics aggregation                             │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│    Layer 2: JURISDICTION CONTRACTS                            │
│  (real-estate-jurisdiction.clar)                              │
│  - Per-jurisdiction (state/county) management                 │
│  - Year-contract creation & tracking                          │
│  - Jurisdiction-level settings (fees, disputes)               │
│  - Cumulative statistics per jurisdiction                     │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│        Layer 3: YEAR CONTRACTS                                │
│  (real-estate-year.clar)                                      │
│  - Annual transaction management                              │
│  - Escrow pool management (multi-currency)                    │
│  - Year-end settlement & reporting                            │
│  - Performance metrics tracking                               │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│     Layer 4: TRANSACTION CONTRACTS                            │
│  (real-estate-transaction.clar)                               │
│  - Full state machine (9 states)                              │
│  - Listing management                                         │
│  - Offer/counter-offer workflow                               │
│  - Term negotiation & proposals                               │
│  - Contingency tracking                                       │
│  - Escrow & fund management                                   │
│  - Digital signatures & possession tracking                   │
└─────────────────────────────────────────────────────────────┘
```

## Smart Contracts

### Layer 1: Master Contract (`real-estate-master.clar`)

**Governance & Jurisdiction Management:**
- `deploy-jurisdiction-contract` - Create new jurisdiction contracts
- `register-jurisdiction` - Store jurisdiction metadata
- `deactivate-jurisdiction` - Disable jurisdiction
- `transfer-ownership` - Change contract owner
- `pause-system` / `resume-system` - Emergency controls

**Fee Management:**
- `collect-fees` - Aggregate platform fees
- `withdraw-fees` - Owner withdraws fees

**Statistics:**
- `get-master-stats` - Platform-wide metrics
- `update-transaction-stats` - Update counters

### Layer 2: Jurisdiction Contract (`real-estate-jurisdiction.clar`)

**Year Management:**
- `create-year-contract` - Deploy year-specific contracts
- `register-year-contract` - Register existing year contract
- `deactivate-year` - Disable year contract

**Settings:**
- `update-jurisdiction-settings` - Modify fees and dispute rules
- `transfer-ownership` - Transfer ownership

**Statistics:**
- `get-jurisdiction-stats` - Jurisdiction metrics
- `update-year-stats` - Update annual statistics

### Layer 3: Year Contract (`real-estate-year.clar`)

**Transaction Management:**
- `create-transaction-contract` - Create new transaction
- `register-transaction` - Register transaction
- `update-transaction-status` - Update state & status

**Escrow Pools:**
- `deposit-escrow-funds` - Add funds (multi-currency)
- `withdraw-escrow-funds` - Withdraw funds
- `get-escrow-balance` - Query pool balance

**Settlement:**
- `finalize-year` - Year-end settlement

### Layer 4: Transaction Contract (`real-estate-transaction.clar`)

**States (9-state machine):**
1. `listing` - Property listed by seller
2. `offer-received` - Buyer(s) submitted offer(s)
3. `negotiating` - Terms being modified
4. `contingency-pending` - Contingencies being resolved
5. `ready-to-close` - All conditions met
6. `closed` - Funds released
7. `completed` - Post-closing tasks done
8. `cancelled` - Transaction terminated
9. `disputed` - Dispute filed

**Listing Management:**
- `create-listing` - Create property listing
- `update-listing` - Modify listing details
- `delist-property` - Remove from market

**Offer Workflow:**
- `submit-offer` - Submit purchase offer
- `accept-offer` - Accept specific offer
- `reject-offer` - Reject offer
- `submit-counter-offer` - Counter with new terms
- `withdraw-offer` - Buyer withdraws offer

**Term Negotiation:**
- `propose-term-changes` - Propose modifications
- `accept-term-changes` - Accept changes
- `reject-term-changes` - Reject changes

**Contingency Management:**
- `create-contingency` - Add contingency
- `mark-contingency-complete` - Complete contingency
- `fail-contingency` - Mark as failed
- `waive-contingency` - Waive contingency

**Escrow Operations:**
- `deposit-earnest-money` - Buyer deposits earnest money
- `deposit-remaining-funds` - Deposit final funds
- `release-funds-to-seller` - Release after conditions met
- `refund-earnest-money` - Refund to buyer

**Signatures & Closure:**
- `sign-contract` - Buyer/seller signs
- `set-possession-date` - Record possession date
- `set-inspection-period` - Define inspection window

## Frontend Components

### 1. Marketplace (`src/components/Marketplace.jsx`)
- **Browse Properties**: View all available listings with details
- **Advanced Filtering**:
  - Search by address, type, or parcel ID
  - Filter by property type
  - Price range filtering
- **Property Details**:
  - Address, price, square footage
  - Bedrooms, bathrooms, year built
  - Zoning and property type
  - Parcel ID

### 2. Offer Management (`src/components/OfferManagement.jsx`)
- **Submit Offers**: Make purchase offers with earnest money
- **Offer History**: View all offers with status tracking
- **Buyer Features**:
  - Submit new offers
  - Withdraw offers
  - View counter-offers
- **Seller Features**:
  - Accept/reject offers
  - Submit counter-offers
- **Offer Details**:
  - Proposed price and earnest money
  - Proposed terms
  - Offer expiry tracking

### 3. Negotiation Dashboard (`src/components/NegotiationDashboard.jsx`)
- **Term Proposals**:
  - Propose term changes
  - Approve/reject proposals
  - Track proposal status
- **Contingency Tracking**:
  - Financing, inspection, appraisal
  - Contingency status & progress
  - Deadline tracking
- **Approval Workflow**:
  - Visual status indicators
  - Expiry countdown
  - Action buttons

### 4. Transaction Tracking (`src/components/TransactionTracking.jsx`)
- **Progress Visualization**:
  - Overall completion percentage
  - Step-by-step timeline
  - Visual state indicators
- **Transaction Summary**:
  - Property details
  - Buyer/seller information
  - Escrow status
- **Signature Tracking**:
  - Buyer signature status
  - Seller signature status
  - Signature timestamps
- **Key Documents**:
  - Document list with status
  - File size and date
  - Signature tracking

### 5. Main Application (`src/AppWithLayers.jsx`)
- **Multi-view Navigation**:
  - Marketplace view
  - Offers view
  - Negotiation view
  - Tracking view
- **Role-based Access**:
  - Buyer role features
  - Seller role features
- **Wallet Integration**:
  - Stacks wallet connection
  - User authentication
  - Role management

## Features

### Multi-Currency Escrow
- **Supported Currencies**: STX, sBTC, USDh
- **Automatic Conversion**: 10% earnest money calculation
- **Smart Routing**: Conditional token transfers

### Contingency Management
- **Contingency Types**:
  - Financing contingency
  - Inspection contingency
  - Appraisal contingency
  - Title search contingency
  - Custom contingencies
- **Status Tracking**:
  - Pending, completed, waived, failed
  - Deadline management
  - Progress indication

### Term Negotiation
- **Proposal Types**:
  - Closing date changes
  - Inspection period extensions
  - Possession date adjustments
  - Earnest money modifications
  - Custom terms
- **Approval Workflow**:
  - Propose → Accept/Reject
  - Counter-proposals
  - History tracking

### State Machine
- **9-State Transaction Lifecycle**:
  - Progression validation
  - State-specific actions
  - Role-based permissions
- **Event Logging**:
  - Complete transaction timeline
  - Actor tracking
  - Timestamp recording

## Installation & Setup

### Prerequisites
- Node.js 16+
- npm or yarn
- Stacks wallet extension (Hiro Wallet)

### Installation

```bash
# Clone repository
git clone <repo-url>
cd settle

# Install dependencies
npm install

# Install Clarity development tools
npm run install:contracts

# Set up environment
cp .env.example .env
```

### Development

```bash
# Start dev server
npm run dev

# Run tests
npm run test

# Build for production
npm run build
```

### Contract Deployment

```bash
# Deploy to testnet
npm run deploy:contracts

# Test contracts locally
npm run test:contracts
```

## Configuration

### Environment Variables

```env
VITE_STACKS_NETWORK=testnet
VITE_STACKS_API_URL=https://api.testnet.hiro.so
VITE_MASTER_CONTRACT=ST...
VITE_JURISDICTION_CODE=NY-2024
```

### Jurisdiction Setup

```clarity
;; Deploy master contract
(deploy-jurisdiction-contract
  "NY-001"           ;; Code
  "New York County"  ;; Name
  "mediation"        ;; Dispute type
  100                ;; Fee basis points (1%)
  contract-principal ;; Jurisdiction contract
)
```

## Usage Flow

### For Buyers

1. **Browse Marketplace**
   - View available properties
   - Filter by criteria
   - Select property

2. **Submit Offer**
   - Enter offer price
   - Set earnest money (calculated)
   - Propose terms
   - Set offer validity period

3. **Negotiate Terms**
   - Review counter-offers
   - Propose term changes
   - Accept/reject proposals

4. **Track Contingencies**
   - Monitor contingency status
   - Complete required contingencies
   - Approve on deadline

5. **Close Transaction**
   - Sign contract
   - Deposit final funds
   - Complete possession transfer

### For Sellers

1. **List Property**
   - Create listing
   - Set initial terms
   - Upload documents

2. **Manage Offers**
   - Review incoming offers
   - Accept best offer
   - Send counter-offers

3. **Negotiate Terms**
   - Propose modifications
   - Approve buyer proposals
   - Track negotiations

4. **Close & Receive Funds**
   - Sign contract
   - Verify escrow
   - Release funds upon closing

## Data Structures

### Transaction Record
```clarity
{
  transaction-id: uint,
  seller: principal,
  buyer: optional principal,
  property-id: string,
  state: string,
  currency: string,
  purchase-price: uint,
  earnest-money: uint,
  buyer-signed-height: optional uint,
  seller-signed-height: optional uint,
  closed-height: optional uint,
  inspection-period-days: uint,
  possession-date: optional uint
}
```

### Offer Record
```clarity
{
  offer-id: uint,
  transaction-id: uint,
  buyer: principal,
  offered-price: uint,
  proposed-terms: string,
  state: string,
  creation-height: uint,
  expiry-height: optional uint
}
```

### Contingency Record
```clarity
{
  contingency-id: uint,
  transaction-id: uint,
  contingency-type: string,
  deadline: uint,
  status: string,
  created-height: uint,
  resolved-height: optional uint,
  failure-reason: optional string
}
```

## Error Handling

### Error Codes

**Master Contract (500-510)**
- 500: Not owner
- 501: Already exists
- 502: Not found
- 503: System paused
- 504: Invalid jurisdiction
- 505: Invalid code

**Jurisdiction Contract (600-610)**
- 600: Not owner
- 601: Already exists
- 602: Not found
- 603: Invalid year
- 604: Unauthorized

**Year Contract (700-710)**
- 700: Not owner
- 701: Already exists
- 702: Not found
- 703: Invalid transaction
- 704: Unauthorized
- 705: Insufficient funds
- 706: Year finalized
- 707: Invalid currency

**Transaction Contract (800-813)**
- 800: Transaction not found
- 801: Invalid buyer
- 802: Invalid seller
- 803: Insufficient funds
- 804: Invalid state
- 805: Invalid currency
- 806: Transfer failed
- 807: Invalid amount
- 808: Unauthorized
- 809: Offer not found
- 810: Contingency not found
- 811: Invalid offer
- 812: Contingencies not met
- 813: Already signed

## Testing

### Unit Tests
```bash
npm run test
```

### Contract Tests
```bash
npm run test:contracts
```

### Integration Tests
```bash
npm run test:integration
```

## Security Considerations

- **Multi-signature**: Both parties must sign contracts
- **Escrow Protection**: Funds locked until all conditions met
- **State Validation**: No invalid state transitions
- **Authorization**: Role-based access control
- **Pause Mechanism**: System-wide emergency pause
- **Immutable Logs**: Complete transaction history

## Performance Optimizations

- **Map-based Storage**: Efficient data retrieval
- **Lazy Loading**: Components load on demand
- **Event Indexing**: Fast transaction lookup
- **Batch Operations**: Reduced contract calls
- **Pagination**: Handle large datasets

## Future Enhancements

- [ ] Multi-signature wallet support
- [ ] Advanced dispute resolution system
- [ ] Integration with title companies
- [ ] Automated appraisal system
- [ ] Title insurance integration
- [ ] Cross-chain bridges
- [ ] Mobile app
- [ ] Advanced analytics dashboard
- [ ] API for 3rd party integrations
- [ ] Decentralized governance (DAO)

## Contributing

Contributions welcome! Please follow:
1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open pull request

## License

MIT License - See LICENSE file for details

## Support

For issues, questions, or suggestions:
- Open GitHub issue
- Contact: support@realestate.stacks
- Discord: [Join Community]

## Acknowledgments

- Stacks Community
- Clarity Language Team
- Real Estate Industry Partners

---

© 2025 Taconite LLC. All rights reserved.

**Built with ❤️ on Stacks Blockchain**

