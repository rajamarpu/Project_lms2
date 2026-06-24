import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  fullPage?: boolean;
  label?: string;
}

const sizeMap = {
  sm: "w-4 h-4",
  md: "w-8 h-8",
  lg: "w-12 h-12",
};

/**
 * Reusable loading indicator.
 * Use `fullPage` for route-level loading states so every page
 * shows a consistent spinner instead of bespoke markup.
 */
export const LoadingSpinner = ({ size = "md", fullPage = false, label }: LoadingSpinnerProps) => {
  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader2 className={`${sizeMap[size]} animate-spin text-primary`} />
      {label && <p className="text-sm text-muted-foreground">{label}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] w-full py-20">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
