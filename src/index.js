import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import SplitEmotionAnalysis from './IPlot';

// Root-Element finden
const rootElement = document.getElementById('root');

// Prüfen, ob das Root-Element vorhanden ist
if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);

    // Rendern der Anwendung
    root.render(
        <React.StrictMode>
            <SplitEmotionAnalysis />
        </React.StrictMode>
    );
} else {
    console.error("Das Root-Element mit ID 'root' wurde nicht gefunden.");
}