import * as React from "react";
import { Loader2 } from "lucide-react";
import { Button, type ButtonProps } from "./button";
import { cn } from "@/lib/utils";

export interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
  loadingText?: string;
  spinnerPosition?: "left" | "right";
}

const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
  (
    {
      children,
      loading = false,
      loadingText,
      spinnerPosition = "left",
      disabled,
      className,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    const spinner = (
      <Loader2 className={cn("h-4 w-4 animate-spin", loading && "opacity-100")} />
    );

    return (
      <Button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          "relative",
          loading && "cursor-wait",
          className
        )}
        {...props}
      >
        {loading && spinnerPosition === "left" && spinner}
        <span className={cn(loading && !loadingText && "opacity-0")}>
          {loading && loadingText ? loadingText : children}
        </span>
        {loading && spinnerPosition === "right" && spinner}
        {loading && !loadingText && (
          <span className="absolute inset-0 flex items-center justify-center">
            {spinner}
          </span>
        )}
      </Button>
    );
  }
);
LoadingButton.displayName = "LoadingButton";

export { LoadingButton };
