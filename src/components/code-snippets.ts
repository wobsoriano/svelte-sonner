export function getOtherCodeSnippet(
	snippet: string,
	richColorsActive: boolean,
	closeButtonActive: boolean
) {
	return `<script>
  ${snippet || ''}
</script>

<!-- ... -->

<Toaster ${richColorsActive ? 'richColors ' : ''} ${closeButtonActive ? 'closeButton ' : ''}/>`;
}

export const usageSnippet = `<script>
  import { Toaster, toast } from 'svelte-sonner'
</script>

<!-- ... -->

<Toaster />
<button on:click={() => toast('My first toast')}>
  Give me a toast
</button>`;
