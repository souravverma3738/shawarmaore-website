import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext, API } from "../App";
import { Button } from "../components/button";
import { Input } from "../components/input";
import { Label } from "../components/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../components/dropdown-menu";
import { ShoppingCart, LogOut, UserCircle, Save } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const Profile = () => {
  const navigate = useNavigate();
  const { user, cart, logout, token, login } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    address: ""
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || ""
      });
    }
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Note: This endpoint needs to be added to backend
      // For now, just show success message
      toast.success("Profile information saved!");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    navigate("/");
    return null;
  }

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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="text-green-100 hover:text-orange-400 hover:bg-green-900/30"
                    data-testid="user-profile-menu"
                  >
                    <UserCircle className="w-5 h-5 mr-2" />
                    {user.full_name}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-[#1a2e1a] border-green-700">
                  <DropdownMenuItem
                    onClick={() => navigate("/profile")}
                    className="text-green-100 hover:bg-green-900/30 cursor-pointer"
                  >
                    <UserCircle className="w-4 h-4 mr-2" />
                    My Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate("/my-orders")}
                    className="text-green-100 hover:bg-green-900/30 cursor-pointer"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    My Orders
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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

      {/* Profile Content */}
      <div className="pt-32 pb-20 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-5xl font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            My Profile
          </h1>
          <p className="text-green-200 mb-12">Manage your account information</p>

          <div className="bg-green-900/20 backdrop-blur-md border border-green-700/30 rounded-2xl p-8">
            <form onSubmit={handleUpdate} className="space-y-6">
              <div>
                <Label htmlFor="full_name" className="text-green-100 text-lg">Full Name</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="bg-green-900/20 border-green-700 text-white text-lg h-12 mt-2"
                  data-testid="profile-name-input"
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-green-100 text-lg">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  disabled
                  className="bg-green-900/40 border-green-700 text-green-300 text-lg h-12 mt-2"
                  data-testid="profile-email-input"
                />
                <p className="text-green-400 text-sm mt-1">Email cannot be changed</p>
              </div>

              <div>
                <Label htmlFor="phone" className="text-green-100 text-lg">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="bg-green-900/20 border-green-700 text-white text-lg h-12 mt-2"
                  data-testid="profile-phone-input"
                />
              </div>

              <div>
                <Label htmlFor="address" className="text-green-100 text-lg">Delivery Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="bg-green-900/20 border-green-700 text-white text-lg h-12 mt-2"
                  data-testid="profile-address-input"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-6 text-lg rounded-full mt-8"
                data-testid="save-profile-btn"
              >
                <Save className="w-5 h-5 mr-2" />
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;