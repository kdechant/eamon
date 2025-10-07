// polyfills for IE 11
import "core-js/stable";

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import MainProgram from "./components/MainProgram";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MainProgram/>
  </StrictMode>
);
