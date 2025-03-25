import * as React from "react"
import { toast } from "sonner"

export function useToast() {
  return {
    toast,
    dismiss: toast.dismiss,
  }
} 