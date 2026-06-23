import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, Mail, Sparkles, Loader2 } from "lucide-react";
import axios from "axios";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useAuth } from "@/store/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const navigate = useNavigate();
  const { setSession } = useAuth();

  const [otp, setOtp] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [isResending, setIsResending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otp.length < 6) {
      setStatus("error");
      setMessage("Please enter the complete 6-digit code.");
      return;
    }

    setStatus("loading");
    try {
      const response = await axios.post(`${API_URL}/auth/verify-email`, { email, otp });
      setStatus("success");
      setMessage("Email verified successfully! Logging you in...");
      
      const { token, user } = response.data;
      
      setTimeout(() => {
        setSession(token, user);
        navigate("/dashboard");
      }, 2000);
    } catch (err: any) {
      setStatus("error");
      setMessage(err?.response?.data?.error || "Invalid or expired OTP. Please try again.");
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setStatus("idle");
    setMessage("");
    try {
      await axios.post(`${API_URL}/auth/resend-verification`, { email });
      setStatus("idle");
      setMessage("A new verification code has been sent to your email.");
    } catch (err: any) {
      setStatus("error");
      setMessage(err?.response?.data?.error || "Failed to resend OTP. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  if (!email) {
    return (
      <div className="flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md glass-card p-8 text-center text-destructive">
          Email parameter is missing. Please go back and try again.
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
            Verification
          </div>
          <h1 className="font-display font-bold text-3xl md:text-4xl mb-2">
            Verify <span className="text-gradient">Email</span>
          </h1>
          <p className="text-muted-foreground text-sm">
            We've sent a 6-digit code to <span className="font-semibold">{email}</span>.
          </p>
        </div>

        {/* Card */}
        <div className="glass-card p-8 shadow-[0_0_60px_hsl(16_100%_60%/0.08)]">
          {status === "success" ? (
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold">Verification Complete!</h3>
              <p className="text-muted-foreground text-sm">
                Your email has been successfully verified. You are being redirected to your dashboard.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Messages */}
              {status === "error" && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                  <span>⚠️</span> {message}
                </div>
              )}
              {status === "idle" && message && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-500 text-sm">
                  <CheckCircle2 className="w-4 h-4" /> {message}
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
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                      <InputOTPSlot 
                        key={index} 
                        index={index} 
                        className="w-12 h-14 text-lg border bg-muted/40 rounded-md" 
                      />
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
                  "Verify Email"
                )}
              </button>

              <div className="text-center mt-6">
                <p className="text-sm text-muted-foreground">
                  Didn't receive the code?{" "}
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={isResending}
                    className="text-primary font-semibold hover:text-primary/80 transition-colors"
                  >
                    {isResending ? "Sending..." : "Resend"}
                  </button>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
