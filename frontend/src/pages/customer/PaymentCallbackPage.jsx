import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import API from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

const PaymentCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get("reference") || searchParams.get("trxref");
  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("");
  const verificationRequest = useRef(null);
  const { user, login } = useAuth();

  useEffect(() => {
    let isMounted = true;

    if (!reference) return undefined;

    if (verificationRequest.current?.reference !== reference) {
      verificationRequest.current = {
        reference,
        promise: API.get(
          `/payment/verify/${encodeURIComponent(reference)}`,
          { skipGlobalNotifications: true },
        ),
      };
    }

    verificationRequest.current.promise
      .then(({ data }) => {
        if (isMounted) {
          if (data.paymentStatus === "success") {
            setStatus("success");
            if (data.paymentType === "subscription") {
              const currentUser = JSON.parse(
                localStorage.getItem("userInfo") || "{}",
              );
              login({ ...currentUser, ...data.subscription });
              setMessage(
                "Your payment was successful. Your vendor subscription is now active.",
              );
            } else {
              setMessage(
                "Your payment was successful and your order is marked as paid.",
              );
            }
          } else {
            setStatus("incomplete");
            setMessage(
              `Payment status: ${data.paymentStatus || "not confirmed"}. Your subscription or order has not been marked as paid.`,
            );
          }
        }
      })
      .catch((error) => {
        if (isMounted) {
          setStatus("error");
          setMessage(
            error.response?.data?.message ||
              "We could not verify your payment. Check your order history before trying again.",
          );
        }
      });

    return () => {
      isMounted = false;
    };
  }, [reference, login]);

  const displayStatus = reference ? status : "error";
  const displayMessage = reference
    ? message
    : "No payment reference was returned. Check your order history before trying again.";
  const isSuccessful = displayStatus === "success";

  return (
    <section className="mx-auto max-w-2xl rounded-3xl bg-white p-8 text-center shadow">
      <h1 className="text-3xl font-bold text-slate-900">
        {displayStatus === "verifying"
          ? "Verifying your payment"
          : isSuccessful
            ? "Payment successful"
            : displayStatus === "incomplete"
              ? "Payment not completed"
              : "Payment verification issue"}
      </h1>
      <p
        role={
          displayStatus === "error" || displayStatus === "incomplete"
            ? "alert"
            : "status"
        }
        className={`mt-4 ${
          isSuccessful ? "text-emerald-700" : "text-slate-600"
        }`}
      >
        {displayStatus === "verifying"
          ? "Please wait while we confirm the transaction with Paystack."
          : displayMessage}
      </p>

      {displayStatus !== "verifying" && (
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to={user?.role === "vendor" ? "/vendor" : "/orders"}
            className="rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white hover:bg-orange-600"
          >
            {user?.role === "vendor" ? "Go to vendor dashboard" : "View my orders"}
          </Link>
          {!isSuccessful && (
            <Link
              to={user?.role === "vendor" ? "/vendor" : "/dashboard"}
              className="rounded-xl border border-slate-300 px-5 py-3 font-medium text-slate-700 hover:bg-slate-50"
            >
              Return to dashboard
            </Link>
          )}
        </div>
      )}
    </section>
  );
};

export default PaymentCallbackPage;
