---
"svelte-sonner": patch
---

fix: guard `heightIndex` against a not-found (`-1`) result

`Toast.svelte` computed `heightIndex` as `heights.findIndex(...) || 0`. When a
toast has no measured height entry yet, `findIndex` returns `-1`, and `-1 || 0`
evaluates to `-1` (since `-1` is truthy). That negative index then fed the
offset calculation (`heightIndex * GAP`) and the `reducerIndex >= heightIndex`
guard, producing incorrect stacking offsets in the brief window before a
toast's height is measured. Replaced the `|| 0` fallback with an explicit
`=== -1 ? 0 : idx` check.
