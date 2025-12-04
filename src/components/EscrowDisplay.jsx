import React, { useState, useEffect } from 'react';
import { 
  formatCurrency, 
  formatEscrowDetails, 
  getCurrencyInfo,
  convertCurrency,
  estimateTransactionFee 
} from '../utils/currencyUtils';

const EscrowDisplay = ({ escrowData, onFund, onSign, onComplete, onRefund, currentUser }) => {
  const [showConversion, setShowConversion] = useState(false);
  const [conversionCurrency, setConversionCurrency] = useState('USD');
  
  if (!escrowData) {
    return (
      <div className="bg-gray-50 rounded-xl p-6 text-center">
        <div className="text-gray-400 text-4xl mb-2">📋</div>
        <p className="text-gray-600">No escrow data available</p>
      </div>
    );
  }
  
  const formatted = formatEscrowDetails(escrowData);
  const currencyInfo = getCurrencyInfo(formatted.currency);
  const fee = estimateTransactionFee(formatted.currency);
  
  const isBuyer = currentUser === escrowData.buyer;
  const isSeller = currentUser === escrowData.seller;
  const canSign = (isBuyer && !escrowData.buyerSignature) || 
                  (isSeller && !escrowData.sellerSignature);
  const canComplete = escrowData.state === 'funded' && 
                     escrowData.buyerSignature && 
                     escrowData.sellerSignature;
  
  const getStateColor = (state) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'funded': 'bg-blue-100 text-blue-800 border-blue-300',
      'completed': 'bg-green-100 text-green-800 border-green-300',
      'cancelled': 'bg-gray-100 text-gray-800 border-gray-300',
      'expired': 'bg-red-100 text-red-800 border-red-300'
    };
    return colors[state] || colors['pending'];
  };
  
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold mb-1">Escrow Contract</h3>
            <p className="text-indigo-100 text-sm">Property: {formatted.propertyId.slice(0, 20)}...</p>
          </div>
          <div className="text-4xl">{currencyInfo?.icon || '💰'}</div>
        </div>
        
        <div className="mt-4 flex gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStateColor(formatted.state)}`}>
            {formatted.state.toUpperCase()}
          </span>
          <span className="px-3 py-1 rounded-full text-sm font-semibold bg-white/20 backdrop-blur-sm">
            {formatted.currency}
          </span>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Currency Info */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-700">Payment Currency</h4>
            {!currencyInfo?.isNative && (
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                SIP-010 Token
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-600 mb-1">Name</p>
              <p className="font-semibold">{formatted.currencyName}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Symbol</p>
              <p className="font-semibold">{formatted.currency}</p>
            </div>
          </div>
          {!currencyInfo?.isNative && (
            <div className="mt-3 pt-3 border-t border-gray-300">
              <p className="text-gray-600 text-xs mb-1">Contract Address</p>
              <p className="font-mono text-xs bg-white p-2 rounded border border-gray-200 break-all">
                {currencyInfo?.contract}
              </p>
            </div>
          )}
        </div>
        
        {/* Financial Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-blue-600 text-sm mb-1">Purchase Price</p>
            <p className="text-2xl font-bold text-blue-900">{formatted.purchasePrice}</p>
            {showConversion && (
              <p className="text-xs text-blue-600 mt-1">
                ≈ ${convertCurrency(
                  parseFloat(formatted.purchasePrice.split(' ')[0]), 
                  formatted.currency, 
                  'USD'
                )} USD
              </p>
            )}
          </div>
          
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <p className="text-green-600 text-sm mb-1">Earnest Money (10%)</p>
            <p className="text-2xl font-bold text-green-900">{formatted.earnestMoney}</p>
            {showConversion && (
              <p className="text-xs text-green-600 mt-1">
                ≈ ${convertCurrency(
                  parseFloat(formatted.earnestMoney.split(' ')[0]), 
                  formatted.currency, 
                  'USD'
                )} USD
              </p>
            )}
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <p className="text-purple-600 text-sm mb-1">Funds Deposited</p>
            <p className="text-2xl font-bold text-purple-900">{formatted.fundsDeposited}</p>
          </div>
          
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <p className="text-orange-600 text-sm mb-1">Est. Transaction Fee</p>
            <p className="text-2xl font-bold text-orange-900">
              {fee.estimatedFee} {fee.currency}
            </p>
            <p className="text-xs text-orange-600 mt-1">{fee.description}</p>
          </div>
        </div>
        
        {/* Conversion Toggle */}
        <button
          onClick={() => setShowConversion(!showConversion)}
          className="text-sm text-indigo-600 hover:text-indigo-800 font-semibold"
        >
          {showConversion ? '✕ Hide' : '💱 Show'} USD Conversion
        </button>
        
        {/* Parties */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-600 text-sm font-semibold">Buyer</p>
              {isBuyer && (
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                  You
                </span>
              )}
            </div>
            <p className="font-mono text-xs break-all">{escrowData.buyer}</p>
            <div className="mt-2">
              {escrowData.buyerSignature ? (
                <span className="text-xs text-green-600 flex items-center gap-1">
                  <span className="text-lg">✓</span> Signed
                </span>
              ) : (
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <span className="text-lg">○</span> Not Signed
                </span>
              )}
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-600 text-sm font-semibold">Seller</p>
              {isSeller && (
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                  You
                </span>
              )}
            </div>
            <p className="font-mono text-xs break-all">{escrowData.seller}</p>
            <div className="mt-2">
              {escrowData.sellerSignature ? (
                <span className="text-xs text-green-600 flex items-center gap-1">
                  <span className="text-lg">✓</span> Signed
                </span>
              ) : (
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <span className="text-lg">○</span> Not Signed
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="space-y-3 pt-4 border-t border-gray-200">
          {escrowData.state === 'pending' && isBuyer && (
            <button
              onClick={onFund}
              className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg"
            >
              💰 Fund Escrow ({formatted.earnestMoney})
            </button>
          )}
          
          {canSign && escrowData.state === 'funded' && (
            <button
              onClick={onSign}
              className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
            >
              ✍️ Sign Contract
            </button>
          )}
          
          {canComplete && (isBuyer || isSeller) && (
            <button
              onClick={onComplete}
              className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
            >
              ✅ Complete Transaction
            </button>
          )}
          
          {(escrowData.state === 'pending' || escrowData.state === 'funded') && (isBuyer || isSeller) && (
            <button
              onClick={onRefund}
              className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all border border-gray-300"
            >
              ↩️ Request Refund
            </button>
          )}
        </div>
        
        {/* Conditions Progress */}
        {escrowData.conditions && escrowData.conditions.length > 0 && (
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <h4 className="font-semibold text-yellow-800 mb-3">Contract Conditions</h4>
            <div className="space-y-2">
              {escrowData.conditions.map((condition, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    escrowData.conditionsMet[index] 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    {escrowData.conditionsMet[index] ? '✓' : index + 1}
                  </div>
                  <span className={`text-sm ${
                    escrowData.conditionsMet[index] 
                      ? 'text-gray-600 line-through' 
                      : 'text-gray-800'
                  }`}>
                    {condition}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Expiry Info */}
        <div className="bg-red-50 rounded-lg p-3 border border-red-200">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-red-600">⏰</span>
            <span className="text-red-700">
              Expires at block: <strong>{formatted.expiryHeight}</strong>
            </span>
          </div>
        </div>
        
        {/* Important Notes for Multi-Currency */}
        {!currencyInfo?.isNative && (
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
              <span>ℹ️</span>
              <span>Token Transfer Requirements</span>
            </h4>
            <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
              <li>This escrow uses {formatted.currency}, a SIP-010 token</li>
              <li>You must have sufficient {formatted.currency} balance in your wallet</li>
              <li>Token approval will be required before funding</li>
              <li>Additional transaction fees apply for token transfers</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default EscrowDisplay;