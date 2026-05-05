import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import ChefApp from './ChefApp';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ChefApp />
  </StrictMode>
);
