# Real Estate Settlement DApp

A decentralized application for real estate settlement using Stacks blockchain and Clarity smart contracts with multi-currency support (STX, sBTC, USDh).

## Features

- **Property Registry**: Register and track real estate parcels on-chain
- **Multi-Currency Escrow**: Create escrow contracts in STX, sBTC, or USDh (Hermetica's BTC-backed stablecoin)
- **NFT Integration**: Each property is represented as an NFT with metadata
- **Interactive Map**: OpenStreetMap integration for property selection
- **Stacks Testnet**: Built for Stacks testnet environment
- **SIP-010 Token Support**: Full support for fungible tokens like sBTC and USDh

## Supported Currencies

### STX (Stacks)
- **Type**: Native token
- **Decimals**: 6
- **Use Case**: Standard real estate transactions on Stacks

### sBTC (Stacks Bitcoin)
- **Type**: SIP-010 token
- **Decimals**: 8
- **Contract**: `SP3DX3H4FEYZJZ586MFBS25ZW3HZDMEW92260R2PR.Wrapped-Bitcoin`
- **Use Case**: Bitcoin-denominated property transactions

### USDh (Hermetica USD)
- **Type**: SIP-010 token
- **Decimals**: 8
- **Contract**: `SP2XD7417HGPRTREMKF748VNEQPDRR0RMANB7X1NK.token-usdh`
- **Use Case**: Stable, BTC-backed USD transactions for predictable pricing

## Tech Stack

- **Frontend**: Vite + React + TailwindCSS
- **Blockchain**: Stacks blockchain (testnet)
- **Smart Contracts**: Clarity language
- **Map**: Leaflet + OpenStreetMap
- **Wallet**: Stacks Connect

## Setup

### Prerequisites
- Node.js 18+ and npm/yarn
- Clarinet CLI for smart contract deployment
- Stacks wallet (Leather, Xverse, or Hiro)
- Testnet STX, sBTC, and/or USDh tokens

### Installation

1. Clone the repository
```bash
git clone https://github.com/pjklein/settle.git
cd settle
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
```bash
cp .env.example .env
```

Edit `.env` with your contract addresses:
```env
VITE_STACKS_NETWORK=testnet
VITE_STACKS_API_URL=https://api.testnet.hiro.so
VITE_CONTRACT_ADDRESS=ST2NV8DHHTJ83N1M7FF3ZTB7C02RAF7S6KK9Y61CG
VITE_REGISTRY_CONTRACT=real-estate-registry
VITE_ESCROW_CONTRACT=real-estate-escrow
VITE_NFT_CONTRACT=real-estate-parcel
VITE_MASTER_CONTRACT=real-estate-master
VITE_TRANSACTION_CONTRACT=real-estate-transaction
VITE_JURISDICTION_CONTRACT=real-estate-jurisdiction
VITE_PARCEL_CONTRACT=real-estate-parcel
VITE_YEAR_CONTRACT=real-estate-year
VITE_SBTC_CONTRACT=SP3DX3H4FEYZJZ586MFBS25ZW3HZDMEW92260R2PR.Wrapped-Bitcoin
VITE_USDH_CONTRACT=SP2XD7417HGPRTREMKF748VNEQPDRR0RMANB7X1NK.token-usdh
VITE_APP_NAME="Real Estate Settlement DApp"
VITE_APP_ICON="/logo.png"
```

4. Start development server
```bash
npm run dev
```

5. Deploy smart contracts to testnet
```bash
npm run deploy:contracts
```

## Smart Contracts

### real-estate-registry.clar
Central registry for property tracking
- Register properties with coordinates
- Track escrow contract assignments
- Manage property ownership transfers

### real-estate-escrow.clar
Multi-currency escrow contract management
- Create escrow in STX, sBTC, or USDh
- Fund escrow with selected currency
- Handle buyer/seller signatures
- Complete transactions with automatic fund transfer
- Refund mechanism for cancelled/expired escrows

### real-estate-parcel.clar
NFT implementation for properties (SIP-009)
- Mint property NFTs with metadata
- Store parcel-specific data (coordinates, legal descriptions)
- Transfer property ownership

## Usage Guide

### 1. Connect Wallet
Click "Connect Stacks Wallet" and authenticate with your wallet (must have testnet tokens).

### 2. Select Property
- Search for an address using the search bar
- Or click directly on the map to select coordinates
- Property information will display in the sidebar

### 3. Register Property
Click "Register Property" to add the property to the on-chain registry.

### 4. Create Escrow
1. Select your preferred currency (STX, sBTC, or USDh)
2. Enter the purchase amount
3. Review earnest money calculation (10% of purchase)
4. Click "Create Escrow"
5. Approve the transaction in your wallet

### 5. Fund Escrow (Buyer)
Once escrow is created, the buyer must fund it with earnest money:
- For **STX**: Direct transfer from wallet
- For **sBTC/USDh**: Token approval + transfer (requires SIP-010 token balance)

### 6. Sign Contract
Both buyer and seller must sign the contract to proceed.

### 7. Complete Transaction
Once fully funded and signed, any party can complete the transaction:
- Full purchase amount transfers to seller
- Property ownership transfers to buyer
- Escrow clears from registry

## Multi-Currency Considerations

### STX Transactions
- Simplest option - native token
- No additional approvals needed
- Lower transaction fees

### sBTC Transactions
- Requires sBTC balance in wallet
- Must approve token spending before funding
- Higher transaction fees for token operations
- Denominated in Bitcoin (8 decimals)

### USDh Transactions
- Stable pricing in USD terms
- BTC-backed by Hermetica protocol
- Requires USDh token balance
- Must approve token spending before funding
- Ideal for price stability during escrow period

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Test smart contracts
npm run test:contracts

# Deploy contracts to testnet
npm run deploy:contracts

# Run linter
npm run lint
```

## Testing Contracts

```bash
# Run all contract tests
clarinet test

# Check contract syntax
clarinet check

# Test specific contract
clarinet test contracts/real-estate-escrow.clar
```

## Project Structure

```
real-estate-settlement-dapp/
├── contracts/
│   ├── real-estate-registry.clar
│   ├── real-estate-escrow.clar
│   └── real-estate-parcel.clar
├── src/
│   ├── components/
│   │   ├── EscrowDisplay.jsx
│   │   └── ...
│   ├── utils/
│   │   ├── currencyUtils.js
│   │   └── ...
│   ├── hooks/
│   │   └── useStacks.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── public/
├── tests/
│   └── ...
├── Clarinet.toml
├── vite.config.js
├── tailwind.config.js
├── package.json
└── README.md
```

## Currency Utilities API

The project includes comprehensive currency utilities:

```javascript
import { 
  toBaseUnits, 
  fromBaseUnits, 
  formatCurrency,
  getCurrencyInfo,
  validateEscrowAmount
} from './utils/currencyUtils';

// Convert display amount to base units
const microSTX = toBaseUnits(100, 'STX'); // 100000000

// Format for display
const formatted = formatCurrency(100000000, 'STX', true); // "100.000000 STX"

// Validate amounts
const validation = validateEscrowAmount(50, 'STX');
// { valid: false, error: 'Minimum amount is 100 STX' }
```

## Security Considerations

- Always verify contract addresses before transactions
- Test with small amounts first on testnet
- Review all escrow conditions before funding
- Ensure sufficient token balances for SIP-010 currencies
- Monitor expiry blocks to avoid automatic cancellation

## Troubleshooting

### "Insufficient funds" error
- Verify you have enough balance in the selected currency
- Check for adequate STX for transaction fees
- For tokens, ensure approval transaction succeeded

### Token transfer fails
- Confirm token contract address is correct
- Verify token balance with `ft-get-balance`
- Check if token approval is required

### Map not loading
- Verify internet connection for OpenStreetMap tiles
- Check browser console for CORS errors
- Ensure Leaflet CSS is properly loaded

## Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Resources

- [Stacks Documentation](https://docs.stacks.co)
- [Clarity Language Reference](https://docs.stacks.co/clarity)
- [SIP-009 NFT Standard](https://github.com/stacksgov/sips/blob/main/sips/sip-009/sip-009-nft-standard.md)
- [SIP-010 Fungible Token Standard](https://github.com/stacksgov/sips/blob/main/sips/sip-010/sip-010-fungible-token-standard.md)
- [Hermetica Protocol](https://www.hermetica.fi)

## Contact

For questions or support, please open an issue on GitHub.

---

© 2025 Taconite LLC. All rights reserved.
Built on Stacks Blockchain.