import React from 'react';
import ReactDOM from 'react-dom/client';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { AccountProvider } from './account/AccountContext';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';

const ErrorFallback: React.FC<FallbackProps> = ({ error }) => {
    return (
        <div role="alert">
            <p>Something went wrong:</p>
            <pre style={{ color: 'red' }}>{error.message}</pre>
        </div>
    )
}

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

root.render(
    <React.StrictMode>
        <BrowserRouter>
            <ErrorBoundary FallbackComponent={ErrorFallback}>
                <AccountProvider>
                    <App />
                </AccountProvider>
            </ErrorBoundary>
        </BrowserRouter>
    </React.StrictMode >
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
