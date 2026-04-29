import { Outlet, useNavigate } from 'react-router-dom';
import { useCheckout } from '@/store/checkout.hook';
import { useIdleTimer } from '@/shared/hooks/useIdleTimer';

export function KioskLayout() {
  const navigate = useNavigate();
  const { reset, isPaying } = useCheckout();

  useIdleTimer(() => {
    reset();
    navigate('/');
  }, 60_000, isPaying);

  return <Outlet />;
}
