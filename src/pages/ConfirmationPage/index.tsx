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
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 select-none">
      <div className="flex flex-col items-center gap-8 bg-slate-900 border border-slate-700 rounded-3xl px-16 py-14 shadow-2xl text-center max-w-lg w-full mx-6">

        {/* Ícono */}
        <div className={`w-32 h-32 rounded-full flex items-center justify-center ${
          isSuccess ? "bg-green-500/20 border-2 border-green-500" : "bg-red-500/20 border-2 border-red-500"
        }`}>
          {isSuccess ? (
            <svg className="w-16 h-16 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-16 h-16 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </div>

        {/* Mensaje */}
        <div className="flex flex-col gap-3">
          <h2 className={`text-5xl font-black ${isSuccess ? "text-green-400" : "text-red-400"}`}>
            {isSuccess ? "¡Pago exitoso!" : "Error en el pago"}
          </h2>

          {isSuccess && result && (
            <p className="text-3xl font-mono font-bold text-white tracking-widest">
              #{result.codigo_ticket}
            </p>
          )}

          {!isSuccess && (
            <p className="text-xl text-slate-400">
              {state.error ?? "Ocurrió un error. Por favor intente nuevamente."}
            </p>
          )}
        </div>

        {/* Botón */}
        <button
          onClick={() => { reset(); navigate('/'); }}
          className={`w-full py-7 rounded-3xl text-3xl font-black transition-all active:scale-95 shadow-xl ${
            isSuccess
              ? "bg-green-500 text-white shadow-green-900/50"
              : "bg-red-500 text-white shadow-red-900/50"
          }`}
        >
          {isSuccess ? "Finalizar" : "Reintentar"}
        </button>

        <p className="text-slate-600 text-base">Vuelve al inicio automáticamente en 15 segundos</p>
      </div>
    </div>
  );
}
