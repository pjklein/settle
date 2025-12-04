/**
 * Currency configuration for the Real Estate Settlement DApp
 * Supports STX, sBTC, and USDh (Hermetica's BTC-backed stablecoin)
 */

export const CURRENCIES = {
  STX: {
    symbol: 'STX',
    name: 'Stacks',
    decimals: 6,
    isNative: true,
    contract: null,
    description: 'Native Stacks token',
    icon: '🟣',
    color: '#5546FF'
  },
  SBTC: {
    symbol: 'sBTC',
    name: 'Stacks Bitcoin',
    decimals: 8,
    isNative: false,
    contract: 'SP3DX3H4FEYZJZ586MFBS25ZW3HZDMEW92260R2PR.Wrapped-Bitcoin',
    description: 'Bitcoin on Stacks',
    icon: '₿',
    color: '#F7931A'
  },
  USDH: {
    symbol: 'USDh',
    name: 'Hermetica USD',
    decimals: 8,
    isNative: false,
    contract: 'SP2XD7417HGPRTREMKF748VNEQPDRR0RMANB7X1NK.token-usdh',
    description: 'BTC-backed stablecoin by Hermetica',
    icon: '💵',
    color: '#10B981'
  }
};

/**
 * Convert display amount to base units (considering decimals)
 * @param {number|string} amount - Amount in display units
 * @param {string} currency - Currency symbol
 * @returns {number} Amount in base units
 */
export function toBaseUnits(amount, currency) {
  const currencyInfo = CURRENCIES[currency];
  if (!currencyInfo) throw new Error(`Unknown currency: ${currency}`);
  
  const multiplier = Math.pow(10, currencyInfo.decimals);
  return Math.round(parseFloat(amount) * multiplier);
}

/**
 * Convert base units to display amount
 * @param {number|string} amount - Amount in base units
 * @param {string} currency - Currency symbol
 * @returns {string} Formatted amount for display
 */
export function fromBaseUnits(amount, currency) {
  const currencyInfo = CURRENCIES[currency];
  if (!currencyInfo) throw new Error(`Unknown currency: ${currency}`);
  
  const divisor = Math.pow(10, currencyInfo.decimals);
  return (parseFloat(amount) / divisor).toFixed(currencyInfo.decimals);
}

/**
 * Format currency amount with symbol
 * @param {number|string} amount - Amount to format
 * @param {string} currency - Currency symbol
 * @param {boolean} fromBase - Whether amount is in base units
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, currency, fromBase = false) {
  const currencyInfo = CURRENCIES[currency];
  if (!currencyInfo) return `${amount} ${currency}`;
  
  const displayAmount = fromBase 
    ? fromBaseUnits(amount, currency)
    : parseFloat(amount).toFixed(currencyInfo.decimals);
  
  return `${displayAmount} ${currency}`;
}

/**
 * Get currency contract address or null for native
 * @param {string} currency - Currency symbol
 * @returns {string|null} Contract address or null
 */
export function getCurrencyContract(currency) {
  const currencyInfo = CURRENCIES[currency];
  return currencyInfo?.contract || null;
}

/**
 * Check if currency is native (STX)
 * @param {string} currency - Currency symbol
 * @returns {boolean} True if native
 */
export function isNativeCurrency(currency) {
  return CURRENCIES[currency]?.isNative || false;
}

/**
 * Calculate earnest money (typically 10% of purchase price)
 * @param {number} purchasePrice - Full purchase price
 * @param {number} percentage - Percentage for earnest money (default 10)
 * @returns {number} Earnest money amount
 */
export function calculateEarnestMoney(purchasePrice, percentage = 10) {
  return Math.round(purchasePrice * (percentage / 100));
}

/**
 * Get all supported currencies as array
 * @returns {Array} Array of currency objects
 */
export function getSupportedCurrencies() {
  return Object.values(CURRENCIES);
}

/**
 * Validate currency symbol
 * @param {string} currency - Currency symbol to validate
 * @returns {boolean} True if valid
 */
export function isValidCurrency(currency) {
  return Object.keys(CURRENCIES).includes(currency);
}

/**
 * Get currency info by symbol
 * @param {string} currency - Currency symbol
 * @returns {Object|null} Currency info object
 */
export function getCurrencyInfo(currency) {
  return CURRENCIES[currency] || null;
}

/**
 * Format escrow details for display
 * @param {Object} escrowData - Escrow data from contract
 * @returns {Object} Formatted escrow details
 */
export function formatEscrowDetails(escrowData) {
  if (!escrowData) return null;
  
  const currency = escrowData.currency || 'STX';
  const currencyInfo = getCurrencyInfo(currency);
  
  return {
    purchasePrice: formatCurrency(escrowData.purchasePrice, currency, true),
    earnestMoney: formatCurrency(escrowData.earnestMoney, currency, true),
    fundsDeposited: formatCurrency(escrowData.fundsDeposited, currency, true),
    currency: currency,
    currencyName: currencyInfo?.name || currency,
    currencyIcon: currencyInfo?.icon || '💰',
    isNative: currencyInfo?.isNative || false,
    state: escrowData.state,
    buyer: escrowData.buyer,
    seller: escrowData.seller,
    propertyId: escrowData.propertyId,
    expiryHeight: escrowData.expiryHeight,
    buyerSignature: escrowData.buyerSignature,
    sellerSignature: escrowData.sellerSignature
  };
}

/**
 * Generate Clarity CV for currency
 * @param {string} currency - Currency symbol
 * @returns {string} Clarity string value
 */
export function getCurrencyClarityValue(currency) {
  return currency; // Returns 'STX', 'sBTC', or 'USDh'
}

/**
 * Estimate transaction fees based on currency type
 * @param {string} currency - Currency symbol
 * @returns {Object} Estimated fee information
 */
export function estimateTransactionFee(currency) {
  const isNative = isNativeCurrency(currency);
  
  return {
    currency: 'STX', // Fees always in STX
    estimatedFee: isNative ? 0.001 : 0.002, // Higher for token transfers
    description: isNative 
      ? 'Standard transaction fee' 
      : 'Includes token transfer approval'
  };
}

/**
 * Get exchange rate placeholder (would integrate with real API)
 * @param {string} fromCurrency - Source currency
 * @param {string} toCurrency - Target currency
 * @returns {Object} Exchange rate info
 */
export function getExchangeRate(fromCurrency, toCurrency) {
  // Placeholder - integrate with real price feed
  const mockRates = {
    'STX-USD': 0.50,
    'sBTC-USD': 45000,
    'USDh-USD': 1.00,
    'STX-sBTC': 0.000011,
    'sBTC-STX': 90000,
    'USDh-STX': 2.00,
    'STX-USDh': 0.50
  };
  
  const rateKey = `${fromCurrency}-${toCurrency}`;
  const rate = mockRates[rateKey];
  
  return {
    from: fromCurrency,
    to: toCurrency,
    rate: rate || 1,
    timestamp: new Date().toISOString(),
    source: 'Mock Rate - Replace with real API'
  };
}

/**
 * Convert amount between currencies using exchange rates
 * @param {number} amount - Amount to convert
 * @param {string} fromCurrency - Source currency
 * @param {string} toCurrency - Target currency
 * @returns {string} Converted amount
 */
export function convertCurrency(amount, fromCurrency, toCurrency) {
  if (fromCurrency === toCurrency) return amount.toFixed(8);
  
  const rate = getExchangeRate(fromCurrency, toCurrency);
  const converted = parseFloat(amount) * rate.rate;
  
  const targetInfo = getCurrencyInfo(toCurrency);
  return converted.toFixed(targetInfo?.decimals || 8);
}

/**
 * Validate escrow amount
 * @param {string|number} amount - Amount to validate
 * @param {string} currency - Currency symbol
 * @returns {Object} Validation result
 */
export function validateEscrowAmount(amount, currency) {
  const minAmounts = {
    STX: 100,      // Minimum 100 STX
    sBTC: 0.001,   // Minimum 0.001 sBTC
    USDh: 1000     // Minimum 1000 USDh
  };
  
  const numAmount = parseFloat(amount);
  const minAmount = minAmounts[currency] || 0;
  
  if (isNaN(numAmount) || numAmount <= 0) {
    return {
      valid: false,
      error: 'Please enter a valid positive amount'
    };
  }
  
  if (numAmount < minAmount) {
    return {
      valid: false,
      error: `Minimum amount is ${minAmount} ${currency}`
    };
  }
  
  return {
    valid: true,
    error: null
  };
}

export default {
  CURRENCIES,
  toBaseUnits,
  fromBaseUnits,
  formatCurrency,
  getCurrencyContract,
  isNativeCurrency,
  calculateEarnestMoney,
  getSupportedCurrencies,
  isValidCurrency,
  getCurrencyInfo,
  formatEscrowDetails,
  getCurrencyClarityValue,
  estimateTransactionFee,
  getExchangeRate,
  convertCurrency,
  validateEscrowAmount
};