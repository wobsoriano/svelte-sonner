<script lang="ts">
import CodeBlock from "./CodeBlock.svelte";
</script>

<div>
  <h2>Usage</h2>
  <p>Render the toaster in the root of your app.</p>
  <CodeBlock
    code={`<script>
import { Toaster, toast } from 'svelte-sonner'
</script>

<!-- ... -->

<Toaster />
<button
  on:click={() => toast('My first toast')}
>
  Give me a toast
</button>`}
  />
</div>
