import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../App";
import { Button } from "../components/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/dialog";
import { Input } from "../components/input";
import { Label } from "../components/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/tabs";
import { ShoppingCart, User, LogOut, LayoutDashboard } from "lucide-react";
import axios from "axios";
import { API } from "../App";
import { toast } from "sonner";
import Logo from "../assets/shawarmore-logo.jpeg";


const Homepage = () => {
  const navigate = useNavigate();
  const { user, cart, login, logout } = useContext(AuthContext);
  const [showAuth, setShowAuth] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    email: "",
    password: "",
    full_name: "",
    phone: "",
    address: ""
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API}/auth/login`, loginData);
      login(response.data.token, response.data.user);
      toast.success("Welcome back!");
      setShowAuth(false);
      if (response.data.user.role === "admin") {
        navigate("/admin");
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || "Login failed");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API}/auth/register`, registerData);
      login(response.data.token, response.data.user);
      toast.success("Account created successfully!");
      setShowAuth(false);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a2e1a] to-[#0f1a0f]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#1a2e1a]/95 backdrop-blur-lg border-b border-green-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate("/")}>
             <img src={Logo} alt="Shawarmore Logo" className="w-12 h-12 object-contain"/>
              <div>
                <h1 className="text-3xl font-bold text-orange-500" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                  Dubai Shawarmore
                </h1>
                <p className="text-xs text-orange-300 tracking-widest">PREMIUM FLAVOUR EVERY WRAP</p>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <Button
                variant="ghost"
                className="text-green-100 hover:text-orange-400 hover:bg-green-900/30 transition-all"
                onClick={() => navigate("/menu")}
                data-testid="nav-menu-btn"
              >
                Menu
              </Button>

              {user ? (
                <>
                  {user.role === "admin" && (
                    <Button
                      variant="ghost"
                      className="text-green-100 hover:text-orange-400 hover:bg-green-900/30"
                      onClick={() => navigate("/admin")}
                      data-testid="nav-admin-btn"
                    >
                      <LayoutDashboard className="w-5 h-5 mr-2" />
                      Dashboard
                    </Button>
                  )}
                  {user.role === "customer" && (
                    <Button
                      variant="ghost"
                      className="text-green-100 hover:text-orange-400 hover:bg-green-900/30"
                      onClick={() => navigate("/my-orders")}
                      data-testid="nav-my-orders-btn"
                    >
                      My Orders
                    </Button>
                  )}
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
                </>
              ) : (
                <>
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
                    className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full"
                    onClick={() => setShowAuth(true)}
                    data-testid="nav-login-btn"
                  >
                    <User className="w-5 h-5 mr-2" />
                    Sign In
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 px-4">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-block bg-orange-500/20 backdrop-blur-sm border border-orange-500/30 px-4 py-2 rounded-full">
                <p className="text-orange-400 text-sm font-semibold tracking-wider">🔥 CHICKEN THE FRESHEST</p>
              </div>

              <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold text-white leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                Taste the Best that
                <span className="block text-orange-500">Surprise you</span>
              </h1>

              <p className="text-green-200 text-lg leading-relaxed">
                An Ethiopian shawarma story: it all gones to one of those nights out and your feel love moments, then these all dressed wraps
              </p>

              <div className="flex flex-wrap gap-4">
                <Button
                  className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-6 text-lg rounded-full shadow-2xl shadow-orange-500/50"
                  onClick={() => navigate("/menu")}
                  data-testid="hero-buynow-btn"
                >
                  Buy Now
                </Button>
                <Button
                  variant="outline"
                  className="border-2 border-green-400 text-green-100 hover:bg-green-900/30 px-8 py-6 text-lg rounded-full backdrop-blur-sm"
                  onClick={() => navigate("/menu")}
                  data-testid="hero-seemenu-btn"
                >
                  See Menu
                </Button>
              </div>

              <div className="flex items-center gap-8 pt-4">
                <div>
                  <p className="text-orange-500 text-3xl font-bold">£15.00</p>
                  <p className="text-green-300 text-sm line-through">£20.00</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/30 to-green-500/30 rounded-full blur-3xl"></div>
              <img
                src="https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=800"
                alt="Delicious Shawarma"
                className="relative z-10 w-full h-auto rounded-3xl shadow-2xl transform hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </div>
        {/* How to Order Section */}
        <div className="py-20 bg-[#132515] text-center">
          <div className="max-w-6xl mx-auto px-6">

            {/* Headings */}
            <h2 className="text-3xl sm:text-4xl font-bold mb-3 text-[#E2F7D4]" style={{ fontFamily: "'Playfair Display', serif" }}>
              How to order
            </h2>

            <p className="text-4xl sm:text-5xl font-extrabold text-orange-500 mb-12">
              It’s as easy as this.
            </p>

            {/* Steps */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

              {/* Step 1 */}
              <div className="flex flex-col items-center">
                <div className="text-orange-400 text-6xl mb-4">
                  📍
                </div>
                <h3 className="font-bold text-lg mb-2 text-[#F5FCEB]">
                  Tell us where you are
                </h3>
                <p className="text-[#A5C7A0] max-w-xs">
                  We’ll show you stores and restaurants nearby you can order from.
                </p>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center">
                <div className="text-orange-400 text-6xl mb-4">
                  🍔
                </div>
                <h3 className="font-bold text-lg mb-2 text-[#F5FCEB]">
                  Find what you want
                </h3>
                <p className="text-[#A5C7A0] max-w-xs">
                  Search for items or dishes, businesses or cuisines.
                </p>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center">
                <div className="text-orange-400 text-6xl mb-4">
                  🕑
                </div>
                <h3 className="font-bold text-lg mb-2 text-[#F5FCEB]">
                  Order for delivery or collection
                </h3>
                <p className="text-[#A5C7A0] max-w-xs">
                  We’ll update you on your order’s progress.
                </p>
              </div>

            </div>
          </div>
        </div>

      {/* Featured Items */}
      <div className="py-20 px-4 bg-gradient-to-b from-transparent to-[#0f1a0f]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl font-bold text-center text-white mb-16" style={{ fontFamily: "'Playfair Display', serif" }}>
            Most Popular
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: "Chicken Shawarma", price: "£7.00", img: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400" },
              { name: "Beef Shawarma", price: "£10.00", img: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400" },
              { name: "Lamb Samosa ", price: "£5.00", img: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400" },
              { name: "Chicken Wings", price: "£9.99", img: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400" }
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-green-900/20 backdrop-blur-md border border-green-700/30 rounded-2xl p-4 hover:border-orange-500/50 transition-all hover:scale-105 cursor-pointer group"
                onClick={() => navigate("/menu")}
                data-testid={`featured-item-${idx}`}
              >
                <div className="relative mb-4 overflow-hidden rounded-xl">
                  <img src={item.img} alt={item.name} className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-500" />
                  <button className="absolute bottom-2 right-2 bg-orange-500 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    +
                  </button>
                </div>
                <h3 className="text-white font-semibold text-center mb-2">{item.name}</h3>
                <p className="text-orange-400 font-bold text-center text-lg">{item.price}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Why Choose Us Section */}
<div className="py-24 bg-[#132515] ">
  <div className="max-w-7xl mx-auto px-6 text-center">

    {/* Heading */}
    <p className="text-green-300 tracking-wide text-sm mb-2 uppercase">
      Dubai Shawarmore
    </p>

    <h2 className="text-4xl sm:text-5xl font-extrabold mb-14">
      <span className="text-orange-500">Why</span>{" "}
      <span className="text-white">Choose Us?</span>
    </h2>

    {/* 3 Cards */}
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">

      {/* Card 1 */}
      <div className="bg-[#132515] border border-green-800/40 rounded-3xl p-8 shadow-xl hover:shadow-orange-500/20 transition-all backdrop-blur-md hover:-translate-y-2">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-orange-500/20 flex items-center justify-center mb-6 shadow-lg">
          <span className="text-orange-400 text-4xl">🎖️</span>
        </div>

        <h3 className="text-white font-bold text-xl mb-4">Loyalty Rewards</h3>

        <ul className="text-green-200 text-sm space-y-2">
          <li>• Earn points for every order</li>
          <li>• Exclusive discounts & promos</li>
          <li>• VIP member-only deals</li>
        </ul>
      </div>

      {/* Card 2 */}
      <div className="bg-[#132515] border border-green-800/40 rounded-3xl p-8 shadow-xl hover:shadow-orange-500/20 transition-all backdrop-blur-md hover:-translate-y-2">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-orange-500/20 flex items-center justify-center mb-6 shadow-lg">
          <span className="text-orange-400 text-4xl">⭐</span>
        </div>

        <h3 className="text-white font-bold text-xl mb-4">Our Promise</h3>

        <ul className="text-green-200 text-sm space-y-2">
          <li>• Fresh ingredients every day</li>
          <li>• Authentic Middle-Eastern flavour</li>
          <li>• Fast & reliable delivery</li>
        </ul>
      </div>

      {/* Card 3 */}
      <div className="bg-[#132515] border border-green-800/40 rounded-3xl p-8 shadow-xl hover:shadow-orange-500/20 transition-all backdrop-blur-md hover:-translate-y-2">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-orange-500/20 flex items-center justify-center mb-6 shadow-lg">
          <span className="text-orange-400 text-4xl">🚀</span>
        </div>

        <h3 className="text-white font-bold text-xl mb-4">Your Benefits</h3>

        <ul className="text-green-200 text-sm space-y-2">
          <li>• Super-fast delivery options</li>
          <li>• Pay online or cash on delivery</li>
          <li>• Order anytime on any device</li>
        </ul>
      </div>

    </div>
  </div>
</div>


      {/* Auth Modal */}
      <Dialog open={showAuth} onOpenChange={setShowAuth}>
        <DialogContent
  className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
             bg-white text-black border-green-700 rounded-lg shadow-xl
             w-[90%] max-w-md p-6"
>
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold text-orange-600">
              Welcome to SHAWARMORE
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="login" className="w-full mt-3">
            <TabsList className="grid w-full grid-cols-2 bg-gray-100 rounded-md">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            {/* LOGIN TAB */}
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="login-email" className="text-gray-800">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    className="bg-gray-100 border-gray-300 text-black"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="login-password" className="text-gray-800">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    className="bg-gray-100 border-gray-300 text-black"
                    required
                  />
                </div>

                <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                  Login
                </Button>
              </form>
            </TabsContent>

            {/* REGISTER TAB */}
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="register-name" className="text-gray-800">Full Name</Label>
                  <Input
                    id="register-name"
                    value={registerData.full_name}
                    onChange={(e) => setRegisterData({ ...registerData, full_name: e.target.value })}
                    className="bg-gray-100 border-gray-300 text-black"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="register-email" className="text-gray-800">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    className="bg-gray-100 border-gray-300 text-black"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="register-phone" className="text-gray-800">Phone</Label>
                  <Input
                    id="register-phone"
                    value={registerData.phone}
                    onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                    className="bg-gray-100 border-gray-300 text-black"
                  />
                </div>

                <div>
                  <Label htmlFor="register-address" className="text-gray-800">Address</Label>
                  <Input
                    id="register-address"
                    value={registerData.address}
                    onChange={(e) => setRegisterData({ ...registerData, address: e.target.value })}
                    className="bg-gray-100 border-gray-300 text-black"
                  />
                </div>

                <div>
                  <Label htmlFor="register-password" className="text-gray-800">Password</Label>
                  <Input
                    id="register-password"
                    type="password"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    className="bg-gray-100 border-gray-300 text-black"
                    required
                  />
                </div>

                <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                  Register
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
      {/* Footer */}
<footer className="bg-[#0b140b] border-t border-green-900/40 text-green-200 ">
  <div className="max-w-7xl mx-auto px-6 py-14">

    {/* Top: Logo + Social */}
    <div className="flex flex-col items-center text-center mb-12">

      <img
        src={Logo}
        alt="Shawarmore Logo"
        className="w-16 h-16 object-contain mb-4"
      />

      <h2 className="text-2xl font-bold text-orange-500">
        Dubai Shawarmore
      </h2>
      <p className="text-sm text-green-300 tracking-wide">
        Premium Flavour Every Wrap
      </p>

      {/* Social Icons */}
      <div className="flex gap-6 mt-6">
        <a href="#" className="text-green-200 hover:text-orange-500 text-2xl">
          <i className="fab fa-facebook"></i>
        </a>
        <a href="#" className="text-green-200 hover:text-orange-500 text-2xl">
          <i className="fab fa-instagram"></i>
        </a>
        <a href="#" className="text-green-200 hover:text-orange-500 text-2xl">
          <i className="fab fa-tiktok"></i>
        </a>
        <a href="#" className="text-green-200 hover:text-orange-500 text-2xl">
          <i className="fab fa-whatsapp"></i>
        </a>
      </div>
    </div>

    {/* Middle Section: Links */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 text-center sm:text-left">

      {/* Column 1 */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
        <ul className="space-y-2 text-green-300">
          <li><a href="/menu" className="hover:text-orange-400">Menu</a></li>
          <li><a href="/my-orders" className="hover:text-orange-400">My Orders</a></li>
          <li><a href="/cart" className="hover:text-orange-400">Cart</a></li>
          <li><a href="/contact" className="hover:text-orange-400">Contact</a></li>
        </ul>
      </div>

      {/* Column 2 */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Customer Service</h3>
        <ul className="space-y-2 text-green-300">
          <li><a href="#" className="hover:text-orange-400">FAQs</a></li>
          <li><a href="#" className="hover:text-orange-400">Delivery Info</a></li>
          <li><a href="#" className="hover:text-orange-400">Refund Policy</a></li>
          <li><a href="#" className="hover:text-orange-400">Terms & Conditions</a></li>
        </ul>
      </div>

      {/* Column 3 */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Contact Us</h3>
        <ul className="space-y-2 text-green-300">
          <li>📞 07400 123456</li>
          <li>📍 Addiscombe Road, Croydon</li>
          <li>🕒 Mon–Sun: 11AM – 11PM</li>
          <li><a href="mailto:info@shawarmore.co.uk" className="hover:text-orange-400">
              info@shawarmore.co.uk
            </a>
          </li>
        </ul>
      </div>

    </div>

    {/* Bottom Copyright */}
    <div className="text-center mt-14 border-t border-green-800/40 pt-6">
      <p className="text-sm text-green-400">
        © {new Date().getFullYear()} Dubai Shawarmore — All Rights Reserved.
      </p>
    </div>

  </div>
</footer>

    </div>
  );
};

export default Homepage;