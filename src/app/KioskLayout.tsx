import { Outlet, useNavigate } from 'react-router-dom';
import { useCheckout } from '@/store/checkout.hook';
import { useIdleTimer } from '@/shared/hooks/useIdleTimer';
import logoUrl from '@/assets/lcosta_sin_fondo.png';

export function KioskLayout() {
  const navigate = useNavigate();
  const { reset, isPaying } = useCheckout();

  useIdleTimer(() => {
    reset();
    navigate('/');
  }, 60_000, isPaying);

  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      <img
        src={logoUrl}
        alt=""
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-screen h-screen object-contain opacity-[0.20] pointer-events-none select-none z-0"
      />
      <div className="relative z-10 min-h-screen">
        <Outlet />
      </div>
    </div>
  );
}
