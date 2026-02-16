import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, User, Mail, Phone, MapPin, Package, 
  Truck, CheckCircle, Clock, CreditCard, Download 
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_URL = "http://localhost:5005/api/orders";

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ==============================
     FETCH SINGLE ORDER
  ============================== */
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/${id}`);
        setOrder(data.order);
      } catch (error) {
        toast.error("Failed to fetch order");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  /* ==============================
     UPDATE STATUS
  ============================== */
  const updateStatus = async (newStatus) => {
    try {
      await axios.put(`${API_URL}/${id}`, {
        orderStatus: newStatus,
      });

      toast.success(`Order status updated to ${newStatus}`);

      setOrder((prev) => ({
        ...prev,
        orderStatus: newStatus,
      }));
    } catch (error) {
      toast.error("Failed to update order");
    }
  };

  const downloadInvoice = () => {
    toast.success('Downloading invoice...');
  };

  if (loading) return <p>Loading...</p>;
  if (!order) return <p>Order not found</p>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/orders')}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Order #{order.orderNumber}
            </h1>
            <p className="text-slate-600 mt-1">
              Placed on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={downloadInvoice}
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Download className="w-5 h-5" />
            <span className="font-medium">Invoice</span>
          </button>

          <select
            value={order.orderStatus}
            onChange={(e) => updateStatus(e.target.value)}
            className="px-4 py-2 border-2 border-emerald-500 rounded-lg font-medium text-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Out for Delivery">Out for Delivery</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Order Items</h2>

            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item._id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                  <div className="w-16 h-16 rounded-lg bg-slate-200 flex items-center justify-center">
                    <Package className="w-8 h-8 text-slate-400" />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">
                      {item.name || item.product?.name}
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">
                      Quantity: {item.quantity}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold text-slate-900">
                      ₹{(item.price * item.quantity)?.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-slate-200 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Subtotal</span>
                <span className="font-medium text-slate-900">
                  ₹{order.subtotal?.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Shipping</span>
                <span className="font-medium text-emerald-600">
                  {order.shipping === 0 ? 'Free' : `₹${order.shipping}`}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200">
                <span className="font-semibold text-slate-900">Total</span>
                <span className="font-bold text-emerald-600 text-lg">
                  ₹{order.total?.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Order Timeline</h2>

            <div className="space-y-4">
              {order.timeline.map((event, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-emerald-500">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    {index < order.timeline.length - 1 && (
                      <div className="w-0.5 h-12 bg-emerald-500"></div>
                    )}
                  </div>
                  <div className="flex-1 pb-8">
                    <p className="font-medium text-slate-900">
                      {event.status}
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                      {new Date(event.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">

  {/* Customer Info */}
  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
    <h2 className="text-lg font-semibold text-slate-900 mb-4">
      Customer Details
    </h2>

    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <User className="w-5 h-5 text-slate-400" />
        <p className="text-sm font-medium text-slate-900">
          {order.user?.name || "N/A"}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Mail className="w-5 h-5 text-slate-400" />
        <p className="text-sm font-medium text-slate-900">
          {order.user?.email || "N/A"}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Phone className="w-5 h-5 text-slate-400" />
        <p className="text-sm font-medium text-slate-900">
          {order.user?.phone || "N/A"}
        </p>
      </div>
    </div>
  </div>

  {/* Payment Info */}
  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
    <h2 className="text-lg font-semibold text-slate-900 mb-4">
      Payment Information
    </h2>

    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-600">Payment Status</span>
        <span className="font-medium text-slate-900">
          {order.paymentStatus}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <CreditCard className="w-5 h-5 text-slate-400" />
        <div>
          <p className="text-xs text-slate-500">Payment Method</p>
          <p className="text-sm font-medium text-slate-900">
            {order.paymentMethod}
          </p>
        </div>
      </div>
    </div>
  </div>

  {/* Order Meta */}
  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
    <h2 className="text-lg font-semibold text-slate-900 mb-4">
      Order Info
    </h2>

    <div className="space-y-2 text-sm">
      <div className="flex justify-between">
        <span>Status</span>
        <span>{order.orderStatus}</span>
      </div>

      <div className="flex justify-between">
        <span>Created</span>
        <span>{new Date(order.createdAt).toLocaleString()}</span>
      </div>

      <div className="flex justify-between">
        <span>Updated</span>
        <span>{new Date(order.updatedAt).toLocaleString()}</span>
      </div>
    </div>
  </div>
</div>

      </div>
    </div>
  );
};

export default OrderDetail;
