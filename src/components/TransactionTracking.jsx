import React, { useState } from 'react';
import { CheckCircle, Clock, AlertCircle, TrendingUp, User, Calendar, DollarSign, FileText } from 'lucide-react';

const TransactionTracking = ({ transaction }) => {
  const [expandedStep, setExpandedStep] = useState(null);

  // Mock transaction data
  const mockTransaction = {
    id: 'TX-2024-001234',
    state: 'contingency-pending',
    property: {
      address: '875 North Michigan Avenue, Chicago, IL 60611',
      price: 450000,
      currency: 'STX'
    },
    seller: {
      name: 'John Smith',
      address: 'ST123456...ABCD'
    },
    buyer: {
      name: 'Jane Doe',
      address: 'ST987654...WXYZ'
    },
    earnestMoney: 45000,
    buyerSigned: true,
    sellerSigned: true,
    buyerSignedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    sellerSignedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    timeline: [
      {
        id: 'step-1',
        state: 'listing',
        title: 'Property Listed',
        description: 'Seller listed the property on the marketplace',
        timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        status: 'completed',
        icon: '📋'
      },
      {
        id: 'step-2',
        state: 'offer-received',
        title: 'Offer Received',
        description: 'Buyer submitted purchase offer of $450K with 10% earnest money',
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        status: 'completed',
        icon: '📬'
      },
      {
        id: 'step-3',
        state: 'negotiating',
        title: 'Terms Negotiated',
        description: 'Seller and buyer agreed on 45-day closing and contingencies',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        status: 'completed',
        icon: '🤝'
      },
      {
        id: 'step-4',
        state: 'contingency-pending',
        title: 'Contingencies in Progress',
        description: 'Financing, inspection, and appraisal contingencies are being resolved',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        status: 'in-progress',
        icon: '⚙️',
        details: {
          financing: { status: 'in-progress', daysLeft: 8 },
          inspection: { status: 'in-progress', daysLeft: 5 },
          appraisal: { status: 'pending', daysLeft: 10 }
        }
      },
      {
        id: 'step-5',
        state: 'ready-to-close',
        title: 'Ready for Closing',
        description: 'All contingencies met, escrow funded, ready for final signing',
        timestamp: null,
        status: 'pending',
        icon: '✓'
      },
      {
        id: 'step-6',
        state: 'closed',
        title: 'Transaction Closed',
        description: 'Funds released to seller, title transferred to buyer',
        timestamp: null,
        status: 'pending',
        icon: '🎉'
      },
      {
        id: 'step-7',
        state: 'completed',
        title: 'Transaction Complete',
        description: 'Possession transferred, recorded with jurisdiction',
        timestamp: null,
        status: 'pending',
        icon: '🏠'
      }
    ]
  };

  const stateColors = {
    listing: 'text-gray-600',
    'offer-received': 'text-blue-600',
    negotiating: 'text-purple-600',
    'contingency-pending': 'text-yellow-600',
    'ready-to-close': 'text-green-600',
    closed: 'text-green-700',
    completed: 'text-green-800',
    cancelled: 'text-red-600',
    disputed: 'text-red-600'
  };

  const getStatusIcon = (status) => {
    const icons = {
      completed: <CheckCircle className="w-6 h-6 text-green-500" />,
      'in-progress': <Clock className="w-6 h-6 text-blue-500 animate-spin" />,
      pending: <Clock className="w-6 h-6 text-gray-400" />,
      failed: <AlertCircle className="w-6 h-6 text-red-500" />
    };
    return icons[status] || icons.pending;
  };

  const getCompletionPercentage = () => {
    const completed = mockTransaction.timeline.filter(s => s.status === 'completed').length;
    return Math.round((completed / mockTransaction.timeline.length) * 100);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const completionPercentage = getCompletionPercentage();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">📊 Transaction Tracking</h2>
            <p className="text-gray-600">Transaction ID: {mockTransaction.id}</p>
          </div>
          <div className="text-right">
            <p className={`text-sm font-semibold ${stateColors[mockTransaction.state]}`}>
              Current State: {mockTransaction.state.toUpperCase().replace(/-/g, ' ')}
            </p>
            <p className="text-gray-600 text-sm mt-1">Started {formatDate(mockTransaction.timeline[0].timestamp)}</p>
          </div>
        </div>

        {/* Completion Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">Overall Progress</span>
            <span className="text-sm font-bold text-indigo-600">{completionPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Transaction Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Property */}
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🏠</span>
            <p className="text-xs text-gray-600 font-semibold">PROPERTY</p>
          </div>
          <p className="text-sm font-bold text-gray-900 truncate">{mockTransaction.property.address}</p>
          <p className="text-lg font-bold text-blue-600">${(mockTransaction.property.price / 1000).toFixed(0)}K</p>
        </div>

        {/* Seller */}
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-purple-500">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">👤</span>
            <p className="text-xs text-gray-600 font-semibold">SELLER</p>
          </div>
          <p className="text-sm font-bold text-gray-900">{mockTransaction.seller.name}</p>
          <p className="text-xs text-gray-500 truncate">{mockTransaction.seller.address}</p>
        </div>

        {/* Buyer */}
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">👥</span>
            <p className="text-xs text-gray-600 font-semibold">BUYER</p>
          </div>
          <p className="text-sm font-bold text-gray-900">{mockTransaction.buyer.name}</p>
          <p className="text-xs text-gray-500 truncate">{mockTransaction.buyer.address}</p>
        </div>

        {/* Escrow */}
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-yellow-500">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🏦</span>
            <p className="text-xs text-gray-600 font-semibold">ESCROW</p>
          </div>
          <p className="text-sm font-bold text-gray-900">Earnest Money</p>
          <p className="text-lg font-bold text-yellow-600">${(mockTransaction.earnestMoney / 1000).toFixed(0)}K</p>
        </div>
      </div>

      {/* Signatures Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Buyer Signature */}
        <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                mockTransaction.buyerSigned ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                {mockTransaction.buyerSigned ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-gray-400" />
                )}
              </div>
              <div>
                <p className="font-bold text-gray-900">Buyer Signature</p>
                <p className="text-xs text-gray-600">{mockTransaction.buyer.name}</p>
              </div>
            </div>
          </div>
          {mockTransaction.buyerSigned && (
            <p className="text-xs text-gray-500">✓ Signed on {formatDate(mockTransaction.buyerSignedAt)}</p>
          )}
        </div>

        {/* Seller Signature */}
        <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                mockTransaction.sellerSigned ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                {mockTransaction.sellerSigned ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-gray-400" />
                )}
              </div>
              <div>
                <p className="font-bold text-gray-900">Seller Signature</p>
                <p className="text-xs text-gray-600">{mockTransaction.seller.name}</p>
              </div>
            </div>
          </div>
          {mockTransaction.sellerSigned && (
            <p className="text-xs text-gray-500">✓ Signed on {formatDate(mockTransaction.sellerSignedAt)}</p>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">📅 Transaction Timeline</h3>

        <div className="space-y-1">
          {mockTransaction.timeline.map((step, index) => (
            <div key={step.id}>
              <div
                onClick={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
                className="flex items-start gap-4 p-4 rounded-lg cursor-pointer hover:bg-gray-50 transition"
              >
                {/* Timeline Connector */}
                <div className="flex flex-col items-center">
                  <div>{getStatusIcon(step.status)}</div>
                  {index < mockTransaction.timeline.length - 1 && (
                    <div className={`w-1 h-12 ${
                      step.status === 'completed' ? 'bg-green-400' : 'bg-gray-300'
                    }`} />
                  )}
                </div>

                {/* Step Details */}
                <div className="flex-1 pt-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-gray-900">{step.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-bold px-2 py-1 rounded ${
                        step.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : step.status === 'in-progress'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {step.status === 'completed' ? '✓' : step.status === 'in-progress' ? '⚙️' : '⏳'}
                        {' '}
                        {step.status.charAt(0).toUpperCase() + step.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  {step.timestamp && (
                    <p className="text-xs text-gray-500 mt-2">
                      <Calendar className="w-3 h-3 inline mr-1" />
                      {formatDate(step.timestamp)}
                    </p>
                  )}

                  {/* Expanded Details */}
                  {expandedStep === step.id && step.details && (
                    <div className="mt-4 p-3 bg-gray-50 rounded border border-gray-200">
                      <p className="text-xs font-semibold text-gray-700 mb-2">Contingency Status:</p>
                      <div className="space-y-2">
                        {Object.entries(step.details).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between text-xs">
                            <span className="capitalize text-gray-700 font-medium">
                              {key.replace(/-/g, ' ')}:
                            </span>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                value.status === 'completed'
                                  ? 'bg-green-100 text-green-700'
                                  : value.status === 'in-progress'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}>
                                {value.status}
                              </span>
                              <span className="text-gray-500">{value.daysLeft} days</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Documents */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" /> Key Documents
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { name: 'Purchase Agreement', size: '245 KB', date: '2024-01-15', status: 'signed' },
            { name: 'Inspection Report', size: '1.2 MB', date: '2024-01-18', status: 'available' },
            { name: 'Appraisal Report', size: '856 KB', date: '2024-01-20', status: 'available' },
            { name: 'Title Report', size: '432 KB', date: '2024-01-16', status: 'signed' },
            { name: 'Financing Approval', size: '524 KB', date: '2024-01-19', status: 'available' },
            { name: 'Survey', size: '2.1 MB', date: '2024-01-21', status: 'available' }
          ].map((doc, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-xl">📄</span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{doc.name}</p>
                  <p className="text-xs text-gray-500">{doc.size} • {doc.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-2">
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  doc.status === 'signed'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {doc.status === 'signed' ? '✓' : '📥'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TransactionTracking;
