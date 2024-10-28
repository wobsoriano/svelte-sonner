<script lang="ts">
	import CodeBlock from './CodeBlock.svelte';
	import { usageSnippet } from './code-snippets.js';
</script>

<div>
	<h2>Usage</h2>
	<p>Render the toaster in the root of your app.</p>
	<CodeBlock code={usageSnippet} />
</div>
