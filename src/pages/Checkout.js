import { useContext, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthContext, API } from "../App";
import { Button } from "../components/button";
import { Input } from "../components/input";
import { Label } from "../components/label";
import { RadioGroup, RadioGroupItem } from "../components/radio-group";
import { ShoppingCart } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const Checkout = () => {
  const navigate = useNavigate();
  const { user, cart, clearCart, token } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    delivery_address: user?.address || "",
    phone: user?.phone || "",
    payment_method: "stripe"
  });

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = 3.0;
  const grandTotal = total + deliveryFee;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    if (!formData.delivery_address || !formData.phone) {
      toast.error("Please fill in all delivery details");
      return;
    }

    setLoading(true);

    try {
      // Create order
      const orderData = {
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity
        })),
        payment_method: formData.payment_method,
        delivery_address: formData.delivery_address,
        phone: formData.phone
      };

      const orderResponse = await axios.post(`${API}/orders`, orderData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const order = orderResponse.data;

      if (formData.payment_method === "cash") {
        // Cash on delivery - order is complete
        clearCart();
        toast.success("Order placed successfully!");
        navigate("/my-orders");
      } else {
        // Stripe payment - create checkout session
        const checkoutData = {
          order_id: order.id,
          origin_url: window.location.origin
        };

        const checkoutResponse = await axios.post(`${API}/checkout/session`, checkoutData, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Redirect to Stripe
        window.location.href = checkoutResponse.data.url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(error.response?.data?.detail || "Failed to process order");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a2e1a] to-[#0f1a0f] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold text-white mb-12 flex items-center gap-4" style={{ fontFamily: "'Playfair Display', serif" }}>
          <ShoppingCart className="w-12 h-12 text-orange-500" />
          Checkout
        </h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Delivery Details */}
          <div className="bg-green-900/20 backdrop-blur-md border border-green-700/30 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Delivery Details</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="phone" className="text-green-100">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="bg-green-900/20 border-green-700 text-white"
                  required
                  data-testid="checkout-phone-input"
                />
              </div>
              <div>
                <Label htmlFor="address" className="text-green-100">Delivery Address</Label>
                <Input
                  id="address"
                  value={formData.delivery_address}
                  onChange={(e) => setFormData({ ...formData, delivery_address: e.target.value })}
                  className="bg-green-900/20 border-green-700 text-white"
                  required
                  data-testid="checkout-address-input"
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-green-900/20 backdrop-blur-md border border-green-700/30 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Payment Method</h2>
            <RadioGroup
              value={formData.payment_method}
              onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
              className="space-y-4"
            >
              <div className="flex items-center space-x-3 bg-green-900/30 p-4 rounded-xl border border-green-700/50">
                <RadioGroupItem value="stripe" id="stripe" data-testid="payment-stripe-radio" />
                <Label htmlFor="stripe" className="text-green-100 cursor-pointer flex-1">
                  <div className="font-semibold">Credit/Debit Card (Stripe)</div>
                  <div className="text-sm text-green-300">Pay securely with your card</div>
                </Label>
              </div>
              <div className="flex items-center space-x-3 bg-green-900/30 p-4 rounded-xl border border-green-700/50">
                <RadioGroupItem value="cash" id="cash" data-testid="payment-cash-radio" />
                <Label htmlFor="cash" className="text-green-100 cursor-pointer flex-1">
                  <div className="font-semibold">Cash on Delivery</div>
                  <div className="text-sm text-green-300">Pay when you receive your order</div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Order Summary */}
          <div className="bg-gradient-to-br from-green-900/30 to-orange-900/20 backdrop-blur-md border border-orange-500/30 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Order Summary</h2>
            
            <div className="space-y-3 mb-6">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between text-green-200" data-testid={`summary-item-${item.id}`}>
                  <span>{item.name} x {item.quantity}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-green-700/30 pt-4 space-y-3">
              <div className="flex justify-between text-green-200">
                <span>Subtotal</span>
                <span data-testid="summary-subtotal">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-green-200">
                <span>Delivery Fee</span>
                <span>${deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-white text-2xl font-bold pt-4">
                <span>Total</span>
                <span className="text-orange-400" data-testid="summary-total">${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full mt-8 bg-orange-500 hover:bg-orange-600 text-white py-6 text-lg rounded-full shadow-2xl shadow-orange-500/50"
              data-testid="place-order-btn"
            >
              {loading ? "Processing..." : formData.payment_method === "stripe" ? "Pay Now" : "Place Order"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;