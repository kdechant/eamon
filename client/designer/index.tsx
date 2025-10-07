import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Designer from './components/Designer';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Designer />
  </StrictMode>,
);
