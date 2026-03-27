import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye } from "lucide-react";
import DataTable from "../../../components/admin/DataTable";
import toast from "react-hot-toast";
import api from "../../../utils/api.js";

const OrderList = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const orderStats = {
    total: orders.length,
    pending: orders.filter((o) => o.orderStatus === "Pending").length,
    shipped: orders.filter((o) => o.orderStatus === "Shipped").length,
    delivered: orders.filter((o) => o.orderStatus === "Delivered").length,
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);

      let token = localStorage.getItem("authToken");
      const { data } = await api.get("/api/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("fetched Orders", data);

      const formattedOrders = data.orders.map((order) => ({
        id: order._id,
        orderNumber: order.orderNumber,
        customer: order.user?.name ?? "N/A",
        email: order.user?.email || "",
        products: order.items
          .map((i) => i.product?.name)
          .filter(Boolean)
          .join(", "),
        totalAmount:
          order.items.reduce(
            (acc, item) => acc + (item.price || 0) * (item.quantity || 0),
            0,
          ) +
          (order.shipping || 0) +
          (order.tax || 0) -
          (order.discount || 0),
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        date: new Date(order.createdAt).toLocaleDateString(),
      }));

      setOrders(formattedOrders);
    } catch (error) {
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      let token = localStorage.getItem("authToken");
      await api.put(
        `/api/orders/${orderId}`,
        {
          orderStatus: newStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      toast.success("Order updated successfully");
      fetchOrders();
    } catch (error) {
      toast.error("Failed to update order");
    }
  };

  const columns = [
    { header: "Order ID", accessor: "orderNumber" },
    {
      header: "Customer",
      accessor: "customer",
      render: (value, row) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-slate-500">{row.email}</div>
        </div>
      ),
    },
    { header: "Products", accessor: "products" },
    {
      header: "Amount",
      accessor: "totalAmount",
      render: (value) => (
        <span className="text-emerald-600 font-semibold">
          ₹{(value || 0).toLocaleString()}
        </span>
      ),
    },
    { header: "Payment", accessor: "paymentStatus" },
    { header: "Status", accessor: "orderStatus" },
    { header: "Date", accessor: "date" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Orders Management</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Orders */}
        <div className="bg-white border rounded-xl p-5 flex justify-between items-center shadow-sm">
          <div>
            <p className="text-sm text-slate-500">Total Orders</p>
            <h2 className="text-2xl font-bold">{orderStats.total}</h2>
          </div>
          <div className="bg-slate-100 p-3 rounded-lg">📦</div>
        </div>

        {/* Pending */}
        <div className="bg-white border rounded-xl p-5 flex justify-between items-center shadow-sm">
          <div>
            <p className="text-sm text-slate-500">Pending</p>
            <h2 className="text-2xl font-bold text-yellow-600">
              {orderStats.pending}
            </h2>
          </div>
          <div className="bg-yellow-100 p-3 rounded-lg">⏳</div>
        </div>

        {/* Shipped */}
        <div className="bg-white border rounded-xl p-5 flex justify-between items-center shadow-sm">
          <div>
            <p className="text-sm text-slate-500">Shipped</p>
            <h2 className="text-2xl font-bold text-indigo-600">
              {orderStats.shipped}
            </h2>
          </div>
          <div className="bg-indigo-100 p-3 rounded-lg">🚚</div>
        </div>

        {/* Delivered */}
        <div className="bg-white border rounded-xl p-5 flex justify-between items-center shadow-sm">
          <div>
            <p className="text-sm text-slate-500">Delivered</p>
            <h2 className="text-2xl font-bold text-emerald-600">
              {orderStats.delivered}
            </h2>
          </div>
          <div className="bg-emerald-100 p-3 rounded-lg">✅</div>
        </div>
      </div>

      {loading ? (
        <p>Loading orders...</p>
      ) : (
        <DataTable
          columns={columns}
          data={orders}
          onRowClick={(row) => navigate(`/admin/orders/${row.id}`)}
          searchPlaceholder="Search orders..."
          actions={(row) => (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/admin/orders/${row.id}`);
                }}
                className="p-2"
              >
                <Eye className="w-4 h-4" />
              </button>

              {row.orderStatus !== "Delivered" &&
                row.orderStatus !== "Cancelled" && (
                  <select
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => updateOrderStatus(row.id, e.target.value)}
                    value={row.orderStatus}
                    className=" text-xs font-medium px-3 py-1.5 rounded-md border border-slate-300 bg-white shadow-sm outline-none cursor-pointer transition-all duration-200 hover:border-emerald-400  focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Out for Delivery">Out for Delivery</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                )}
            </>
          )}
        />
      )}
    </div>
  );
};

export default OrderList;
