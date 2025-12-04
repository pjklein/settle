import React from 'react'
import ReactDOM from 'react-dom/client'
import AppWithLayers from './AppWithLayers.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { ThemeProvider } from './hooks/useTheme.jsx'
import './index.css'

console.log('main.jsx loading...');

const rootElement = document.getElementById('root');
console.log('Root element:', rootElement);

if (!rootElement) {
  throw new Error('Root element not found!');
}

console.log('Creating React root...');
const root = ReactDOM.createRoot(rootElement);

console.log('Rendering AppWithLayers...');
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <ErrorBoundary>
        <AppWithLayers />
      </ErrorBoundary>
    </ThemeProvider>
  </React.StrictMode>,
);

console.log('App rendered successfully');