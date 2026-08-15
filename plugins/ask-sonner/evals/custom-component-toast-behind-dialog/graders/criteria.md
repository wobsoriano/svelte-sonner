# Grading criteria

Two independent bugs. The response must fix both.

## Required

- **No JSX.** svelte-sonner takes a component _reference_ plus a `componentProps`
  object — `toast.custom(OrderToast, { componentProps: { orderNumber } })`. Explains
  that `toast(<OrderToast … />)` is React Sonner syntax with no Svelte equivalent,
  and that the argument is never markup or an instantiated component.
- **Headless, not just unstyled.** Since the user wants entirely their own markup,
  points at `toast.custom` rather than `toast(Component, …)`, which renders the
  component as the title inside the default styled shell.
- **Stacking context.** Diagnoses the dialog layering as a z-index / stacking-context
  problem, and fixes it by mounting a single `<Toaster />` at the root layout,
  outside the dialog's portal or any ancestor that creates a stacking context
  (`transform`, `filter`, `overflow`).

## Credit for

- Mentioning that a `toast.custom` component also receives a `closeToast` prop, so
  the "View order" button can dismiss the toast itself.

## Should not

- Must not suggest raising the Toaster's z-index as the only fix while leaving it
  mounted inside the dialog.
