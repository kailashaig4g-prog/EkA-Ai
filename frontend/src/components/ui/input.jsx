import * as React from "react";
import { cn } from "../../lib/utils";

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-base text-white placeholder:text-white/30 focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] transition-all outline-none backdrop-blur-sm disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
