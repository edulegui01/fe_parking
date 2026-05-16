import { createBrowserRouter } from 'react-router-dom';
import { KioskLayout } from './KioskLayout';
import { AdminLayout } from './AdminLayout';
import IdlePage from '../pages/IdlePage';
import DocumentPage from '../pages/DocumentPage';
import CheckoutPage from '../pages/CheckoutPage';
import FacturaPage from '../pages/FacturaPage';
import PaymentPage from '../pages/PaymentPage';
import AdminPage from '../pages/AdminPage';

export const router = createBrowserRouter([
  {
    element: <KioskLayout />,
    children: [
      { path: '/',         element: <IdlePage /> },
      { path: '/document', element: <DocumentPage /> },
      { path: '/checkout', element: <CheckoutPage /> },
      { path: '/factura',  element: <FacturaPage /> },
      { path: '/payment',  element: <PaymentPage /> },
    ],
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminPage /> },
      { path: 'nfc',  element: <AdminPage /> },
    ],
  },
]);
