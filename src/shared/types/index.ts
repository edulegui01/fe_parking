// ── Envelope genérico ────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  status: "success" | "error";
  data: T | null;
  error: { code: string; message: string } | null;
  meta: { trace_id: string; timestamp: string; version: string };
}

// ── TICKET ───────────────────────────────────────────────────────────────────

/** POST /ticket */
export interface CrearTicketData {
  codigo_ticket: string;
  fecha_ingreso: string;
  message: string;
}

/** GET /ticket/consultar-contribuyente?documento= */
export interface ContribuyenteData {
  documento: string;
  ruc_base: string;
  dv: string;
  ruc_formateado: string;
  razon_social: string;
  estado: string;
  codigo_control: string;
  fecha_carga: string;
}

/** GET /ticket/consulta-monto?ticket_code=&documento= */
export interface ConsultaMontoData {
  codigo_ticket: string;
  fecha_ingreso: string;
  documento: string;
  tipo_documento: string;
  descuento_porcentaje: number;
  iva_porcentaje: number;
  tarifa_calculada: number;
  monto_total: number;
  tiempo_transcurrido: string;
  facturado: string;
  facturas: {
    id_factura_parking: number;
    id_factura: number | null;
    fecha_factura: string;
  }[];
  paciente: {
    paciente: string;
    ruc: string | null;
    pasaporte: string | null;
    id_grupo: number;
    secuencia: number;
    id_expediente: number;
    email: string;
    porc_iva: number;
    descuento: number;
  };
}

/** POST /ticket/generate-invoice */
export interface GenerarFacturaData {
  codigo_ticket: string;
  monto: string;
  id_expediente: number;
  ruc: string;
}

/** POST /ticket/exit — misma forma que ContribuyenteData */
export type RegistrarEgresoData = ContribuyenteData;

// ── PAGO ─────────────────────────────────────────────────────────────────────

/** POST /pago/tarjeta  |  POST /pago/qr — body */
export interface PagoData {
  ticket_code: string;
  monto: number;
  id_expediente?: number;
  ruc?: string;
  a_nombre_de?: string;
  correo_electronico?: string;
}

/** POST /pago/tarjeta  |  POST /pago/qr — respuesta */
export interface PagoResultData {
  codigo_ticket: string;
  monto_facturado: number;
  id_expediente: number;
  xml: string;
  cdc: string;
  url_qr: string;
  ruc: string;
}

// ── BANCARD ──────────────────────────────────────────────────────────────────

/** POST /bancard/verificar-conexion */
export interface BancardConexionData {
  eco: number;
}

/** POST /bancard/iniciar-pago-tarjeta */
export interface BancardIniciarPagoData {
  bin: string;
  nsu: string;
}

/** POST /bancard/confirmar-pago-tarjeta */
export interface BancardConfirmarPagoData {
  codigoAutorizacion: string;
  nroBoleta: string;
  codigoComercio: string;
  nombreTarjeta: string;
  pan: string;
  mensajeDisplay: string;
  saldo: number;
  nombreCliente: string;
  issuerId: string;
  montoVuelto: number;
}

/** POST /bancard/pago-qr */
export interface BancardPagoQrData {
  codigoAutorizacion: string;
  codigoComercio: string;
  issuerId: string;
  mensajeDisplay: string;
  montoVuelto: number;
  nombreCliente: string;
  nombreTarjeta: string;
  nroBoleta: string;
  saldo: number;
}

// ── Legacy (mantener compatibilidad) ─────────────────────────────────────────

export interface Ticket {
  id: string;
  code: string;
  entryTime: string;
  exitTime?: string;
  durationMinutes: number;
  amountDue: number;
  licensePlate?: string;
}

export type PaymentMethod = "card" | "qr";

export type PaymentStatus = "pending" | "processing" | "success" | "error";

export interface PaymentResult {
  transactionId: string;
  status: PaymentStatus;
  message?: string;
}
