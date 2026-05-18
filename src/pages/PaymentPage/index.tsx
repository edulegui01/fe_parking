import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCheckout } from '../../store/checkout.hook';
import { usePayment } from '../../features/payment/hooks/usePayment';
import { Button } from '../../shared/components/Button';

export default function PaymentPage() {
  const { state, reset } = useCheckout();
  const { pay, loading } = usePayment();
  const navigate = useNavigate();
  const isDone = state.status === 'success' || state.status === 'error';
  const isSuccess = state.status === 'success';

  useEffect(() => {
    if (!state.ticketData) navigate('/');
  }, [state.ticketData, navigate]);

  useEffect(() => {
    if (!isDone) return;
    const timer = setTimeout(() => { reset(); navigate('/'); }, 5_000);
    return () => clearTimeout(timer);
  }, [isDone, reset, navigate]);

  if (!state.ticketData) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen select-none px-10 py-10">
      <p className="text-6xl font-black text-brand-blue mb-3 tracking-tight">Pago</p>
      <p className="text-2xl text-gray-400 mb-14">Seleccione un método de pago</p>

      <div className="flex flex-col gap-5 w-full max-w-2xl">
        {/* Tarjeta */}
        <button
          onClick={() => pay('card' as const)}
          disabled={loading || isDone}
          className="flex items-center gap-8 w-full px-10 py-9 rounded-3xl bg-white border-2 border-gray-200 hover:border-brand-blue hover:bg-brand-blue-pale transition-all active:scale-95 disabled:opacity-40 shadow-sm"
        >
          <div className="w-20 h-20 rounded-2xl bg-brand-blue-pale flex items-center justify-center flex-shrink-0">
            <svg className="w-10 h-10 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <path strokeLinecap="round" d="M2 10h20" />
            </svg>
          </div>
          <div className="text-left">
            <p className="text-3xl font-black text-gray-900">Tarjeta</p>
            <p className="text-gray-400 text-xl mt-1">Débito o crédito</p>
          </div>
        </button>

        {/* QR */}
        <button
          onClick={() => pay('qr' as const)}
          disabled={loading || isDone}
          className="flex items-center gap-8 w-full px-10 py-9 rounded-3xl bg-white border-2 border-gray-200 hover:border-brand-green hover:bg-brand-green-pale transition-all active:scale-95 disabled:opacity-40 shadow-sm"
        >
          <div className="w-20 h-20 rounded-2xl bg-brand-green-pale flex items-center justify-center flex-shrink-0">
            <svg className="w-10 h-10 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
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
            <p className="text-3xl font-black text-gray-900">Código QR</p>
            <p className="text-gray-400 text-xl mt-1">Escaneá con tu app de pagos</p>
          </div>
        </button>
      </div>

      {loading && (
        <div className="mt-10 flex items-center gap-3 bg-brand-blue-pale border border-blue-100 rounded-2xl px-7 py-4">
          <svg className="animate-spin w-6 h-6 text-brand-blue" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <p className="text-brand-blue text-xl font-semibold">Procesando pago...</p>
        </div>
      )}

      <Button variant="back" className="mt-8 max-w-2xl" onClick={() => navigate('/checkout')}>
        Volver
      </Button>

      {/* Modal de resultado */}
      {isDone && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="flex flex-col items-center gap-6 text-center bg-white border border-gray-200 rounded-3xl px-14 py-12 mx-6 shadow-2xl">

            {/* Ícono */}
            <div className="relative flex items-center justify-center">
              {isSuccess && (
                <div
                  className="absolute w-36 h-36 rounded-full bg-brand-green/10 animate-ping"
                  style={{ animationDuration: '2s' }}
                />
              )}
              <div className={`relative w-28 h-28 rounded-full flex items-center justify-center ${
                isSuccess
                  ? 'bg-brand-green-pale border-2 border-brand-green/40'
                  : 'bg-red-50 border-2 border-red-300'
              }`}>
                {isSuccess ? (
                  <svg className="w-16 h-16 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-16 h-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
            </div>

            {/* Mensaje */}
            <h2 className={`text-4xl font-black tracking-tight ${isSuccess ? 'text-brand-green' : 'text-red-500'}`}>
              {isSuccess ? '¡Pago exitoso!' : 'Error en el pago'}
            </h2>

            {!isSuccess && (
              <p className="text-lg text-gray-500">
                {state.error ?? 'Ocurrió un error. Intente nuevamente.'}
              </p>
            )}

            <p className="text-gray-400 text-sm">Volviendo al inicio...</p>
          </div>
        </div>
      )}
    </div>
  );
}
