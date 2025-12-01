import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext, API } from "../App";
import { Button } from "../components/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/select";
import { LayoutDashboard, LogOut, Package } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import Logo from "../assets/shawarmore-logo.jpeg";
const AdminOrders = () => {
  const navigate = useNavigate();
  const { logout, token } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API}/orders/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data);
    } catch (error) {
      console.error("Failed to fetch orders", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.put(
        `${API}/orders/${orderId}/status?order_status=${newStatus}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Order status updated!");
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to update status");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "text-yellow-400 bg-yellow-400/20";
      case "confirmed":
        return "text-blue-400 bg-blue-400/20";
      case "preparing":
        return "text-orange-400 bg-orange-400/20";
      case "delivered":
        return "text-green-400 bg-green-400/20";
      case "cancelled":
        return "text-red-400 bg-red-400/20";
      default:
        return "text-gray-400 bg-gray-400/20";
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "text-green-400 bg-green-400/20";
      case "pending":
        return "text-yellow-400 bg-yellow-400/20";
      case "cash_on_delivery":
        return "text-blue-400 bg-blue-400/20";
      default:
        return "text-gray-400 bg-gray-400/20";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a2e1a] to-[#0f1a0f]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#1a2e1a]/95 backdrop-blur-lg border-b border-green-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate("/admin")}>
             <img src={Logo} alt="Shawarmore Logo" className="w-12 h-12 object-contain"/>
              <div>
                <h1 className="text-3xl font-bold text-orange-500" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                  Dubai Shawarmore
                </h1>
                <p className="text-xs text-orange-300 tracking-widest">ALL ORDERS</p>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <Button
                variant="ghost"
                className="text-green-100 hover:text-orange-400 hover:bg-green-900/30"
                onClick={() => navigate("/admin")}
                data-testid="nav-dashboard-btn"
              >
                <LayoutDashboard className="w-5 h-5 mr-2" />
                Dashboard
              </Button>
              <Button
                variant="ghost"
                className="text-green-100 hover:text-orange-400 hover:bg-green-900/30"
                onClick={logout}
                data-testid="nav-logout-btn"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Orders Content */}
      <div className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-5xl font-bold text-white mb-12 flex items-center gap-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            <Package className="w-12 h-12 text-orange-500" />
            All Orders
          </h1>

          {loading ? (
            <div className="text-center text-green-200 text-xl">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="bg-green-900/20 backdrop-blur-md border border-green-700/30 rounded-2xl p-12 text-center">
              <Package className="w-24 h-24 text-green-600 mx-auto mb-6" />
              <h2 className="text-2xl text-white mb-4">No orders yet</h2>
              <p className="text-green-300">Orders will appear here when customers start ordering</p>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-green-900/20 backdrop-blur-md border border-green-700/30 rounded-2xl p-6"
                  data-testid={`order-card-£{order.id}`}
                >
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h3 className="text-white font-semibold text-xl mb-2">
                        Order #{order.id.substring(0, 8)}
                      </h3>
                      <p className="text-green-300 text-sm mb-3">
                        {new Date(order.created_at).toLocaleDateString()} at{" "}
                        {new Date(order.created_at).toLocaleTimeString()}
                      </p>
                      <div className="text-green-300 space-y-1">
                        <p className="text-sm">👤 User ID: {order.user_id.substring(0, 8)}</p>
                        <p className="text-sm">📞 {order.phone}</p>
                        <p className="text-sm">📍 {order.delivery_address}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-green-100 text-sm mb-2 block">Order Status</Label>
                        <Select
                          value={order.order_status}
                          onValueChange={(value) => handleStatusChange(order.id, value)}
                        >
                          <SelectTrigger className="bg-green-900/20 border-green-700 text-white" data-testid={`order-status-select-${order.id}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-[#1a2e1a] border-green-700">
                            <SelectItem value="pending" className="text-white">Pending</SelectItem>
                            <SelectItem value="confirmed" className="text-white">Confirmed</SelectItem>
                            <SelectItem value="preparing" className="text-white">Preparing</SelectItem>
                            <SelectItem value="delivered" className="text-white">Delivered</SelectItem>
                            <SelectItem value="cancelled" className="text-white">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <span className={`px-4 py-2 rounded-full text-sm font-semibold inline-block ${getPaymentStatusColor(order.payment_status)}`} data-testid={`payment-status-${order.id}`}>
                          Payment: {order.payment_status === "cash_on_delivery" ? "COD" : order.payment_status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-green-700/30 pt-4">
                    <h4 className="text-green-100 font-semibold mb-3">Order Items:</h4>
                    <div className="space-y-2 mb-4">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-green-200" data-testid={`order-item-£{item.id}`}>
                          <span>
                            {item.product_name} x {item.quantity}
                          </span>
                          <span>£{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center border-t border-green-700/30 pt-4">
                      <span className="text-green-100 text-lg font-semibold">Total Amount:</span>
                      <span className="text-orange-400 font-bold text-2xl" data-testid={`order-total-£{order.id}`}>
                        £{order.total_amount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Label = ({ children, className = "" }) => {
  return <label className={className}>{children}</label>;
};

export default AdminOrders;