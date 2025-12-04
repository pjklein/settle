import React, { useState } from 'react';
import { AlertCircle, X } from 'lucide-react';

const TestnetBanner = () => {
  const [isOpen, setIsOpen] = useState(true);

  const disclaimerContent = `
    <html>
      <head>
        <title>Testnet Disclaimer - Real Estate Settlement DApp</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 900px;
            margin: 0 auto;
            padding: 40px 20px;
            background-color: #f5f5f5;
          }
          .container {
            background: white;
            border-radius: 8px;
            padding: 40px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          h1 {
            color: #dc2626;
            border-bottom: 3px solid #dc2626;
            padding-bottom: 10px;
          }
          h2 {
            color: #1f2937;
            margin-top: 30px;
          }
          .warning {
            background-color: #fee2e2;
            border-left: 4px solid #dc2626;
            padding: 20px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .warning-title {
            font-weight: bold;
            color: #991b1b;
            margin-bottom: 10px;
          }
          ul {
            margin: 15px 0;
            padding-left: 20px;
          }
          li {
            margin: 10px 0;
          }
          .highlight {
            background-color: #fef08a;
            padding: 2px 6px;
            border-radius: 3px;
          }
          .info-box {
            background-color: #eff6ff;
            border-left: 4px solid #3b82f6;
            padding: 20px;
            margin: 20px 0;
            border-radius: 4px;
          }
          code {
            background-color: #f3f4f6;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>⚠️ TESTNET DISCLAIMER</h1>
          
          <div class="warning">
            <div class="warning-title">IMPORTANT: This Application is Running on Testnet</div>
            <p>You are accessing the Real Estate Settlement DApp running on the <span class="highlight">Stacks Testnet</span>. This is a test environment with important limitations and disclaimers.</p>
          </div>

          <h2>1. What are NFTs?</h2>
          <p>NFTs (Non-Fungible Tokens) are unique digital assets stored on a blockchain. Unlike fungible tokens (like STX or Bitcoin) which are interchangeable, each NFT has distinct properties and cannot be replicated. In this application, NFTs represent property parcels with unique metadata including:</p>
          <ul>
            <li>Property coordinates and legal descriptions</li>
            <li>Assessed values and zoning information</li>
            <li>Square footage and property type</li>
            <li>Ownership history</li>
          </ul>

          <h2>2. Testnet NFTs Are Simulations Only</h2>
          <p>The NFTs created in this testnet environment are <span class="highlight">purely for testing and simulation purposes</span>. They do NOT represent real property ownership or confer any legal rights in the real world. Specifically:</p>
          <ul>
            <li><strong>No Legal Ownership:</strong> Testnet NFTs do not grant ownership of any real property</li>
            <li><strong>No Real Estate Title:</strong> These NFTs cannot be used to claim title to land or buildings</li>
            <li><strong>Testing Environment:</strong> Testnet transactions may be reset, rolled back, or deleted without notice</li>
            <li><strong>Not Enforceable:</strong> Any transaction on testnet cannot be used as evidence of ownership or agreement in legal proceedings</li>
            <li><strong>Experimental Features:</strong> The application, smart contracts, and functionality may be modified or discontinued</li>
          </ul>

          <h2>3. Testnet Tokens Have No Value</h2>
          <p>The tokens used in this testnet environment have <span class="highlight">absolutely no monetary or commercial value</span>:</p>
          <ul>
            <li><strong>Testnet STX:</strong> Test Stacks tokens cannot be traded, sold, or converted to real currency</li>
            <li><strong>Testnet sBTC:</strong> Test Bitcoin-backed tokens have no relation to real Bitcoin</li>
            <li><strong>Testnet USDh:</strong> Test stablecoins have no USD backing or value</li>
            <li><strong>No Exchange:</strong> Testnet tokens cannot be exchanged on any marketplace or exchange</li>
            <li><strong>Not Transferable:</strong> You cannot transfer testnet tokens to mainnet or any other network</li>
            <li><strong>Subject to Faucet Rules:</strong> Testnet token supply may be reset without notice</li>
          </ul>

          <h2>4. Additional Disclaimers</h2>
          <ul>
            <li><strong>Data Loss:</strong> All testnet data, transactions, and contracts may be permanently deleted during maintenance or updates</li>
            <li><strong>No Support Guarantee:</strong> Testnet services are provided "as-is" without any guarantee of uptime or functionality</li>
            <li><strong>Security Testing:</strong> This is a testing environment; security vulnerabilities may exist and be exploited</li>
            <li><strong>Smart Contract Risks:</strong> Smart contracts may contain bugs or vulnerabilities. Do not assume they will work as intended on mainnet</li>
            <li><strong>Not Financial Advice:</strong> Nothing in this application constitutes financial, legal, or investment advice</li>
            <li><strong>Use at Your Own Risk:</strong> You use this application entirely at your own risk</li>
            <li><strong>No Liability:</strong> Taconite LLC and developers are not liable for any losses, damages, or issues arising from testnet use</li>
            <li><strong>Educational Purpose Only:</strong> This testnet is provided for educational and testing purposes only</li>
            <li><strong>Regulatory Compliance:</strong> Users are responsible for ensuring their use complies with applicable laws and regulations</li>
            <li><strong>Data Privacy:</strong> While testnet data may be public, do not use real personal or financial information in test transactions</li>
          </ul>

          <h2>5. Mainnet vs. Testnet</h2>
          <div class="info-box">
            <p><strong>Mainnet (Production):</strong> Real blockchain network where actual value and ownership are transferred. Transactions are permanent and irreversible.</p>
            <p><strong>Testnet (This Environment):</strong> Test blockchain network for development and testing. Tokens have no value, data may be reset, and transactions are not permanent.</p>
          </div>

          <h2>6. When Moving to Mainnet</h2>
          <p>If and when this application moves to mainnet, the following will apply:</p>
          <ul>
            <li>Real property ownership will be at stake</li>
            <li>Real financial value will be exchanged</li>
            <li>All transactions will be permanent and irreversible</li>
            <li>Legal and regulatory requirements will apply</li>
            <li>Security and audit requirements will be stricter</li>
            <li>Smart contracts will undergo professional security audits</li>
          </ul>

          <div class="warning">
            <div class="warning-title">Acknowledgment</div>
            <p>By continuing to use this testnet application, you acknowledge that you have read, understood, and agree to all the terms and disclaimers above. You understand that testnet tokens and NFTs have no value and do not confer real-world ownership or rights.</p>
          </div>

          <p style="text-align: center; margin-top: 40px; color: #666;">
            Last Updated: November 25, 2025<br/>
            © 2025 Taconite LLC. All rights reserved.
          </p>
        </div>
      </body>
    </html>
  `;

  if (!isOpen) {
    return null;
  }

  const handleDisclaimerClick = () => {
    const win = window.open();
    win.document.write(disclaimerContent);
    win.document.title = 'Testnet Disclaimer - Real Estate Settlement DApp';
  };

  return (
    <div className="bg-red-600 text-white px-4 py-3 flex items-center justify-between gap-4 shadow-lg">
      <div className="flex items-center gap-3 flex-1">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <div className="flex-1">
          <p className="font-bold">⚠️ TESTNET ENVIRONMENT</p>
          <p className="text-sm text-red-100">
            This is a test network. NFTs and tokens have no real value and do not confer ownership.{' '}
            <button
              onClick={handleDisclaimerClick}
              className="underline font-bold hover:text-red-50 transition"
            >
              Read full disclaimer
            </button>
            {' '}(opens in new tab)
          </p>
        </div>
      </div>
      <button
        onClick={() => setIsOpen(false)}
        className="flex-shrink-0 hover:bg-red-700 rounded-lg p-1 transition"
        aria-label="Close banner"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};

export default TestnetBanner;
