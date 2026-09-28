import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CreditCard, Smartphone, Wallet, Building2,
  MapPin, User, Mail, Phone, ShieldCheck, Lock, CheckCircle,
  Plus, Trash2, Home, Briefcase, Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import addressService from '../services/addressService';

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);

const emptyAddress = { label: 'Home', fullName: '', phone: '', address: '', city: '', state: '', pincode: '' };

const comingSoonMethods = ['UPI', 'Credit Card', 'Debit Card', 'Net Banking'];

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { product, quantity = 1, selectedSize } = location.state || {};

  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [processing, setProcessing] = useState(false);

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [addressesLoading, setAddressesLoading] = useState(true);

  const [newAddress, setNewAddress] = useState({ ...emptyAddress });

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const res = await addressService.getAddresses();
        const addrs = res.data || [];
        setSavedAddresses(addrs);
        const defaultAddr = addrs.find((a) => a.isDefault);
        if (defaultAddr) setSelectedAddressId(defaultAddr._id);
        else if (addrs.length > 0) setSelectedAddressId(addrs[0]._id);
        else setShowNewAddressForm(true);
      } catch {
        setShowNewAddressForm(true);
      } finally {
        setAddressesLoading(false);
      }
    };
    fetchAddresses();
  }, []);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No product selected</h2>
          <button onClick={() => navigate('/products')} className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700">
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  const productImage = product.images?.[0]?.url || product.image || 'https://via.placeholder.com/80x80?text=Product';
  const total = product.price * quantity;

  const paymentMethods = [
    { id: 'COD', label: 'Cash on Delivery', icon: Wallet },
    { id: 'UPI', label: 'UPI', icon: Smartphone },
    { id: 'Credit Card', label: 'Credit Card', icon: CreditCard },
    { id: 'Debit Card', label: 'Debit Card', icon: CreditCard },
    { id: 'Net Banking', label: 'Net Banking', icon: Building2 },
  ];

  const getSelectedAddress = () => {
    if (showNewAddressForm) return null;
    return savedAddresses.find((a) => a._id === selectedAddressId);
  };

  const handleAddressInput = (e) => {
    const { name, value } = e.target;
    setNewAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveNewAddress = async () => {
    if (!newAddress.fullName || !newAddress.phone || !newAddress.address || !newAddress.city || !newAddress.state || !newAddress.pincode) {
      toast.error('Please fill all address fields');
      return false;
    }
    try {
      const res = await addressService.addAddress(newAddress);
      setSavedAddresses(res.data);
      const added = res.data[res.data.length - 1];
      setSelectedAddressId(added._id);
      setShowNewAddressForm(false);
      setNewAddress({ ...emptyAddress });
      toast.success('Address saved');
      return true;
    } catch {
      toast.error('Failed to save address');
      return false;
    }
  };

  const handleDeleteAddress = async (addrId) => {
    try {
      const res = await addressService.deleteAddress(addrId);
      setSavedAddresses(res.data);
      if (selectedAddressId === addrId) {
        const defaultAddr = res.data.find((a) => a.isDefault);
        setSelectedAddressId(defaultAddr?._id || res.data[0]?._id || null);
        if (res.data.length === 0) setShowNewAddressForm(true);
      }
      toast.success('Address deleted');
    } catch {
      toast.error('Failed to delete address');
    }
  };

  const handlePaymentSelect = (methodId) => {
    if (comingSoonMethods.includes(methodId)) {
      toast.error(`${methodId} is coming soon. Please select Cash on Delivery.`, { duration: 3000 });
      return;
    }
    setPaymentMethod(methodId);
  };

  const handlePlaceOrder = async () => {
    let shippingAddress;

    if (showNewAddressForm) {
      if (!newAddress.fullName || !newAddress.phone || !newAddress.address || !newAddress.city || !newAddress.state || !newAddress.pincode) {
        toast.error('Please fill all address fields');
        return;
      }
      shippingAddress = newAddress;
      await addressService.addAddress({ ...newAddress, isDefault: savedAddresses.length === 0 });
    } else {
      const addr = getSelectedAddress();
      if (!addr) {
        toast.error('Please select or add an address');
        return;
      }
      shippingAddress = {
        fullName: addr.fullName,
        phone: addr.phone,
        address: addr.address,
        city: addr.city,
        state: addr.state,
        pincode: addr.pincode,
      };
    }

    setProcessing(true);
    try {
      const res = await api.post('/api/orders', {
        items: [{ product: product._id, quantity }],
        shippingAddress,
        paymentMethod,
      });

      if (res.data.success) {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        localStorage.setItem('cart', JSON.stringify(cart.filter((i) => (i.id || i._id) !== product._id)));
        toast.success('Order placed successfully!');
        navigate('/order-success', {
          state: { orderId: res.data.order.orderNumber, total: res.data.order.total, product: product.name, quantity },
        });
      }
    } catch (error) {
      if (error.response?.data?.code === 'PROFILE_INCOMPLETE') {
        toast.error('Please complete your profile first');
        navigate('/profile');
        return;
      }
      toast.error(error.response?.data?.message || 'Order failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleProceedToPayment = () => {
    if (!showNewAddressForm && !selectedAddressId) {
      toast.error('Please select or add an address');
      return;
    }
    if (showNewAddressForm) {
      if (!newAddress.fullName || !newAddress.phone || !newAddress.address || !newAddress.city || !newAddress.state || !newAddress.pincode) {
        toast.error('Please fill all address fields');
        return;
      }
    }
    setStep(2);
  };

  const AddressIcon = ({ label }) => label === 'Work' ? <Briefcase className="h-4 w-4" /> : <Home className="h-4 w-4" />;

  const getButtonText = () => {
    if (processing) return 'Processing...';
    return `Place Order • ${formatCurrency(total)}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Steps */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="flex items-center justify-between">
            {[{ num: 1, label: 'Address' }, { num: 2, label: 'Payment' }].map((s, index) => (
              <React.Fragment key={s.num}>
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all ${step >= s.num ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                    {step > s.num ? <CheckCircle className="h-6 w-6" /> : s.num}
                  </div>
                  <span className="text-sm font-medium mt-2">{s.label}</span>
                </div>
                {index < 1 && <div className={`flex-1 h-1 mx-4 rounded transition-all ${step > s.num ? 'bg-emerald-600' : 'bg-slate-200'}`} />}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Address */}
            {step === 1 && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
                <h2 className="text-2xl font-bold mb-6">Delivery Address</h2>

                {addressesLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                  </div>
                ) : (
                  <>
                    {savedAddresses.length > 0 && !showNewAddressForm && (
                      <div className="space-y-3 mb-6">
                        {savedAddresses.map((addr) => (
                          <div key={addr._id} onClick={() => setSelectedAddressId(addr._id)}
                            className={`flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${selectedAddressId === addr._id ? 'border-emerald-600 bg-emerald-50' : 'border-slate-200 hover:border-emerald-300'}`}>
                            <div className="flex-shrink-0 mt-1">
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedAddressId === addr._id ? 'border-emerald-600' : 'border-slate-300'}`}>
                                {selectedAddressId === addr._id && <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />}
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <AddressIcon label={addr.label} />
                                <span className="font-semibold text-slate-900">{addr.label}</span>
                                {addr.isDefault && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Default</span>}
                              </div>
                              <p className="text-sm text-slate-700">{addr.fullName} • {addr.phone}</p>
                              <p className="text-sm text-slate-600">{addr.address}, {addr.city}, {addr.state} - {addr.pincode}</p>
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); handleDeleteAddress(addr._id); }}
                              className="flex-shrink-0 p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {!showNewAddressForm && (
                      <button onClick={() => setShowNewAddressForm(true)}
                        className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-600 hover:border-emerald-400 hover:text-emerald-600 transition-all">
                        <Plus className="h-5 w-5" />
                        <span className="font-medium">Add New Address</span>
                      </button>
                    )}

                    {showNewAddressForm && (
                      <div className="border-2 border-emerald-200 rounded-xl p-6 bg-emerald-50/30">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold text-slate-900">{savedAddresses.length > 0 ? 'Add New Address' : 'Add Delivery Address'}</h3>
                          {savedAddresses.length > 0 && (
                            <button onClick={() => { setShowNewAddressForm(false); setNewAddress({ ...emptyAddress }); }}
                              className="text-sm text-slate-500 hover:text-slate-700">Cancel</button>
                          )}
                        </div>
                        <div className="flex gap-2 mb-4">
                          {['Home', 'Work', 'Other'].map((l) => (
                            <button key={l} onClick={() => setNewAddress((prev) => ({ ...prev, label: l }))}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${newAddress.label === l ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-emerald-300'}`}>
                              {l}
                            </button>
                          ))}
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                            <input type="text" name="fullName" value={newAddress.fullName} onChange={handleAddressInput}
                              className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:border-emerald-500 outline-none" required />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Phone *</label>
                            <input type="tel" name="phone" value={newAddress.phone} onChange={handleAddressInput}
                              className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:border-emerald-500 outline-none" required />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Address *</label>
                            <textarea name="address" value={newAddress.address} onChange={handleAddressInput} rows="2"
                              className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:border-emerald-500 outline-none resize-none" required />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">City *</label>
                            <input type="text" name="city" value={newAddress.city} onChange={handleAddressInput}
                              className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:border-emerald-500 outline-none" required />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">State *</label>
                            <input type="text" name="state" value={newAddress.state} onChange={handleAddressInput}
                              className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:border-emerald-500 outline-none" required />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Pincode *</label>
                            <input type="text" name="pincode" value={newAddress.pincode} onChange={handleAddressInput} maxLength="6"
                              className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:border-emerald-500 outline-none" required />
                          </div>
                        </div>
                        {savedAddresses.length > 0 && (
                          <button onClick={handleSaveNewAddress}
                            className="mt-4 px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-all">
                            Save Address
                          </button>
                        )}
                      </div>
                    )}
                  </>
                )}

                <button onClick={handleProceedToPayment}
                  className="w-full mt-6 px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/30">
                  Continue to Payment
                </button>
              </div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
                <h2 className="text-2xl font-bold mb-6">Payment Method</h2>

                {/* Selected address summary */}
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl mb-6">
                  <MapPin className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                  <div className="flex-1 text-sm">
                    <span className="font-medium text-slate-900">{getSelectedAddress()?.fullName}</span>
                    <span className="text-slate-500 mx-1">•</span>
                    <span className="text-slate-600">{getSelectedAddress()?.address}, {getSelectedAddress()?.city}</span>
                  </div>
                  <button onClick={() => setStep(1)} className="text-sm text-emerald-600 font-medium hover:underline">Change</button>
                </div>

                {/* Payment Methods */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  {paymentMethods.map((method) => {
                    const Icon = method.icon;
                    const isComingSoon = comingSoonMethods.includes(method.id);
                    return (
                      <button key={method.id} onClick={() => handlePaymentSelect(method.id)}
                        className={`relative p-4 border-2 rounded-lg transition-all ${paymentMethod === method.id ? 'border-emerald-600 bg-emerald-50' : 'border-slate-200 hover:border-emerald-300'}`}>
                        <Icon className="h-8 w-8 mx-auto mb-2 text-emerald-600" />
                        <p className="text-sm font-medium text-center">{method.label}</p>
                        {isComingSoon && (
                          <span className="absolute top-1 right-1 text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-semibold">
                            Soon
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* COD Info */}
                {paymentMethod === 'COD' && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl mb-6">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-5 w-5 text-emerald-600" />
                      <span className="text-sm font-medium text-emerald-800">Pay with cash when your order is delivered</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg mt-6">
                  <Lock className="h-5 w-5 text-green-600" />
                  <span className="text-sm text-green-700 font-medium">Your payment information is secure and encrypted</span>
                </div>

                <div className="flex gap-4 mt-6">
                  <button onClick={() => setStep(1)}
                    className="flex-1 px-6 py-3 border-2 border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all">
                    Back
                  </button>
                  <button onClick={handlePlaceOrder} disabled={processing}
                    className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/30 disabled:opacity-70">
                    {getButtonText()}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-4">
              <h3 className="text-xl font-bold mb-6">Order Summary</h3>

              <div className="flex gap-4 mb-6 pb-6 border-b border-slate-200">
                <img src={productImage} alt={product.name} className="w-20 h-20 rounded-lg object-cover"
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/80x80?text=Product'; }} />
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900 mb-1">{product.name}</h4>
                  <p className="text-sm text-slate-600">Qty: {quantity}</p>
                  {selectedSize && <p className="text-sm text-slate-600">Size: {selectedSize}</p>}
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-slate-600">
                  <span>Price</span>
                  <span>{formatCurrency(product.price)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Quantity</span>
                  <span>{quantity}</span>
                </div>
              </div>

              <div className="flex justify-between text-xl font-bold text-slate-900 pt-6 border-t border-slate-200">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-200 space-y-3">
                <div className="flex items-center gap-2 text-sm text-slate-600"><ShieldCheck className="h-4 w-4 text-green-600" /><span>100% Secure Payment</span></div>
                <div className="flex items-center gap-2 text-sm text-slate-600"><CheckCircle className="h-4 w-4 text-green-600" /><span>Money-back Guarantee</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
