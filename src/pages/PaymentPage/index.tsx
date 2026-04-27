import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCheckout } from '../../store/checkout.hook';
import { usePayment } from '../../features/payment/hooks/usePayment';
import { useIdleTimer } from '../../shared/hooks/useIdleTimer';
import { Button } from '../../shared/components/Button';

export default function PaymentPage() {
  const { state, reset } = useCheckout();
  const { pay, loading } = usePayment();
  const navigate = useNavigate();

  useIdleTimer(() => { reset(); navigate('/'); }, 60_000);

  useEffect(() => {
    if (!state.ticketData) navigate('/');
  }, [state.ticketData, navigate]);

  if (!state.ticketData) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-navy-900 select-none px-10 py-10">
      <p className="text-6xl font-black text-white mb-3 tracking-tight">Pago</p>
      <p className="text-2xl text-slate-400 mb-14">Seleccione un método de pago</p>

      <div className="flex flex-col gap-5 w-full max-w-lg">
        {/* Tarjeta */}
        <button
          onClick={() => pay('card' as const)}
          disabled={loading}
          className="flex items-center gap-8 w-full px-10 py-9 rounded-3xl bg-navy-800 border border-white/10 active:border-blue-500 active:bg-navy-700 transition-all active:scale-95 disabled:opacity-40"
        >
          <div className="w-20 h-20 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
            <svg className="w-10 h-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <path strokeLinecap="round" d="M2 10h20" />
            </svg>
          </div>
          <div className="text-left">
            <p className="text-3xl font-black text-white">Tarjeta</p>
            <p className="text-slate-400 text-xl mt-1">Débito o crédito</p>
          </div>
        </button>

        {/* QR */}
        <button
          onClick={() => pay('qr' as const)}
          disabled={loading}
          className="flex items-center gap-8 w-full px-10 py-9 rounded-3xl bg-navy-800 border border-white/10 active:border-ocean-400 active:bg-navy-700 transition-all active:scale-95 disabled:opacity-40"
        >
          <div className="w-20 h-20 rounded-2xl bg-ocean-400/20 border border-ocean-400/30 flex items-center justify-center flex-shrink-0">
            <svg className="w-10 h-10 text-ocean-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="5" y="5" width="3" height="3" fill="currentColor" stroke="none" />
              <rect x="16" y="5" width="3" height="3" fill="currentColor" stroke="none" />
              <rect x="5" y="16" width="3" height="3" fill="currentColor" stroke="none" />
              <line x1="14" y1="14" x2="14" y2="14.01" strokeWidth="2.5" />
              <line x1="17" y1="14" x2="21" y2="14" />
              <line x1="21" y1="14" x2="21" y2="17" />
              <line x1="14" y1="17" x2="17" y2="17" />
              <line x1="17" y1="17" x2="17" y2="21" />
              <line x1="14" y1="21" x2="21" y2="21" />
            </svg>
          </div>
          <div className="text-left">
            <p className="text-3xl font-black text-white">Código QR</p>
            <p className="text-slate-400 text-xl mt-1">Escaneá con tu app de pagos</p>
          </div>
        </button>
      </div>

      {loading && (
        <div className="mt-10 flex items-center gap-3 bg-navy-800 border border-white/10 rounded-2xl px-7 py-4">
          <svg className="animate-spin w-6 h-6 text-ocean-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <p className="text-slate-300 text-xl font-medium">Procesando pago...</p>
        </div>
      )}

      <Button variant="back" className="mt-8 max-w-lg" onClick={() => navigate('/checkout')}>
        Volver
      </Button>
    </div>
  );
}
