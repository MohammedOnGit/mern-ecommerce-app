import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { checkAuthStatus } from "@/store/auth-slice";
import { clearCart } from "@/store/shop/cart-slice";

function PaystackReturn() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();

  const [status, setStatus] = useState("processing");
  const [message, setMessage] = useState("Verifying your payment...");
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    let attempts = 0;

    const verifyPayment = async () => {
      try {
        const reference =
          searchParams.get("reference") || searchParams.get("trxref");
        const token = searchParams.get("token");
        const paymentSuccess =
          searchParams.get("payment_success") === "true";

        if (!reference) throw new Error("Missing payment reference");

        // Restore auth if token exists
        if (token) {
          localStorage.setItem("token", token);
          await dispatch(checkAuthStatus());
        }

        // Verify with backend
        const res = await fetch(
          `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/shop/orders/verify-payment?reference=${reference}`,
          { credentials: "include" }
        );

        if (!res.ok) throw new Error("Verification failed");

        const data = await res.json();
        if (!data?.success || !data.orderId) {
          throw new Error("Invalid verification response");
        }

        // Success
        setOrderId(data.orderId);
        setStatus("success");
        setMessage("Payment verified successfully!");

        dispatch(clearCart());

        localStorage.setItem(
          "lastOrder",
          JSON.stringify({
            orderId: data.orderId,
            timestamp: Date.now(),
            status: "confirmed",
          })
        );

        setTimeout(() => {
          navigate(`/order-confirmation/${data.orderId}`, {
            replace: true,
            state: { fromPayment: true, paymentStatus: "success" },
          });
        }, 1200);
      } catch (error) {
        attempts += 1;

        if (attempts <= 2) {
          setMessage(`Retrying verification... (${attempts}/2)`);
          setTimeout(verifyPayment, 2000);
          return;
        }

        console.error("Payment verification failed:", error);

        setStatus("failed");
        setMessage("Payment verification failed");

        toast.error(
          "Unable to verify payment. Please check your order status."
        );

        setTimeout(() => {
          navigate("/shop/checkout", {
            replace: true,
            state: { paymentError: true },
          });
        }, 3000);
      }
    };

    verifyPayment();
  }, [dispatch, navigate, searchParams]);

  const StatusIcon =
    status === "success"
      ? CheckCircle
      : status === "failed"
      ? XCircle
      : Loader2;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg border p-8 text-center">
        <StatusIcon
          className={`h-16 w-16 mx-auto mb-4 ${
            status === "processing"
              ? "animate-spin text-blue-500"
              : status === "success"
              ? "text-green-500"
              : "text-red-500"
          }`}
        />

        <h1 className="text-2xl font-bold mb-3">
          {status === "processing"
            ? "Processing Payment"
            : status === "success"
            ? "Payment Successful"
            : "Payment Failed"}
        </h1>

        <p className="text-gray-600 mb-6">{message}</p>

        {status === "processing" && (
          <div className="space-y-3">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full w-3/4 bg-blue-500 animate-pulse" />
            </div>
            <div className="flex justify-center gap-2 text-sm text-gray-500">
              <AlertCircle className="h-4 w-4" />
              Do not close this window
            </div>
          </div>
        )}

        {status === "success" && orderId && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm font-medium text-green-800">
              Order Reference
            </p>
            <p className="font-mono text-sm break-all">{orderId}</p>
          </div>
        )}

        {status === "failed" && (
          <div className="mt-6 space-y-3">
            <button
              onClick={() => navigate("/shop/checkout")}
              className="w-full py-3 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Return to Checkout
            </button>
            <button
              onClick={() => navigate("/shop/account")}
              className="w-full py-3 border rounded-lg hover:bg-gray-50"
            >
              View My Orders
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default PaystackReturn;
