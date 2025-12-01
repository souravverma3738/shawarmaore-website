import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../App";
import { Button } from "../components/button";
import { ShoppingCart, User, LogOut, Trash2, Plus, Minus, LayoutDashboard } from "lucide-react";
import { toast } from "sonner";

import Logo from "../assets/shawarmore-logo.jpeg";
const Cart = () => {
  const navigate = useNavigate();
  const { user, cart, updateCartQuantity, removeFromCart, logout } = useContext(AuthContext);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = () => {
    if (!user) {
      toast.error("Please login to checkout");
      navigate("/");
      return;
    }
    navigate("/checkout");
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
                className="text-green-100 hover:text-orange-400 hover:bg-green-900/30"
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
                    className="text-green-100 hover:text-orange-400 hover:bg-green-900/30"
                    onClick={logout}
                    data-testid="nav-logout-btn"
                  >
                    <LogOut className="w-5 h-5" />
                  </Button>
                </>
              ) : (
                <Button
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full"
                  onClick={() => navigate("/")}
                  data-testid="nav-login-btn"
                >
                  <User className="w-5 h-5 mr-2" />
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Cart Content */}
      <div className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-white mb-12 flex items-center gap-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            <ShoppingCart className="w-12 h-12 text-orange-500" />
            Your Cart
          </h1>

          {cart.length === 0 ? (
            <div className="bg-green-900/20 backdrop-blur-md border border-green-700/30 rounded-2xl p-12 text-center">
              <ShoppingCart className="w-24 h-24 text-green-600 mx-auto mb-6" />
              <h2 className="text-2xl text-white mb-4">Your cart is empty</h2>
              <p className="text-green-300 mb-8">Start adding some delicious wraps!</p>
              <Button
                onClick={() => navigate("/menu")}
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-6 rounded-full"
                data-testid="empty-cart-browse-btn"
              >
                Browse Menu
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Cart Items */}
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="bg-green-900/20 backdrop-blur-md border border-green-700/30 rounded-2xl p-6 flex items-center gap-6"
                  data-testid={`cart-item-${item.id}`}
                >
                  <img
                    src={item.image_url || "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=200"}
                    alt={item.name}
                    className="w-24 h-24 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-xl mb-1">{item.name}</h3>
                    <p className="text-green-300 text-sm">{item.description}</p>
                    <p className="text-orange-400 font-bold text-lg mt-2">${item.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-green-900/30 rounded-full p-1">
                      <Button
                        onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                        className="bg-green-800 hover:bg-green-700 text-white rounded-full w-8 h-8 p-0"
                        data-testid={`decrease-qty-${item.id}`}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="text-white font-semibold w-8 text-center" data-testid={`qty-${item.id}`}>{item.quantity}</span>
                      <Button
                        onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                        className="bg-green-800 hover:bg-green-700 text-white rounded-full w-8 h-8 p-0"
                        data-testid={`increase-qty-${item.id}`}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <Button
                      onClick={() => {
                        removeFromCart(item.id);
                        toast.success("Item removed from cart");
                      }}
                      variant="ghost"
                      className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                      data-testid={`remove-item-${item.id}`}
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              ))}

              {/* Cart Summary */}
              <div className="bg-gradient-to-br from-green-900/30 to-orange-900/20 backdrop-blur-md border border-orange-500/30 rounded-2xl p-8">
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-green-200">
                    <span>Subtotal</span>
                    <span data-testid="cart-subtotal">${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-green-200">
                    <span>Delivery Fee</span>
                    <span>$3.00</span>
                  </div>
                  <div className="border-t border-green-700/30 pt-4">
                    <div className="flex justify-between items-center text-white text-2xl font-bold">
                      <span>Total</span>
                      <span className="text-orange-400" data-testid="cart-total">${(total + 3).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleCheckout}
                  className="w-full mt-8 bg-orange-500 hover:bg-orange-600 text-white py-6 text-lg rounded-full shadow-2xl shadow-orange-500/50"
                  data-testid="proceed-checkout-btn"
                >
                  Proceed to Checkout
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;