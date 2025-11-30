import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext, API } from "../App";
import { Button } from "../components/button";
import { ShoppingCart, User, LogOut, Package, LayoutDashboard } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const MyOrders = () => {
  const navigate = useNavigate();
  const { user, cart, logout, token } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API}/orders/my`, {
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
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate("/")}>
              <div className="text-5xl">🌯</div>
              <div>
                <h1 className="text-3xl font-bold text-orange-500" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                  SHAWARMORE
                </h1>
                <p className="text-xs text-orange-300 tracking-widest">PREMIUM FLAVOUR EVERY WRAP</p>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <Button
                variant="ghost"
                className="text-green-100 hover:text-orange-400 hover:bg-green-900/30"
                onClick={() => navigate("/menu")}
                data-testid="nav-menu-btn"
              >
                Menu
              </Button>
              <Button
                variant="ghost"
                className="text-green-100 hover:text-orange-400 hover:bg-green-900/30"
                onClick={() => navigate("/my-orders")}
                data-testid="nav-my-orders-btn"
              >
                My Orders
              </Button>
              <Button
                variant="ghost"
                className="text-green-100 hover:text-orange-400 hover:bg-green-900/30 relative"
                onClick={() => navigate("/cart")}
                data-testid="nav-cart-btn"
              >
                <ShoppingCart className="w-5 h-5" />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
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
        <div className="max-w-6xl mx-auto">
          <h1 className="text-5xl font-bold text-white mb-12 flex items-center gap-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            <Package className="w-12 h-12 text-orange-500" />
            My Orders
          </h1>

          {loading ? (
            <div className="text-center text-green-200 text-xl">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="bg-green-900/20 backdrop-blur-md border border-green-700/30 rounded-2xl p-12 text-center">
              <Package className="w-24 h-24 text-green-600 mx-auto mb-6" />
              <h2 className="text-2xl text-white mb-4">No orders yet</h2>
              <p className="text-green-300 mb-8">Start ordering delicious food!</p>
              <Button
                onClick={() => navigate("/menu")}
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-6 rounded-full"
                data-testid="no-orders-browse-btn"
              >
                Browse Menu
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-green-900/20 backdrop-blur-md border border-green-700/30 rounded-2xl p-6"
                  data-testid={`order-card-${order.id}`}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-white font-semibold text-xl mb-2">
                        Order #{order.id.substring(0, 8)}
                      </h3>
                      <p className="text-green-300 text-sm">
                        {new Date(order.created_at).toLocaleDateString()} at{" "}
                        {new Date(order.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(order.order_status)}`} data-testid={`order-status-${order.id}`}>
                        {order.order_status.toUpperCase()}
                      </span>
                      <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getPaymentStatusColor(order.payment_status)}`} data-testid={`payment-status-${order.id}`}>
                        {order.payment_status === "cash_on_delivery" ? "COD" : order.payment_status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-green-200" data-testid={`order-item-${item.id}`}>
                        <span>
                          {item.product_name} x {item.quantity}
                        </span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-green-700/30 pt-4">
                    <div className="flex justify-between items-center">
                      <div className="text-green-300">
                        <p className="text-sm mb-1">📞 {order.phone}</p>
                        <p className="text-sm">📍 {order.delivery_address}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-green-300 text-sm mb-1">Total Amount</p>
                        <p className="text-orange-400 font-bold text-2xl" data-testid={`order-total-${order.id}`}>
                          ${order.total_amount.toFixed(2)}
                        </p>
                      </div>
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

export default MyOrders;