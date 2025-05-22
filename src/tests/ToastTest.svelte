<script lang="ts">
	import { Toaster, toast } from '$lib/index.js';
	const { cb }: { cb: (t: typeof toast) => void } = $props();

	function onClick() {
		cb(toast);
	}
</script>

<Toaster />

<button data-testid="trigger" onclick={onClick}>Trigger</button>
