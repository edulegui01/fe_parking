import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { paymentService } from '../services/payment.service';
import { useCheckout } from '../../../store/checkout.hook';
import type { PagoData, PagoResultData, ApiResponse } from '../../../shared/types';

type FacturaState = { ruc?: string; razon_social?: string; email?: string };

export function usePayment() {
  const { state, paymentSuccess, paymentError } = useCheckout();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const factura = (location.state as { factura?: FacturaState } | null)?.factura;

  async function pay(method: 'card' | 'qr') {
    if (!state.ticketData) return;
    setLoading(true);

    const payload: PagoData = {
      ticket_code: state.ticketData.codigo_ticket,
      monto: state.ticketData.monto_total,
      id_expediente: state.ticketData.paciente.id_expediente || undefined,
      ruc: factura?.ruc || undefined,
      a_nombre_de: factura?.razon_social || undefined,
      correo_electronico: factura?.email || undefined,
    };

    try {
      const res: ApiResponse<PagoResultData> = method === 'card'
        ? await paymentService.pagarTarjeta(payload)
        : await paymentService.pagarQr(payload);
      paymentSuccess(res.data!);
      navigate('/confirmation');
    } catch (e) {
      paymentError(e instanceof Error ? e.message : 'Error al procesar el pago');
      navigate('/confirmation');
    } finally {
      setLoading(false);
    }
  }

  return { pay, loading };
}
