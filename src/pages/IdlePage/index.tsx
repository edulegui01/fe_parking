import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useCheckout } from "@/store/checkout.hook";

export default function IdlePage() {
  const navigate = useNavigate();
  const { setQrCode } = useCheckout();
  const bufferRef = useRef("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        const code = bufferRef.current.trim();
        bufferRef.current = "";
        if (code) {
          setQrCode(code);
          navigate("/document");
        }
      } else if (e.key.length === 1) {
        bufferRef.current += e.key;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate, setQrCode]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-navy-900 select-none overflow-hidden">
      <div className="flex flex-col items-center gap-10">

        {/* Ícono QR */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className="w-28 h-28 text-ocean-400"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
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

        {/* Mensaje */}
        <div className="text-center">
          <p className="text-5xl font-bold text-white leading-snug">
            Coloque el código QR
          </p>
          <p className="text-5xl font-bold text-white leading-snug">
            en el lector
          </p>
        </div>

        {/* Flecha animada hacia abajo */}
        <div className="flex flex-col items-center gap-1">
          {[0, 1, 2].map((i) => (
            <svg
              key={i}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 12"
              className="w-14 h-7 text-ocean-400"
              style={{
                animation: "bounce-fade 1.4s ease-in-out infinite",
                animationDelay: `${i * 0.2}s`,
                opacity: 0,
              }}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="2,2 12,10 22,2" />
            </svg>
          ))}
          <style>{`
            @keyframes bounce-fade {
              0%   { opacity: 0; transform: translateY(-6px); }
              50%  { opacity: 1; transform: translateY(2px); }
              100% { opacity: 0; transform: translateY(8px); }
            }
          `}</style>
        </div>
      </div>
    </div>
  );
}
