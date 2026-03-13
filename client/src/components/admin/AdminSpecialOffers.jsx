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
  X,
  Image as ImageIcon
} from 'lucide-react';
import specialOfferService from '../../services/specialOfferService';
import productService from '../../services/productService';
import toast from 'react-hot-toast';

/**
 * Admin Special Offers Management Panel
 * WITH QUICK PRODUCT ADD FEATURE
 */
const AdminSpecialOffers = () => {
  const [offers, setOffers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [filter, setFilter] = useState('active');

  // Offer Form State
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

  // Quick Product Form State
  const [quickProduct, setQuickProduct] = useState({
    name: '',
    price: '',
    description: '',
    images: [''],
    category: 'Moisturizer'
  });

  const BADGE_OPTIONS = [
    { value: 'FLASH SALE', color: 'bg-red-500' },
    { value: 'BEST SELLER', color: 'bg-emerald-500' },
    { value: 'LIMITED', color: 'bg-amber-500' },
    { value: 'HOT DEAL', color: 'bg-orange-500' },
    { value: 'TRENDING', color: 'bg-violet-500' },
    { value: 'NEW ARRIVAL', color: 'bg-blue-500' }
  ];

  const CATEGORIES = [
    'Moisturizer',
    'Cleanser',
    'Serum',
    'Sunscreen',
    'Treatment',
    'Mask',
    'Toner',
    'Oil',
    'Eye Care',
    'Other'
  ];

  useEffect(() => {
    fetchData();
  }, [filter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const offersRes = await specialOfferService.getAllOffers({ status: filter });
      setOffers(offersRes.data || []);

      const productsRes = await productService.getAll();
      const productsList = Array.isArray(productsRes) ? productsRes :
                          Array.isArray(productsRes?.products) ? productsRes.products :
                          Array.isArray(productsRes?.data) ? productsRes.data : [];
      setProducts(productsList);

      const analyticsRes = await specialOfferService.getAnalytics();
      setAnalytics(analyticsRes.data);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load offers');
    } finally {
      setLoading(false);
    }
  };

  // QUICK ADD PRODUCT
  const handleQuickAddProduct = async () => {
    try {
      if (!quickProduct.name || !quickProduct.price) {
        toast.error('Please fill product name and price');
        return;
      }

      const productData = {
        name: quickProduct.name,
        description: quickProduct.description || 'No description',
        price: parseFloat(quickProduct.price),
        originalPrice: parseFloat(quickProduct.price),
        category: quickProduct.category,
        images: quickProduct.images.filter(img => img.trim() !== ''),
        stock: 100,
        isActive: true
      };

      const newProduct = await productService.create(productData);
      
      // Add to products list
      setProducts([...products, newProduct]);
      
      // Auto-select the new product
      setFormData({ ...formData, productId: newProduct._id || newProduct.id });
      
      // Close product modal
      setShowProductModal(false);
      
      // Reset form
      setQuickProduct({
        name: '',
        price: '',
        description: '',
        images: [''],
        category: 'Moisturizer'
      });
      
      toast.success('Product created and selected!');

    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Failed to create product');
    }
  };

  const handleOpenModal = (offer = null) => {
    if (offer) {
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
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });

    // Auto-calculate offer price when discount changes
    if (name === 'discount' && formData.productId) {
      const product = products.find(p => p._id === formData.productId);
      if (product) {
        const discountPercent = parseInt(value.replace('%', ''));
        const calculatedPrice = product.price * (1 - discountPercent / 100);
        setFormData(prev => ({
          ...prev,
          offerPrice: Math.round(calculatedPrice)
        }));
      }
    }

    // Auto-calculate offer price when product changes
    if (name === 'productId' && value) {
      const product = products.find(p => p._id === value);
      if (product && formData.discount) {
        const discountPercent = parseInt(formData.discount.replace('%', ''));
        const calculatedPrice = product.price * (1 - discountPercent / 100);
        setFormData(prev => ({
          ...prev,
          offerPrice: Math.round(calculatedPrice)
        }));
      }
    }

    // Auto-set badge color when badge changes
    if (name === 'badge') {
      const badge = BADGE_OPTIONS.find(b => b.value === value);
      if (badge) {
        setFormData(prev => ({ ...prev, badgeColor: badge.color }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Validation
      if (!formData.productId) {
        toast.error('Please select a product');
        return;
      }

      const offerData = {
        ...formData,
        discount: formData.discount.includes('%') ? formData.discount : `${formData.discount}%`,
        offerPrice: parseFloat(formData.offerPrice),
        position: parseInt(formData.position),
        expiresAt: new Date(formData.expiresAt).toISOString()
      };

      if (editingOffer) {
        await specialOfferService.updateOffer(editingOffer._id, offerData);
        toast.success('Offer updated successfully!');
      } else {
        await specialOfferService.createOffer(offerData);
        toast.success('Offer created successfully!');
      }

      handleCloseModal();
      fetchData();

    } catch (error) {
      console.error('Error saving offer:', error);
      toast.error(error.response?.data?.message || 'Failed to save offer');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this offer?')) return;

    try {
      await specialOfferService.deleteOffer(id);
      toast.success('Offer deleted successfully!');
      fetchData();
    } catch (error) {
      console.error('Error deleting offer:', error);
      toast.error('Failed to delete offer');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await specialOfferService.toggleStatus(id);
      toast.success('Offer status updated!');
      fetchData();
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('Failed to update status');
    }
  };

  const formatTimeLeft = (expiresAt) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires - now;

    if (diff <= 0) return 'Expired';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Special Offers</h1>
          <p className="text-slate-600 mt-1">Manage banner special offers</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Create New Offer
        </button>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <Package className="h-8 w-8 opacity-80" />
              <span className="text-3xl font-bold">{analytics.activeOffers}</span>
            </div>
            <p className="text-blue-100 text-sm">Active Offers</p>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <Eye className="h-8 w-8 opacity-80" />
              <span className="text-3xl font-bold">{analytics.totalViews.toLocaleString()}</span>
            </div>
            <p className="text-emerald-100 text-sm">Total Views</p>
          </div>

          <div className="bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <MousePointer className="h-8 w-8 opacity-80" />
              <span className="text-3xl font-bold">{analytics.totalClicks.toLocaleString()}</span>
            </div>
            <p className="text-violet-100 text-sm">Total Clicks</p>
          </div>

          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-8 w-8 opacity-80" />
              <span className="text-3xl font-bold">{analytics.clickThroughRate}</span>
            </div>
            <p className="text-amber-100 text-sm">Click Rate</p>
          </div>

          <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <ShoppingCart className="h-8 w-8 opacity-80" />
              <span className="text-3xl font-bold">{analytics.conversionRate}</span>
            </div>
            <p className="text-rose-100 text-sm">Conversion Rate</p>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-200">
        {['active', 'expired', 'inactive', 'all'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 font-medium capitalize transition-colors ${
              filter === tab
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Offers Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Position</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Product</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Badge</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Discount</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Pricing</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Expires</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Stats</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {offers.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-12 text-center">
                    <Package className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 text-lg font-medium">No offers found</p>
                    <p className="text-slate-400 text-sm mt-1">Create your first special offer to get started</p>
                  </td>
                </tr>
              ) : (
                offers.map((offer) => (
                  <tr key={offer._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-bold">
                        {offer.position}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {offer.productId?.images?.[0] ? (
                          <img
                            src={offer.productId.images[0]}
                            alt={offer.productId.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center">
                            <Package className="h-6 w-6 text-slate-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-slate-900">{offer.productId?.name || 'Unknown Product'}</p>
                          <p className="text-xs text-slate-500">ID: {offer.productId?._id?.slice(-6) || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-white ${offer.badgeColor}`}>
                        {offer.badge}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-lg font-bold text-primary-600">{offer.discount}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="line-through text-slate-400">₹{offer.productId?.price}</p>
                        <p className="text-lg font-bold text-slate-900">₹{offer.offerPrice}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-700">{formatTimeLeft(offer.expiresAt)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="text-slate-600"><Eye className="h-3 w-3 inline mr-1" />{offer.views} views</p>
                        <p className="text-slate-600"><MousePointer className="h-3 w-3 inline mr-1" />{offer.clicks} clicks</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(offer._id)}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                          offer.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {offer.isActive ? <CheckCircle className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                        {offer.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenModal(offer)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(offer._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-900">
                {editingOffer ? 'Edit Offer' : 'Create New Offer'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Product Selection with Quick Add */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Product *
                </label>
                <div className="flex gap-2">
                  <select
                    name="productId"
                    value={formData.productId}
                    onChange={handleInputChange}
                    required
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select a product</option>
                    {products.map((product) => (
                      <option key={product._id} value={product._id}>
                        {product.name} - ₹{product.price}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowProductModal(true)}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Quick Add
                  </button>
                </div>
              </div>

              {/* Rest of the form fields... (badge, discount, etc.) */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Badge *
                  </label>
                  <select
                    name="badge"
                    value={formData.badge}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    {BADGE_OPTIONS.map((badge) => (
                      <option key={badge.value} value={badge.value}>
                        {badge.value}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Discount % *
                  </label>
                  <input
                    type="text"
                    name="discount"
                    value={formData.discount}
                    onChange={handleInputChange}
                    placeholder="30%"
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Offer Price *
                  </label>
                  <input
                    type="number"
                    name="offerPrice"
                    value={formData.offerPrice}
                    onChange={handleInputChange}
                    placeholder="999"
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
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
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Expires At *
                </label>
                <input
                  type="datetime-local"
                  name="expiresAt"
                  value={formData.expiresAt}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <label className="text-sm font-medium text-slate-700">
                  Active
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  {editingOffer ? 'Update Offer' : 'Create Offer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Add Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="bg-emerald-600 text-white px-6 py-4 rounded-t-2xl flex justify-between items-center">
              <h3 className="text-xl font-bold">Quick Add Product</h3>
              <button
                onClick={() => setShowProductModal(false)}
                className="p-1 hover:bg-emerald-700 rounded-lg"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={quickProduct.name}
                  onChange={(e) => setQuickProduct({ ...quickProduct, name: e.target.value })}
                  placeholder="e.g., Vitamin C Serum"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Price *
                </label>
                <input
                  type="number"
                  value={quickProduct.price}
                  onChange={(e) => setQuickProduct({ ...quickProduct, price: e.target.value })}
                  placeholder="999"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Category
                </label>
                <select
                  value={quickProduct.category}
                  onChange={(e) => setQuickProduct({ ...quickProduct, category: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  value={quickProduct.description}
                  onChange={(e) => setQuickProduct({ ...quickProduct, description: e.target.value })}
                  placeholder="Brief product description"
                  rows="3"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Image URL (optional)
                </label>
                <input
                  type="text"
                  value={quickProduct.images[0]}
                  onChange={(e) => setQuickProduct({ ...quickProduct, images: [e.target.value] })}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowProductModal(false)}
                  className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleQuickAddProduct}
                  className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add & Select
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSpecialOffers;