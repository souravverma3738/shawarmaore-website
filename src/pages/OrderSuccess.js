import { useContext, useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthContext, API } from "../App";
import { Button } from "../components/button";
import { CheckCircle, Loader2 } from "lucide-react";
import axios from "axios";
import Logo from "../assets/shawarmore-logo.jpeg";
const OrderSuccess = () => {
  const navigate = useNavigate();
  const { clearCart, token } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("checking");
  const [attempts, setAttempts] = useState(0);
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (sessionId) {
      pollPaymentStatus();
    } else {
      setStatus("error");
    }
  }, [sessionId]);

  const pollPaymentStatus = async () => {
    const maxAttempts = 5;
    
    if (attempts >= maxAttempts) {
      setStatus("timeout");
      return;
    }

    try {
      const response = await axios.get(`${API}/checkout/status/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.payment_status === "paid") {
        setStatus("success");
        clearCart();
      } else if (response.data.status === "expired") {
        setStatus("error");
      } else {
        // Continue polling
        setAttempts(prev => prev + 1);
        setTimeout(pollPaymentStatus, 2000);
      }
    } catch (error) {
      console.error("Error checking payment status:", error);
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a2e1a] to-[#0f1a0f] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-green-900/20 backdrop-blur-md border border-green-700/30 rounded-2xl p-12 text-center">
        {status === "checking" && (
          <>
            <Loader2 className="w-20 h-20 text-orange-500 mx-auto mb-6 animate-spin" />
            <h1 className="text-3xl font-bold text-white mb-4">Processing Payment</h1>
            <p className="text-green-200">Please wait while we confirm your payment...</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" data-testid="success-icon" />
            <h1 className="text-3xl font-bold text-white mb-4">Payment Successful!</h1>
            <p className="text-green-200 mb-8">Thank you for your order. We'll start preparing it right away!</p>
            <div className="space-y-4">
              <Button
                onClick={() => navigate("/my-orders")}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-6 rounded-full"
                data-testid="view-orders-btn"
              >
                View My Orders
              </Button>
              <Button
                onClick={() => navigate("/menu")}
                variant="outline"
                className="w-full border-green-700 text-green-100 hover:bg-green-900/30 py-6 rounded-full"
                data-testid="continue-shopping-btn"
              >
                Continue Shopping
              </Button>
            </div>
          </>
        )}

        {(status === "error" || status === "timeout") && (
          <>
            <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
              <span className="text-red-500 text-5xl">✕</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">Payment {status === "timeout" ? "Processing" : "Failed"}</h1>
            <p className="text-green-200 mb-8">
              {status === "timeout"
                ? "Payment is still processing. Please check your orders or email for confirmation."
                : "There was an issue with your payment. Please try again or contact support."}
            </p>
            <div className="space-y-4">
              <Button
                onClick={() => navigate("/my-orders")}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-6 rounded-full"
                data-testid="check-orders-btn"
              >
                Check My Orders
              </Button>
              <Button
                onClick={() => navigate("/cart")}
                variant="outline"
                className="w-full border-green-700 text-green-100 hover:bg-green-900/30 py-6 rounded-full"
                data-testid="back-to-cart-btn"
              >
                Back to Cart
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OrderSuccess;