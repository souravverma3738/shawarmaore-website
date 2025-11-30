import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext, API } from "../App";
import { Button } from "../components/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/select";
import { LayoutDashboard, LogOut, TrendingUp, Package, DollarSign, CreditCard, Users, ShoppingBag } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const AdminSales = () => {
  const navigate = useNavigate();
  const { logout, token } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState("today");
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    stripeOrders: 0,
    cashOrders: 0,
    pendingOrders: 0,
    confirmedOrders: 0,
    deliveredOrders: 0
  });
  const [topProducts, setTopProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    fetchData();
  }, [timeFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ordersRes, productsRes] = await Promise.all([
        axios.get(`${API}/orders/all`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/products/all`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const allOrders = ordersRes.data;
      const allProducts = productsRes.data;
      setOrders(allOrders);
      setProducts(allProducts);

      // Filter orders based on time
      const filteredOrders = filterOrdersByTime(allOrders, timeFilter);
      calculateAnalytics(filteredOrders, allProducts);
      setRecentOrders(allOrders.slice(0, 5));
    } catch (error) {
      console.error("Failed to fetch data", error);
      toast.error("Failed to load sales data");
    } finally {
      setLoading(false);
    }
  };

  const filterOrdersByTime = (orders, filter) => {
    const now = new Date();
    return orders.filter(order => {
      const orderDate = new Date(order.created_at);
      switch (filter) {
        case "today":
          return orderDate.toDateString() === now.toDateString();
        case "week":
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return orderDate >= weekAgo;
        case "month":
          return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
        case "all":
        default:
          return true;
      }
    });
  };

  const calculateAnalytics = (filteredOrders, allProducts) => {
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0);
    const totalOrders = filteredOrders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const stripeOrders = filteredOrders.filter(o => o.payment_method === "stripe").length;
    const cashOrders = filteredOrders.filter(o => o.payment_method === "cash").length;

    const pendingOrders = filteredOrders.filter(o => o.order_status === "pending").length;
    const confirmedOrders = filteredOrders.filter(o => o.order_status === "confirmed" || o.order_status === "preparing").length;
    const deliveredOrders = filteredOrders.filter(o => o.order_status === "delivered").length;

    // Calculate top products
    const productSales = {};
    filteredOrders.forEach(order => {
      order.items.forEach(item => {
        if (!productSales[item.product_id]) {
          productSales[item.product_id] = {
            name: item.product_name,
            quantity: 0,
            revenue: 0
          };
        }
        productSales[item.product_id].quantity += item.quantity;
        productSales[item.product_id].revenue += item.price * item.quantity;
      });
    });

    const topProductsData = Object.entries(productSales)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    setAnalytics({
      totalRevenue,
      totalOrders,
      avgOrderValue,
      stripeOrders,
      cashOrders,
      pendingOrders,
      confirmedOrders,
      deliveredOrders
    });
    setTopProducts(topProductsData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a2e1a] to-[#0f1a0f]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#1a2e1a]/95 backdrop-blur-lg border-b border-green-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate("/admin")}>
              <div className="text-5xl">🌯</div>
              <div>
                <h1 className="text-3xl font-bold text-orange-500" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                  SHAWARMORE
                </h1>
                <p className="text-xs text-orange-300 tracking-widest">SALES ANALYTICS</p>
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

      {/* Sales Dashboard Content */}
      <div className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h1 className="text-5xl font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                Sales Dashboard
              </h1>
              <p className="text-green-200">Track your business performance</p>
            </div>
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="bg-green-900/20 border-green-700 text-white w-48" data-testid="time-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a2e1a] border-green-700">
                <SelectItem value="today" className="text-white">Today</SelectItem>
                <SelectItem value="week" className="text-white">This Week</SelectItem>
                <SelectItem value="month" className="text-white">This Month</SelectItem>
                <SelectItem value="all" className="text-white">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="text-center text-green-200 text-xl">Loading analytics...</div>
          ) : (
            <div className="space-y-8">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/20 backdrop-blur-md border border-green-700/30 rounded-2xl p-6" data-testid="metric-revenue">
                  <div className="flex items-center justify-between mb-4">
                    <DollarSign className="w-12 h-12 text-green-400" />
                    <TrendingUp className="w-6 h-6 text-green-400" />
                  </div>
                  <h3 className="text-green-200 text-sm mb-2">Total Revenue</h3>
                  <p className="text-white text-3xl font-bold">${analytics.totalRevenue.toFixed(2)}</p>
                </div>

                <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/20 backdrop-blur-md border border-blue-700/30 rounded-2xl p-6" data-testid="metric-orders">
                  <div className="flex items-center justify-between mb-4">
                    <ShoppingBag className="w-12 h-12 text-blue-400" />
                    <Package className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-blue-200 text-sm mb-2">Total Orders</h3>
                  <p className="text-white text-3xl font-bold">{analytics.totalOrders}</p>
                </div>

                <div className="bg-gradient-to-br from-orange-900/30 to-amber-900/20 backdrop-blur-md border border-orange-700/30 rounded-2xl p-6" data-testid="metric-avg">
                  <div className="flex items-center justify-between mb-4">
                    <TrendingUp className="w-12 h-12 text-orange-400" />
                    <DollarSign className="w-6 h-6 text-orange-400" />
                  </div>
                  <h3 className="text-orange-200 text-sm mb-2">Avg Order Value</h3>
                  <p className="text-white text-3xl font-bold">${analytics.avgOrderValue.toFixed(2)}</p>
                </div>

                <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/20 backdrop-blur-md border border-purple-700/30 rounded-2xl p-6" data-testid="metric-payment">
                  <div className="flex items-center justify-between mb-4">
                    <CreditCard className="w-12 h-12 text-purple-400" />
                    <Users className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-purple-200 text-sm mb-2">Payment Methods</h3>
                  <div className="flex gap-4">
                    <div>
                      <p className="text-white text-xl font-bold">{analytics.stripeOrders}</p>
                      <p className="text-purple-300 text-xs">Stripe</p>
                    </div>
                    <div>
                      <p className="text-white text-xl font-bold">{analytics.cashOrders}</p>
                      <p className="text-purple-300 text-xs">Cash</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Status Overview */}
              <div className="bg-green-900/20 backdrop-blur-md border border-green-700/30 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Order Status Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-yellow-400 text-4xl font-bold mb-2">{analytics.pendingOrders}</div>
                    <p className="text-green-200">Pending Orders</p>
                  </div>
                  <div className="text-center">
                    <div className="text-blue-400 text-4xl font-bold mb-2">{analytics.confirmedOrders}</div>
                    <p className="text-green-200">In Progress</p>
                  </div>
                  <div className="text-center">
                    <div className="text-green-400 text-4xl font-bold mb-2">{analytics.deliveredOrders}</div>
                    <p className="text-green-200">Delivered</p>
                  </div>
                </div>
              </div>

              {/* Top Products */}
              <div className="bg-green-900/20 backdrop-blur-md border border-green-700/30 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Top Selling Products</h2>
                {topProducts.length > 0 ? (
                  <div className="space-y-4">
                    {topProducts.map((product, index) => (
                      <div key={product.id} className="flex items-center justify-between p-4 bg-green-900/30 rounded-xl" data-testid={`top-product-${index}`}>
                        <div className="flex items-center gap-4">
                          <div className="text-orange-400 font-bold text-2xl w-8">#{index + 1}</div>
                          <div>
                            <h3 className="text-white font-semibold">{product.name}</h3>
                            <p className="text-green-300 text-sm">{product.quantity} units sold</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-orange-400 font-bold text-xl">${product.revenue.toFixed(2)}</p>
                          <p className="text-green-300 text-sm">Revenue</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-green-300 text-center py-8">No sales data available yet</p>
                )}
              </div>

              {/* Recent Orders */}
              <div className="bg-green-900/20 backdrop-blur-md border border-green-700/30 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Recent Orders</h2>
                {recentOrders.length > 0 ? (
                  <div className="space-y-4">
                    {recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 bg-green-900/30 rounded-xl border border-green-700/20" data-testid={`recent-order-${order.id}`}>
                        <div>
                          <h3 className="text-white font-semibold">Order #{order.id.substring(0, 8)}</h3>
                          <p className="text-green-300 text-sm">{new Date(order.created_at).toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-orange-400 font-bold text-lg">${order.total_amount.toFixed(2)}</p>
                          <p className="text-sm text-green-300 capitalize">{order.order_status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-green-300 text-center py-8">No orders yet</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSales;