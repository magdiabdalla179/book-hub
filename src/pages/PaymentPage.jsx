import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Loader2, Smartphone, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import api from '../lib/axios';
import toast from 'react-hot-toast';

export default function PaymentPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [transactionId, setTransactionId] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('idle'); // idle, pending, successful, failed
  const [pollInterval, setPollInterval] = useState(null);

  // Fetch order details
  const { data: orderData, isLoading: isLoadingOrder } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const { data } = await api.get(`/orders/${orderId}`);
      return data.data;
    }
  });

  // Initiate Payment Mutation
  const initiatePayment = useMutation({
    mutationFn: async () => {
      const endpoint = orderData.paymentMethod === 'mtn_momo' ? '/payments/momo' : '/payments/airtel';
      const { data } = await api.post(endpoint, {
        orderId,
        amount: orderData.total,
        phoneNumber: orderData.shippingAddress?.phone || '0780000000' // fallback for digital only
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
    }
  });

  // Start polling mechanism
  const startPolling = (txId) => {
    const endpoint = orderData.paymentMethod === 'mtn_momo' ? `/payments/momo/${txId}/status` : `/payments/airtel/${txId}/status`;
    
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
      } catch (err) {
        clearInterval(interval);
        setPaymentStatus('failed');
      }
    }, 2000); // Poll every 2 seconds

    setPollInterval(interval);
  };

  useEffect(() => {
    if (orderData && paymentStatus === 'idle') {
      initiatePayment.mutate();
    }
    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [orderData]);

  if (isLoadingOrder) {
    return (
      <div className="min-h-screen page-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
      </div>
    );
  }

  const isMtn = orderData?.paymentMethod === 'mtn_momo';
  const logoUrl = isMtn 
    ? 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/MTN_Logo.svg/512px-MTN_Logo.svg.png'
    : 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Airtel_Logo.svg/512px-Airtel_Logo.svg.png';
  
  const brandColor = isMtn ? 'text-yellow-500' : 'text-red-500';

  return (
    <div className="min-h-screen page-bg pt-32 pb-20 flex items-center justify-center p-4">
      <div className="glass-dark p-8 rounded-2xl w-full max-w-md text-center relative overflow-hidden">
        
        {/* Decorative background glow based on provider */}
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 blur-[100px] opacity-20 pointer-events-none ${isMtn ? 'bg-yellow-500' : 'bg-red-500'}`} />

        <div className="relative z-10">
          <img src={logoUrl} alt="Provider" className="h-16 mx-auto mb-8 object-contain bg-white rounded-xl p-2" />
          
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Complete Payment</h2>
            <p className="text-surface-400">Order #{orderData?.orderNumber}</p>
            <div className="text-4xl font-black mt-4 font-display">
              <span className={brandColor}>RWF</span> <span className="text-white">{orderData?.total?.toLocaleString()}</span>
            </div>
          </div>

          {paymentStatus === 'pending' && (
            <div className="space-y-6">
              <div className="w-20 h-20 mx-auto relative flex items-center justify-center">
                <Loader2 className={`w-12 h-12 animate-spin ${brandColor} absolute`} />
                <Smartphone className="w-6 h-6 text-white absolute" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2 animate-pulse">Awaiting Confirmation...</h3>
                <p className="text-surface-300 text-sm leading-relaxed">
                  Please check your phone (<strong>{orderData.shippingAddress?.phone}</strong>) and enter your PIN to authorize the payment.
                </p>
              </div>
            </div>
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
                  The transaction was declined or timed out. Please check your balance and try again.
                </p>
                <div className="flex gap-4">
                  <button onClick={() => navigate('/checkout')} className="btn-outline flex-1">
                    Change Method
                  </button>
                  <button onClick={() => initiatePayment.mutate()} className={`btn-brand flex-1 ${isMtn ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-red-500 hover:bg-red-600'}`}>
                    Retry
                  </button>
                </div>
              </div>
            </div>
          )}

          {paymentStatus === 'idle' && (
            <div className="flex justify-center p-8">
              <Loader2 className="w-8 h-8 text-surface-500 animate-spin" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
