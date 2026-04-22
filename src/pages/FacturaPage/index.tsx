import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, ApiError } from "../../shared/services/api";
import { Button } from "../../shared/components/Button";
import type { ApiResponse, ContribuyenteData } from "../../shared/types";

function validarEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

function calcularDV(base: string): string {
  if (!base) return "";
  const digits = base.split("").reverse().map(Number);
  const weights = [2, 3, 4, 5, 6, 7, 8, 9];
  let sum = 0;
  for (let i = 0; i < digits.length; i++) sum += digits[i] * weights[i % weights.length];
  let dv = 11 - (sum % 11);
  if (dv === 10) dv = 0;
  if (dv === 11) dv = 1;
  return dv.toString();
}

const NUM_KEYS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["←", "0", "C"],
];

const ALPHA_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M"],
  ["←", "SPACE", ",", "."],
];

const EMAIL_ROWS = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["z", "x", "c", "v", "b", "n", "m", "@", "."],
  ["←", "_", "-", ".com", "SPACE"],
];

type Step = "ruc" | "email_only" | "full_details";
type DetailField = "razon" | "email";

// ── Subcomponentes ────────────────────────────────────────────────────────────

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-3">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`rounded-full transition-all duration-300 ${
            i < current ? "w-10 h-3 bg-sky-400" : i === current ? "w-10 h-3 bg-sky-500" : "w-3 h-3 bg-slate-600"
          }`}
        />
      ))}
    </div>
  );
}

function FieldCard({
  label,
  value,
  active,
  placeholder,
  mono,
  onClick,
}: {
  label: string;
  value: string;
  active?: boolean;
  placeholder?: string;
  mono?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`flex flex-col gap-2 px-8 py-6 rounded-3xl border-2 transition-all duration-200 ${
        onClick ? "cursor-pointer" : ""
      } ${active ? "border-sky-400 bg-slate-700/60" : "border-slate-600 bg-slate-800/60"}`}
    >
      <span className="text-base font-bold text-slate-400 uppercase tracking-widest">{label}</span>
      <span
        className={`text-4xl font-bold break-all leading-tight ${mono ? "font-mono" : ""} ${
          value ? "text-white" : "text-slate-600"
        }`}
      >
        {value || placeholder || "———"}
      </span>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function FacturaPage() {
  const navigate = useNavigate();

  const [rucBase, setRucBase] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [step, setStep] = useState<Step>("ruc");
  const [razonSocial, setRazonSocial] = useState("");
  const [email, setEmail] = useState("");
  const [activeField, setActiveField] = useState<DetailField>("razon");

  const dv = calcularDV(rucBase);
  const rucFormateado = rucBase ? `${rucBase}-${dv}` : "";
  const canConfirmRuc = rucBase.length > 0 && !loading;

  const canConfirmDetails =
    step === "email_only"
      ? validarEmail(email)
      : razonSocial.trim().length > 0 && validarEmail(email);

  const handleNumKey = (key: string) => {
    setError(null);
    if (key === "←") setRucBase((p) => p.slice(0, -1));
    else if (key === "C") setRucBase("");
    else if (rucBase.length < 15) setRucBase((p) => p + key);
  };

  const handleConsultar = async () => {
    if (!canConfirmRuc) return;
    setError(null);
    setLoading(true);
    try {
      const res = await api.get<ApiResponse<ContribuyenteData>>(
        `/ticket/consultar-contribuyente?documento=${encodeURIComponent(rucFormateado)}`
      );
      setRazonSocial(res.data!.razon_social);
      setStep("email_only");
    } catch (err) {
      if (err instanceof ApiError && err.code === "RUC_NOT_FOUND") {
        setStep("full_details");
        setActiveField("razon");
      } else {
        setError(err instanceof Error ? err.message : "Error al consultar");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAlphaKey = (key: string) => {
    setRazonSocial((p) => {
      if (key === "←") return p.slice(0, -1);
      if (key === "SPACE") return p + " ";
      return p.length < 80 ? p + key : p;
    });
  };

  const handleEmailKey = (key: string) => {
    setEmail((p) => {
      if (key === "←") return p.slice(0, -1);
      if (key === "SPACE") return p + " ";
      if (key === ".com") return p + ".com";
      return p.length < 60 ? p + key : p;
    });
  };

  const handleConfirmarDetails = () => {
    if (!canConfirmDetails) return;
    navigate("/payment", {
      state: { factura: { ruc: rucFormateado, razon_social: razonSocial, email } },
    });
  };

  // ── Step 1: RUC ──────────────────────────────────────────────────────────────

  if (step === "ruc") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 select-none px-10 py-10">
        {/* Header */}
        <StepIndicator current={0} total={3} />
        <p className="text-6xl font-black text-white mt-8 mb-2 tracking-tight">Factura</p>
        <p className="text-2xl text-slate-400 mb-10">Ingrese su número de RUC</p>

        {/* Display RUC */}
        <div
          className={`w-full max-w-lg rounded-3xl border-2 px-8 py-7 mb-4 transition-all duration-200 ${
            error ? "border-red-500 bg-red-950/30" : rucBase ? "border-sky-500 bg-slate-800" : "border-slate-700 bg-slate-800"
          }`}
        >
          <p className="text-slate-400 text-lg font-semibold uppercase tracking-widest mb-3">RUC</p>
          {rucBase ? (
            <div className="flex items-baseline gap-3">
              <span className="text-6xl font-mono font-black text-white tracking-wider">{rucBase}</span>
              <span className="text-4xl font-mono font-bold text-slate-500">-</span>
              <span className="text-6xl font-mono font-black text-sky-400">{dv}</span>
            </div>
          ) : (
            <span className="text-5xl font-mono text-slate-600">———</span>
          )}
        </div>

        <div className="h-9 flex items-center mb-6">
          {error && (
            <div className="flex items-center gap-2 bg-red-900/40 border border-red-700 rounded-2xl px-5 py-2">
              <span className="text-red-400 text-xl font-medium">{error}</span>
            </div>
          )}
        </div>

        {/* PIN pad */}
        <div className="flex flex-col gap-4 mb-10">
          {NUM_KEYS.map((row, ri) => (
            <div key={ri} className="flex gap-4 justify-center">
              {row.map((key) => (
                <button
                  key={key}
                  onClick={() => handleNumKey(key)}
                  className={[
                    "w-40 h-28 rounded-3xl text-5xl font-bold transition-all duration-100 active:scale-90",
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
          onClick={handleConsultar}
          disabled={!canConfirmRuc}
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

        <Button variant="back" className="mt-4 max-w-lg" onClick={() => navigate(-1 as never)}>
          Cancelar
        </Button>
      </div>
    );
  }

  // ── Step 2a: solo email ───────────────────────────────────────────────────────

  if (step === "email_only") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 select-none px-10 py-10">
        <StepIndicator current={1} total={3} />
        <p className="text-6xl font-black text-white mt-8 mb-2 tracking-tight">Factura</p>
        <p className="text-2xl text-slate-400 mb-8">Ingrese su correo electrónico</p>

        <div className="flex flex-col gap-4 w-full max-w-2xl mb-8">
          {/* Razón social — readonly con check */}
          <div className="flex items-center gap-4 px-8 py-6 rounded-3xl border-2 border-green-700 bg-green-900/20">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex flex-col gap-1 min-w-0">
              <span className="text-base font-bold text-green-500 uppercase tracking-widest">Razón social</span>
              <span className="text-3xl font-bold text-white leading-tight truncate">{razonSocial}</span>
              <span className="text-xl font-mono text-slate-400">{rucFormateado}</span>
            </div>
          </div>

          {/* Email */}
          <FieldCard
            label="Correo electrónico"
            value={email}
            placeholder="———"
            mono
            active
          />
        </div>

        {/* Teclado email */}
        <div className="flex flex-col gap-2.5 w-full max-w-2xl mb-6">
          {EMAIL_ROWS.map((row, ri) => (
            <div key={ri} className="flex gap-2 justify-center flex-wrap">
              {row.map((key) => {
                const isWide = key === "SPACE" || key === ".com" || key === "←";
                return (
                  <button
                    key={key}
                    onClick={() => handleEmailKey(key)}
                    className={[
                      "h-16 rounded-2xl text-2xl font-bold transition-all active:scale-90",
                      isWide ? "px-7" : "w-[52px]",
                      key === "←"
                        ? "bg-red-900/60 text-red-400 border-2 border-red-800"
                        : "bg-slate-700 text-white border-2 border-slate-600 active:bg-slate-600",
                    ].join(" ")}
                  >
                    {key === "SPACE" ? "espacio" : key}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <button
          onClick={handleConfirmarDetails}
          disabled={!canConfirmDetails}
          className="w-full max-w-2xl py-8 rounded-3xl text-3xl font-black transition-all active:scale-95 disabled:opacity-30 bg-green-500 text-white shadow-2xl shadow-green-900/50 disabled:shadow-none"
        >
          Confirmar
        </button>

        <Button variant="back" className="mt-4 max-w-2xl" onClick={() => navigate(-1 as never)}>
          Cancelar
        </Button>
      </div>
    );
  }

  // ── Step 2b: razón social + email ─────────────────────────────────────────────

  return (
    <div className="flex flex-col items-center min-h-screen bg-slate-900 select-none px-10 pt-14 pb-10">
      <StepIndicator current={1} total={3} />
      <p className="text-6xl font-black text-white mt-8 mb-2 tracking-tight">Factura</p>

      {/* Aviso RUC no encontrado */}
      <div className="flex items-center gap-3 bg-amber-900/30 border border-amber-700 rounded-2xl px-6 py-3 mb-8">
        <svg className="w-7 h-7 text-amber-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
        <span className="text-amber-400 text-xl font-semibold">RUC no registrado — complete sus datos</span>
      </div>

      {/* Campos */}
      <div className="flex flex-col gap-4 w-full max-w-2xl mb-6">
        <FieldCard
          label="Razón social"
          value={razonSocial}
          active={activeField === "razon"}
          onClick={() => setActiveField("razon")}
        />
        <FieldCard
          label="Correo electrónico"
          value={email}
          active={activeField === "email"}
          mono
          onClick={() => setActiveField("email")}
        />
      </div>

      {/* Teclado razón social */}
      {activeField === "razon" && (
        <>
          <div className="flex flex-col gap-2.5 w-full max-w-2xl mb-5">
            {ALPHA_ROWS.map((row, ri) => (
              <div key={ri} className="flex gap-2 justify-center flex-wrap">
                {row.map((key) => (
                  <button
                    key={key}
                    onClick={() => handleAlphaKey(key)}
                    className={[
                      "h-16 rounded-2xl text-2xl font-bold transition-all active:scale-90",
                      key === "SPACE"
                        ? "px-10 bg-slate-600 text-slate-200 border-2 border-slate-500"
                        : key === "←"
                        ? "px-5 bg-red-900/60 text-red-400 border-2 border-red-800"
                        : key === "," || key === "."
                        ? "w-16 bg-slate-600 text-slate-200 border-2 border-slate-500"
                        : "w-[52px] bg-slate-700 text-white border-2 border-slate-600 active:bg-slate-600",
                    ].join(" ")}
                  >
                    {key === "SPACE" ? "espacio" : key}
                  </button>
                ))}
              </div>
            ))}
          </div>
          <button
            onClick={() => setActiveField("email")}
            className="w-full max-w-2xl py-7 mb-4 rounded-3xl bg-sky-600 text-white text-3xl font-black active:scale-95 transition-all shadow-lg shadow-sky-900/50"
          >
            Siguiente →
          </button>
        </>
      )}

      {/* Teclado email */}
      {activeField === "email" && (
        <>
          <div className="flex flex-col gap-2.5 w-full max-w-2xl mb-5">
            {EMAIL_ROWS.map((row, ri) => (
              <div key={ri} className="flex gap-2 justify-center flex-wrap">
                {row.map((key) => {
                  const isWide = key === "SPACE" || key === ".com" || key === "←";
                  return (
                    <button
                      key={key}
                      onClick={() => handleEmailKey(key)}
                      className={[
                        "h-16 rounded-2xl text-2xl font-bold transition-all active:scale-90",
                        isWide ? "px-7" : "w-[52px]",
                        key === "←"
                          ? "bg-red-900/60 text-red-400 border-2 border-red-800"
                          : "bg-slate-700 text-white border-2 border-slate-600 active:bg-slate-600",
                      ].join(" ")}
                    >
                      {key === "SPACE" ? "espacio" : key}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
          <button
            onClick={handleConfirmarDetails}
            disabled={!canConfirmDetails}
            className="w-full max-w-2xl py-8 mb-4 rounded-3xl text-3xl font-black transition-all active:scale-95 disabled:opacity-30 bg-green-500 text-white shadow-2xl shadow-green-900/50 disabled:shadow-none"
          >
            Confirmar
          </button>
        </>
      )}

      <Button variant="back" className="mt-2 max-w-2xl" onClick={() => navigate(-1 as never)}>
        Cancelar
      </Button>
    </div>
  );
}
