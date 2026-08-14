---
'svelte-sonner': patch
---

fix: replace the svelte-preprocess `<style global>` block with a native Svelte 5 `:global` block so the published component compiles with the latest `@sveltejs/vite-plugin-svelte` (fixes crashes with `@tailwindcss/vite` CSS extraction)
