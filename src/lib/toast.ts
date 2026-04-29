// Dispatch a toast via custom DOM event (no React context needed)
export type ToastType = "success" | "error" | "info";

export function toast(message: string, type: ToastType = "success") {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("app:toast", { detail: { message, type } }));
}
