import { api } from '../../../shared/services/api';
import type { ApiResponse, PagoData, PagoResultData } from '../../../shared/types';

export const paymentService = {
  pagarTarjeta: (payload: PagoData) =>
    api.post<ApiResponse<PagoResultData>>('/pago/tarjeta', payload),

  pagarQr: (payload: PagoData) =>
    api.post<ApiResponse<PagoResultData>>('/pago/qr', payload),
};
