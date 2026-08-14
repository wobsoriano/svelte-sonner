---
'svelte-sonner': minor
---

feat: support multiple toasters via `<Toaster id="..." />` and `toast(..., { toasterId })` (matching upstream sonner semantics: a toaster without an `id` renders only toasts without a `toasterId`), use the `gap` prop in the toast offset math instead of a hardcoded value, and honor `toastOptions.closeButton`. Note: an `id` passed to `<Toaster />` now identifies the toaster instead of landing on the `<ol>` element
