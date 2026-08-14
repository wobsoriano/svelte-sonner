---
'svelte-sonner': patch
---

fix: record the drag start time so a fast flick below the distance threshold can dismiss a toast, reset the auto-close timer when a dismissed toast id is recreated in the same tick, keep height entries in newest-first order when several toasts mount together, and fully reset gesture state when a toast is revived mid-exit
