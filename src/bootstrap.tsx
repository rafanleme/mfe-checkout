import React from 'react';
import { createRoot } from 'react-dom/client';
import CheckoutApp from './CheckoutApp';
import { BrowserRouter } from 'react-router-dom';

const root = createRoot(document.getElementById('root')!);
root.render(
  <BrowserRouter>
    <CheckoutApp />
  </BrowserRouter>
);
