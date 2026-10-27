# ask-sonner

A Claude Code plugin bundling the `ask-sonner` skill: a guide for working with [svelte-sonner](https://github.com/wobsoriano/svelte-sonner), covering setup, picking the right `toast()` call, styling/theming, icons, positioning, multiple toasters, and troubleshooting.

## Install

Add this repo as a marketplace, then install the plugin:

```
/plugin marketplace add wobsoriano/svelte-sonner
/plugin install ask-sonner@svelte-sonner
```

Or point Claude Code at a local checkout for development:

```
claude --plugin-dir /path/to/svelte-sonner/plugins/ask-sonner
```

## What's included

- `skills/ask-sonner/SKILL.md` — setup, recipes, styling ladder, troubleshooting table
- `skills/ask-sonner/API.md` — full prop/option reference for `<Toaster />` and `toast()`
- `evals/` — three eval cases (`prompt.md` plus `graders/criteria.md` each), run with
  `claude plugin eval plugins/ask-sonner`
