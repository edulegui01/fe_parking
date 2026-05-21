import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../shared/services/api";
import { useCheckout } from "@/store/checkout.hook";
import { Button } from "../../shared/components/Button";
import type { ApiResponse, ConsultaMontoData } from "../../shared/types";

const KEYS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["←", "0", "C"],
];

const MAX_LENGTH = 11;

export default function DocumentPage() {
  const [documento, setDocumento] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const { state: { qrCode }, ticketLoaded } = useCheckout();

  const canConfirm = documento.trim().length > 0 && !loading;

  const handleConfirm = async () => {
    if (!canConfirm || !qrCode) return;
    setError(null);
    setLoading(true);
    try {
      const res = await api.get<ApiResponse<ConsultaMontoData>>(
        `/ticket/consulta-monto?ticket_code=${encodeURIComponent(qrCode)}&documento=${encodeURIComponent(documento)}`,
      );
      const data = res.data!;
      if (data.monto_total === 0) {
        setInfoMessage(data.mensaje);
        setTimeout(() => { setInfoMessage(null); navigate("/"); }, 4000);
        return;
      }
      ticketLoaded(data);
      navigate("/checkout");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al consultar el ticket");
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (key: string) => {
    if (loading) return;
    setError(null);
    if (key === "←") setDocumento((p) => p.slice(0, -1));
    else if (key === "C") setDocumento("");
    else if (documento.length < MAX_LENGTH) setDocumento((p) => p + key);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen select-none px-10 py-10">
      <p className="text-6xl font-black text-brand-blue mb-3 tracking-tight">Documento</p>
      <p className="text-2xl text-gray-400 mb-10">Ingrese su cédula sin puntos</p>

      {/* Display */}
      <div
        className={`w-full max-w-2xl py-8 px-8 rounded-3xl border-2 text-center mb-4 transition-all duration-200 bg-white ${
          error ? "border-red-400" : documento ? "border-brand-blue" : "border-gray-200"
        }`}
        style={{ boxShadow: documento && !error ? "0 0 0 4px rgba(30,63,138,0.08)" : undefined }}
      >
        <p className="text-7xl font-mono font-black tracking-widest min-h-[80px] text-brand-blue">
          {documento || <span className="text-gray-300">———</span>}
        </p>
      </div>

      <div className="h-10 flex items-center mb-6">
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-300 rounded-2xl px-5 py-2">
            <span className="text-red-600 text-xl font-medium">{error}</span>
          </div>
        )}
      </div>

      {/* PIN pad */}
      <div className="flex flex-col gap-4 w-full max-w-2xl mb-10">
        {KEYS.map((row, ri) => (
          <div key={ri} className="flex gap-4">
            {row.map((key) => (
              <button
                key={key}
                onClick={() => handleKey(key)}
                disabled={loading}
                className={[
                  "flex-1 h-28 rounded-3xl text-5xl font-bold transition-all duration-100 active:scale-90 disabled:opacity-40",
                  key === "←"
                    ? "bg-red-50 text-red-500 border-2 border-red-200 active:bg-red-100"
                    : key === "C"
                    ? "bg-amber-50 text-amber-600 border-2 border-amber-200 active:bg-amber-100"
                    : "bg-brand-blue-pale text-brand-blue border border-blue-100 active:bg-blue-100 shadow-sm",
                ].join(" ")}
              >
                {key === "C" ? <span className="text-2xl">Limpiar</span> : key}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Confirmar */}
      <button
        onClick={handleConfirm}
        disabled={!canConfirm}
        className="w-full max-w-2xl py-8 rounded-3xl text-3xl font-black transition-all active:scale-95 disabled:opacity-30 bg-brand-blue text-white shadow-lg shadow-brand-blue/20 disabled:shadow-none"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-3">
            <svg className="animate-spin w-8 h-8 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Consultando...
          </span>
        ) : "Confirmar"}
      </button>

      <Button variant="back" className="mt-4 max-w-2xl" disabled={loading} onClick={() => navigate("/")}>
        Cancelar
      </Button>

      {/* Modal monto cero */}
      {infoMessage && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="flex flex-col items-center gap-6 text-center bg-white border border-gray-200 rounded-3xl px-14 py-12 mx-6 shadow-2xl max-w-lg w-full">
            <div className="w-28 h-28 rounded-full flex items-center justify-center bg-brand-green-pale border-2 border-brand-green/40">
              <svg className="w-16 h-16 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-4xl font-black text-brand-green">Atención</h2>
            <p className="text-2xl text-gray-600 leading-snug">{infoMessage}</p>
            <p className="text-gray-400 text-lg">Volviendo al inicio...</p>
          </div>
        </div>
      )}
    </div>
  );
}
