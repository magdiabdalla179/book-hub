import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Loader2, Smartphone, CheckCircle2, XCircle, CreditCard } from 'lucide-react';
import api from '../lib/axios';
import toast from 'react-hot-toast';

function StripeForm({ amount, orderId, onSuccess, onFailed }) {
  const [stripePromise, setStripePromise] = useState(null);
  const [Elements, setElements] = useState(null);
  const [CardElement, setCardElement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { data: config } = useQuery({
    queryKey: ['stripe-config'],
    queryFn: async () => {
      const { data } = await api.get('/payments/config/stripe');
      return data;
    },
  });

  useEffect(() => {
    if (!config?.publishableKey) return;

    let cancelled = false;

    import('@stripe/stripe-js').then(async ({ loadStripe }) => {
      if (cancelled) return;
      const instance = await loadStripe(config.publishableKey);
      if (cancelled) return;
      setStripePromise(instance);
    });

    import('@stripe/react-stripe-js').then((mod) => {
      if (cancelled) return;
      setElements(() => mod.Elements);
      setCardElement(() => mod.CardElement);
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, [config]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripePromise || !CardElement) return;

    setLoading(true);
    setError(null);

    try {
      const { data } = await api.post('/payments/stripe/create-intent', {
        orderId,
        amount,
      });

      const stripe = await stripePromise;
      const { error: confirmError } = await stripe.confirmCardPayment(data.clientSecret);

      if (confirmError) {
        setError(confirmError.message);
        setLoading(false);
        return;
      }

      const { data: confirmData } = await api.post('/payments/stripe/confirm', {
        paymentIntentId: data.paymentIntentId,
      });

      if (confirmData.status === 'successful') {
        onSuccess();
      } else {
        onFailed();
      }
    } catch (err) {
      setError(err.message || 'Payment failed');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-8 h-8 text-surface-500 animate-spin" />
      </div>
    );
  }

  if (!Elements || !CardElement || !stripePromise) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-8 h-8 text-surface-500 animate-spin" />
      </div>
    );
  }

  const CardInput = CardElement;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Elements stripe={stripePromise}>
        <div className="bg-neutral-low rounded-lg p-4 border border-neutral-high text-left">
          <label className="block text-sm text-surface-300 mb-2">Card Details</label>
          <CardInput
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#dfe8de',
                  '::placeholder': { color: '#6b8c6b' },
                },
                invalid: { color: '#ef4444' },
              },
            }}
          />
        </div>
      </Elements>
      {error && <p className="text-error text-sm text-left">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <CreditCard className="w-5 h-5" />
        )}
        Pay RWF {Number(amount || 0).toLocaleString()}
      </button>
      <p className="text-xs text-surface-500">Secured by Stripe. Your card details are never stored on our servers.</p>
    </form>
  );
}

export default function PaymentPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [transactionId, setTransactionId] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('idle');
  const [pollInterval, setPollInterval] = useState(null);

  const { data: orderData, isLoading: isLoadingOrder } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const { data } = await api.get(`/orders/${orderId}`);
      return data.data;
    },
  });

  const initiatePayment = useMutation({
    mutationFn: async () => {
      const endpoint = orderData.paymentMethod === 'mtn_momo' ? '/payments/momo' : '/payments/airtel';
      const { data } = await api.post(endpoint, {
        orderId,
        amount: orderData.total,
        phoneNumber: orderData.shippingAddress?.phone || '0780000000',
      });
      return data;
    },
    onSuccess: (data) => {
      setTransactionId(data.transactionId);
      setPaymentStatus('pending');
      startPolling(data.transactionId);
    },
    onError: (error) => {
      setPaymentStatus('failed');
      toast.error(error.response?.data?.message || 'Failed to initiate payment');
    },
  });

  const startPolling = (txId) => {
    const endpoint = orderData.paymentMethod === 'mtn_momo'
      ? `/payments/momo/${txId}/status`
      : `/payments/airtel/${txId}/status`;

    const interval = setInterval(async () => {
      try {
        const { data } = await api.get(endpoint);
        if (data.status === 'successful') {
          clearInterval(interval);
          setPaymentStatus('successful');
          setTimeout(() => navigate(`/order-confirmation/${orderId}`), 2000);
        } else if (data.status === 'failed') {
          clearInterval(interval);
          setPaymentStatus('failed');
        }
      } catch {
        clearInterval(interval);
        setPaymentStatus('failed');
      }
    }, 2000);

    setPollInterval(interval);
  };

  useEffect(() => {
    if (orderData && paymentStatus === 'idle' && orderData.paymentMethod !== 'stripe') {
      initiatePayment.mutate();
    }
  }, [orderData]);

  useEffect(() => {
    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [pollInterval]);

  const isStripe = orderData?.paymentMethod === 'stripe';
  const isMtn = orderData?.paymentMethod === 'mtn_momo';
  const logoUrl = isMtn
    ? 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/MTN_Logo.svg/512px-MTN_Logo.svg.png'
    : isStripe
      ? ''
      : 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Airtel_Logo.svg/512px-Airtel_Logo.svg.png';

  const brandColor = isMtn ? 'text-yellow-500' : isStripe ? 'text-indigo-500' : 'text-red-500';
  const brandBg = isMtn ? 'bg-yellow-500' : isStripe ? 'bg-indigo-500' : 'bg-red-500';

  if (isLoadingOrder) {
    return (
      <div className="min-h-screen page-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen page-bg pt-32 pb-20 flex items-center justify-center p-4">
      <div className="glass-dark p-8 rounded-lg w-full max-w-md text-center relative overflow-hidden">
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 blur-[100px] opacity-20 pointer-events-none ${brandBg}`} />

        <div className="relative z-10">
          {logoUrl ? (
            <img src={logoUrl} alt="Provider" className="h-16 mx-auto mb-8 object-contain bg-white rounded-lg p-2" />
          ) : (
            <div className="w-16 h-16 mx-auto mb-8 bg-white rounded-lg flex items-center justify-center">
              <CreditCard className="w-8 h-8 text-indigo-600" />
            </div>
          )}

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Complete Payment</h2>
            <p className="text-surface-400">Order #{orderData?.orderNumber}</p>
            <div className="text-4xl font-black mt-4 font-display">
              <span className={brandColor}>RWF</span>{' '}
              <span className="text-white">{Number(orderData?.total || 0).toLocaleString()}</span>
            </div>
          </div>

          {paymentStatus === 'pending' && !isStripe && (
            <div className="space-y-6">
              <div className="w-20 h-20 mx-auto relative flex items-center justify-center">
                <Loader2 className={`w-12 h-12 animate-spin ${brandColor} absolute`} />
                <Smartphone className="w-6 h-6 text-white absolute" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2 animate-pulse">Awaiting Confirmation...</h3>
                <p className="text-surface-300 text-sm leading-relaxed">
                  Please check your phone (<strong>{orderData.shippingAddress?.phone}</strong>) and enter your PIN.
                </p>
              </div>
            </div>
          )}

          {isStripe && paymentStatus === 'idle' && (
            <StripeForm
              amount={orderData?.total}
              orderId={orderId}
              onSuccess={() => {
                setPaymentStatus('successful');
                setTimeout(() => navigate(`/order-confirmation/${orderId}`), 2000);
              }}
              onFailed={() => setPaymentStatus('failed')}
            />
          )}

          {paymentStatus === 'successful' && (
            <div className="space-y-4 animate-scale-in">
              <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-white">Payment Successful!</h3>
              <p className="text-surface-400">Redirecting to confirmation...</p>
            </div>
          )}

          {paymentStatus === 'failed' && (
            <div className="space-y-6 animate-scale-in">
              <div className="w-20 h-20 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto">
                <XCircle className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Payment Failed</h3>
                <p className="text-surface-400 text-sm mb-6">
                  The transaction was declined or timed out.
                </p>
                <div className="flex gap-4">
                  <button onClick={() => navigate('/checkout')} className="btn-outline flex-1">
                    Change Method
                  </button>
                  <button
                    onClick={() => {
                      setPaymentStatus('idle');
                      setTransactionId(null);
                      if (isStripe) {
                        window.location.reload();
                      } else {
                        initiatePayment.mutate();
                      }
                    }}
                    className="btn-primary flex-1"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          )}

          {paymentStatus === 'idle' && !isStripe && (
            <div className="flex justify-center p-8">
              <Loader2 className="w-8 h-8 text-surface-500 animate-spin" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
