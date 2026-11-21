import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Gallery } from './Gallery.tsx';
import { startOffline } from '../offline.ts';
import '../styles.css';

const root = document.getElementById('root');
if (!root) throw new Error('#root not found');

createRoot(root).render(
  <StrictMode>
    <Gallery />
  </StrictMode>,
);

startOffline();
