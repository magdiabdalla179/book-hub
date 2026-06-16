import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Check, ChevronRight, User, MapPin, CreditCard, ShoppingBag, Loader2, Search } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import api from '../lib/axios';
import { provinces, allDistricts, provinceColors, provinceBgMap } from '../data/rwanda';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { items, subtotal, shippingCost, tax, total, clearCart } = useCartStore();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    province: '',
    country: 'Rwanda',
    postalCode: '',
    notes: '',
    paymentMethod: 'mtn_momo',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const createOrder = useMutation({
    mutationFn: async () => {
      const orderItems = items.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
        format: item.selectedFormat || item.product.format,
      }));
      const { data } = await api.post('/orders', {
        items: orderItems,
        shippingAddress: {
          fullName: formData.fullName,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          province: formData.province,
          country: formData.country,
          postalCode: formData.postalCode,
        },
        notes: formData.notes,
        paymentMethod: formData.paymentMethod,
      });
      return data;
    },
    onSuccess: (data) => {
      clearCart();
      navigate(`/payment/${data.data.id}`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create order');
    },
  });

  const handleNext = () => {
    if (currentStep === 1) {
      if (!formData.fullName || !formData.phone) return toast.error('Name and phone are required');
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (needsShipping) {
        if (!formData.address || !formData.city) return toast.error('Address and city are required');
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      setCurrentStep(4);
    } else if (currentStep === 4) {
      createOrder.mutate();
    }
  };

  const needsShipping = items.some((i) => (i.selectedFormat || i.product.format) !== 'ebook');

  const steps = [
    { num: 1, title: 'Details', icon: User },
    { num: 2, title: 'Shipping', icon: MapPin },
    { num: 3, title: 'Review', icon: ShoppingBag },
    { num: 4, title: 'Payment', icon: CreditCard },
  ];

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen page-bg pt-24 pb-20">
      <div className="section-container max-w-5xl">

        <div className="mb-12">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-neutral-low rounded-full z-0" />
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary rounded-full z-0 transition-all duration-500"
              style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            />
            {steps.map((step) => {
              const Icon = step.icon;
              const isActive = currentStep === step.num;
              const isPast = currentStep > step.num;
              return (
                <div key={step.num} className="relative z-10 flex flex-col items-center gap-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                    isActive ? 'bg-primary border-primary text-primary-on' :
                    isPast ? 'bg-green-500 border-green-500 text-white' :
                    'bg-neutral border-neutral-high text-outline'
                  }`}>
                    {isPast ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span className={`text-xs font-medium uppercase tracking-wider ${
                    isActive || isPast ? 'text-white' : 'text-surface-500'
                  }`}>
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 glass-dark p-8 rounded-lg">

            {currentStep === 1 && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-2xl font-bold text-white mb-6">Personal Details</h2>
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-1.5">Full Name</label>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="input-field" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-1.5">Phone Number</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="input-field" placeholder="078..." />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-2xl font-bold text-white mb-6">Shipping Address</h2>
                {!needsShipping ? (
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <p className="text-blue-400 font-medium">Digital order only!</p>
                    <p className="text-surface-300 text-sm mt-1">Your order contains only e-books. No physical shipping address is required.</p>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-surface-300 mb-1.5">Street Address</label>
                      <input type="text" name="address" value={formData.address} onChange={handleChange} className="input-field" placeholder="KG 7 Ave, KG 123 St" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-surface-300 mb-3">Select Province & District</label>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {provinces.map((p) => (
                          <button
                            key={p.name}
                            type="button"
                            onClick={() => setFormData({ ...formData, province: formData.province === p.name ? '' : p.name, city: '' })}
                            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                              formData.province === p.name ? provinceColors[p.name] + ' border-2' : 'bg-neutral-low border-neutral-high text-surface-300 hover:border-outline'
                            }`}
                          >
                            {p.name}
                          </button>
                        ))}
                      </div>
                      {formData.province && (
                        <div className={`rounded-lg p-4 border ${provinceBgMap[formData.province]} border-neutral-high`}>
                          <div className="flex items-center gap-2 mb-3">
                            <MapPin className="w-4 h-4 text-primary" />
                            <span className="text-sm text-surface-300 font-medium">Select district in <span className="text-white">{formData.province}</span></span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {provinces.find((p) => p.name === formData.province)?.districts.map((d) => (
                              <button
                                key={d}
                                type="button"
                                onClick={() => setFormData({ ...formData, city: d })}
                                className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                                  formData.city === d ? 'bg-primary border-primary text-primary-on' : 'bg-neutral border-neutral-high text-surface-300 hover:border-outline hover:text-white'
                                }`}
                              >
                                {d}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      {!formData.province && (
                        <div className="flex items-center gap-3 p-4 bg-neutral-low rounded-lg border border-neutral-high">
                          <Search className="w-5 h-5 text-outline shrink-0" />
                          <input
                            type="text"
                            placeholder="Search for a district..."
                            className="bg-transparent border-none outline-none text-white text-sm flex-1 placeholder:text-outline"
                            onChange={(e) => {
                              const q = e.target.value.toLowerCase();
                              const match = allDistricts.find((d) => d.district.toLowerCase().includes(q));
                              if (match && q.length > 0) {
                                setFormData({ ...formData, province: match.province, city: match.district });
                              }
                            }}
                          />
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-surface-300 mb-1.5">Delivery Notes (Optional)</label>
                      <textarea name="notes" value={formData.notes} onChange={handleChange} className="input-field min-h-[100px] resize-y" placeholder="Any special instructions for delivery?" />
                    </div>
                  </>
                )}
              </div>
            )}

            {currentStep === 3 && (
              <div className="animate-fade-in">
                <h2 className="text-2xl font-bold text-white mb-6">Order Review</h2>
                <div className="space-y-4 mb-8">
                  {items.map((item) => (
                    <div key={item.product._id} className="flex gap-4 p-4 bg-neutral-low rounded-lg">
                      <img src={item.product.coverImage || '/placeholder-book.svg'} alt={item.product.title} className="w-16 h-24 object-cover rounded-lg" />
                      <div className="flex-1">
                        <h4 className="font-medium text-white">{item.product.title}</h4>
                        <p className="text-sm text-surface-400 mb-2">{item.selectedFormat || item.product.format}</p>
                        <div className="flex justify-between mt-auto">
                          <span className="text-surface-300">Qty: {item.quantity}</span>
                          <span className="font-bold text-primary">RWF {((item.product.discountPrice ?? item.product.price) * item.quantity).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-6 p-4 bg-neutral-low rounded-lg">
                  <div>
                    <h4 className="font-medium text-surface-300 mb-1">Details</h4>
                    <p className="text-white text-sm">{formData.fullName}</p>
                    <p className="text-white text-sm">{formData.phone}</p>
                  </div>
                  {needsShipping && (
                    <div>
                      <h4 className="font-medium text-surface-300 mb-1">Shipping To</h4>
                      <p className="text-white text-sm">{formData.address}</p>
                      <p className="text-white text-sm">{formData.city}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="animate-fade-in">
                <h2 className="text-2xl font-bold text-white mb-6">Select Payment Method</h2>
                <div className="space-y-4">
                  <label className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    formData.paymentMethod === 'mtn_momo' ? 'bg-neutral-low border-tertiary' : 'border-neutral-high hover:bg-neutral-low'
                  }`}>
                    <input type="radio" name="paymentMethod" value="mtn_momo" checked={formData.paymentMethod === 'mtn_momo'} onChange={handleChange} className="hidden" />
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shrink-0">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/MTN_Logo.svg/512px-MTN_Logo.svg.png" alt="MTN" className="w-8 h-8 object-contain" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">MTN Mobile Money</h4>
                      <p className="text-sm text-surface-400">Pay securely with MTN MoMo</p>
                    </div>
                    {formData.paymentMethod === 'mtn_momo' && <Check className="w-6 h-6 text-yellow-500 ml-auto" />}
                  </label>

                  <label className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    formData.paymentMethod === 'airtel_money' ? 'bg-neutral-low border-error' : 'border-neutral-high hover:bg-neutral-low'
                  }`}>
                    <input type="radio" name="paymentMethod" value="airtel_money" checked={formData.paymentMethod === 'airtel_money'} onChange={handleChange} className="hidden" />
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shrink-0">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Airtel_Logo.svg/512px-Airtel_Logo.svg.png" alt="Airtel" className="w-8 h-8 object-contain" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">Airtel Money</h4>
                      <p className="text-sm text-surface-400">Pay securely with Airtel Money</p>
                    </div>
                    {formData.paymentMethod === 'airtel_money' && <Check className="w-6 h-6 text-red-500 ml-auto" />}
                  </label>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mt-10 pt-6 border-t border-neutral-low">
              {currentStep > 1 ? (
                <button onClick={() => setCurrentStep((prev) => prev - 1)} className="btn-ghost" disabled={createOrder.isPending}>
                  Back
                </button>
              ) : <div />}

              <button onClick={handleNext} disabled={createOrder.isPending} className="btn-primary flex items-center gap-2">
                {createOrder.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : currentStep === 4 ? (
                  'Place Order'
                ) : (
                  <>Continue <ChevronRight className="w-5 h-5" /></>
                )}
              </button>
            </div>
          </div>

          <div className="w-full lg:w-80 shrink-0">
            <div className="glass-dark p-6 rounded-lg sticky top-24">
              <h3 className="font-bold text-white mb-6">Summary</h3>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm text-surface-300">
                  <span>Items ({items.length})</span>
                  <span>RWF {subtotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-surface-300">
                  <span>Shipping</span>
                  <span>{shippingCost() === 0 ? 'Free' : `RWF ${shippingCost().toLocaleString()}`}</span>
                </div>
                <div className="flex justify-between text-sm text-surface-300">
                  <span>Tax (18%)</span>
                  <span>RWF {tax().toLocaleString()}</span>
                </div>
              </div>
              <div className="pt-4 border-t border-neutral-low">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-white">Total</span>
                  <span className="text-2xl font-bold text-primary">RWF {total().toLocaleString()}</span>
                </div>
                <p className="text-xs text-surface-500 text-right">Includes VAT</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
