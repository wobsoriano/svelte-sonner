# Grading criteria

The response must diagnose both problems and return corrected `<Toaster />` markup.

## Required

- Identifies that `classes` has no effect without `unstyled: true` — svelte-sonner's
  default styles win the cascade otherwise. The corrected markup sets
  `toastOptions={{ unstyled: true, classes: { ... } }}`.
- Identifies that `theme` defaults to `'light'` and does not follow the OS, so a
  dark-only app must pass `theme="dark"`, `theme="system"`, or bind it to the app's
  own theme state.
- Returns actual corrected `<Toaster />` markup, not just prose.

## Should not

- Must not claim the prop is `classNames` — svelte-sonner names it `classes`.
- Must not suggest that `theme="system"` alone is enough for an app that is dark-only
  regardless of OS preference.
