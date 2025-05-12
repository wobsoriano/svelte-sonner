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
<button onclick={() => toast('My first toast')}>
  Give me a toast
</button>`;
