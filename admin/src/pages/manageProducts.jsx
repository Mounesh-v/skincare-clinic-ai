import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Search,
  Filter,
  Upload,
  X,
  Image as ImageIcon,
  Tag,
  Package,
  DollarSign,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { productApi } from '../api';

function mapProductFromApi(p) {
  const images = (p.images && Array.isArray(p.images))
    ? p.images.map((img) => (typeof img === 'string' ? img : img?.url)).filter(Boolean)
    : [];
  return {
    id: p._id,
    _id: p._id,
    name: p.name,
    description: p.description,
    category: p.category,
    price: p.price,
    originalPrice: p.originalPrice ?? p.price,
    stock: p.stock,
    images,
    skinType: p.skinTypes || [],
    ingredients: Array.isArray(p.ingredients) ? p.ingredients.join(', ') : (p.ingredients || ''),
    howToUse: p.howToUse,
    isActive: p.status === 'Active',
    status: p.status,
    views: p.views ?? 0,
    sales: p.sold ?? 0,
  };
}

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Serums',
    price: '',
    originalPrice: '',
    stock: '',
    images: [],
    skinType: [],
    ingredients: '',
    howToUse: '',
    isActive: true
  });

  const categories = ['Cleansers', 'Moisturizers', 'Serums', 'Sunscreen', 'Masks', 'Toners', 'Eye Care', 'Treatments', 'Kits'];
  const skinTypes = ['Oily', 'Dry', 'Combination', 'Sensitive', 'Normal'];

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await productApi.getAll();
        if (!cancelled && res.products) {
          setProducts(res.products.map(mapProductFromApi));
        }
      } catch (err) {
        if (!cancelled) toast.error(err.message || 'Failed to load products');
      } finally {
        if (!cancelled) setProductsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description || '',
        category: product.category || 'Serums',
        price: product.price,
        originalPrice: product.originalPrice,
        stock: product.stock,
        images: product.images || [],
        skinType: product.skinType || [],
        ingredients: product.ingredients || '',
        howToUse: product.howToUse || '',
        isActive: product.isActive ?? true
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        category: 'Serums',
        price: '',
        originalPrice: '',
        stock: '',
        images: [],
        skinType: [],
        ingredients: '',
        howToUse: '',
        isActive: true
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSkinTypeChange = (type) => {
    setFormData(prev => ({
      ...prev,
      skinType: prev.skinType.includes(type)
        ? prev.skinType.filter(t => t !== type)
        : [...prev.skinType, type]
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    // In real app, upload to server and get URLs
    const imageUrls = files.map(file => URL.createObjectURL(file));
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...imageUrls]
    }));
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      description: formData.description,
      category: formData.category,
      price: Number(formData.price),
      originalPrice: formData.originalPrice ? Number(formData.originalPrice) : Number(formData.price),
      stock: Number(formData.stock) || 0,
      ingredients: formData.ingredients ? formData.ingredients.split(',').map((s) => s.trim()).filter(Boolean) : [],
      skinTypes: formData.skinType.length ? formData.skinType : ['All'],
      howToUse: formData.howToUse,
      status: formData.isActive ? 'Active' : 'Inactive',
      images: (formData.images || []).map((url) => (typeof url === 'string' ? { url } : url)),
    };
    try {
      if (editingProduct) {
        await productApi.update(editingProduct.id, payload);
        setProducts(products.map((p) => (p.id === editingProduct.id ? { ...p, ...formData, isActive: formData.isActive, status: payload.status } : p)));
        toast.success('Product updated successfully!');
      } else {
        const res = await productApi.create(payload);
        if (res.product) setProducts([...products, mapProductFromApi(res.product)]);
        toast.success('Product added successfully!');
      }
      handleCloseModal();
    } catch (err) {
      toast.error(err.message || 'Failed to save product');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await productApi.delete(id);
      setProducts(products.filter((p) => p.id !== id));
      toast.success('Product deleted successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to delete product');
    }
  };

  const toggleStatus = async (id) => {
    const p = products.find((x) => x.id === id);
    if (!p) return;
    const newActive = !p.isActive;
    try {
      await productApi.update(id, { status: newActive ? 'Active' : 'Inactive' });
      setProducts(products.map((prod) => (prod.id === id ? { ...prod, isActive: newActive } : prod)));
      toast.success('Product status updated!');
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Manage Products</h1>
            <p className="text-slate-600">Add, edit, and manage your product listings</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
          >
            <Plus className="h-5 w-5" />
            Add New Product
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-slate-200 rounded-lg focus:border-emerald-500 outline-none"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="pl-10 pr-8 py-2 border-2 border-slate-200 rounded-lg focus:border-emerald-500 outline-none appearance-none bg-white"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

          </div>
        </div>

        {/* Products Grid */}
        {productsLoading ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <p className="text-slate-600">Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <Package className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">No Products Found</h3>
            <p className="text-slate-600 mb-6">Start by adding your first product</p>
            <button
              onClick={() => handleOpenModal()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700"
            >
              <Plus className="h-5 w-5" />
              Add Product
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => (
              <div key={product.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                
                {/* Product Image */}
                <div className="relative aspect-square bg-slate-100">
                  <img
                    src={(product.images && product.images[0]) || 'https://via.placeholder.com/400'}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <button
                      onClick={() => toggleStatus(product.id)}
                      className={`p-2 rounded-full ${
                        product.isActive 
                          ? 'bg-emerald-500 text-white' 
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {product.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                  </div>
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 bg-violet-500 text-white text-xs font-bold rounded-full">
                      {product.category}
                    </span>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-5">
                  <h3 className="font-bold text-slate-900 text-lg mb-2 line-clamp-2">
                    {product.name}
                  </h3>

                  {/* Price */}
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-2xl font-black text-emerald-600">
                      ₹{product.price}
                    </span>
                    <span className="text-sm text-slate-400 line-through">
                      ₹{product.originalPrice}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-slate-600 mb-4">
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>{product.views}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Package className="h-4 w-4" />
                      <span>{product.stock} in stock</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" />
                      <span>{product.sales} sold</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-4 border-t border-slate-200">
                    <button
                      onClick={() => handleOpenModal(product)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 font-semibold rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 font-semibold rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              
              {/* Product Images */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  <ImageIcon className="inline h-4 w-4 mr-1" />
                  Product Images
                </label>
                
                <div className="grid grid-cols-4 gap-4 mb-4">
                  {formData.images.map((img, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  
                  {/* Upload Button */}
                  <label className="aspect-square border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-emerald-500 transition-colors">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <div className="text-center">
                      <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-xs text-slate-500">Upload</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-emerald-500 outline-none"
                    placeholder="e.g., Vitamin C Brightening Serum"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    <Tag className="inline h-4 w-4 mr-1" />
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-emerald-500 outline-none"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    <Package className="inline h-4 w-4 mr-1" />
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-emerald-500 outline-none"
                    placeholder="100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    <DollarSign className="inline h-4 w-4 mr-1" />
                    Sale Price *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-emerald-500 outline-none"
                    placeholder="1499"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Original Price *
                  </label>
                  <input
                    type="number"
                    name="originalPrice"
                    value={formData.originalPrice}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-emerald-500 outline-none"
                    placeholder="2499"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Product Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-emerald-500 outline-none"
                  placeholder="Describe your product features and benefits..."
                />
              </div>

              {/* Skin Types */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Suitable for Skin Types
                </label>
                <div className="flex flex-wrap gap-3">
                  {skinTypes.map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleSkinTypeChange(type)}
                      className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                        formData.skinType.includes(type)
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ingredients */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Key Ingredients
                </label>
                <textarea
                  name="ingredients"
                  value={formData.ingredients}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-emerald-500 outline-none"
                  placeholder="List main ingredients (comma separated)"
                />
              </div>

              {/* How to Use */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  How to Use
                </label>
                <textarea
                  name="howToUse"
                  value={formData.howToUse}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-emerald-500 outline-none"
                  placeholder="Application instructions..."
                />
              </div>

              {/* Active Status */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  id="isActive"
                  className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <label htmlFor="isActive" className="text-sm font-semibold text-slate-700">
                  Make product visible in store
                </label>
              </div>

              {/* Form Actions */}
              <div className="flex items-center gap-4 pt-6 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
                >
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
};

export default ManageProducts;