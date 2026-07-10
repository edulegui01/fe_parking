import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, ApiError } from "../../shared/services/api";
import { useCheckout } from "@/store/checkout.hook";
import { Button } from "../../shared/components/Button";
import type { ApiResponse, ContribuyenteData } from "../../shared/types";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validarEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
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
  ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["z", "x", "c", "v", "b", "n", "m", "@", "."],
  ["←", "_", "-", ".com"],
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
            i < current
              ? "w-10 h-3 bg-brand-green"
              : i === current
              ? "w-10 h-3 bg-brand-blue"
              : "w-3 h-3 bg-gray-200"
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
      } ${active ? "border-brand-blue bg-brand-blue-pale" : "border-gray-200 bg-white"}`}
    >
      <span className="text-base font-bold text-gray-400 uppercase tracking-widest">{label}</span>
      <span
        className={`text-4xl font-bold break-all leading-tight ${mono ? "font-mono" : ""} ${
          value ? "text-gray-900" : "text-gray-300"
        }`}
      >
        {value || placeholder || "———"}
      </span>
    </div>
  );
}

// ── Teclado PIN ───────────────────────────────────────────────────────────────

function PinKey({ keyVal, onClick }: { keyVal: string; onClick: () => void }) {
  const isDelete = keyVal === "←";
  const isClear = keyVal === "C";
  return (
    <button
      onClick={onClick}
      className={[
        "flex-1 h-28 rounded-3xl text-5xl font-bold transition-all duration-100 active:scale-90",
        isDelete
          ? "bg-red-50 text-red-500 border-2 border-red-200 active:bg-red-100"
          : isClear
          ? "bg-amber-50 text-amber-600 border-2 border-amber-200 active:bg-amber-100"
          : "bg-brand-blue-pale text-brand-blue border border-blue-100 active:bg-blue-100 shadow-sm",
      ].join(" ")}
    >
      {isClear ? <span className="text-2xl">Limpiar</span> : keyVal}
    </button>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function FacturaPage() {
  const navigate = useNavigate();
  const { state: { ticketData } } = useCheckout();

  const [rucBase, setRucBase] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [step, setStep] = useState<Step>("ruc");
  const [razonSocial, setRazonSocial] = useState("");
  const [email, setEmail] = useState(ticketData?.paciente.email ?? "");
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

  const keyboardBtnClass = (key: string) => {
    const isWide = key === "SPACE" || key === ".com" || key === "←";
    const isDelete = key === "←";
    return [
      "h-16 rounded-2xl text-2xl font-bold transition-all active:scale-90",
      isWide ? "px-7" : "w-[52px]",
      isDelete
        ? "bg-red-50 text-red-500 border-2 border-red-200 active:bg-red-100"
        : "bg-brand-blue-pale text-brand-blue border border-blue-100 active:bg-blue-100",
    ].join(" ");
  };

  // ── Step 1: RUC ──────────────────────────────────────────────────────────────

  if (step === "ruc") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen select-none px-10 py-10">
        <StepIndicator current={0} total={3} />
        <p className="text-6xl font-black text-brand-blue mt-8 mb-2 tracking-tight">Factura</p>
        <p className="text-2xl text-gray-400 mb-10">Ingrese su número de RUC</p>

        {/* Display RUC */}
        <div className="flex items-center gap-3 w-full max-w-2xl mb-4">
          <div className={`flex-1 rounded-3xl border-2 px-8 py-7 transition-all duration-200 bg-white ${
            error ? "border-red-400" : rucBase ? "border-brand-blue" : "border-gray-200"
          }`}>
            <p className="text-gray-400 text-lg font-semibold uppercase tracking-widest mb-3">Documento</p>
            <span className="text-6xl font-mono font-black text-gray-900 tracking-wider">
              {rucBase || <span className="text-gray-300">———</span>}
            </span>
          </div>

          <span className="text-5xl font-bold text-gray-300">-</span>

          <div className={`w-36 rounded-3xl border-2 px-6 py-7 transition-all duration-200 bg-white ${
            rucBase ? "border-brand-blue" : "border-gray-200"
          }`}>
            <p className="text-gray-400 text-lg font-semibold uppercase tracking-widest mb-3">DV</p>
            <span className="text-6xl font-mono font-black text-brand-blue">
              {rucBase ? dv : <span className="text-gray-300">-</span>}
            </span>
          </div>
        </div>

        <div className="h-9 flex items-center mb-6">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-300 rounded-2xl px-5 py-2">
              <span className="text-red-600 text-xl font-medium">{error}</span>
            </div>
          )}
        </div>

        {/* PIN pad */}
        <div className="flex flex-col gap-4 w-full max-w-2xl mb-10">
          {NUM_KEYS.map((row, ri) => (
            <div key={ri} className="flex gap-4">
              {row.map((key) => (
                <PinKey key={key} keyVal={key} onClick={() => handleNumKey(key)} />
              ))}
            </div>
          ))}
        </div>

        <button
          onClick={handleConsultar}
          disabled={!canConfirmRuc}
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

        <Button variant="back" className="mt-4 max-w-2xl" onClick={() => navigate(-1 as never)}>
          Cancelar
        </Button>
      </div>
    );
  }

  // ── Step 2a: solo email ───────────────────────────────────────────────────────

  if (step === "email_only") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen select-none px-10 py-10">
        <StepIndicator current={1} total={3} />
        <p className="text-6xl font-black text-brand-blue mt-8 mb-2 tracking-tight">Factura</p>
        <p className="text-2xl text-gray-400 mb-8">Ingrese su correo electrónico</p>

        <div className="flex flex-col gap-4 w-full max-w-2xl mb-8">
          {/* Razón social — readonly con check */}
          <div className="flex items-center gap-4 px-8 py-6 rounded-3xl border-2 border-brand-green bg-brand-green-pale">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-brand-green flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex flex-col gap-1 min-w-0">
              <span className="text-base font-bold text-brand-green uppercase tracking-widest">Razón social</span>
              <span className="text-3xl font-bold text-gray-900 leading-tight truncate">{razonSocial}</span>
              <span className="text-xl font-mono text-gray-500">{rucFormateado}</span>
            </div>
          </div>

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
              {row.map((key) => (
                <button key={key} onClick={() => handleEmailKey(key)} className={keyboardBtnClass(key)}>
                  {key === "SPACE" ? "espacio" : key}
                </button>
              ))}
            </div>
          ))}
        </div>

        <button
          onClick={handleConfirmarDetails}
          disabled={!canConfirmDetails}
          className="w-full max-w-2xl py-8 rounded-3xl text-3xl font-black transition-all active:scale-95 disabled:opacity-30 bg-brand-blue text-white shadow-lg shadow-brand-blue/20 disabled:shadow-none"
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
    <div className="flex flex-col items-center min-h-screen select-none px-10 pt-14 pb-10">
      <StepIndicator current={1} total={3} />
      <p className="text-6xl font-black text-brand-blue mt-8 mb-2 tracking-tight">Factura</p>

      {/* Aviso RUC no encontrado */}
      <div className="flex items-center gap-3 bg-amber-50 border border-amber-300 rounded-2xl px-6 py-3 mb-8">
        <svg className="w-7 h-7 text-amber-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
        <span className="text-amber-700 text-xl font-semibold">RUC no registrado — complete sus datos</span>
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
                        ? "px-10 bg-brand-blue-pale text-brand-blue border border-blue-100"
                        : key === "←"
                        ? "px-5 bg-red-50 text-red-500 border-2 border-red-200 active:bg-red-100"
                        : key === "," || key === "."
                        ? "w-16 bg-brand-blue-pale text-brand-blue border border-blue-100"
                        : "w-[52px] bg-brand-blue-pale text-brand-blue border border-blue-100 active:bg-blue-100",
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
            className="w-full max-w-2xl py-7 mb-4 rounded-3xl bg-brand-blue text-white text-3xl font-black active:scale-95 transition-all shadow-lg shadow-brand-blue/20"
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
                {row.map((key) => (
                  <button key={key} onClick={() => handleEmailKey(key)} className={keyboardBtnClass(key)}>
                    {key === "SPACE" ? "espacio" : key}
                  </button>
                ))}
              </div>
            ))}
          </div>
          <button
            onClick={handleConfirmarDetails}
            disabled={!canConfirmDetails}
            className="w-full max-w-2xl py-8 mb-4 rounded-3xl text-3xl font-black transition-all active:scale-95 disabled:opacity-30 bg-brand-blue text-white shadow-lg shadow-brand-blue/20 disabled:shadow-none"
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
