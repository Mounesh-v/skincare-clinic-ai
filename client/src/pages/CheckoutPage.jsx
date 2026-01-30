import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CreditCard, Building2, Smartphone, Wallet,
  MapPin, User, Mail, Phone, ShieldCheck, Lock, CheckCircle
} from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { formatCurrency } from '../utils/formatters';
import toast from 'react-hot-toast';

/**
 * Checkout Page
 * Complete payment and shipping information
 */
const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { product, quantity = 1, selectedSize } = location.state || {};

  const [step, setStep] = useState(1); // 1: Address, 2: Payment
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [processing, setProcessing] = useState(false);

  // Form states
  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    upiId: '',
  });

  if (!product) {
    return (
      <div className="container-custom section-padding text-center">
        <h2 className="text-2xl font-bold mb-4">No product selected</h2>
        <Button onClick={() => navigate('/products')}>Browse Products</Button>
      </div>
    );
  }

  const subtotal = product.price * quantity;
  const discount = (product.originalPrice - product.price) * quantity;
  const shipping = subtotal > 999 ? 0 : 49;
  const tax = Math.round(subtotal * 0.18); // 18% GST
  const total = subtotal + shipping + tax;

  const paymentMethods = [
    { id: 'card', label: 'Credit/Debit Card', icon: CreditCard },
    { id: 'upi', label: 'UPI', icon: Smartphone },
    { id: 'netbanking', label: 'Net Banking', icon: Building2 },
    { id: 'wallet', label: 'Digital Wallet', icon: Wallet },
  ];

  const handleInputChange = (e, type) => {
    const { name, value } = e.target;
    if (type === 'shipping') {
      setShippingInfo({ ...shippingInfo, [name]: value });
    } else {
      setPaymentInfo({ ...paymentInfo, [name]: value });
    }
  };

  const handlePlaceOrder = async () => {
    setProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setProcessing(false);
      toast.success('Order placed successfully! 🎉');
      navigate('/order-success', {
        state: {
          orderId: `ORD${Date.now()}`,
          product,
          quantity,
          total,
        }
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container-custom">
        {/* Progress Steps */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: 'Shipping' },
              { num: 2, label: 'Payment' },
              { num: 3, label: 'Confirm' },
            ].map((s, index) => (
              <React.Fragment key={s.num}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all ${
                      step >= s.num
                        ? 'bg-primary-600 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {step > s.num ? <CheckCircle className="h-6 w-6" /> : s.num}
                  </div>
                  <span className="text-sm font-medium mt-2">{s.label}</span>
                </div>
                {index < 2 && (
                  <div
                    className={`flex-1 h-1 mx-4 rounded transition-all ${
                      step > s.num ? 'bg-primary-600' : 'bg-slate-200'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Shipping Information */}
            {step === 1 && (
              <Card>
                <h2 className="text-2xl font-bold mb-6">Shipping Information</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input
                        type="text"
                        name="fullName"
                        value={shippingInfo.fullName}
                        onChange={(e) => handleInputChange(e, 'shipping')}
                        className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Email *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input
                        type="email"
                        name="email"
                        value={shippingInfo.email}
                        onChange={(e) => handleInputChange(e, 'shipping')}
                        className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Phone *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={shippingInfo.phone}
                        onChange={(e) => handleInputChange(e, 'shipping')}
                        className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Address *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                      <textarea
                        name="address"
                        value={shippingInfo.address}
                        onChange={(e) => handleInputChange(e, 'shipping')}
                        rows="3"
                        className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={shippingInfo.city}
                      onChange={(e) => handleInputChange(e, 'shipping')}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={shippingInfo.state}
                      onChange={(e) => handleInputChange(e, 'shipping')}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={shippingInfo.pincode}
                      onChange={(e) => handleInputChange(e, 'shipping')}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                      maxLength="6"
                      required
                    />
                  </div>
                </div>

                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => setStep(2)}
                  className="mt-6"
                >
                  Continue to Payment
                </Button>
              </Card>
            )}

            {/* Payment Method */}
            {step === 2 && (
              <Card>
                <h2 className="text-2xl font-bold mb-6">Payment Method</h2>
                
                {/* Payment Method Selection */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {paymentMethods.map((method) => {
                    const Icon = method.icon;
                    return (
                      <button
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id)}
                        className={`p-4 border-2 rounded-lg transition-all ${
                          paymentMethod === method.id
                            ? 'border-primary-600 bg-primary-50'
                            : 'border-slate-200 hover:border-primary-300'
                        }`}
                      >
                        <Icon className="h-8 w-8 mx-auto mb-2 text-primary-600" />
                        <p className="text-sm font-medium text-center">{method.label}</p>
                      </button>
                    );
                  })}
                </div>

                {/* Card Payment Form */}
                {paymentMethod === 'card' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Card Number
                      </label>
                      <input
                        type="text"
                        name="cardNumber"
                        value={paymentInfo.cardNumber}
                        onChange={(e) => handleInputChange(e, 'payment')}
                        placeholder="1234 5678 9012 3456"
                        maxLength="19"
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        name="cardName"
                        value={paymentInfo.cardName}
                        onChange={(e) => handleInputChange(e, 'payment')}
                        placeholder="Name on card"
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          name="expiryDate"
                          value={paymentInfo.expiryDate}
                          onChange={(e) => handleInputChange(e, 'payment')}
                          placeholder="MM/YY"
                          maxLength="5"
                          className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          CVV
                        </label>
                        <input
                          type="text"
                          name="cvv"
                          value={paymentInfo.cvv}
                          onChange={(e) => handleInputChange(e, 'payment')}
                          placeholder="123"
                          maxLength="3"
                          className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* UPI Payment */}
                {paymentMethod === 'upi' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      UPI ID
                    </label>
                    <input
                      type="text"
                      name="upiId"
                      value={paymentInfo.upiId}
                      onChange={(e) => handleInputChange(e, 'payment')}
                      placeholder="yourname@upi"
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                    />
                  </div>
                )}

                {/* Net Banking / Wallet - Placeholder */}
                {(paymentMethod === 'netbanking' || paymentMethod === 'wallet') && (
                  <div className="text-center py-8">
                    <p className="text-slate-600">
                      You will be redirected to complete the payment
                    </p>
                  </div>
                )}

                {/* Security Badge */}
                <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg mt-6">
                  <Lock className="h-5 w-5 text-green-600" />
                  <span className="text-sm text-green-700 font-medium">
                    Your payment information is secure and encrypted
                  </span>
                </div>

                <div className="flex gap-4 mt-6">
                  <Button variant="outline" onClick={() => setStep(1)} fullWidth>
                    Back
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handlePlaceOrder}
                    loading={processing}
                    fullWidth
                  >
                    {processing ? 'Processing...' : `Pay ${formatCurrency(total)}`}
                  </Button>
                </div>
              </Card>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <h3 className="text-xl font-bold mb-6">Order Summary</h3>

              {/* Product Info */}
              <div className="flex gap-4 mb-6 pb-6 border-b border-slate-200">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-20 h-20 rounded-lg object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/80x80?text=Product';
                  }}
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900 mb-1">{product.name}</h4>
                  <p className="text-sm text-slate-600">Qty: {quantity}</p>
                  {selectedSize && (
                    <p className="text-sm text-slate-600">Size: {selectedSize}</p>
                  )}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatCurrency(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'FREE' : formatCurrency(shipping)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Tax (GST 18%)</span>
                  <span>{formatCurrency(tax)}</span>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between text-xl font-bold text-slate-900 pt-6 border-t border-slate-200">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t border-slate-200 space-y-3">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <ShieldCheck className="h-4 w-4 text-green-600" />
                  <span>100% Secure Payment</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Money-back Guarantee</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;