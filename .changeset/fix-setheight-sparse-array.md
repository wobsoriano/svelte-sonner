---
"svelte-sonner": patch
---

fix: prevent `Cannot read properties of undefined (reading 'toastId')` crash from `setHeight`

`setHeight` looked up a toast's position in `this.toasts` (via `#findToastIdx`)
and then used that integer to write into `this.heights`. The two arrays grow
independently (`toasts` is unshifted, `heights` is pushed; `remove()` splices
`toasts` but only `removeHeight()` filters `heights`), so the indices drift out
of sync. When `toastIdx >= heights.length`, `this.heights[toastIdx] = data`
created a sparse array with `undefined` holes, and a subsequent
`heights.findIndex((h) => h.toastId === ...)` then dereferenced the hole and
threw `TypeError: Cannot read properties of undefined (reading 'toastId')`,
white-screening the host app.

Fixed by searching `heights` directly by `toastId` (mirroring `removeHeight`)
via a dedicated `#findHeightIdx` helper, so the index always refers to the
correct array. The lookup is wrapped in `untrack` because `setHeight` runs
inside a `$effect`; a tracked read of `this.heights` would re-trigger that
effect on the following write and hit `effect_update_depth_exceeded`.
