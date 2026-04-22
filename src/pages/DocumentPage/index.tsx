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
      ticketLoaded(res.data!);
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 select-none px-10 py-10">
      <p className="text-6xl font-black text-white mb-3 tracking-tight">Documento</p>
      <p className="text-2xl text-slate-400 mb-10">Ingrese su cédula sin puntos</p>

      {/* Display */}
      <div
        className={`w-full max-w-lg py-8 px-8 rounded-3xl border-2 text-center mb-4 transition-all duration-200 bg-slate-800 ${
          error ? "border-red-500" : documento ? "border-sky-500" : "border-slate-700"
        }`}
      >
        <p className="text-7xl font-mono font-black tracking-widest min-h-[80px] text-white">
          {documento || <span className="text-slate-600">———</span>}
        </p>
      </div>

      <div className="h-10 flex items-center mb-6">
        {error && (
          <div className="flex items-center gap-2 bg-red-900/40 border border-red-700 rounded-2xl px-5 py-2">
            <span className="text-red-400 text-xl font-medium">{error}</span>
          </div>
        )}
      </div>

      {/* PIN pad */}
      <div className="flex flex-col gap-4 mb-10">
        {KEYS.map((row, ri) => (
          <div key={ri} className="flex gap-4 justify-center">
            {row.map((key) => (
              <button
                key={key}
                onClick={() => handleKey(key)}
                disabled={loading}
                className={[
                  "w-40 h-28 rounded-3xl text-5xl font-bold transition-all duration-100 active:scale-90 disabled:opacity-40",
                  key === "←"
                    ? "bg-red-900/60 text-red-400 border-2 border-red-800 active:bg-red-900"
                    : key === "C"
                    ? "bg-amber-900/60 text-amber-400 border-2 border-amber-800 active:bg-amber-900"
                    : "bg-slate-700 text-white border-2 border-slate-600 active:bg-slate-600 shadow-lg shadow-black/30",
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
        className="w-full max-w-lg py-8 rounded-3xl text-3xl font-black transition-all active:scale-95 disabled:opacity-30 bg-green-500 text-white shadow-2xl shadow-green-900/50 disabled:shadow-none"
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

      <Button variant="back" className="mt-4 max-w-lg" disabled={loading} onClick={() => navigate("/")}>
        Cancelar
      </Button>
    </div>
  );
}
