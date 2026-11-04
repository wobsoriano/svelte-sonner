# Grading criteria

Four separate sub-problems. The response must resolve all four and show both the
`<Toaster />` setup and the `notify()` module.

## Required

1. **Icons.** Toaster icon overrides are snippets, not component props. The fix is
   `{#snippet successIcon()}<CheckIcon />{/snippet}` as a child of `<Toaster />`,
   not `successIcon={CheckIcon}`.
2. **Two stacks.** Each `<Toaster />` needs its own `id`, and the toast call targets
   one with `toast('...', { toasterId: 'chat' })`. Should note that a `<Toaster />`
   with no `id` renders only toasts that specify no `toasterId`.
3. **Persist then tear down.** `{ duration: Infinity }` to persist, capture the id
   returned by the `toast()` call, and `toast.dismiss(id)` to remove it.
   `toast.dismiss` is importable and callable outside any component, so a websocket
   handler can call it directly.
4. **Close callbacks.** `onDismiss` (user closed it — close button, swipe, or an
   explicit `toast.dismiss()`) is distinct from `onAutoClose` (duration elapsed).
   There is no single "closed" callback. Analytics belongs in `onDismiss` only.

## Should not

- Must not use `useSonner()` — it throws at every call site in this library.
- Must not present `onDismiss` as firing on timeout.
