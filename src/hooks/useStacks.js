import { useState, useCallback, useEffect, useRef } from 'react';
import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { STACKS_TESTNET } from '@stacks/network';

export const useStacks = () => {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const userSessionRef = useRef(null);
  const appConfigRef = useRef(null);
  const network = STACKS_TESTNET;

  // Initialize session on mount
  useEffect(() => {
    const initializeSession = async () => {
      try {
        // Clear corrupted session data from localStorage first
        try {
          if (typeof localStorage !== 'undefined') {
            const sessionData = localStorage.getItem('blockstack');
            if (sessionData) {
              try {
                const parsed = JSON.parse(sessionData);
                // Check if session data has version field
                if (!parsed.version) {
                  console.warn('⚠️ Session data missing version, clearing...');
                  localStorage.removeItem('blockstack');
                }
              } catch (e) {
                console.warn('⚠️ Corrupted session data found, clearing...');
                localStorage.removeItem('blockstack');
              }
            }
          }
        } catch (e) {
          console.warn('Could not check localStorage:', e);
        }

        // Create fresh AppConfig
        appConfigRef.current = new AppConfig(['store_write', 'publish_data']);
        
        // Create UserSession with try-catch to handle corrupted data
        try {
          userSessionRef.current = new UserSession({ appConfig: appConfigRef.current });
        } catch (e) {
          console.warn('⚠️ Failed to create session, clearing storage:', e);
          // Clear all blockstack-related storage
          try {
            if (typeof localStorage !== 'undefined') {
              localStorage.removeItem('blockstack');
              // Also try clearing any indexed db
              const keys = [];
              for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.includes('stacks')) {
                  keys.push(key);
                }
              }
              keys.forEach(k => localStorage.removeItem(k));
            }
          } catch (storageErr) {
            console.warn('Could not clear storage:', storageErr);
          }
          // Try again with clean storage
          userSessionRef.current = new UserSession({ appConfig: appConfigRef.current });
        }

        const session = userSessionRef.current;
        
        // Check for pending sign-in
        if (session?.isSignInPending?.()) {
          console.log('⏳ Pending sign-in detected, handling...');
          try {
            const userData = await session.handlePendingSignIn();
            console.log('✅ Pending sign-in handled:', userData?.profile?.stxAddress?.testnet);
            setUserData(userData);
            setError(null);
          } catch (e) {
            console.error('❌ Pending sign-in failed:', e);
            setError(new Error('Failed to complete wallet sign-in. Please try again.'));
          }
        } else if (session?.isUserSignedIn?.()) {
          // User already signed in, load their data
          try {
            const loadedData = session.loadUserData();
            console.log('✅ User already signed in:', loadedData?.profile?.stxAddress?.testnet);
            setUserData(loadedData);
          } catch (e) {
            console.warn('⚠️ Failed to load existing user data:', e);
            // Clear the corrupted session
            try {
              session.signUserOut?.('/');
            } catch (signoutErr) {
              console.warn('Could not sign out:', signoutErr);
            }
            // Clear storage
            try {
              if (typeof localStorage !== 'undefined') {
                localStorage.removeItem('blockstack');
              }
            } catch (e) {
              console.warn('Could not clear localStorage:', e);
            }
          }
        }
      } catch (e) {
        console.error('❌ useStacks initialization error:', e);
        setError(new Error('Failed to initialize wallet session'));
      }
    };

    initializeSession();
  }, []);

  const authenticate = useCallback(() => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!userSessionRef.current) {
        throw new Error('User session not initialized');
      }
      
      // Modern wallet detection for @stacks/connect v7+
      const walletProviders = {
        leather: window.LeatherProvider !== undefined,
        xverse: window.XverseProviders !== undefined,
        asigna: window.AsignaMultisig !== undefined,
        hiro: window.hirosigner !== undefined,
      };
      
      const availableWallets = Object.entries(walletProviders)
        .filter(([_, available]) => available)
        .map(([name, _]) => name);
      
      console.log('💼 Available wallet providers:', availableWallets.length > 0 ? availableWallets : 'None detected');
      
      // Show Connect dialog
      showConnect({
        appDetails: {
          name: import.meta.env.VITE_APP_NAME || 'Real Estate DApp',
          icon: import.meta.env.VITE_APP_ICON || '/logo.png',
        },
        redirectTo: '/',
        onFinish: () => {
          try {
            const session = userSessionRef.current;
            const userData = session.loadUserData();
            if (!userData || !userData.profile) {
              throw new Error('Invalid user data returned from wallet');
            }
            setUserData(userData);
            setError(null);
            console.log('✅ Wallet connected successfully:', userData.profile.stxAddress?.testnet || userData.profile.stxAddress);
          } catch (e) {
            console.error('❌ Failed to load user data after connection:', e);
            setError(new Error('Wallet connection failed. User data invalid.'));
            setUserData(null);
          }
          setIsLoading(false);
        },
        onCancel: () => {
          console.log('⚠️ User cancelled wallet connection');
          setIsLoading(false);
          setError(new Error('Wallet connection was cancelled. Please try again.'));
        },
        userSession: userSessionRef.current,
      });
    } catch (e) {
      console.error('❌ Authenticate error:', e);
      setError(new Error(`Wallet connection failed: ${e.message}`));
      setIsLoading(false);
    }
  }, []);

  const signOut = useCallback(() => {
    try {
      userSessionRef.current?.signUserOut?.('/');
      setUserData(null);
      setError(null);
      console.log('✅ Signed out successfully');
    } catch (e) {
      console.warn('⚠️ Sign out error:', e);
      setError(new Error('Failed to sign out'));
    }
  }, []);

  return {
    userData,
    isAuthenticated: !!userData,
    isLoading,
    authenticate,
    signOut,
    userSession: userSessionRef.current,
    network,
    stxAddress: userData?.profile?.stxAddress?.testnet,
    error,
  };
};
