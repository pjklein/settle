import React, { useState, Suspense, lazy } from 'react';
import { useStacks } from './hooks/useStacks';
import TestnetBanner from './components/TestnetBanner';
import ThemeToggle from './components/ThemeToggle';
import EscrowDisplay from './components/EscrowDisplay';
import {
  CURRENCIES,
  formatCurrency,
  toBaseUnits,
  validateEscrowAmount,
  estimateTransactionFee
} from './utils/currencyUtils';

// Lazy load map component
const MapComponent = lazy(() => 
  import('./components/Map').catch(err => {
    console.error('Map import failed:', err);
    return { default: () => <div className="w-full h-96 bg-gray-200 p-4 text-red-600">Map failed</div> };
  })
);

function App() {
  let userData, isAuthenticated, authenticate, signOut, error;
  try {
    const stacksHook = useStacks();
    userData = stacksHook.userData;
    isAuthenticated = stacksHook.isAuthenticated;
    authenticate = stacksHook.authenticate;
    signOut = stacksHook.signOut;
    error = stacksHook.error;
  } catch (e) {
    console.error('useStacks error:', e);
    userData = null;
    isAuthenticated = false;
    authenticate = () => alert('Wallet connection failed: ' + e.message);
    signOut = () => {};
    error = e;
  }
  const [selectedCurrency, setSelectedCurrency] = useState('STX');
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [escrowData, setEscrowData] = useState(null);
  const [mapCenter] = useState([41.8781, -87.6298]);
  const [displayError, setDisplayError] = useState(null);

  const handlePropertySelect = (property) => {
    setSelectedProperty(property);
    console.log('📍 Property selected in App:', property);
  };

  const handleCreateEscrow = () => {
    if (!purchaseAmount || !selectedProperty) {
      alert('Please select a property and enter a purchase amount');
      return;
    }

    const validation = validateEscrowAmount(parseFloat(purchaseAmount), selectedCurrency);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    const earnestMoney = parseFloat(purchaseAmount) * 0.1;
    const newEscrow = {
      property: selectedProperty,
      currency: selectedCurrency,
      purchasePrice: parseFloat(purchaseAmount),
      earnestMoney: earnestMoney,
      buyer: userData?.profile?.stxAddress?.testnet || 'No address',
      seller: 'Seller address pending',
      state: 'pending',
      buyerSignature: false,
      sellerSignature: false,
      timestamp: new Date().toISOString()
    };

    setEscrowData(newEscrow);
    setPurchaseAmount('');
  };

  const currencyInfo = CURRENCIES[selectedCurrency];
  const baseUnits = purchaseAmount ? toBaseUnits(purchaseAmount, selectedCurrency) : 0;
  const earnestMoneyUnits = baseUnits ? Math.floor(baseUnits * 0.1) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Testnet Banner */}
      <TestnetBanner />
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 shadow-lg border-b-4 border-indigo-600">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">🏠</div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Real Estate Settlement DApp</h1>
                <p className="text-gray-600 dark:text-gray-400">Multi-Currency Escrow on Stacks Blockchain</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <div className="text-right text-sm">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {userData?.profile?.stxAddress?.testnet?.substring(0, 10)}...
                    </p>
                    <p className="text-gray-500 dark:text-gray-400">Connected</p>
                  </div>
                  <button
                    onClick={signOut}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={authenticate}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition font-bold"
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {isAuthenticated ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Currency Selection */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4">📱 Currency</h2>
                <div className="space-y-2">
                  {Object.entries(CURRENCIES).map(([key, currency]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedCurrency(key)}
                      className={`w-full p-3 rounded-lg border-2 transition text-left flex justify-between items-center ${
                        selectedCurrency === key
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 bg-white hover:border-indigo-300'
                      }`}
                    >
                      <div>
                        <p className="font-bold">{key}</p>
                        <p className="text-xs text-gray-500">{currency.description}</p>
                      </div>
                      <span className="text-xl">{currency.icon}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Property */}
              {selectedProperty && (
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">📍 Property Details</h2>
                  <div className="space-y-3">
                    <div className="border-l-4 border-blue-500 pl-4">
                      <p className="text-sm text-gray-600 font-semibold">Address</p>
                      <p className="text-gray-900">{selectedProperty.address}</p>
                    </div>
                    {selectedProperty.area && (
                      <div className="border-l-4 border-green-500 pl-4">
                        <p className="text-sm text-gray-600 font-semibold">Area</p>
                        <p className="text-gray-900">{selectedProperty.area.toLocaleString()} sq ft</p>
                      </div>
                    )}
                    {selectedProperty.estimatedPrice && (
                      <div className="border-l-4 border-purple-500 pl-4">
                        <p className="text-sm text-gray-600 font-semibold">Estimated Price</p>
                        <p className="text-gray-900">${selectedProperty.estimatedPrice.toLocaleString()}</p>
                      </div>
                    )}
                    <div className="border-l-4 border-yellow-500 pl-4">
                      <p className="text-sm text-gray-600 font-semibold">Coordinates</p>
                      <p className="text-gray-900 text-sm">{selectedProperty.lat.toFixed(4)}, {selectedProperty.lng.toFixed(4)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedProperty(null)}
                    className="w-full mt-4 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition font-medium"
                  >
                    Clear Selection
                  </button>
                </div>
              )}

              {/* Escrow Form */}
              {selectedProperty && !escrowData && (
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">💰 Escrow</h2>
                  <input
                    type="number"
                    value={purchaseAmount}
                    onChange={(e) => setPurchaseAmount(e.target.value)}
                    placeholder="Amount"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={handleCreateEscrow}
                    className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-bold"
                  >
                    Create
                  </button>
                </div>
              )}
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Map */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                <div className="p-4 bg-gray-50 border-b">
                  <h2 className="text-lg font-bold text-gray-900">🗺️ Select Property</h2>
                  {selectedProperty && (
                    <p className="text-sm text-gray-600 mt-1">Selected: {selectedProperty.address}</p>
                  )}
                </div>
                <Suspense fallback={<div className="w-full h-96 bg-gray-100 flex items-center justify-center text-gray-500">Loading...</div>}>
                  <MapComponent 
                    mapCenter={mapCenter}
                    selectedProperty={selectedProperty}
                    onPropertySelect={handlePropertySelect}
                  />
                </Suspense>
              </div>

              {/* Escrow Display */}
              {escrowData && (
                <EscrowDisplay
                  escrowData={escrowData}
                  currentUser={userData?.profile?.stxAddress?.testnet}
                  onFund={() => alert('Funding...')}
                  onSign={() => alert('Signing...')}
                  onComplete={() => alert('Completing...')}
                  onRefund={() => alert('Refunding...')}
                />
              )}
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-2xl p-12 text-center border border-gray-200">
              <div className="text-6xl mb-6">🔐</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Connect Wallet</h2>
              <p className="text-gray-600 mb-8">Start trading real estate with multi-currency escrow on Stacks.</p>
              
              {error && (
                <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg text-red-700 text-left">
                  <strong>❌ Connection Error:</strong>
                  <p className="text-sm mt-2">{error.message}</p>
                  <p className="text-xs text-red-600 mt-2">
                    💡 Tip: Make sure your wallet extension is installed and enabled. Try opening this app in a regular browser if using Simple Browser.
                  </p>
                </div>
              )}
              
              <button
                onClick={() => authenticate()}
                className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition font-bold text-lg disabled:opacity-50"
              >
                {error ? 'Try Again' : 'Connect Wallet'}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
