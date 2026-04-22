import { Button } from '../../../shared/components/Button';
import { usePayment } from '../hooks/usePayment';

export function PaymentSelector() {
  const { pay, loading } = usePayment();

  return (
    <div className="flex flex-col gap-6 w-full max-w-sm">
      <Button
        variant="primary"
        onClick={() => pay('card')}
        disabled={loading}
        fullWidth
      >
        💳 Tarjeta
      </Button>

      <Button
        variant="secondary"
        onClick={() => pay('qr')}
        disabled={loading}
        fullWidth
      >
        📱 Pagar con QR
      </Button>
    </div>
  );
}
