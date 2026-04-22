import { createBrowserRouter } from 'react-router-dom';
import IdlePage from '../pages/IdlePage';
import DocumentPage from '../pages/DocumentPage';
import CheckoutPage from '../pages/CheckoutPage';
import FacturaPage from '../pages/FacturaPage';
import PaymentPage from '../pages/PaymentPage';
import ConfirmationPage from '../pages/ConfirmationPage';

export const router = createBrowserRouter([
  { path: '/',            element: <IdlePage /> },
  { path: '/document',    element: <DocumentPage /> },
  { path: '/checkout',    element: <CheckoutPage /> },
  { path: '/factura',     element: <FacturaPage /> },
  { path: '/payment',     element: <PaymentPage /> },
  { path: '/confirmation',element: <ConfirmationPage /> },
]);
