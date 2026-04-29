import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCheckout } from "@/store/checkout.hook";
import { Button } from "../../shared/components/Button";

const montoFormatter = new Intl.NumberFormat("es-PY", {
  style: "currency",
  currency: "PYG",
  maximumFractionDigits: 0,
});

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { state: { ticketData } } = useCheckout();

  useEffect(() => {
    if (!ticketData) navigate("/");
  }, [ticketData, navigate]);

  if (!ticketData) return null;

  const montoFormateado = montoFormatter.format(ticketData.monto_total);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-navy-900 select-none px-10 py-10">

      {/* Paciente */}
      <div className="mb-8 text-center">
        {ticketData.paciente.paciente ? (
          <p className="text-3xl font-bold text-ocean-400">{ticketData.paciente.paciente}</p>
        ) : (
          <p className="text-2xl font-medium text-amber-400">
            {ticketData.paciente.message ?? "Sin datos de documento"}
          </p>
        )}
      </div>

      {/* Monto */}
      <div className="flex flex-col items-center mb-14">
        <p className="text-2xl font-semibold text-slate-400 uppercase tracking-widest mb-4">
          Total a pagar
        </p>
        <p className="text-8xl font-black text-white tracking-tight leading-none">
          {montoFormateado}
        </p>
        <div className="flex items-center gap-2 mt-5 bg-navy-800 border border-white/10 rounded-2xl px-6 py-3">
          <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
          </svg>
          <p className="text-slate-300 text-xl font-medium">{ticketData.tiempo_transcurrido}</p>
        </div>
      </div>

      {/* Pregunta */}
      <p className="text-4xl font-bold text-white mb-10">¿Desea factura?</p>

      {/* Botones */}
      <div className="flex gap-6 w-full max-w-2xl">
        <button
          onClick={() => navigate("/factura")}
          className="flex-1 py-10 rounded-3xl text-4xl font-black bg-green-500 text-white shadow-2xl shadow-green-900/50 transition-all active:scale-95"
        >
          Sí
        </button>
        <button
          onClick={() => navigate("/payment")}
          className="flex-1 py-10 rounded-3xl text-4xl font-black bg-navy-800 text-slate-300 border border-white/15 transition-all active:scale-95 active:bg-navy-700"
        >
          No
        </button>
      </div>

      <Button variant="back" className="mt-4 max-w-2xl" onClick={() => navigate("/")}>
        Cancelar
      </Button>
    </div>
  );
}
