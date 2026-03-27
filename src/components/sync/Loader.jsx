import React, { useEffect, useState } from "react";

export default function Loader({ loading }) {
  const [visible, setVisible] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showRefreshHint, setShowRefreshHint] = useState(false);

  useEffect(() => {
    if (loading) {
      setVisible(true);
      setSuccess(false);
      setShowRefreshHint(false);

      const refreshTimer = setTimeout(() => {
        setShowRefreshHint(true);
      }, 10000);

      return () => clearTimeout(refreshTimer);
    } else if (visible) {
      setSuccess(true);
      setShowRefreshHint(false);

      const timeout = setTimeout(() => {
        setVisible(false);
        setSuccess(false);
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [loading, visible]);

  if (!visible) return null;

  return (
    <div className="py-4">
      <div className="w-full max-w-md mx-auto">
        <div className="h-6 rounded-full overflow-hidden bg-gray-200 shadow-inner transition-all duration-500">
          <div
            className={`h-full w-full flex items-center justify-center text-sm font-medium text-white transition-colors duration-500 ${
              success ? "bg-green-500" : "bg-blue-500"
            }`}
          >
            {success ? "Flows synchronized." : "Synchronizing flows..."}
          </div>
        </div>

        {showRefreshHint && !success && (
          <div className="mt-3 text-center text-sm text-gray-600">
            <p className="mb-2">Synchronization is taking unusually long.</p>
            <button
              onClick={() => window.location.reload()}
              className="text-blue-600 hover:text-blue-800 underline font-medium"
            >
              Refresh page
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
