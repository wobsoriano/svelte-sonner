---
"svelte-sonner": major
---

Introducing Svelte Sonner v1! 🥳

This release brings compatibility with Svelte 5, a major internal refactor to use Svelte runes and snippets, and feature parity with the original package.

Here's an example of using snippets to change the default loading icon:

```svelte
<Toaster>
	{#snippet loadingIcon()}
		<LoadingIcon />
	{/snippet}
```

Coming soon: Docs site 😉
