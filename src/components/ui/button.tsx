import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-black uppercase tracking-wide ring-offset-background transition-brutal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground border-4 border-black shadow-brutal hover:translate-x-1 hover:translate-y-1 hover:shadow-none rounded-none",
        destructive: "bg-destructive text-destructive-foreground border-4 border-black shadow-brutal hover:translate-x-1 hover:translate-y-1 hover:shadow-none rounded-none",
        outline: "border-4 border-black bg-background hover:bg-accent hover:text-accent-foreground shadow-brutal hover:translate-x-1 hover:translate-y-1 hover:shadow-none rounded-none",
        secondary: "bg-secondary text-secondary-foreground border-4 border-black shadow-pink hover:translate-x-1 hover:translate-y-1 hover:shadow-none rounded-none",
        ghost: "hover:bg-accent hover:text-accent-foreground border-4 border-transparent hover:border-black",
        link: "text-primary underline-offset-4 hover:underline font-black",
        neon: "bg-gradient-neon text-black border-4 border-black shadow-neon hover:animate-neon-pulse rounded-none",
        cyber: "bg-gradient-cyber text-white border-4 border-black shadow-pink hover:translate-x-1 hover:translate-y-1 hover:shadow-none rounded-none",
        electric: "bg-gradient-electric text-black border-4 border-black shadow-blue hover:translate-x-1 hover:translate-y-1 hover:shadow-none rounded-none",
        festive: "bg-gradient-sunset text-white border-4 border-black shadow-brutal hover:translate-x-1 hover:translate-y-1 hover:shadow-none rounded-none",
        tropical: "bg-gradient-tropical text-foreground border-4 border-black shadow-brutal hover:translate-x-1 hover:translate-y-1 hover:shadow-none rounded-none",
        lime: "bg-gradient-lime text-white border-4 border-black shadow-brutal hover:translate-x-1 hover:translate-y-1 hover:shadow-none rounded-none",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-10 px-4 py-2",
        lg: "h-14 px-8 py-4",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
