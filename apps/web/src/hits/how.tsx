import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HowItWorks } from './HowItWorks.tsx';
import { startOffline } from '../offline.ts';
import '../styles.css';

const root = document.getElementById('root');
if (!root) throw new Error('#root not found');

createRoot(root).render(
  <StrictMode>
    <HowItWorks />
  </StrictMode>,
);

startOffline();
