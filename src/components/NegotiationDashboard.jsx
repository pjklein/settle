import React, { useState } from 'react';
import { AlertCircle, Check, Clock, X } from 'lucide-react';

const NegotiationDashboard = ({ transaction, onProposeTerm, onApprove, onReject }) => {
  const [showTermForm, setShowTermForm] = useState(false);
  const [termForm, setTermForm] = useState({
    termType: 'closing-date',
    value: '',
    description: ''
  });
  const [selectedProposal, setSelectedProposal] = useState(null);

  // Mock term proposals
  const mockProposals = [
    {
      id: 'term-001',
      proposer: 'Seller',
      proposerAddress: 'ST123456...',
      type: 'closing-date',
      title: 'Closing Date Change',
      originalValue: '30 days',
      proposedValue: '45 days',
      reason: 'Additional time needed for title transfer',
      status: 'pending',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'term-002',
      proposer: 'Buyer',
      proposerAddress: 'ST987654...',
      type: 'inspection-period',
      title: 'Extended Inspection Period',
      originalValue: '7 days',
      proposedValue: '14 days',
      reason: 'Requesting more time for building inspection',
      status: 'approved',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      approvedAt: new Date(Date.now() - 12 * 60 * 60 * 1000)
    },
    {
      id: 'term-003',
      proposer: 'Seller',
      proposerAddress: 'ST123456...',
      type: 'possession-date',
      title: 'Possession Date',
      originalValue: 'Upon closing',
      proposedValue: '5 days after closing',
      reason: 'Seller requires time to vacate property',
      status: 'pending',
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      expiresAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)
    }
  ];

  // Mock contingencies
  const mockContingencies = [
    {
      id: 'cont-001',
      type: 'financing',
      description: 'Loan approval contingent on appraisal',
      deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      status: 'pending',
      progress: 65
    },
    {
      id: 'cont-002',
      type: 'inspection',
      description: 'Professional home inspection',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: 'in-progress',
      progress: 40
    },
    {
      id: 'cont-003',
      type: 'appraisal',
      description: 'Property appraisal for financing',
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      status: 'pending',
      progress: 0
    },
    {
      id: 'cont-004',
      type: 'title-search',
      description: 'Title search and insurance',
      deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      status: 'completed',
      progress: 100
    }
  ];

  const termTypes = [
    { value: 'closing-date', label: '📅 Closing Date' },
    { value: 'inspection-period', label: '🔍 Inspection Period' },
    { value: 'possession-date', label: '🏠 Possession Date' },
    { value: 'earnest-money', label: '💰 Earnest Money' },
    { value: 'financing-contingency', label: '🏦 Financing Contingency' },
    { value: 'other', label: '📝 Other' }
  ];

  const handleProposeTerm = () => {
    if (!termForm.value || !termForm.description) {
      alert('Please fill in all fields');
      return;
    }

    const proposal = {
      id: `term-${Date.now()}`,
      type: termForm.termType,
      value: termForm.value,
      description: termForm.description,
      status: 'pending'
    };

    console.log('Proposing term:', proposal);
    onProposeTerm?.(proposal);

    setTermForm({ termType: 'closing-date', value: '', description: '' });
    setShowTermForm(false);
  };

  const getTermTypeLabel = (type) => {
    const term = termTypes.find(t => t.value === type);
    return term?.label || type;
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: '⏳' },
      approved: { bg: 'bg-green-100', text: 'text-green-700', icon: '✓' },
      rejected: { bg: 'bg-red-100', text: 'text-red-700', icon: '✗' },
      'in-progress': { bg: 'bg-blue-100', text: 'text-blue-700', icon: '⚙️' },
      completed: { bg: 'bg-green-100', text: 'text-green-700', icon: '✓' }
    };
    return configs[status] || configs.pending;
  };

  const getContingencyIcon = (type) => {
    const icons = {
      financing: '🏦',
      inspection: '🔍',
      appraisal: '📊',
      'title-search': '📋',
      survey: '📐',
      other: '📝'
    };
    return icons[type] || '📋';
  };

  const getDaysRemaining = (date) => {
    const now = new Date();
    const days = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
    return days;
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
            <h2 className="text-2xl font-bold text-gray-900 mb-1">🤝 Contract Negotiation</h2>
            <p className="text-gray-600">Manage terms, contingencies, and approvals</p>
          </div>
          <button
            onClick={() => setShowTermForm(!showTermForm)}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-bold"
          >
            {showTermForm ? '✕ Cancel' : '➕ Propose Term'}
          </button>
        </div>
      </div>

      {/* Propose Term Form */}
      {showTermForm && (
        <div className="bg-white rounded-xl shadow-md p-6 border-2 border-indigo-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Propose Contract Term</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Term Type
              </label>
              <select
                value={termForm.termType}
                onChange={(e) => setTermForm({...termForm, termType: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
              >
                {termTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Proposed Value
              </label>
              <input
                type="text"
                value={termForm.value}
                onChange={(e) => setTermForm({...termForm, value: e.target.value})}
                placeholder="e.g., 45 days, $42,500, 14 days"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description / Reason
              </label>
              <textarea
                value={termForm.description}
                onChange={(e) => setTermForm({...termForm, description: e.target.value})}
                placeholder="Explain why this change is needed..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 h-20 resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleProposeTerm}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-bold"
              >
                ✓ Propose Term
              </button>
              <button
                onClick={() => {
                  setShowTermForm(false);
                  setTermForm({ termType: 'closing-date', value: '', description: '' });
                }}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition font-bold"
              >
                ✕ Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Term Proposals */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4">📋 Term Proposals</h3>
          <div className="space-y-4">
            {mockProposals.map(proposal => {
              const statusConfig = getStatusConfig(proposal.status);
              const daysLeft = getDaysRemaining(proposal.expiresAt);

              return (
                <div
                  key={proposal.id}
                  onClick={() => setSelectedProposal(selectedProposal?.id === proposal.id ? null : proposal)}
                  className={`bg-white rounded-lg shadow-md p-4 border-2 transition cursor-pointer ${
                    selectedProposal?.id === proposal.id
                      ? 'border-indigo-600'
                      : 'border-transparent hover:border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-bold text-gray-900">{proposal.title}</h4>
                      <p className="text-xs text-gray-500">By {proposal.proposer}</p>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-bold ${statusConfig.bg} ${statusConfig.text}`}>
                      {statusConfig.icon} {proposal.status}
                    </div>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-600">Original:</span>
                      <span className="font-semibold text-gray-900">{proposal.originalValue}</span>
                      <span className="text-gray-400">→</span>
                      <span className="font-semibold text-indigo-600">{proposal.proposedValue}</span>
                    </div>
                    <p className="text-sm text-gray-600">{proposal.reason}</p>
                  </div>

                  {proposal.status === 'pending' && (
                    <div className="flex gap-2 mb-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onApprove?.(proposal.id);
                        }}
                        className="flex-1 px-2 py-1 bg-green-600 text-white rounded text-xs font-bold hover:bg-green-700 transition flex items-center justify-center gap-1"
                      >
                        <Check className="w-3 h-3" /> Approve
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onReject?.(proposal.id);
                        }}
                        className="flex-1 px-2 py-1 bg-red-600 text-white rounded text-xs font-bold hover:bg-red-700 transition flex items-center justify-center gap-1"
                      >
                        <X className="w-3 h-3" /> Reject
                      </button>
                    </div>
                  )}

                  <div className="text-xs text-gray-500 border-t pt-2">
                    {proposal.status === 'pending' && daysLeft > 0 && (
                      <span>⏰ Expires in {daysLeft} days</span>
                    )}
                    {proposal.status === 'approved' && (
                      <span>✓ Approved {formatDate(proposal.approvedAt)}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Contingencies */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4">✓ Contingencies</h3>
          <div className="space-y-4">
            {mockContingencies.map(contingency => {
              const statusConfig = getStatusConfig(contingency.status);
              const daysLeft = getDaysRemaining(contingency.deadline);
              const isUrgent = daysLeft <= 3 && contingency.status !== 'completed';

              return (
                <div
                  key={contingency.id}
                  className={`bg-white rounded-lg shadow-md p-4 border-l-4 ${
                    statusConfig.bg === 'bg-red-100'
                      ? 'border-l-red-500'
                      : statusConfig.bg === 'bg-green-100'
                      ? 'border-l-green-500'
                      : statusConfig.bg === 'bg-blue-100'
                      ? 'border-l-blue-500'
                      : 'border-l-yellow-500'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{getContingencyIcon(contingency.type)}</span>
                        <h4 className="font-bold text-gray-900 capitalize">{contingency.type}</h4>
                      </div>
                      <p className="text-sm text-gray-600">{contingency.description}</p>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-bold ${statusConfig.bg} ${statusConfig.text}`}>
                      {statusConfig.icon}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition ${
                          contingency.status === 'completed'
                            ? 'bg-green-500'
                            : contingency.status === 'in-progress'
                            ? 'bg-blue-500'
                            : 'bg-yellow-500'
                        }`}
                        style={{ width: `${contingency.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{contingency.progress}% complete</p>
                  </div>

                  {/* Deadline */}
                  <div className={`flex items-center gap-2 text-xs font-semibold ${
                    isUrgent ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    <Clock className="w-3 h-3" />
                    {contingency.status === 'completed'
                      ? `✓ Completed ${formatDate(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000))}`
                      : daysLeft <= 0
                      ? '🔴 OVERDUE'
                      : `Due in ${daysLeft} days (${formatDate(contingency.deadline)})`
                    }
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Alert for Urgent Items */}
      {mockProposals.some(p => p.status === 'pending') && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg flex gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
          <div>
            <h4 className="font-bold text-yellow-900 mb-1">Pending Actions Required</h4>
            <p className="text-sm text-yellow-800">
              You have {mockProposals.filter(p => p.status === 'pending').length} term proposals awaiting approval. 
              Review and respond promptly to keep negotiations on track.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default NegotiationDashboard;
