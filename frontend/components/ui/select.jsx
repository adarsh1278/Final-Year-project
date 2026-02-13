"use client"

import * as React from "react"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

// ---- Context ----
const SelectCtx = React.createContext(null)
const useSelectCtx = () => {
  const ctx = React.useContext(SelectCtx)
  if (!ctx) throw new Error("Select components must be used within <Select>")
  return ctx
}

// ---- Root ----
const Select = ({ value: controlledValue, defaultValue = "", onValueChange, children }) => {
  const [open, setOpen] = React.useState(false)
  const [internalValue, setInternalValue] = React.useState(defaultValue)
  const triggerRef = React.useRef(null)
  const contentRef = React.useRef(null)

  const value = controlledValue !== undefined ? controlledValue : internalValue
  const handleChange = (v) => {
    if (controlledValue === undefined) setInternalValue(v)
    onValueChange?.(v)
    setOpen(false)
  }

  // Close on outside click
  React.useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (triggerRef.current?.contains(e.target)) return
      if (contentRef.current?.contains(e.target)) return
      setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  // Close on escape
  React.useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [open])

  return (
    <SelectCtx.Provider value={{ open, setOpen, value, onValueChange: handleChange, triggerRef, contentRef }}>
      <div className="relative">
        {children}
      </div>
    </SelectCtx.Provider>
  )
}

// ---- Trigger ----
const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => {
  const { open, setOpen, triggerRef } = useSelectCtx()

  const combinedRef = (node) => {
    triggerRef.current = node
    if (typeof ref === "function") ref(node)
    else if (ref) ref.current = node
  }

  return (
    <button
      ref={combinedRef}
      type="button"
      onClick={() => setOpen(!open)}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors",
        "hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
        "disabled:cursor-not-allowed disabled:opacity-50",
        open && "ring-2 ring-blue-500 border-blue-500",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className={cn("h-4 w-4 text-gray-500 transition-transform ml-2 shrink-0", open && "rotate-180")} />
    </button>
  )
})
SelectTrigger.displayName = "SelectTrigger"

// ---- Value ----
const SelectValue = ({ placeholder }) => {
  const { value } = useSelectCtx()
  const [label, setLabel] = React.useState("")

  React.useEffect(() => {
    // Find the matching item label in the DOM after render
    const timer = requestAnimationFrame(() => {
      const el = document.querySelector(`[data-select-value="${CSS.escape(value)}"]`)
      if (el) setLabel(el.textContent || value)
      else setLabel(value)
    })
    return () => cancelAnimationFrame(timer)
  }, [value])

  return (
    <span className={cn("truncate block text-left", !value && "text-gray-400")}>
      {value ? label || value : placeholder}
    </span>
  )
}

// ---- Content ----
const SelectContent = React.forwardRef(({ className, children, position, ...props }, ref) => {
  const { open, triggerRef, contentRef } = useSelectCtx()
  const [dropUp, setDropUp] = React.useState(false)

  const combinedRef = (node) => {
    contentRef.current = node
    if (typeof ref === "function") ref(node)
    else if (ref) ref.current = node
  }

  React.useEffect(() => {
    if (!open || !triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom
    setDropUp(spaceBelow < 250)
  }, [open, triggerRef])

  if (!open) return null

  return (
    <div
      ref={combinedRef}
      className={cn(
        "absolute left-0 z-[9999] min-w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg",
        "animate-in fade-in-0 zoom-in-95 duration-100",
        dropUp ? "bottom-full mb-1" : "top-full mt-1",
        className
      )}
      {...props}
    >
      <div className="max-h-[240px] overflow-y-auto p-1 scrollbar-thin">
        {children}
      </div>
    </div>
  )
})
SelectContent.displayName = "SelectContent"

// ---- Item ----
const SelectItem = React.forwardRef(({ className, children, value: itemValue, disabled, ...props }, ref) => {
  const { value, onValueChange } = useSelectCtx()
  const isSelected = value === itemValue

  return (
    <div
      ref={ref}
      data-select-value={itemValue}
      role="option"
      aria-selected={isSelected}
      onClick={() => {
        if (!disabled) onValueChange(itemValue)
      }}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-md py-2.5 pl-8 pr-3 text-sm transition-colors",
        "hover:bg-blue-50 hover:text-blue-900",
        isSelected && "bg-blue-50 text-blue-900 font-medium",
        disabled && "pointer-events-none opacity-50",
        className
      )}
      {...props}
    >
      <span className="absolute left-2 flex h-4 w-4 items-center justify-center">
        {isSelected && <Check className="h-4 w-4 text-blue-600" />}
      </span>
      <span>{children}</span>
    </div>
  )
})
SelectItem.displayName = "SelectItem"

// ---- Group / Label / Separator ----
const SelectGroup = ({ children, ...props }) => (
  <div role="group" {...props}>{children}</div>
)

const SelectLabel = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold text-gray-500", className)}
    {...props}
  />
))
SelectLabel.displayName = "SelectLabel"

const SelectSeparator = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-gray-200", className)}
    {...props}
  />
))
SelectSeparator.displayName = "SelectSeparator"

// Dummy scroll buttons for API compat
const SelectScrollUpButton = () => null
const SelectScrollDownButton = () => null

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}
