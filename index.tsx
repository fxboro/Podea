import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { registerSW } from 'virtual:pwa-register';

// Register PWA service worker with auto-update and offline capability
const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
        console.info('[PWA] New application version detected, activating update.');
    },
    onOfflineReady() {
        console.info('[PWA] Podea is ready for offline operation.');
    },
    onRegisterError(error: unknown) {
        console.warn('[PWA] Service worker registration notice:', error);
    }
});

const rootElement = document.getElementById('root');
if (!rootElement) {
    throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
