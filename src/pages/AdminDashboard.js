import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../App";
import { Button } from "../components/button";
import { LayoutDashboard, Package, ShoppingBag, LogOut, TrendingUp } from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

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
                <p className="text-xs text-orange-300 tracking-widest">ADMIN PANEL</p>
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

      {/* Dashboard Content */}
      <div className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-6xl font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            Admin Dashboard
          </h1>
          <p className="text-green-200 text-lg mb-16">Manage your SHAWARMORE business</p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Sales Analytics */}
            <div
              onClick={() => navigate("/admin/sales")}
              className="bg-gradient-to-br from-purple-900/30 to-pink-900/20 backdrop-blur-md border border-purple-500/30 rounded-3xl p-12 hover:scale-105 transition-transform cursor-pointer group"
              data-testid="sales-analytics-card"
            >
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-purple-500/20 mb-6 group-hover:bg-purple-500/40 transition-colors">
                <TrendingUp className="w-10 h-10 text-purple-400" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Sales Analytics</h2>
              <p className="text-green-200 text-lg">View revenue, orders, and performance metrics</p>
            </div>

            {/* Manage Products */}
            <div
              onClick={() => navigate("/admin/products")}
              className="bg-gradient-to-br from-green-900/30 to-orange-900/20 backdrop-blur-md border border-orange-500/30 rounded-3xl p-12 hover:scale-105 transition-transform cursor-pointer group"
              data-testid="manage-products-card"
            >
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-orange-500/20 mb-6 group-hover:bg-orange-500/40 transition-colors">
                <ShoppingBag className="w-10 h-10 text-orange-400" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Manage Products</h2>
              <p className="text-green-200 text-lg">Add, edit, and remove menu items from your catalog</p>
            </div>

            {/* View Orders */}
            <div
              onClick={() => navigate("/admin/orders")}
              className="bg-gradient-to-br from-green-900/30 to-blue-900/20 backdrop-blur-md border border-blue-500/30 rounded-3xl p-12 hover:scale-105 transition-transform cursor-pointer group"
              data-testid="view-orders-card"
            >
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-blue-500/20 mb-6 group-hover:bg-blue-500/40 transition-colors">
                <Package className="w-10 h-10 text-blue-400" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">View Orders</h2>
              <p className="text-green-200 text-lg">Monitor and manage all customer orders</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;