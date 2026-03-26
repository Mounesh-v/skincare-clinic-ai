import React, { useState, useEffect } from "react";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  Eye,
  Search,
  Filter,
  X,
  MapPin,
  Phone,
  Mail,
  Calendar,
} from "lucide-react";
import toast from "react-hot-toast";
import { orderApi } from "../api";
import { Download } from "lucide-react";

const orderSteps = [
  "Pending",
  "Processing",
  "Shipped",
  "Out for Delivery",
  "Delivered",
];
function mapOrderFromApi(o) {
  return {
    id: o.orderNumber || o._id,
    _id: o._id,
    customerName: o.user?.name || "Customer",
    customerEmail: o.user?.email || "",
    customerPhone: o.user?.phone || "",

    product: o.items
      ?.map((i) => i.product?.name)
      .filter(Boolean)
      .join(", "),

    quantity: o.items.reduce((acc, i) => acc + (i.quantity || 0), 0),

    amount:
      o.items.reduce(
        (acc, item) => acc + (item.price || 0) * (item.quantity || 0),
        0,
      ) +
      (o.shipping || 0) +
      (o.tax || 0) -
      (o.discount || 0),

    status: o.orderStatus || "Pending",
    orderDate: o.createdAt
      ? new Date(o.createdAt).toISOString().slice(0, 10)
      : "",

    shippingAddress: o.shippingAddress || "—",
    paymentMethod: o.paymentMethod || "—",
    paymentStatus: o.paymentStatus || "Pending",

    items: o.items || [],
  };
}

const OrdersManagement = () => {
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await orderApi.getAll();

        console.log("Vendor Order List", res);

        if (!cancelled && res.orders) {
          setOrders(
            res.orders.map((o) => ({
              ...mapOrderFromApi(o),
              original: o, //  keep full data
            })),
          );
        }
      } catch (err) {
        if (!cancelled) toast.error(err.message || "Failed to load orders");
      } finally {
        if (!cancelled) setOrdersLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const statusConfig = {
    Pending: { color: "bg-slate-100 text-slate-700", icon: Clock },
    Processing: { color: "bg-yellow-100 text-yellow-700", icon: Clock },
    Shipped: { color: "bg-blue-100 text-blue-700", icon: Truck },
    Delivered: { color: "bg-emerald-100 text-emerald-700", icon: CheckCircle },
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    const order = orders.find((o) => o.id === orderId || o._id === orderId);
    if (!order) return;
    try {
      await orderApi.updateStatus(order._id, newStatus);
      setOrders(
        orders.map((o) =>
          o.id === orderId || o._id === orderId
            ? { ...o, status: newStatus }
            : o,
        ),
      );
      toast.success(`Order status updated to ${newStatus}`);
      setShowDetails(false);
      if (
        selectedOrder &&
        (selectedOrder.id === orderId || selectedOrder._id === orderId)
      ) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (err) {
      toast.error(err.message || "Failed to update order status");
    }
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order); // now full order
    setShowDetails(true);
  };

  const filteredOrders = orders.filter((order) => {
    const id = String(order.id || "");
    const customer = String(order.customerName || "");
    const product = String(order.product || "");
    const matchesSearch =
      id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: orders.length,
    processing: orders.filter((o) => o.status === "Processing").length,
    shipped: orders.filter((o) => o.status === "Shipped").length,
    delivered: orders.filter((o) => o.status === "Delivered").length,
  };

  if (ordersLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-600">Loading orders...</p>
      </div>
    );
  }

  const handleExport = () => {
    if (!orders.length) {
      toast.error("No orders to export");
      return;
    }

    const headers = [
      "Order ID",
      "Customer",
      "Email",
      "Product",
      "Quantity",
      "Amount",
      "Status",
      "Date",
    ];

    const rows = orders.map((o) => [
      o.id,
      o.customerName,
      o.customerEmail,
      o.product,
      o.quantity,
      o.amount,
      o.status,
      o.orderDate,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows]
        .map((e) => e.map((v) => `"${v}"`).join(","))
        .join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "orders.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Orders Management
            </h1>
            <p className="text-slate-600">
              View and manage your customer orders
            </p>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 border-2 border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Download className="h-5 w-5" />
            Export Orders
          </button>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-slate-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm mb-1">Total Orders</p>
                <p className="text-3xl font-bold text-slate-900">
                  {stats.total}
                </p>
              </div>
              <Package className="h-10 w-10 text-slate-400" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-yellow-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm mb-1">Processing</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {stats.processing}
                </p>
              </div>
              <Clock className="h-10 w-10 text-yellow-400" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-blue-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm mb-1">Shipped</p>
                <p className="text-3xl font-bold text-blue-600">
                  {stats.shipped}
                </p>
              </div>
              <Truck className="h-10 w-10 text-blue-400" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-emerald-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm mb-1">Delivered</p>
                <p className="text-3xl font-bold text-emerald-600">
                  {stats.delivered}
                </p>
              </div>
              <CheckCircle className="h-10 w-10 text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by order ID, customer, or product..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-slate-200 rounded-lg focus:border-emerald-500 outline-none"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-10 pr-8 py-2 border-2 border-slate-200 rounded-lg focus:border-emerald-500 outline-none appearance-none bg-white min-w-[200px]"
              >
                <option value="all">All Status</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">
                    Order ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">
                    Product
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">
                    Qty
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center">
                      <Package className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500 text-lg font-medium">
                        No orders found
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const StatusIcon = statusConfig[order.status].icon;
                    return (
                      <tr
                        key={order.id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm font-bold text-slate-900">
                          {order.id}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-700">
                          {order.orderDate}
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {order.customerName}
                            </p>
                            <p className="text-xs text-slate-500">
                              {order.customerEmail}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-700">
                          {order.product}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-900 font-semibold">
                          {order.quantity}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-900">
                          ₹{order.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${statusConfig[order.status].color}`}
                          >
                            <StatusIcon className="h-3 w-3" />
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => viewOrderDetails(order.original)}
                            className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-semibold text-sm"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {showDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Order Details
                </h2>
                <p className="text-slate-600">{selectedOrder.id}</p>
              </div>
              <button
                onClick={() => setShowDetails(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Order Status */}
              {/* <div className="bg-slate-50 rounded-xl p-6">
                <h3 className="font-bold text-slate-900 mb-4">
                  Update Order Status
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {["Processing", "Shipped", "Delivered"].map((status) => (
                    <button
                      key={status}
                      onClick={() =>
                        updateOrderStatus(selectedOrder.id, status)
                      }
                      className={`p-4 rounded-lg font-semibold transition-all ${
                        selectedOrder.status === status
                          ? statusConfig[status].color +
                            " border-2 border-slate-300"
                          : "bg-white border-2 border-slate-200 text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      {React.createElement(statusConfig[status].icon, {
                        className: "h-6 w-6 mx-auto mb-2",
                      })}
                      {status}
                    </button>
                  ))}
                </div>
              </div> */}

              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="font-bold text-slate-900 mb-6">
                  Order Progress
                </h3>

                <div className="flex items-center justify-between relative">
                  {orderSteps.map((step, index) => {
                    const currentIndex = orderSteps.indexOf(
                      selectedOrder.orderStatus || selectedOrder.status,
                    );

                    const isCompleted = index <= currentIndex;

                    return (
                      <div
                        key={step}
                        className="flex-1 flex flex-col items-center relative"
                      >
                        {/* Line */}
                        {index !== 0 && (
                          <div
                            className={`absolute top-4 left-[-50%] w-full h-1 ${
                              index <= currentIndex
                                ? "bg-emerald-500"
                                : "bg-slate-300"
                            }`}
                          />
                        )}

                        {/* Circle */}
                        <div
                          className={`z-10 w-8 h-8 flex items-center justify-center rounded-full text-white text-xs font-bold ${
                            isCompleted ? "bg-emerald-500" : "bg-slate-300"
                          }`}
                        >
                          {index + 1}
                        </div>

                        {/* Label */}
                        <p
                          className={`mt-2 text-xs text-center ${
                            isCompleted
                              ? "text-emerald-600 font-semibold"
                              : "text-slate-500"
                          }`}
                        >
                          {step}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Customer Info */}
              <div className="border border-slate-200 rounded-xl p-6">
                <h3 className="font-bold text-slate-900 mb-4">
                  Customer Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Mail className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Name</p>
                      <p className="font-semibold text-slate-900">
                        {selectedOrder.user?.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <Mail className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Email</p>
                      <p className="font-semibold text-slate-900">
                        {selectedOrder.customerEmail}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-violet-100 rounded-lg">
                      <Phone className="h-5 w-5 text-violet-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Phone</p>
                      <p className="font-semibold text-slate-900">
                        {selectedOrder.customerPhone}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <MapPin className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Shipping Address</p>
                      <p className="font-semibold text-slate-900">
                        {selectedOrder.shippingAddress}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Details */}
              {/* Products List */}
              <div className="border border-slate-200 rounded-xl p-6">
                <h3 className="font-bold text-slate-900 mb-4">Products</h3>

                <div className="space-y-4">
                  {selectedOrder.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-slate-50 p-4 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        {/* Image */}
                        <img
                          src={item.product?.images?.[0]?.url}
                          alt=""
                          className="w-14 h-14 rounded-lg object-cover"
                        />

                        {/* Info */}
                        <div>
                          <p className="font-semibold text-slate-900">
                            {item.product?.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {item.product?.category}
                          </p>
                          <p className="text-xs text-slate-400">
                            Qty: {item.quantity}
                          </p>
                        </div>
                      </div>

                      {/* Price */}
                      <p className="font-bold text-slate-900">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersManagement;
