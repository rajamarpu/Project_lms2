import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { KeyRound, Sparkles, Loader2 } from "lucide-react";
import API from "@/api/client";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const VerifyResetOtp = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const navigate = useNavigate();

  const [otp, setOtp] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otp.length < 6) {
      setStatus("error");
      setMessage("Please enter the complete 6-digit code.");
      return;
    }

    setStatus("loading");
    try {
      const response = await API.post(`/auth/verify-reset-otp`, { email, otp });
      const { id, token } = response.data;
      navigate(`/reset-password/${id}/${token}`);
    } catch (err: any) {
      setStatus("error");
      setMessage(err?.response?.data?.error || "Invalid or expired OTP. Please try again.");
    }
  };

  if (!email) {
    return (
      <div className="flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md glass-card p-8 text-center text-destructive">
          Email parameter is missing. Please restart the password reset process.
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-secondary/40 bg-secondary/10 text-secondary text-xs font-medium mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Security Check
          </div>
          <h1 className="font-display font-bold text-3xl md:text-4xl mb-2">
            Enter <span className="text-gradient">Reset Code</span>
          </h1>
          <p className="text-muted-foreground text-sm">
            We've sent a 6-digit code to <span className="font-semibold">{email}</span>.
          </p>
        </div>

        {/* Card */}
        <div className="glass-card p-8 shadow-[0_0_60px_hsl(16_100%_60%/0.08)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Messages */}
            {status === "error" && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                <span>⚠️</span> {message}
              </div>
            )}

            {/* OTP Input */}
            <div className="flex flex-col items-center justify-center space-y-4">
              <label className="text-sm font-medium text-foreground/80 text-center">
                Enter 6-digit Code
              </label>
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={setOtp}
              >
                <InputOTPGroup className="gap-2">
                  {[...Array(6)].map((_, index) => (
                    <InputOTPSlot key={index} index={index} className="w-12 h-14 text-lg border bg-muted/40 rounded-md" />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={status === "loading" || otp.length < 6}
              className="w-full btn-primary justify-center py-3.5 text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed mt-4"
            >
              {status === "loading" ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin w-4 h-4" />
                  Verifying…
                </span>
              ) : (
                "Continue to Reset Password"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerifyResetOtp;
