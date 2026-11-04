---
name: ask-sonner
description: Guide to Svelte Sonner (`svelte-sonner`), the Svelte 5 port of Sonner — install and wire up the Toaster, pick the right toast() call, promise and loading toasts, updating, dismissing and persisting toasts, styling, theming and icons, positioning and multiple toasters. Use when working with svelte-sonner or troubleshooting it — toasts that don't appear, appear twice, lose their styles, ignore Tailwind classes, sit behind a modal, break under SvelteKit SSR, or don't follow dark mode.
---

# Working With Svelte Sonner

A guide skill for [svelte-sonner](https://github.com/wobsoriano/svelte-sonner), the Svelte 5 port of [Sonner](https://sonner.emilkowal.ski). When a task involves svelte-sonner — wiring it up, rendering toasts, styling them, or fixing them — answer from this file first. Full prop tables for `<Toaster />` and `toast()` live in [API.md](API.md); read it when you need an exact prop name, type, or default.

## Setup

Two pieces, and only two:

1. **One `<Toaster />`, mounted once**, as close to the root as possible — in SvelteKit, `+layout.svelte`. Never render it per-page or conditionally; a second mounted Toaster duplicates every toast.
2. **`toast()` called from anywhere** — event handlers, `$effect`, load-response handlers. It's a plain function, no store subscription needed.

```svelte
<script lang="ts">
	import { Toaster, toast } from 'svelte-sonner'; // one package, both exports
</script>

<Toaster />
<button onclick={() => toast('Give me a toast')}>Toast</button>
```

**SvelteKit SSR** — if toasts render unstyled or behave oddly only on the first load, add this to `vite.config.ts` so the library isn't pre-bundled/externalized for SSR:

```ts
export default defineConfig({
	ssr: { noExternal: ['svelte-sonner'] }
});
```

## Picking the right call

| You want                                                               | Call                                                                                                                                                                                                                                                                             |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Plain message                                                          | `toast('Title')` — add `{ description }` for a second line                                                                                                                                                                                                                       |
| Success / error / info / warning icon                                  | `toast.success('…')`, `toast.error('…')`, etc.                                                                                                                                                                                                                                   |
| Spinner while you manage state yourself                                | `toast.loading('…')`, then update it by id                                                                                                                                                                                                                                       |
| Loading → success/error tied to a promise                              | `toast.promise(promise, { loading, success, error })` — success/error accept functions receiving the resolved value/error                                                                                                                                                        |
| Button that does something                                             | `{ action: { label, onClick } }` — closes the toast unless the return handling short-circuits it; `cancel` is the secondary variant. The field is still named `onClick` (it's a plain object key, not a DOM attribute) even though Svelte 5 markup elsewhere uses `onclick`      |
| Render a whole Svelte component as the toast body, default toast shell | `toast(MyComponent, { componentProps: {...} })`                                                                                                                                                                                                                                  |
| Custom Svelte component, no styles at all                              | `toast.custom(MyComponent, { componentProps: {...} })` — headless, your component controls the markup while Sonner keeps positioning/stacking/swipe. Your component also receives a `closeToast` prop on top of `componentProps` — call it to dismiss from your own close button |

There's no JSX render-prop form here — where React Sonner takes `toast(<jsx/>)` or `toast.custom((t) => <jsx/>)`, svelte-sonner takes an actual **component reference** (never an instance) plus a `componentProps` object.

## Recipes

**Update a toast** — call `toast()` again with the same `id`; only the props you pass change. Switching to `toast.success(…, { id })` changes the type. This is how loading → success flows work without `toast.promise`:

```ts
const id = toast.loading('Uploading…');
toast.success('Uploaded', { id });
```

**Persist** — `{ duration: Infinity }`. **Dismiss** — `toast.dismiss(id)`, or `toast.dismiss()` for all.

**Read active toasts** — use `toast.getActiveToasts()`. It works anywhere, including outside a component:

```ts
import { toast } from 'svelte-sonner';
const open = toast.getActiveToasts();
```

Do **not** use `useSonner()`, despite what the README shows. It reads a Svelte context that `<Toaster />` sets on itself, and `<Toaster />` accepts no children — so no component is ever a descendant of it, and the call throws `Context "<Toaster/>" not found` wherever you put it.

**Multiple toasters** — give each an `id` and target with `toast('…', { toasterId: 'canvas' })`. A `<Toaster />` without an `id` only renders toasts that don't specify a `toasterId`.

**Close callbacks** — `onDismiss` fires on close button, swipe, or an explicit `toast.dismiss()`; `onAutoClose` fires on timeout. They are separate; there is no single "closed" callback.

## Styling — the escalation ladder

Climb only as far as the change requires; jumping to the top rung too early is fine (it's the recommended end state), lingering in the middle is not.

1. **Defaults** — plus `richColors` on the Toaster for colorful success/error, `invert` to flip against the theme.
2. **Inline tweaks** — `toastOptions={{ style: '...' }}` on the Toaster for all toasts (a CSS string, not a style object), or `style` per `toast()` call.
3. **Classes on parts** — `toastOptions={{ unstyled: true, classes: { toast, title, description, actionButton, cancelButton, closeButton } }}`. Note the field is `classes`, not `classNames` — this is a Svelte port so it follows Svelte's native `class` attribute naming. `classes` also accepts per-type keys (`success`, `error`, `warning`, `info`, `loading`) to style just one toast type. There's also a `class` (whole toast) and `descriptionClass` shorthand at the top level if you only need those two parts.
4. **Headless** — `toast.custom(MyComponent, { componentProps })` with your own Svelte component, keeping Sonner's positioning, stacking, and swipe. Your component is handed a `closeToast` prop alongside `componentProps`; call it from your own close button. The recommended approach for a design-system toast: wrap it in your own `toast()` abstraction. (`unstyled: true` on its own is a halfway house, but headless gives more control for the same effort.)

**Icons** — swap defaults per-type on the Toaster using **snippets**, not a props object: `{#snippet successIcon()}...{/snippet}` (also `infoIcon`, `warningIcon`, `errorIcon`, `loadingIcon`, `closeIcon`). Per-toast, pass a component reference to `icon`, or `null` to remove it.

```svelte
<Toaster>
	{#snippet successIcon()}<CheckIcon />{/snippet}
</Toaster>
```

**Theme** — `theme` defaults to `'light'` and does not track the OS. Pass `theme="system"`, or wire it to your own dark-mode state (e.g. [mode-watcher](https://mode-watcher.sveco.dev)'s `userPrefersMode.current`).

## Troubleshooting

| Symptom                                                                         | Cause → fix                                                                                                                                                                                                                              |
| ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Toast never appears                                                             | No `<Toaster />` mounted, or it unmounted (conditional render, per-page placement). Mount one at the root layout.                                                                                                                        |
| Same toast appears twice                                                        | Two Toasters mounted (layout **and** page) — keep one. Or `toast()` fired inside an `$effect` that reruns — fire from the event handler instead, or pass a stable `id` so a repeat call updates rather than duplicates.                  |
| Tailwind/CSS classes have no effect                                             | You passed `classes` (or `class`) without `unstyled: true` — Sonner's default styles still win the cascade. Set `unstyled: true` alongside them, or go fully headless (see the ladder above).                                            |
| Toasts render unstyled, or behave inconsistently on first load only (SvelteKit) | SSR pre-bundling issue. Add `ssr: { noExternal: ['svelte-sonner'] }` to `vite.config.ts`.                                                                                                                                                |
| Toast behind a modal/overlay, or clipped                                        | An ancestor creates a stacking context (`transform`, `filter`, `overflow`) or the overlay out-z-indexes the toaster. Move `<Toaster />` to the root layout, outside any dialog/portal container.                                         |
| Dark mode ignored                                                               | `theme` defaults to `'light'` — set `theme="system"` or bind it to your theme state (see Theme above).                                                                                                                                   |
| Success/error look gray, not green/red                                          | That's the default. Add `richColors` to the Toaster.                                                                                                                                                                                     |
| Toast never closes                                                              | `duration: Infinity`, `dismissible: false`, or a `toast.promise` whose promise never settles — the loading toast waits forever.                                                                                                          |
| `toast.promise` stuck on loading                                                | It needs a promise (or a function returning one) as its first argument, and the promise must actually resolve/reject. A resolved value shaped like `{ ok: false, ... }` (a Response-like object) is treated as an error even on resolve. |
| Passing JSX-style markup as the message does nothing                            | There's no JSX here — pass a string, or a Svelte **component reference** (not `<Component />` markup, not an instance) as the message/icon/action label, with `componentProps` for its props.                                            |
| Swipe-to-dismiss goes the wrong way / doesn't work                              | Directions default to the two implied by `position` — `bottom-right` gives `['bottom','right']`, `top-center` gives `['top']`. Pass `swipeDirections` on the Toaster to allow others.                                                    |
| Toast shows up in every toaster                                                 | Multiple toasters need targeting: give each Toaster an `id` and pass `toasterId` in the `toast()` call.                                                                                                                                  |
| Toasts too close to the screen edge on mobile                                   | `offset` (desktop, default 24px) and `mobileOffset` (<600px, default 16px) — numbers, CSS strings, or per-side objects.                                                                                                                  |
