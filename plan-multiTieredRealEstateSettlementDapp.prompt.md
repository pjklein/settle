# Plan: Multi-Tiered Real Estate Settlement DApp

**TL;DR:** Build a hierarchical smart contract system with master contract overseeing jurisdiction contracts, which create year-specific contracts, which create individual transaction contracts. Each layer manages listings, offers, term updates, contingency tracking, and escrow. Frontend provides listing marketplace, offer management, contract negotiation dashboard, and transaction tracking.

## Smart Contract Architecture

### Layer 1: Master Contract (`real-estate-master.clar`)
1. Initialize and deploy jurisdiction contracts by state/county code
2. Track all jurisdiction contract addresses
3. Enforce governance rules and fee collection
4. Maintain master registry of all active transactions
5. Handle system-wide pause/shutdown mechanisms
6. Delegate CRUD operations to jurisdiction contracts

#### Key Functions:
- `deploy-jurisdiction-contract(jurisdiction-code: string)` → Creates new jurisdiction contract
- `register-jurisdiction(jurisdiction-code: string, jurisdiction-data: {...})` → Store jurisdiction metadata
- `get-jurisdiction-contract(jurisdiction-code: string)` → Lookup jurisdiction contract address
- `get-all-jurisdictions()` → List all active jurisdictions
- `collect-fees(amount: uint)` → Aggregate platform fees
- `pause-system()` → Emergency pause (owner only)
- `get-master-stats()` → Cumulative platform statistics

#### Data Structures:
```clarity
{
  jurisdiction-contracts: Map<code, principal>,
  jurisdiction-metadata: Map<code, {name, rules, fee-basis-points, dispute-rules}>,
  platform-fees: uint,
  total-transactions: uint,
  total-volume: uint,
  paused: bool
}
```

---

### Layer 2: Jurisdiction Contract (`real-estate-jurisdiction-{code}.clar`)
1. Create year-specific contracts for each calendar year
2. Track all year contracts for that jurisdiction
3. Manage jurisdiction-level settings (fees, dispute rules)
4. Maintain cumulative statistics (volume, disputes, completed sales)
5. Store jurisdiction metadata (name, rules, standards)

#### Key Functions:
- `create-year-contract(year: uint)` → Creates new year contract
- `register-year-contract(year: uint, contract-address: principal)` → Track year contracts
- `get-year-contract(year: uint)` → Lookup year contract
- `get-all-years()` → List all year contracts
- `update-jurisdiction-settings({fees, rules, ...})` → Modify jurisdiction rules
- `get-jurisdiction-stats()` → Statistics for jurisdiction
- `get-transaction-count()` → Total transactions in jurisdiction

#### Data Structures:
```clarity
{
  jurisdiction-code: string,
  year-contracts: Map<uint, principal>,
  jurisdiction-name: string,
  fee-basis-points: uint,
  dispute-resolution-type: string,
  contingency-rules: {...},
  total-sales: uint,
  total-volume: uint,
  completed-transactions: uint,
  disputed-transactions: uint,
  creation-height: uint
}
```

---

### Layer 3: Year Contract (`real-estate-jurisdiction-year-{code}-{year}.clar`)
1. Create individual transaction contracts
2. Track all transactions for that jurisdiction-year
3. Manage annual escrow pools and fund tracking
4. Handle year-end settlement and reporting
5. Store performance metrics for the year

#### Key Functions:
- `create-transaction-contract(seller: principal, property-data: {...})` → Create new transaction
- `register-transaction(transaction-id: uint, contract-address: principal)` → Track transactions
- `get-transaction(transaction-id: uint)` → Lookup transaction
- `get-all-transactions()` → List all transactions for year
- `deposit-escrow-funds(amount: uint, currency: string)` → Add to annual escrow pool
- `withdraw-escrow-funds(amount: uint, currency: string)` → Remove from annual escrow pool
- `get-escrow-balance(currency: string)` → Current escrow pool balance
- `get-year-stats()` → Performance metrics for year
- `finalize-year()` → Year-end settlement and reporting

#### Data Structures:
```clarity
{
  jurisdiction-code: string,
  year: uint,
  transaction-contracts: Map<uint, principal>,
  transaction-count: uint,
  escrow-pools: Map<currency, uint>,
  pending-transactions: uint,
  completed-transactions: uint,
  disputed-transactions: uint,
  total-volume: uint,
  average-days-to-close: uint,
  creation-height: uint,
  finalized: bool
}
```

---

### Layer 4: Transaction Contract (`real-estate-transaction-{id}.clar`)
State machine-based contract managing individual property transactions from listing through close.

#### States:
- `listing` → Property listed by seller, awaiting offers
- `offer-received` → Buyer(s) have submitted offer(s)
- `negotiating` → Terms being modified by buyer/seller
- `contingency-pending` → All terms agreed, contingencies being resolved
- `ready-to-close` → All contingencies met, funds escrowed
- `closed` → Transaction complete, possession transferred
- `completed` → Post-closing tasks done, attestation recorded
- `cancelled` → Transaction terminated, funds refunded
- `disputed` → Dispute filed, pending resolution

#### Key Functions:

**Listing Management:**
- `create-listing(property-data: {...}, terms: {...})` → Initial property listing
- `update-listing(property-data: {...})` → Seller modifies property details
- `delist-property()` → Seller removes property from market
- `get-listing()` → Retrieve current listing details

**Offer Management:**
- `submit-offer(buyer: principal, offered-price: uint, terms: {...})` → Submit purchase offer
- `accept-offer(offer-id: uint)` → Seller accepts specific offer
- `reject-offer(offer-id: uint)` → Seller rejects offer
- `submit-counter-offer(offer-id: uint, price: uint, terms: {...})` → Counter with new terms
- `withdraw-offer()` → Buyer withdraws offer
- `get-offers()` → List all offers
- `get-offer(offer-id: uint)` → Get specific offer details

**Term Negotiation:**
- `propose-term-changes(offer-id: uint, term-changes: {...})` → Propose modifications
- `accept-term-changes(proposal-id: uint)` → Accept proposed changes
- `reject-term-changes(proposal-id: uint)` → Reject proposed changes
- `get-term-history()` → Full version history of all term modifications
- `get-current-terms()` → Agreed-upon terms as of now

**Contingency Tracking:**
- `create-contingency(contingency-type: string, deadline: uint)` → Add contingency
- `update-contingency-status(contingency-id: uint, status: string)` → Update status (pending/completed/waived/failed)
- `mark-contingency-complete(contingency-id: uint)` → Complete contingency
- `fail-contingency(contingency-id: uint, reason: string)` → Mark as failed
- `waive-contingency(contingency-id: uint)` → Waive contingency
- `get-contingencies()` → List all contingencies
- `get-contingency-status()` → Overall contingency readiness

**Escrow Management:**
- `deposit-earnest-money(amount: uint, currency: string)` → Buyer deposits EM
- `deposit-remaining-funds(amount: uint, currency: string)` → Buyer deposits final amount at closing
- `get-escrow-balance()` → Current escrowed funds
- `get-release-conditions()` → What must occur for funds release
- `check-release-conditions()` → Verify all conditions met
- `release-funds-to-seller()` → Transfer escrowed funds to seller (after all conditions met)
- `refund-earnest-money(reason: string)` → Return EM to buyer (if applicable)

**Possession Tracking:**
- `set-possession-date(date: uint)` → Record possession date
- `set-inspection-period(days: uint)` → Establish inspection window
- `record-final-walkthrough()` → Mark final walkthrough complete
- `record-possession-transfer()` → Record property possession transferred
- `get-possession-status()` → Current possession timeline

**State Transitions & Signatures:**
- `sign-contract(signer-type: string)` → Buyer/seller signs agreement (stored as signed-height)
- `can-proceed-to-contingency()` → Check if ready for contingency phase
- `can-proceed-to-closing()` → Check if all contingencies met
- `finalize-transaction()` → Close transaction after all requirements met
- `cancel-transaction(reason: string)` → Terminate transaction

**Read-Only Functions:**
- `get-transaction-state()` → Current state
- `get-current-offer()` → Accepted offer details
- `get-buyer()` → Current buyer principal
- `get-seller()` → Seller principal
- `get-property-data()` → Property information
- `get-transaction-timeline()` → All state changes with timestamps
- `get-completion-status()` → Percentage completion metrics

#### Data Structures:
```clarity
{
  transaction-id: uint,
  state: string,  ;; current state from list above
  property-data: {
    coordinates: {lat: int, lng: int},
    legal-description: string,
    parcel-id: string,
    assessed-value: uint,
    property-type: string,
    zoning: string,
    square-footage: uint
  },
  seller: principal,
  buyer: principal,
  listing-data: {
    list-price: uint,
    list-date: uint,
    days-on-market: uint,
    listed-by: principal
  },
  offers: List<{
    offer-id: uint,
    buyer: principal,
    offered-price: uint,
    earnest-money: uint,
    terms: {...},
    status: string,  ;; pending, accepted, rejected, countered
    submission-date: uint
  }>,
  accepted-offer: Option<uint>,  ;; offer-id
  term-history: List<{
    version: uint,
    proposer: principal,
    changes: {...},
    status: string,  ;; proposed, accepted, rejected
    timestamp: uint
  }>,
  contingencies: List<{
    contingency-id: uint,
    type: string,  ;; home-inspection, appraisal, financing, title
    status: string,  ;; pending, completed, waived, failed
    deadline: uint,
    completion-date: Option<uint>,
    details: string
  }>,
  escrow: {
    currency: string,
    earnest-money-deposited: uint,
    remaining-funds-deposited: uint,
    total-escrowed: uint,
    buyer-signature-height: Option<uint>,
    seller-signature-height: Option<uint>,
    release-conditions: List<string>
  },
  possession: {
    inspection-period-days: uint,
    final-walkthrough-date: Option<uint>,
    possession-date: uint,
    possession-transferred-date: Option<uint>
  },
  timeline: List<{
    event-type: string,
    timestamp: uint,
    height: uint,
    actor: principal,
    details: string
  }>,
  creation-height: uint
}
```

---

## React Frontend Components

### Pages/Views

#### 1. Marketplace Dashboard
- **Purpose:** Browse and search property listings across all jurisdictions
- **Features:**
  - Search by location, price range, property type
  - Filter by state/county (jurisdiction)
  - Sort by list price, days-on-market, newest
  - Map view showing all listings
  - Grid view with property cards
  - Saved/favorited listings
- **Data Flow:** Query all year contracts → Get all transactions in listing state → Display with filtering
- **Components:** PropertyListingCard, SearchFilters, MapView, ListView

#### 2. Listing Detail View
- **Purpose:** Full property information and offer submission
- **Features:**
  - Property photos/images (placeholder)
  - Full legal description
  - Assessed value history
  - Zoning and restrictions
  - Current terms (inspection period, closing date, earnest money %)
  - Offer submission form
  - Offer history (if multiple offers visible)
  - Seller contact info (seller side only)
- **Data Flow:** Load specific transaction → Display property-data + listing-data + current-offer
- **Components:** PropertyDetailPanel, OfferForm, TermsDisplay, OfferHistoryTimeline

#### 3. Offer Management Dashboard
- **Purpose:** View received/made offers and manage acceptance/rejection
- **Features:**
  - Inbox view of all offers received (seller view)
  - Outbox view of all offers made (buyer view)
  - Filter by status (pending, accepted, rejected, countered)
  - Accept/reject/counter buttons
  - Offer comparison (side-by-side with different prices/terms)
  - Counter-offer form
  - Offer expiration tracking
- **Data Flow:** Filter offers by buyer/seller → Show with status indicators → Allow state transitions
- **Components:** OfferCard, OfferComparison, CounterOfferForm, OfferStatusTimeline

#### 4. Contract Negotiation
- **Purpose:** Manage term modifications and track negotiation history
- **Features:**
  - Current agreed terms display
  - Proposed changes form (both parties can propose)
  - Version history with full diff tracking
  - Timeline of all proposals (who proposed, when, what changed)
  - Accept/reject/counter buttons for each proposal
  - Visual diff highlighting changes
  - Comment section per proposal
- **Data Flow:** Load term-history → Display versions with changes → Allow propose/accept/reject
- **Components:** TermComparison, TermHistoryTimeline, ProposalForm, ChangeHighlight

#### 5. Contingency Tracker
- **Purpose:** Track contract contingencies (inspection, appraisal, financing, title)
- **Features:**
  - Checklist of contingencies (home inspection, appraisal, financing, title)
  - Status indicators (pending, completed, waived, failed)
  - Deadline tracking with countdown
  - Event logging (inspection report uploaded, appraisal received, etc.)
  - Completion evidence upload area
  - Ability to mark complete or fail
  - Timeline showing when each was resolved
  - Overall readiness percentage
- **Data Flow:** Load contingencies array → Display with status → Allow status updates
- **Components:** ContingencyChecklist, ContingencyCard, EventLog, DeadlineCountdown, ReadinessGauge

#### 6. Escrow Management
- **Purpose:** Track escrowed funds and release conditions
- **Features:**
  - Display escrowed amount and currency
  - Show earnest money deposited
  - Show remaining funds due at close
  - List release conditions (inspection passed, appraisal approved, financing approved, title cleared)
  - Checkmark conditions as met
  - Timeline of fund deposits
  - Release button (only when all conditions met)
  - Refund button (if transaction cancelled)
- **Data Flow:** Load escrow data → Check release conditions → Enable release button when ready
- **Components:** EscrowBalanceWidget, ReleaseConditionsChecklist, DepositTimeline, FundReleaseButton

#### 7. Transaction Timeline/Status
- **Purpose:** High-level view of transaction progress
- **Features:**
  - Visual timeline of all state changes
  - Current state highlighted
  - Countdown to key dates (inspection deadline, appraisal deadline, closing date)
  - Signature status (both parties signed?)
  - Completion percentage
  - Action items remaining
  - All participants (buyer, seller, agent?, title company?)
- **Data Flow:** Load transaction.timeline array → Display chronologically with icons
- **Components:** TransactionTimeline, StateIndicator, ActionItemsList, ParticipantList

#### 8. Transaction History / Completed Sales
- **Purpose:** View past transactions and closing records
- **Features:**
  - Filter by year, jurisdiction, status
  - Display completed transactions
  - Closing date, final price, days-to-close
  - Attestation badge (blockchain confirmed)
  - Export/print closing statement
  - View full transaction history (all states/changes)
- **Data Flow:** Query year contracts for completed transactions → Display with full history
- **Components:** CompletedTransactionCard, TransactionHistoryPanel, ClosingStatement, AttestationBadge

---

### Key React Components

#### Core Components

**PropertyListingCard**
```jsx
Props: {property, listing, onViewDetails, onSubmitOffer}
Displays: Address, price, days-on-market, property-type, agent, favorite button
Actions: View Details, Submit Offer
```

**OfferForm**
```jsx
Props: {property, currentTerms, onSubmit}
Fields: Offered price, earnest money %, inspection days, closing date, special terms
Validation: Min offer %, deadline requirements, fund availability
```

**OfferCard**
```jsx
Props: {offer, onAccept, onReject, onCounter, showDetails}
Displays: Buyer/seller name, offered price, terms, submission date, current status
Actions: Accept, Reject, Counter (contextual based on state and actor)
```

**TermComparison**
```jsx
Props: {currentTerms, proposedTerms, onAccept, onReject, onModify}
Displays: Side-by-side comparison of current vs proposed
Highlights: Changes in different color
```

**ContingencyChecklist**
```jsx
Props: {contingencies, onStatusChange, onMarkComplete}
Displays: List of contingencies, status, deadline, completion date
Actions: Mark complete, fail, waive buttons (contextual)
```

**EscrowBalanceWidget**
```jsx
Props: {escrow, releaseConditions, onReleaseClick}
Displays: Current balance, earnest money, remaining funds, currency
Shows: Release conditions checklist, release button (enabled when ready)
```

**TransactionTimeline**
```jsx
Props: {transaction}
Displays: All state changes chronologically with timestamps
Icons: Different icon per state (listing→offer→negotiate→contingency→close→complete)
```

**ContingencyCard**
```jsx
Props: {contingency, onUpdate}
Displays: Type, status, deadline, days remaining, completion details
Actions: Mark complete, fail, waive (if allowed)
```

---

## Data Flow & Integration Points

### Workflow 1: Property Listing Creation
1. **Seller submits listing** via PropertyListingForm in frontend
2. **Create transaction contract** on Layer 4 (year contract deploys it)
3. **Store property NFT** (real-estate-parcel contract mints it)
4. **Register listing** with Layer 3 year contract
5. **Listing appears** in marketplace search/map
6. **Blockchain confirms** transaction deployment

**Frontend Flow:**
```
Seller Dashboard 
  → List Property Form 
    → Property details + terms
    → Submit to Layer 4 contract
    → Listing appears in marketplace
```

### Workflow 2: Offer Submission
1. **Buyer views listing** → PropertyListingCard in marketplace
2. **Clicks "Make Offer"** → OfferForm opens
3. **Fills offer details** (price, earnest money %, terms)
4. **Submits transaction** → Calls Layer 4 `submit-offer`
5. **Earnest money deposited** → Call to escrow contract
6. **Offer recorded** on blockchain with buyer principal + timestamp
7. **Seller notified** (server-side event or polling)
8. **Seller sees in OfferCard** in Offer Management Dashboard

**Frontend Flow:**
```
Buyer → PropertyListingCard 
  → Make Offer button 
  → OfferForm (price, terms)
  → Submit transaction
  → Wallet signs transaction
  → Offer appears in seller's dashboard
```

### Workflow 3: Offer Negotiation
1. **Seller receives offers** in OfferCard components
2. **Seller clicks "Counter"** → CounterOfferForm opens
3. **Seller modifies price/terms** → Proposes changes
4. **Submits counter** → Calls Layer 4 `submit-counter-offer`
5. **Version history updated** with new proposal
6. **Buyer sees counter** in their offer (now shows as "countered")
7. **Buyer clicks "Counter back"** or "Accept"
8. **Negotiation continues** until both accept same terms

**Frontend Flow:**
```
Seller → OfferCard (Pending offer)
  → Counter button
  → CounterOfferForm (modify price/terms)
  → Submit counter-offer
  → Buyer sees updated offer marked "Countered"
  → Buyer: Accept or Counter again
```

### Workflow 4: Term Negotiation (Post-Offer Acceptance)
1. **Offer accepted** → State moves to "negotiating"
2. **Either party can propose changes** to terms (inspection days, closing date, etc.)
3. **Frontend shows TermComparison** with Current Terms vs Proposed
4. **Call Layer 4 `propose-term-changes`** with modifications
5. **Other party sees change** in ContractNegotiationDashboard
6. **Can accept, reject, or propose counter-changes**
7. **Version history grows** with each proposal
8. **When both accept same version** → Move to contingency phase

**Frontend Flow:**
```
Buyer/Seller → Contract Negotiation Dashboard
  → See current agreed terms
  → Click "Propose Changes"
  → Modify specific terms
  → Submit proposal
  → Other party sees proposed changes
  → Accept/Reject/Counter-propose
```

### Workflow 5: Contingency Management
1. **Terms finalized** → State moves to "contingency-pending"
2. **System auto-creates contingencies** (home inspection, appraisal, financing, title)
3. **ContingencyTracker component** shows checklist
4. **Parties update status** as contingencies complete
5. **Call Layer 4 `update-contingency-status`** with completion details
6. **Cannot proceed to closing** until all contingencies met or waived
7. **System shows readiness %** (2/4 contingencies met = 50%)

**Frontend Flow:**
```
Buyer/Seller → Contingency Tracker
  → See checklist (inspection, appraisal, financing, title)
  → As each completes: Upload report
  → Call update-contingency-status(completed)
  → Readiness percentage increases
  → When all complete: "Ready to Close" button enabled
```

### Workflow 6: Escrow & Closing
1. **All contingencies met** → State moves to "ready-to-close"
2. **Buyer deposits remaining funds** via EscrowManagementWidget
3. **System checks release conditions** (earnest money + remaining = purchase price)
4. **Both parties sign closing documents** (via Layer 4 `sign-contract`)
5. **When all conditions met:** Release button enabled
6. **Click release** → Layer 4 `release-funds-to-seller`
7. **Property NFT transferred** to buyer
8. **Transaction marked "closed"** then "completed"

**Frontend Flow:**
```
Buyer → Escrow Management
  → Deposit remaining funds
  → Confirm release conditions
  → Sign contract (record height)

Seller → Escrow Management
  → Confirm receipt of funds
  → Sign contract

System → When both signed:
  → Show "Release Funds" button
  → Click → Transfer funds to seller
  → Transfer property NFT to buyer
  → Mark transaction "Completed"
```

---

## Architecture Decisions & Configuration Points

### 1. Multi-Signature Escrow vs Contract-Controlled
**Decision:** Contract-controlled escrow with release conditions
- **Pros:** Automatic enforcement, no intermediary needed, transparent on-chain
- **Cons:** No human override in disputes
- **Frontend Impact:** EscrowWidget displays automated conditions

### 2. Dispute Resolution
**Decision:** Governance token holders vote on disputes (for MVP start simple)
- **Future:** Mediator network, arbitration tier
- **Frontend Impact:** Add Dispute Button → Initiates voting period

### 3. Contingency Enforcement
**Decision:** Buyer can unilaterally fail contingency and lose earnest money (strict default)
- **Alternative:** Configurable per transaction
- **Frontend Impact:** Fail button shows consequence warning

### 4. Version Control Strategy
**Decision:** Store all term proposals on-chain (delta compression)
- **Frontend Impact:** Full negotiation history visible, can see exact changes per version

### 5. Property Uniqueness Identifier
**Decision:** Hash of (coordinates + legal description) + county code + parcel-id
- **Prevents collisions** across jurisdictions
- **Frontend Impact:** Property search indexed on hash + jurisdiction

### 6. Jurisdiction Organization
**Decision:** Hierarchical: Region → State → County (maps to real estate law structure)
- **Layer 2 contracts:** One per county (e.g., real-estate-jurisdiction-ny-king-county)
- **Frontend Impact:** Jurisdiction selector in listings dropdown

### 7. Annual vs Perpetual Year Contracts
**Decision:** Year-based contracts (Layer 3) for accounting/reporting
- **Benefits:** Clear annual reconciliation, tax compliance, performance metrics by year
- **Frontend Impact:** Transaction search filters on year

### 8. Fee Model
**Decision:** Basis points on transaction (e.g., 1% = 100 basis points)
- **Collected at:** Layer 1 (master) siphons fees from each transaction
- **Frontend Impact:** Show fee breakdown in closing statement

---

## Phase 1: MVP Scope

**Smart Contracts:**
- ✓ Master contract (basic deployment/tracking)
- ✓ One Jurisdiction contract (single state/county for testing)
- ✓ One Year contract (2025)
- ✓ Transaction contract (full state machine)

**Frontend:**
- ✓ Marketplace Dashboard (search/browse listings)
- ✓ Listing Detail + Offer Form
- ✓ Offer Management Dashboard
- ✓ Basic Term Negotiation
- ✓ Contingency Tracker (checklist)
- ✓ Escrow Widget
- ✓ Transaction Timeline

**Omitted for Phase 1:**
- ❌ Multi-jurisdiction support (only 1 county)
- ❌ Multiple years (only 2025)
- ❌ Dispute resolution (skip to Phase 2)
- ❌ Agent/broker features (direct buyer-seller only)
- ❌ Document upload/storage (reference URLs only)
- ❌ Appraisal/inspection integration (manual status only)

---

## Phase 2: Production Features

**Smart Contracts:**
- Multi-jurisdiction deployment automation
- Dispute resolution with voting
- Advanced escrow with multi-party signatures
- Compliance/regulatory hooks

**Frontend:**
- Document upload integration
- Real estate agent/broker dashboard
- Third-party integrations (lenders, appraisers, title companies)
- Advanced search and analytics
- Mobile app

**Integrations:**
- Zillow/MLS data import
- Appraisal management APIs
- Title company APIs
- Lender APIs
- County recording APIs
