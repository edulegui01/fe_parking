import { createContext, useReducer } from "react";
import type { ReactNode } from "react";
import type { ConsultaMontoData, PagoResultData } from "../shared/types";

// ── State ────────────────────────────────────────────────────────────────────

type CheckoutStatus = "idle" | "success" | "error";

interface CheckoutState {
  status: CheckoutStatus;
  qrCode: string | null;
  ticketData: ConsultaMontoData | null;
  paymentResult: PagoResultData | null;
  error: string | null;
}

const initialState: CheckoutState = {
  status: "idle",
  qrCode: null,
  ticketData: null,
  paymentResult: null,
  error: null,
};

// ── Actions ──────────────────────────────────────────────────────────────────

type Action =
  | { type: "SET_QR_CODE"; payload: string }
  | { type: "TICKET_LOADED"; payload: ConsultaMontoData }
  | { type: "PAYMENT_SUCCESS"; payload: PagoResultData }
  | { type: "PAYMENT_ERROR"; payload: string }
  | { type: "RESET" };

function reducer(state: CheckoutState, action: Action): CheckoutState {
  switch (action.type) {
    case "SET_QR_CODE":
      return { ...initialState, qrCode: action.payload };
    case "TICKET_LOADED":
      return { ...state, ticketData: action.payload };
    case "PAYMENT_SUCCESS":
      return { ...state, status: "success", paymentResult: action.payload };
    case "PAYMENT_ERROR":
      return { ...state, status: "error", error: action.payload };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

// ── Context ──────────────────────────────────────────────────────────────────

interface CheckoutContextValue {
  state: CheckoutState;
  setQrCode: (code: string) => void;
  ticketLoaded: (data: ConsultaMontoData) => void;
  paymentSuccess: (result: PagoResultData) => void;
  paymentError: (message: string) => void;
  reset: () => void;
}

export const CheckoutContext = createContext<CheckoutContextValue | null>(null);

export function CheckoutProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const value: CheckoutContextValue = {
    state,
    setQrCode: (code) => dispatch({ type: "SET_QR_CODE", payload: code }),
    ticketLoaded: (data) => dispatch({ type: "TICKET_LOADED", payload: data }),
    paymentSuccess: (result) =>
      dispatch({ type: "PAYMENT_SUCCESS", payload: result }),
    paymentError: (message) =>
      dispatch({ type: "PAYMENT_ERROR", payload: message }),
    reset: () => dispatch({ type: "RESET" }),
  };

  return (
    <CheckoutContext.Provider value={value}>
      {children}
    </CheckoutContext.Provider>
  );
}
