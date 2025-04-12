"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { cva, type VariantProps } from "class-variance-authority"
import { Menu } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const SidebarContext = React.createContext<{
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
}>({
  isOpen: true,
  setIsOpen: () => {},
})

export function SidebarProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [isOpen, setIsOpen] = React.useState(true)

  return (
    <SidebarContext.Provider value={{ isOpen, setIsOpen }}>
      <div className="grid lg:grid-cols-[270px_1fr] lg:gap-0 relative">{children}</div>
    </SidebarContext.Provider>
  )
}

export function SidebarTrigger({ className }: React.HTMLAttributes<HTMLButtonElement>) {
  const { isOpen, setIsOpen } = React.useContext(SidebarContext)

  return (
    <Button variant="ghost" size="icon" className={cn("lg:hidden", className)} onClick={() => setIsOpen(!isOpen)}>
      <Menu className="h-5 w-5" />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
}

export function SidebarInset({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col flex-1">{children}</div>
}

export function SidebarRail() {
  return <div className="absolute right-0 top-0 bottom-0 w-px bg-border" />
}

export function Sidebar({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { isOpen } = React.useContext(SidebarContext)

  return (
    <aside
      className={cn(
        "fixed top-0 bottom-0 left-0 right-0 z-50 bg-background lg:right-auto lg:w-[270px] lg:border-r lg:z-0",
        isOpen ? "block" : "hidden lg:block",
        className,
      )}
      {...props}
    >
      <div className="h-full w-full overflow-auto pb-10">{children}</div>
    </aside>
  )
}

export function SidebarHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <header className={cn("sticky top-0 z-10 bg-background px-4 py-3", className)} {...props}>
      {children}
    </header>
  )
}

export function SidebarContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("px-4 py-3", className)} {...props}>
      {children}
    </div>
  )
}

export function SidebarGroup({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("pb-4", className)} {...props}>
      {children}
    </div>
  )
}

export function SidebarGroupLabel({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mb-2 px-2 text-xs font-semibold text-muted-foreground", className)} {...props}>
      {children}
    </div>
  )
}

export function SidebarGroupContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("space-y-1", className)} {...props}>
      {children}
    </div>
  )
}

export function SidebarMenu({ className, children, ...props }: React.HTMLAttributes<HTMLUListElement>) {
  return (
    <ul className={cn("space-y-1", className)} {...props}>
      {children}
    </ul>
  )
}

export function SidebarMenuItem({ className, children, ...props }: React.HTMLAttributes<HTMLLIElement>) {
  return (
    <li className={cn("", className)} {...props}>
      {children}
    </li>
  )
}

const sidebarMenuButtonVariants = cva(
  "group flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium",
  {
    variants: {
      isActive: {
        true: "bg-accent text-accent-foreground",
        false: "hover:bg-accent/50 hover:text-accent-foreground",
      },
    },
    defaultVariants: {
      isActive: false,
    },
  },
)

export interface SidebarMenuButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof sidebarMenuButtonVariants> {
  asChild?: boolean
}

export const SidebarMenuButton = React.forwardRef<HTMLButtonElement, SidebarMenuButtonProps>(
  ({ className, isActive, asChild = false, ...props }, ref) => {
    const Comp = asChild ? React.Fragment : "button"
    const pathname = usePathname()

    if (asChild) {
      return (
        <Comp>
          <a
            className={cn(
              sidebarMenuButtonVariants({
                isActive: isActive || pathname === props.href,
                className,
              }),
            )}
            {...props}
          />
        </Comp>
      )
    }

    return <Comp ref={ref} className={cn(sidebarMenuButtonVariants({ isActive, className }))} {...props} />
  },
)
SidebarMenuButton.displayName = "SidebarMenuButton"

export function SidebarMenuBadge({ className, children, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn("ml-auto flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-xs", className)}
      {...props}
    >
      {children}
    </span>
  )
}

export function SidebarMenuSub({ className, children, ...props }: React.HTMLAttributes<HTMLUListElement>) {
  return (
    <ul className={cn("ml-4 space-y-1 border-l pl-2", className)} {...props}>
      {children}
    </ul>
  )
}

