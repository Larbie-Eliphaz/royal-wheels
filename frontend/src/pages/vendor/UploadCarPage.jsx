import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../api/axios";
import UploadCarForm from "../../components/vendor/UploadCarForm";

const requestUploadLimit = async () => {
  const [carsResponse, profileResponse] = await Promise.all([
    API.get("/cars/vendor/my-cars"),
    API.get("/users/profile"),
  ]);
  const cars = Array.isArray(carsResponse.data)
    ? carsResponse.data
    : carsResponse.data?.cars;
  const vendor = profileResponse.data?.user;
  if (!Array.isArray(cars) || !vendor) {
    throw new Error("Unable to determine your current listing limit.");
  }

  const hasActiveSubscription =
    vendor.subscriptionStatus === "active" &&
    new Date(vendor.subscriptionExpiresAt).getTime() > Date.now();
  const plan = vendor.vendorPlan || vendor.plan;
  const limit = hasActiveSubscription
    ? plan === "starter"
      ? 10
      : null
    : 3;
  return { count: cars.length, limit, hasActiveSubscription };
};

const UploadCarPage = () => {
  const [uploadLimit, setUploadLimit] = useState(null);
  const [loadingLimit, setLoadingLimit] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadUploadLimit = useCallback(async () => requestUploadLimit(), []);

  useEffect(() => {
    let isMounted = true;
    requestUploadLimit()
      .then((limit) => {
        if (isMounted) {
          setUploadLimit(limit);
          setErrorMessage("");
        }
      })
      .catch((error) => {
        if (isMounted) {
          setErrorMessage(
            error.response?.data?.message ||
              error.message ||
              "Unable to load your current car listings.",
          );
        }
      })
      .finally(() => {
        if (isMounted) setLoadingLimit(false);
      });

    return () => {
      isMounted = false;
    };
  }, [loadUploadLimit]);

  const refreshUploadLimit = async () => {
    try {
      setUploadLimit(await loadUploadLimit());
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "Unable to load your current car listings.",
      );
    }
  };

  const hasReachedLimit =
    uploadLimit?.limit !== null &&
    uploadLimit?.limit !== undefined &&
    uploadLimit.count >= uploadLimit.limit;

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">
        Upload New Car
      </h1>

      {errorMessage && (
        <p role="alert" className="mb-6 rounded-xl bg-red-50 p-4 text-red-700">
          {errorMessage}
        </p>
      )}

      {!loadingLimit && uploadLimit && (
        <div className="mb-6 rounded-2xl border border-orange-200 bg-orange-50 p-4 text-slate-800">
          {uploadLimit.limit === null ? (
            <p>
              {uploadLimit.hasActiveSubscription
                ? "Your active plan allows unlimited car listings."
                : "You can upload up to 3 cars without a subscription."}
            </p>
          ) : (
            <p>
              {uploadLimit.hasActiveSubscription
                ? `Your Starter plan allows ${uploadLimit.limit} cars.`
                : `Free vendor limit: ${uploadLimit.limit} cars.`}{" "}
              {uploadLimit.count} currently listed.
            </p>
          )}
        </div>
      )}

      {!hasReachedLimit ? (
        <UploadCarForm onUploaded={refreshUploadLimit} />
      ) : (
        <div className="rounded-2xl bg-white p-6 shadow">
          <p className="font-semibold text-slate-900">
            You’ve reached your {uploadLimit.limit}-car listing limit.
          </p>
          <p className="mt-2 text-slate-600">
            Subscribe or renew a plan to upload more cars.
          </p>
          <Link
            to="/pricing"
            className="mt-4 inline-flex rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white hover:bg-orange-600"
          >
            View subscription plans
          </Link>
        </div>
      )}
    </div>
  );
};

export default UploadCarPage;