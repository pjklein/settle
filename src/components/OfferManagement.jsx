import React, { useState } from 'react';
import { DollarSign, TrendingUp, Clock, Check, X, MessageSquare } from 'lucide-react';

const OfferManagement = ({ transaction, isSellerView, onSubmitOffer, onAcceptOffer, onRejectOffer, onCounterOffer }) => {
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [showCounterForm, setShowCounterForm] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  
  const [offerForm, setOfferForm] = useState({
    offeredPrice: '',
    earnestMoney: '',
    proposedTerms: '',
    offerValidity: 7 // days
  });

  const [counterForm, setCounterForm] = useState({
    counterPrice: '',
    counterTerms: ''
  });

  // Mock offers data
  const mockOffers = [
    {
      id: 'offer-001',
      buyer: 'ST123456789...ABCD',
      offeredPrice: 425000,
      earnestMoney: 42500,
      proposedTerms: 'Standard 30-day closing, financing contingent on appraisal',
      status: 'pending',
      submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'offer-002',
      buyer: 'ST987654321...WXYZ',
      offeredPrice: 440000,
      earnestMoney: 44000,
      proposedTerms: 'Cash offer, 14-day closing, as-is condition',
      status: 'pending',
      submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      expiresAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'offer-003',
      buyer: 'ST555666777...MNOP',
      offeredPrice: 410000,
      earnestMoney: 41000,
      proposedTerms: 'Financing contingent, 45-day closing, inspection contingency',
      status: 'rejected',
      submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      expiresAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    }
  ];

  const handleSubmitOffer = () => {
    if (!offerForm.offeredPrice || !offerForm.earnestMoney) {
      alert('Please fill in all required fields');
      return;
    }

    const newOffer = {
      id: `offer-${Date.now()}`,
      buyer: 'Your Wallet Address',
      offeredPrice: parseFloat(offerForm.offeredPrice),
      earnestMoney: parseFloat(offerForm.earnestMoney),
      proposedTerms: offerForm.proposedTerms,
      status: 'pending',
      submittedAt: new Date(),
      expiresAt: new Date(Date.now() + offerForm.offerValidity * 24 * 60 * 60 * 1000)
    };

    console.log('Submitting offer:', newOffer);
    onSubmitOffer?.(newOffer);
    
    // Reset form
    setOfferForm({ offeredPrice: '', earnestMoney: '', proposedTerms: '', offerValidity: 7 });
    setShowOfferForm(false);
  };

  const handleCounterOffer = () => {
    if (!selectedOffer) return;
    
    const counter = {
      offerId: selectedOffer.id,
      counterPrice: parseFloat(counterForm.counterPrice),
      counterTerms: counterForm.counterTerms
    };

    console.log('Submitting counter offer:', counter);
    onCounterOffer?.(counter);
    
    setCounterForm({ counterPrice: '', counterTerms: '' });
    setShowCounterForm(false);
    setSelectedOffer(null);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: '⏳' },
      accepted: { bg: 'bg-green-100', text: 'text-green-700', icon: '✓' },
      rejected: { bg: 'bg-red-100', text: 'text-red-700', icon: '✗' },
      countered: { bg: 'bg-blue-100', text: 'text-blue-700', icon: '↩️' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return config;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">📋 Offer Management</h2>
            <p className="text-gray-600">Submit, review, and manage property offers</p>
          </div>
          {!isSellerView && (
            <button
              onClick={() => setShowOfferForm(!showOfferForm)}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-bold"
            >
              {showOfferForm ? '✕ Cancel' : '➕ Submit Offer'}
            </button>
          )}
        </div>
      </div>

      {/* Submit Offer Form */}
      {showOfferForm && !isSellerView && (
        <div className="bg-white rounded-xl shadow-md p-6 border-2 border-indigo-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Submit New Offer</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                💰 Offered Price
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500">$</span>
                <input
                  type="number"
                  value={offerForm.offeredPrice}
                  onChange={(e) => {
                    setOfferForm({
                      ...offerForm,
                      offeredPrice: e.target.value,
                      earnestMoney: (parseFloat(e.target.value) * 0.1).toFixed(2)
                    });
                  }}
                  placeholder="Enter offer price"
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                🏦 Earnest Money (10%)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500">$</span>
                <input
                  type="number"
                  value={offerForm.earnestMoney}
                  onChange={(e) => setOfferForm({...offerForm, earnestMoney: e.target.value})}
                  placeholder="Earnest money deposit"
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                  readOnly
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ⏰ Offer Valid For
              </label>
              <select
                value={offerForm.offerValidity}
                onChange={(e) => setOfferForm({...offerForm, offerValidity: parseInt(e.target.value)})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
              >
                <option value={3}>3 days</option>
                <option value={5}>5 days</option>
                <option value={7}>7 days</option>
                <option value={10}>10 days</option>
                <option value={14}>14 days</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              📝 Proposed Terms
            </label>
            <textarea
              value={offerForm.proposedTerms}
              onChange={(e) => setOfferForm({...offerForm, proposedTerms: e.target.value})}
              placeholder="e.g., 30-day closing, financing contingent on appraisal, inspection contingency included..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 h-24 resize-none"
            />
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={handleSubmitOffer}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-bold"
            >
              ✓ Submit Offer
            </button>
            <button
              onClick={() => setShowOfferForm(false)}
              className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition font-bold"
            >
              ✕ Cancel
            </button>
          </div>
        </div>
      )}

      {/* Offers List */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-900">
          All Offers ({mockOffers.filter(o => o.status !== 'rejected').length})
        </h3>

        {mockOffers.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="text-5xl mb-4">📪</div>
            <p className="text-gray-600">No offers yet. Be the first to make an offer!</p>
          </div>
        ) : (
          mockOffers.map(offer => {
            const statusConfig = getStatusBadge(offer.status);
            const isExpired = new Date() > offer.expiresAt;
            const daysRemaining = Math.ceil((offer.expiresAt - new Date()) / (1000 * 60 * 60 * 24));

            return (
              <div
                key={offer.id}
                onClick={() => setSelectedOffer(selectedOffer?.id === offer.id ? null : offer)}
                className={`bg-white rounded-xl shadow-md p-6 border-2 transition cursor-pointer ${
                  selectedOffer?.id === offer.id
                    ? 'border-indigo-600 shadow-lg'
                    : 'border-transparent hover:border-gray-200'
                }`}
              >
                {/* Offer Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">
                      Offer from {offer.buyer}
                    </h4>
                    <p className="text-sm text-gray-500">
                      Submitted {formatDate(offer.submittedAt)}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-bold ${statusConfig.bg} ${statusConfig.text}`}>
                    {statusConfig.icon} {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
                  </div>
                </div>

                {/* Offer Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                    <p className="text-sm text-gray-600 font-semibold mb-1">💰 Offered Price</p>
                    <p className="text-2xl font-bold text-green-600">
                      ${(offer.offeredPrice / 1000).toFixed(0)}K
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                    <p className="text-sm text-gray-600 font-semibold mb-1">🏦 Earnest Money</p>
                    <p className="text-2xl font-bold text-blue-600">
                      ${(offer.earnestMoney / 1000).toFixed(0)}K
                    </p>
                  </div>

                  <div className={`rounded-lg p-4 border ${
                    isExpired
                      ? 'bg-red-50 border-red-200'
                      : 'bg-yellow-50 border-yellow-200'
                  }`}>
                    <p className="text-sm text-gray-600 font-semibold mb-1">⏰ Expires</p>
                    <p className={`font-bold ${isExpired ? 'text-red-600' : 'text-yellow-600'}`}>
                      {isExpired ? 'EXPIRED' : `${daysRemaining} days left`}
                    </p>
                  </div>
                </div>

                {/* Terms */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
                  <p className="text-sm text-gray-600 font-semibold mb-2">📝 Proposed Terms</p>
                  <p className="text-gray-800">{offer.proposedTerms}</p>
                </div>

                {/* Action Buttons - Show only for seller on pending offers */}
                {isSellerView && offer.status === 'pending' && (
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAcceptOffer?.(offer.id);
                      }}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-bold flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" /> Accept
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRejectOffer?.(offer.id);
                      }}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-bold flex items-center justify-center gap-2"
                    >
                      <X className="w-4 h-4" /> Reject
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedOffer(offer);
                        setShowCounterForm(true);
                      }}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-bold flex items-center justify-center gap-2"
                    >
                      <MessageSquare className="w-4 h-4" /> Counter
                    </button>
                  </div>
                )}

                {/* Expanded Details */}
                {selectedOffer?.id === offer.id && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs text-gray-500">
                      Offer ID: {offer.id} | Expires: {formatDate(offer.expiresAt)}
                    </p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Counter Offer Form */}
      {showCounterForm && selectedOffer && (
        <div className="bg-white rounded-xl shadow-md p-6 border-2 border-blue-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Counter Offer - {selectedOffer.buyer}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                💰 Counter Price
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500">$</span>
                <input
                  type="number"
                  value={counterForm.counterPrice}
                  onChange={(e) => setCounterForm({...counterForm, counterPrice: e.target.value})}
                  placeholder={`Current: $${(selectedOffer.offeredPrice / 1000).toFixed(0)}K`}
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              📝 Counter Terms
            </label>
            <textarea
              value={counterForm.counterTerms}
              onChange={(e) => setCounterForm({...counterForm, counterTerms: e.target.value})}
              placeholder="Specify your counter terms..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 h-20 resize-none"
            />
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={handleCounterOffer}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-bold"
            >
              ✓ Send Counter
            </button>
            <button
              onClick={() => {
                setShowCounterForm(false);
                setCounterForm({ counterPrice: '', counterTerms: '' });
              }}
              className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition font-bold"
            >
              ✕ Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfferManagement;
