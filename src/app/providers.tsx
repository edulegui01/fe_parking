import type { ReactNode } from 'react';
import { CheckoutProvider } from '../store/checkout.context';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <CheckoutProvider>
      {children}
    </CheckoutProvider>
  );
}
