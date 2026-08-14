# svelte-sonner

## 1.2.1

### Patch Changes

- f506748: fix: firefox mouseleave firing when mouse doesn't move

## 1.2.0

### Minor Changes

- 7312f33: feat: support multiple toasters via `<Toaster id="..." />` and `toast(..., { toasterId })` (matching upstream sonner semantics: a toaster without an `id` renders only toasts without a `toasterId`), use the `gap` prop in the toast offset math instead of a hardcoded value, and honor `toastOptions.closeButton`. Note: an `id` passed to `<Toaster />` now identifies the toaster instead of landing on the `<ol>` element

### Patch Changes

- 7fbbc1c: fix: guard `heightIndex` against a not-found (`-1`) result

    `Toast.svelte` computed `heightIndex` as `heights.findIndex(...) || 0`. When a
    toast has no measured height entry yet, `findIndex` returns `-1`, and `-1 || 0`
    evaluates to `-1` (since `-1` is truthy). That negative index then fed the
    offset calculation (`heightIndex * GAP`) and the `reducerIndex >= heightIndex`
    guard, producing incorrect stacking offsets in the brief window before a
    toast's height is measured. Replaced the `|| 0` fallback with an explicit
    `=== -1 ? 0 : idx` check.

- 32b4655: fix: prevent `Cannot read properties of undefined (reading 'toastId')` crash from `setHeight`

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

- 7312f33: fix: replace the svelte-preprocess `<style global>` block with a native Svelte 5 `:global` block so the published component compiles with the latest `@sveltejs/vite-plugin-svelte` (fixes crashes with `@tailwindcss/vite` CSS extraction)
- 6084611: fix: record the drag start time so a fast flick below the distance threshold can dismiss a toast, reset the auto-close timer when a dismissed toast id is recreated in the same tick, keep height entries in newest-first order when several toasts mount together, and fully reset gesture state when a toast is revived mid-exit
- 7312f33: fix: port the bug-fix batch from upstream sonner (emilkowalski/sonner#777): custom icons no longer render twice in promise toasts, a fast flick no longer dismisses a toast in a direction not in `swipeDirections` (which is now actually passed down from the Toaster), decorative icons are hidden from assistive technology, toast content takes the full toast width, `toast.custom()` keeps an explicit id of `0`, toasts created before the `<Toaster />` mounts are no longer lost, a new toast reusing the id of a dismissed toast no longer inherits its props, and a toast recreated right after being dismissed is no longer removed by the pending dismissal

## 1.1.1

### Patch Changes

- 828befe: Fix infinite-duration toasts being dismissed immediately when updated

## 1.1.0

### Minor Changes

- b059173: Add `pauseWhenPageIsHidden` prop and rename dismissable to dismissible (deprecated alias kept for backwards compatibility)

## 1.0.8

### Patch Changes

- 3cfc3c8: Ignore system theme change if theme has been set explicitly

## 1.0.7

### Patch Changes

- 27599d7: Switch to OIDC for npm publishing

## 1.0.6

### Patch Changes

- 065ac06: Restore expand functionality broken in v1.0.3

## 1.0.5

### Patch Changes

- e441e34: perf: don't unnecessarily run expensive `getDocumentDirection`
- e441e34: fix: allow event handlers to be passed as props and call them before the internal ones

## 1.0.4

### Patch Changes

- 1a718f6: - Remove lift interaction
    - Ensure `onDismiss` fires correctly
- 61e932d: fix: increase specificity of toast styles by removing :where() to resolve issues with `richColors`

## 1.0.3

### Patch Changes

- be39b67: Avoid triggering nested $effect updates on dismissal

## 1.0.2

### Patch Changes

- ae0b9fa: Fixed an issue where usage of toast inside `$effect` causes an infinite loop

## 1.0.1

### Patch Changes

- 02af4ff: Fixes an issue where `runed` package can't be resolved due to it being in the `devDependencies` section instead of `dependencies`.

## 1.0.0

### Major Changes

- 1b1f5b3: Introducing Svelte Sonner v1! 🥳

    This release brings compatibility with Svelte 5, a major internal refactor to use Svelte runes and snippets, and feature parity with the original package.

    Here's an example of using snippets to change the default loading icon:

    ```svelte
    <Toaster>
    	{#snippet loadingIcon()}
    		<LoadingIcon />
    	{/snippet}
    </Toaster>
    ```

    Coming soon: Docs site 😉

## 0.3.26

### Patch Changes

- 1836b26: Add license

## 0.3.25

### Patch Changes

- a9e6f9c: fix: Svelte 5 peer dep

## 0.3.24

### Patch Changes

- 52a09f2: fix: animate manually dismissed toasts

## 0.3.23

### Patch Changes

- 3903d66: feat: exported Icon and Loader component
- 771223b: fix: dark mode for close button
- f031fa4: fix: safari 13 support for matchmedia event listener

## 0.3.22

### Patch Changes

- 24fa4f2: fix: remove action button styling when unstyled is true

## 0.3.21

### Patch Changes

- 65cb045: fix: height calculation for updated toasts

## 0.3.20

### Patch Changes

- e3ec6c7: fix: blurry toasts, heights store

## 0.3.19

### Patch Changes

- fee33b7: fix: multi-line promises height

## 0.3.18

### Patch Changes

- 379d307: fix: blurry toasts

## 0.3.17

### Patch Changes

- 074220c: feat: make icons customizable

## 0.3.16

### Patch Changes

- 40b42e2: fix: rtl styling

## 0.3.15

### Patch Changes

- 26fc332: fix: toasts dismissing at the same time

## 0.3.14

### Patch Changes

- ea6f527: fix: class toast option not applied to toasts

## 0.3.13

### Patch Changes

- 877e513: fix: prevent action button shrinking

## 0.3.12

### Patch Changes

- 6a59c2c: fix: add back missing duration prop to Toaster

## 0.3.11

### Patch Changes

- 8c220f8: fix: toast dismissing immediately after update

## 0.3.10

### Patch Changes

- 23d87bc: Custom components properties propagation when it is used in toast of predefined types.

## 0.3.10

### Patch Changes

- [#40](https://github.com/wobsoriano/svelte-sonner/pull/40): Custom components properties propagation when it is used in toast of predefined types.

## 0.3.9

### Patch Changes

- c997d85: fix: toasts being dismissed early & add `clientWritable`
