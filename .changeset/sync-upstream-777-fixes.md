---
'svelte-sonner': patch
---

fix: port the bug-fix batch from upstream sonner (emilkowalski/sonner#777): custom icons no longer render twice in promise toasts, a fast flick no longer dismisses a toast in a direction not in `swipeDirections` (which is now actually passed down from the Toaster), decorative icons are hidden from assistive technology, toast content takes the full toast width, `toast.custom()` keeps an explicit id of `0`, toasts created before the `<Toaster />` mounts are no longer lost, a new toast reusing the id of a dismissed toast no longer inherits its props, and a toast recreated right after being dismissed is no longer removed by the pending dismissal
