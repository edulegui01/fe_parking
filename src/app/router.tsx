import { createBrowserRouter } from 'react-router-dom';
import { KioskLayout } from './KioskLayout';
import IdlePage from '../pages/IdlePage';
import DocumentPage from '../pages/DocumentPage';
import CheckoutPage from '../pages/CheckoutPage';
import FacturaPage from '../pages/FacturaPage';
import PaymentPage from '../pages/PaymentPage';

export const router = createBrowserRouter([
  { path: '/', element: <IdlePage /> },
  {
    element: <KioskLayout />,
    children: [
      { path: '/document', element: <DocumentPage /> },
      { path: '/checkout', element: <CheckoutPage /> },
      { path: '/factura',  element: <FacturaPage /> },
      { path: '/payment',  element: <PaymentPage /> },
    ],
  },
]);
