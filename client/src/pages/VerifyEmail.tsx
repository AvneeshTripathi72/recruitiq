import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useDocumentMeta } from "@/hooks/use-document-meta";

export default function VerifyEmail() {
  useDocumentMeta("Verify Email — Tilcons", "Verify your email address for Tilcons ATS + CRM");
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your account...");

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const token = query.get("token");

    if (!token) {
      setStatus("error");
      setMessage("No verification token found.");
      return;
    }

    apiRequest("GET", `/api/verify?token=${token}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Verification failed");
        setStatus("success");
        setMessage(data.message || "Account verified successfully");
        setTimeout(() => setLocation("/signin"), 3000);
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err.message || "Invalid or expired verification link");
      });
  }, [setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-xl shadow-xl border border-border p-8 text-center">
        {status === "loading" && (
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 text-sky-500 animate-spin mb-4" />
            <h2 className="text-xl font-bold text-slate-800">{message}</h2>
          </div>
        )}
        {status === "success" && (
          <div className="flex flex-col items-center">
            <CheckCircle2 className="h-16 w-16 text-emerald-500 mb-4" />
            <h2 className="text-xl font-bold text-slate-800 mb-2">Success!</h2>
            <p className="text-slate-500">{message}</p>
            <p className="text-sm text-slate-400 mt-4">Redirecting to sign in...</p>
          </div>
        )}
        {status === "error" && (
          <div className="flex flex-col items-center">
            <XCircle className="h-16 w-16 text-red-500 mb-4" />
            <h2 className="text-xl font-bold text-slate-800 mb-2">Verification Failed</h2>
            <p className="text-slate-500 mb-6">{message}</p>
            <button
              onClick={() => setLocation("/signin")}
              className="px-6 py-2 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-700 transition-colors"
            >
              Go to Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
