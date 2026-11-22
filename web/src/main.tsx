import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import Playground from "./Playground";
import ErrorBoundary from "./components/ErrorBoundary";
import { ToastProvider } from "./toast";

const Root = location.search.includes("playground") ? Playground : App;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <ErrorBoundary>
      <ToastProvider>
        <Root />
      </ToastProvider>
    </ErrorBoundary>
  </StrictMode>,
)
