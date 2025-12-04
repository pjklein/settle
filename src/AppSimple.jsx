import React, { useState, useEffect } from 'react';

function App() {
  const [error, setError] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    console.log('AppSimple mounted');
    setLoaded(true);
  }, []);

  return (
    <div className="min-h-screen bg-blue-500 flex items-center justify-center">
      <div className="text-center bg-white p-8 rounded-lg max-w-md">
        <h1 className="text-4xl font-bold text-gray-900">🏠 Real Estate DApp</h1>
        <p className="text-gray-600 mt-2">Multi-Currency Escrow on Stacks</p>
        <div className="mt-4 text-sm">
          <p className="text-gray-500">Status: {loaded ? '✅ Loaded' : '⏳ Loading'}</p>
        </div>
        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
            <strong>Error:</strong>
            <p>{error}</p>
          </div>
        )}
        <button className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold">
          Connect Wallet
        </button>
      </div>
    </div>
  );
}

export default App;
