import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Info } from "lucide-react";
import { cn } from "@/lib/format";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-semibold rounded-[12px] transition-[background-color,border-color,color,transform] duration-[120ms] ease-out active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none",
  {
    variants: {
      variant: {
        primary: "bg-[#245B3D] text-white hover:bg-[#19472E]",
        secondary: "bg-white text-[#245B3D] border-[1.5px] border-[#245B3D] hover:bg-[#EAF0E5]",
        gold: "bg-[#D7A34D] text-[#25352B] hover:bg-[#C6923D]",
        farmer: "bg-[#245B3D] text-white hover:bg-[#19472E] text-[18px] min-h-[56px] px-6",
        ghost: "bg-transparent text-[#25352B] hover:bg-[#EAF0E5]",
        destructive: "bg-[#FDECEC] text-[#A32D2D] border border-[#A32D2D] hover:bg-[#FAD6D6]",
      },
      size: {
        sm: "min-h-[40px] px-3.5 text-sm",
        md: "min-h-[48px] px-5 text-sm",
        lg: "min-h-[56px] px-6 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold leading-tight",
  {
    variants: {
      tone: {
        success: "bg-[#E6F3E9] text-[#24603B]",
        warning: "bg-[#FFF2D8] text-[#80520C]",
        danger: "bg-[#FDECEC] text-[#A32D2D]",
        info: "bg-[#E8F2F8] text-[#245B78]",
        neutral: "bg-[#EAF0E5] text-[#25352B] border border-[#D6DED2]",
        gold: "bg-[#D7A34D] text-[#25352B]",
      },
    },
    defaultVariants: {
      tone: "neutral",
    },
  }
);

export function Badge({
  children,
  tone,
  className,
}: {
  children: React.ReactNode;
  tone?: VariantProps<typeof badgeVariants>["tone"];
  className?: string;
}) {
  return <span className={cn(badgeVariants({ tone }), className)}>{children}</span>;
}

export function Card({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "bg-white border border-[#D6DED2] rounded-[16px] shadow-[0_2px_8px_rgba(37,53,43,0.06)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function DemoBanner({
  title,
  detail,
  className,
}: {
  title: string;
  detail: string;
  className?: string;
}) {
  return (
    <div
      role="note"
      className={cn(
        "flex items-start gap-3 rounded-[12px] border border-[#D6DED2] bg-[#EAF0E5] px-4 py-3 text-sm text-[#25352B]",
        className
      )}
    >
      <Info className="h-5 w-5 shrink-0 text-[#245B3D] mt-0.5" aria-hidden="true" />
      <div>
        <span className="font-semibold">{title}: </span>
        <span className="text-[#52645A]">{detail}</span>
      </div>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[16px] border border-dashed border-[#788A7B] bg-white px-6 py-12 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#EAF0E5] text-[#245B3D]">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-[#25352B]">{title}</h3>
      <p className="mt-1.5 max-w-md text-sm text-[#52645A]">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
