import React, { useState, Suspense, lazy } from 'react';
import { useStacks } from './hooks/useStacks';
import TestnetBanner from './components/TestnetBanner';
import ThemeToggle from './components/ThemeToggle';
import Marketplace from './components/Marketplace';
import OfferManagement from './components/OfferManagement';
import NegotiationDashboard from './components/NegotiationDashboard';
import TransactionTracking from './components/TransactionTracking';

const AppWithLayers = () => {
  // Stacks integration
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

  // Component states
  const [activeView, setActiveView] = useState('marketplace'); // marketplace, offers, negotiation, tracking
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [transactionData, setTransactionData] = useState(null);
  const [userRole, setUserRole] = useState('buyer'); // buyer or seller

  const handlePropertySelect = (property) => {
    setSelectedProperty(property);
    console.log('📍 Property selected:', property);
  };

  const handleSubmitOffer = (offer) => {
    console.log('📋 Offer submitted:', offer);
    setTransactionData(prev => ({
      ...prev,
      offer: offer,
      state: 'offer-received'
    }));
    setActiveView('offers');
  };

  const handleAcceptOffer = (offerId) => {
    console.log('✓ Offer accepted:', offerId);
    setTransactionData(prev => ({
      ...prev,
      acceptedOffer: offerId,
      state: 'contingency-pending'
    }));
  };

  const handleRejectOffer = (offerId) => {
    console.log('✗ Offer rejected:', offerId);
  };

  const handleCounterOffer = (counter) => {
    console.log('↩️ Counter offer:', counter);
  };

  const handleProposeTerm = (proposal) => {
    console.log('📝 Term proposed:', proposal);
  };

  const handleApproveProposal = (proposalId) => {
    console.log('✓ Proposal approved:', proposalId);
  };

  const handleRejectProposal = (proposalId) => {
    console.log('✗ Proposal rejected:', proposalId);
  };

  const navItems = [
    { id: 'marketplace', label: '🛍️ Marketplace', icon: '🏪' },
    { id: 'offers', label: '📋 Offers', icon: '📬', disabled: !selectedProperty },
    { id: 'negotiation', label: '🤝 Negotiation', icon: '💬', disabled: !transactionData },
    { id: 'tracking', label: '📊 Tracking', icon: '📈', disabled: !transactionData }
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white rounded-xl shadow-2xl p-12 text-center">
            <div className="text-6xl mb-6">🔐</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Connect Wallet</h2>
            <p className="text-gray-600 mb-8">
              Start using the multi-tiered real estate settlement DApp on Stacks blockchain.
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg text-red-700 text-left">
                <strong>❌ Connection Error:</strong>
                <p className="text-sm mt-2">{error.message}</p>
              </div>
            )}

            <button
              onClick={() => authenticate()}
              className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition font-bold text-lg"
            >
              {error ? 'Try Again' : 'Connect Wallet'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
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
                <p className="text-gray-600 dark:text-gray-400">Multi-Tiered Jurisdiction-Based Smart Contracts</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <div className="text-right text-sm">
                <p className="font-medium text-gray-900 dark:text-white">
                  {userData?.profile?.stxAddress?.testnet?.substring(0, 10)}...
                </p>
                <p className="text-gray-500 dark:text-gray-400">
                  Role: <span className="font-bold capitalize text-indigo-600">{userRole}</span>
                </p>
              </div>
              <button
                onClick={signOut}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium"
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-8 overflow-x-auto">
          <div className="flex">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                disabled={item.disabled}
                className={`px-6 py-4 font-bold transition whitespace-nowrap ${
                  activeView === item.id
                    ? 'text-indigo-600 border-b-4 border-indigo-600 bg-indigo-50'
                    : item.disabled
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'
                }`}
              >
                {item.icon} {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Views */}
        {activeView === 'marketplace' && (
          <Marketplace
            onPropertySelect={handlePropertySelect}
            selectedProperty={selectedProperty}
          />
        )}

        {activeView === 'offers' && selectedProperty && (
          <OfferManagement
            transaction={transactionData}
            isSellerView={userRole === 'seller'}
            onSubmitOffer={handleSubmitOffer}
            onAcceptOffer={handleAcceptOffer}
            onRejectOffer={handleRejectOffer}
            onCounterOffer={handleCounterOffer}
          />
        )}

        {activeView === 'negotiation' && transactionData && (
          <NegotiationDashboard
            transaction={transactionData}
            onProposeTerm={handleProposeTerm}
            onApprove={handleApproveProposal}
            onReject={handleRejectProposal}
          />
        )}

        {activeView === 'tracking' && transactionData && (
          <TransactionTracking
            transaction={transactionData}
          />
        )}

        {/* Placeholder for disabled views */}
        {(activeView === 'offers' || activeView === 'negotiation' || activeView === 'tracking') && !selectedProperty && !transactionData && (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="text-5xl mb-4">📍</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Select a Property First</h3>
            <p className="text-gray-600 mb-6">Go to the Marketplace to select a property to get started</p>
            <button
              onClick={() => setActiveView('marketplace')}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-bold"
            >
              Go to Marketplace
            </button>
          </div>
        )}
      </main>

      {/* Footer Info */}
      <footer className="bg-gray-900 text-white mt-12">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-2">🏗️ Architecture</h3>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>✓ Layer 1: Master Contract</li>
                <li>✓ Layer 2: Jurisdiction Contracts</li>
                <li>✓ Layer 3: Year Contracts</li>
                <li>✓ Layer 4: Transaction Contracts</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2">📊 Features</h3>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>✓ Multi-currency escrow (STX, sBTC, USDh)</li>
                <li>✓ Full state machine workflow</li>
                <li>✓ Contingency tracking</li>
                <li>✓ Term negotiation</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2">🔗 Blockchain</h3>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>Network: Stacks Testnet</li>
                <li>Language: Clarity</li>
                <li>Standard: SIP-009 (NFT)</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© 2025 Taconite LLC. Real Estate Settlement DApp. Built on Stacks Blockchain.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AppWithLayers;
