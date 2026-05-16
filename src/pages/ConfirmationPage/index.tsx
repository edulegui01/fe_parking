import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCheckout } from '../../store/checkout.hook';

export default function ConfirmationPage() {
  const { state, reset } = useCheckout();
  const navigate = useNavigate();
  const isSuccess = state.status === 'success';
  const result = state.paymentResult;

  useEffect(() => {
    const timer = setTimeout(() => { reset(); navigate('/'); }, 15_000);
    return () => clearTimeout(timer);
  }, [reset, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen select-none px-10">
      <div className="flex flex-col items-center gap-8 text-center max-w-lg w-full">

        {/* Ícono */}
        <div className="relative flex items-center justify-center mb-2">
          {isSuccess && (
            <div
              className="absolute w-44 h-44 rounded-full bg-brand-green/10 animate-ping"
              style={{ animationDuration: '2s' }}
            />
          )}
          <div className={`relative w-36 h-36 rounded-full flex items-center justify-center ${
            isSuccess
              ? 'bg-brand-green-pale border-2 border-brand-green/40'
              : 'bg-red-50 border-2 border-red-300'
          }`}>
            {isSuccess ? (
              <svg className="w-20 h-20 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-20 h-20 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>
        </div>

        {/* Mensaje */}
        <div className="flex flex-col gap-3">
          <h2 className={`text-6xl font-black tracking-tight ${isSuccess ? 'text-brand-green' : 'text-red-500'}`}>
            {isSuccess ? '¡Pago exitoso!' : 'Error en el pago'}
          </h2>

          {isSuccess && result && (
            <p className="text-3xl font-mono font-bold text-gray-600 tracking-widest">
              #{result.codigo_ticket}
            </p>
          )}

          {!isSuccess && (
            <p className="text-xl text-gray-500">
              {state.error ?? 'Ocurrió un error. Por favor intente nuevamente.'}
            </p>
          )}
        </div>

        {/* Botón */}
        <button
          onClick={() => { reset(); navigate('/'); }}
          className={`w-full py-8 rounded-3xl text-3xl font-black transition-all active:scale-95 shadow-xl ${
            isSuccess
              ? 'bg-brand-green text-white shadow-brand-green/20'
              : 'bg-red-500 text-white shadow-red-500/20'
          }`}
        >
          {isSuccess ? 'Finalizar' : 'Reintentar'}
        </button>

        <p className="text-gray-400 text-base">Vuelve al inicio automáticamente en 15 segundos</p>
      </div>
    </div>
  );
}
