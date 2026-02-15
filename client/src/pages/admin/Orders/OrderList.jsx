import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye } from "lucide-react";
import DataTable from "../../../components/admin/DataTable";
import toast from "react-hot-toast";
import axios from "axios";

const OrderList = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_URL = "http://localhost:5005/api/orders";

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(API_URL);

      const formattedOrders = data.orders.map((order) => ({
        id: order._id,
        orderNumber: order.orderNumber,
        customer: order.user?.name ?? "N/A",
        email: order.user?.email || "",
        products: order.items
          .map((i) => i.name || i.product?.name)
          .join(", "),
        totalAmount: order.total,
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
      await axios.put(`${API_URL}/${orderId}`, {
        orderStatus: newStatus,
      });

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
          ₹{value?.toLocaleString()}
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
                    onChange={(e) =>
                      updateOrderStatus(row.id, e.target.value)
                    }
                    value={row.orderStatus}
                    className="text-xs border px-2 py-1"
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
