import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B35] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a] disabled:pointer-events-none disabled:opacity-50 min-h-[44px] min-w-[44px]",
  {
    variants: {
      variant: {
        default:
          "bg-[#FF6B35] hover:bg-[#ff8559] text-white shadow-[0_0_20px_rgba(255,107,53,0.2)] hover:shadow-[0_0_30px_rgba(255,107,53,0.4)] hover:-translate-y-0.5",
        secondary:
          "bg-white/5 hover:bg-white/10 text-white border border-white/10 backdrop-blur-sm",
        ghost: "text-white/70 hover:text-white hover:bg-white/5",
        destructive: "bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/20",
        outline: "border border-white/20 bg-transparent hover:bg-white/5 text-white",
        link: "text-[#FF6B35] underline-offset-4 hover:underline",
      },
      size: {
        default: "px-6 py-2.5",
        sm: "px-4 py-2 text-xs",
        lg: "px-8 py-3 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
