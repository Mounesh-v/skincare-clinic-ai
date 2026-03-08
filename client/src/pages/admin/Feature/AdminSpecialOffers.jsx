import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  EyeOff,
  TrendingUp,
  Clock,
  DollarSign,
  MousePointer,
  ShoppingCart,
  Loader2,
  Calendar,
  Tag,
  Package,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';
import specialOfferService from '../../../services/specialOfferService';
import productService from '../../../services/productService';
import toast from 'react-hot-toast';
import Button from '../../../components/common/Button';

/**
 * Admin Special Offers Management Panel
 * Full CRUD operations for special offers banner
 */
const AdminSpecialOffers = () => {
  const [offers, setOffers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [filter, setFilter] = useState('active'); // active, expired, inactive, all

  // Form state
  const [formData, setFormData] = useState({
    productId: '',
    badge: 'FLASH SALE',
    badgeColor: 'bg-red-500',
    discount: '30%',
    offerPrice: '',
    expiresAt: '',
    position: 1,
    isActive: true
  });

  const BADGE_OPTIONS = [
    { value: 'FLASH SALE', color: 'bg-red-500' },
    { value: 'BEST SELLER', color: 'bg-emerald-500' },
    { value: 'LIMITED', color: 'bg-amber-500' },
    { value: 'HOT DEAL', color: 'bg-orange-500' },
    { value: 'TRENDING', color: 'bg-violet-500' },
    { value: 'NEW ARRIVAL', color: 'bg-blue-500' }
  ];

  useEffect(() => {
    fetchData();
  }, [filter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch offers
      const offersRes = await specialOfferService.getAllOffers({ status: filter });
      setOffers(offersRes.data || []);

      // Fetch products for dropdown
      const productsRes = await productService.getAll();
      const productsList = Array.isArray(productsRes) ? productsRes :
                          Array.isArray(productsRes?.products) ? productsRes.products :
                          Array.isArray(productsRes?.data) ? productsRes.data : [];
      setProducts(productsList);

      // Fetch analytics
      const analyticsRes = await specialOfferService.getAnalytics();
      setAnalytics(analyticsRes.data);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load offers');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (offer = null) => {
    if (offer) {
      // Edit mode
      setEditingOffer(offer);
      setFormData({
        productId: offer.productId._id || offer.productId,
        badge: offer.badge,
        badgeColor: offer.badgeColor,
        discount: offer.discount,
        offerPrice: offer.offerPrice,
        expiresAt: new Date(offer.expiresAt).toISOString().slice(0, 16),
        position: offer.position,
        isActive: offer.isActive
      });
    } else {
      // Create mode
      setEditingOffer(null);
      setFormData({
        productId: '',
        badge: 'FLASH SALE',
        badgeColor: 'bg-red-500',
        discount: '30%',
        offerPrice: '',
        expiresAt: '',
        position: 1,
        isActive: true
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingOffer(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Auto-set badge color when badge changes
    if (name === 'badge') {
      const badgeOption = BADGE_OPTIONS.find(b => b.value === value);
      if (badgeOption) {
        setFormData(prev => ({ ...prev, badgeColor: badgeOption.color }));
      }
    }

    // Auto-calculate offer price when product changes
    if (name === 'productId') {
      const product = products.find(p => p._id === value);
      if (product) {
        const discountPercent = parseInt(formData.discount) || 30;
        const calculatedPrice = Math.round(product.price * (1 - discountPercent / 100));
        setFormData(prev => ({ ...prev, offerPrice: calculatedPrice }));
      }
    }

    // Auto-calculate discount percentage
    if (name === 'discount') {
      const product = products.find(p => p._id === formData.productId);
      if (product) {
        const discountPercent = parseInt(value) || 0;
        const calculatedPrice = Math.round(product.price * (1 - discountPercent / 100));
        setFormData(prev => ({ ...prev, offerPrice: calculatedPrice }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingOffer) {
        // Update
        await specialOfferService.updateOffer(editingOffer._id, formData);
        toast.success('Offer updated successfully!');
      } else {
        // Create
        await specialOfferService.createOffer(formData);
        toast.success('Offer created successfully!');
      }
      
      handleCloseModal();
      fetchData();
    } catch (error) {
      console.error('Error saving offer:', error);
      toast.error(error.message || 'Failed to save offer');
    }
  };

  const handleToggleStatus = async (offerId) => {
    try {
      await specialOfferService.toggleStatus(offerId);
      toast.success('Offer status updated!');
      fetchData();
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (offerId) => {
    if (!window.confirm('Are you sure you want to delete this offer?')) return;
    
    try {
      await specialOfferService.deleteOffer(offerId);
      toast.success('Offer deleted successfully!');
      fetchData();
    } catch (error) {
      console.error('Error deleting offer:', error);
      toast.error('Failed to delete offer');
    }
  };

  const selectedProduct = products.find(p => p._id === formData.productId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-slate-900 mb-2">
            Special Offers Management
          </h1>
          <p className="text-slate-600">Manage banner offers displayed on homepage</p>
        </div>

        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-xl p-6 border-2 border-emerald-200 shadow-lg">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="h-8 w-8 text-emerald-600" />
                <div>
                  <p className="text-3xl font-black text-slate-900">{analytics.activeOffers}</p>
                  <p className="text-sm text-slate-600">Active Offers</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border-2 border-blue-200 shadow-lg">
              <div className="flex items-center gap-3 mb-2">
                <Eye className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-3xl font-black text-slate-900">{analytics.totalViews}</p>
                  <p className="text-sm text-slate-600">Total Views</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border-2 border-violet-200 shadow-lg">
              <div className="flex items-center gap-3 mb-2">
                <MousePointer className="h-8 w-8 text-violet-600" />
                <div>
                  <p className="text-3xl font-black text-slate-900">{analytics.totalClicks}</p>
                  <p className="text-sm text-slate-600">Total Clicks</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border-2 border-orange-200 shadow-lg">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-3xl font-black text-slate-900">{analytics.clickThroughRate}</p>
                  <p className="text-sm text-slate-600">CTR</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border-2 border-rose-200 shadow-lg">
              <div className="flex items-center gap-3 mb-2">
                <ShoppingCart className="h-8 w-8 text-rose-600" />
                <div>
                  <p className="text-3xl font-black text-slate-900">{analytics.conversionRate}</p>
                  <p className="text-sm text-slate-600">Conv. Rate</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Toolbar */}
        <div className="bg-white rounded-xl p-4 shadow-lg mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                filter === 'active' 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilter('expired')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                filter === 'expired' 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Expired
            </button>
            <button
              onClick={() => setFilter('inactive')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                filter === 'inactive' 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Inactive
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                filter === 'all' 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All
            </button>
          </div>

          <Button
            onClick={() => handleOpenModal()}
            className="bg-gradient-to-r from-emerald-600 to-teal-600"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create New Offer
          </Button>
        </div>

        {/* Offers Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
          </div>
        ) : offers.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <AlertCircle className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">No Offers Found</h3>
            <p className="text-slate-600 mb-6">Create your first special offer to get started</p>
            <Button onClick={() => handleOpenModal()}>
              <Plus className="h-5 w-5 mr-2" />
              Create Offer
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b-2 border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Position</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Product</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Badge</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Discount</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Prices</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Expires</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Stats</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {offers.map((offer) => (
                    <tr key={offer._id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold">
                          {offer.position}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={offer.productId?.images?.[0] || '/api/placeholder/50/50'}
                            alt={offer.productId?.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div>
                            <p className="font-semibold text-slate-900">{offer.productId?.name}</p>
                            <p className="text-xs text-slate-500">ID: {offer.productId?._id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-white text-xs font-bold ${offer.badgeColor}`}>
                          {offer.badge}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-lg font-black text-red-600">{offer.discount}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-xs text-slate-500 line-through">₹{offer.productId?.price}</p>
                          <p className="text-lg font-bold text-emerald-600">₹{offer.offerPrice}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-slate-400" />
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{offer.timeLeft}</p>
                            <p className="text-xs text-slate-500">
                              {new Date(offer.expiresAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <p className="text-xs text-slate-600">👁️ {offer.views} views</p>
                          <p className="text-xs text-slate-600">🖱️ {offer.clicks} clicks</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleStatus(offer._id)}
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${
                            offer.isActive 
                              ? 'bg-emerald-100 text-emerald-700' 
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {offer.isActive ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                          {offer.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenModal(offer)}
                            className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(offer._id)}
                            className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b-2 border-slate-100 p-6 flex items-center justify-between">
                <h2 className="text-2xl font-black text-slate-900">
                  {editingOffer ? 'Edit Offer' : 'Create New Offer'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Product Selection */}
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-2">
                    <Package className="inline h-4 w-4 mr-2" />
                    Select Product *
                  </label>
                  <select
                    name="productId"
                    value={formData.productId}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-emerald-500 outline-none"
                  >
                    <option value="">Choose a product...</option>
                    {products.map(product => (
                      <option key={product._id} value={product._id}>
                        {product.name} - ₹{product.price}
                      </option>
                    ))}
                  </select>
                  {selectedProduct && (
                    <p className="mt-2 text-sm text-slate-600">
                      Original Price: ₹{selectedProduct.price}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Badge */}
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-2">
                      <Tag className="inline h-4 w-4 mr-2" />
                      Badge *
                    </label>
                    <select
                      name="badge"
                      value={formData.badge}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-emerald-500 outline-none"
                    >
                      {BADGE_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.value}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Position */}
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-2">
                      Position (1-5) *
                    </label>
                    <input
                      type="number"
                      name="position"
                      value={formData.position}
                      onChange={handleInputChange}
                      min="1"
                      max="5"
                      required
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Discount */}
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-2">
                      <DollarSign className="inline h-4 w-4 mr-2" />
                      Discount (e.g., 30%) *
                    </label>
                    <input
                      type="text"
                      name="discount"
                      value={formData.discount}
                      onChange={handleInputChange}
                      placeholder="30%"
                      required
                      pattern="\d+%"
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-emerald-500 outline-none"
                    />
                  </div>

                  {/* Offer Price */}
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-2">
                      Offer Price (₹) *
                    </label>
                    <input
                      type="number"
                      name="offerPrice"
                      value={formData.offerPrice}
                      onChange={handleInputChange}
                      required
                      min="0"
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>

                {/* Expires At */}
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-2">
                    <Calendar className="inline h-4 w-4 mr-2" />
                    Expires At *
                  </label>
                  <input
                    type="datetime-local"
                    name="expiresAt"
                    value={formData.expiresAt}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-emerald-500 outline-none"
                  />
                </div>

                {/* Active Toggle */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    id="isActive"
                    className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <label htmlFor="isActive" className="text-sm font-bold text-slate-900">
                    Active (visible on banner)
                  </label>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-4 border-t-2 border-slate-100">
                  <Button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 bg-slate-200 text-slate-700 hover:bg-slate-300"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600"
                  >
                    {editingOffer ? 'Update Offer' : 'Create Offer'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSpecialOffers;