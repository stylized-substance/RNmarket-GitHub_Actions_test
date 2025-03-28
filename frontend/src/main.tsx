import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ToastContextProvider from '#src/context/ToastContext';
import CartContextProvider from '#src/context/CartContext.tsx';
import ProductContextProvider from '#src/context/ProductContext.tsx';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ProductContextProvider>
      <QueryClientProvider client={queryClient}>
        <ToastContextProvider>
          <CartContextProvider>
            <App />
          </CartContextProvider>
        </ToastContextProvider>
      </QueryClientProvider>
    </ProductContextProvider>
  </StrictMode>
);
