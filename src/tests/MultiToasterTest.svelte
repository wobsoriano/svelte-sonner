<script lang="ts">
	import { Toaster, toast } from '$lib/index.js';
	const { cb }: { cb: (t: typeof toast) => void } = $props();

	function onClick() {
		cb(toast);
	}
</script>

<div data-testid="default-toaster">
	<Toaster />
</div>

<div data-testid="named-toaster">
	<Toaster id="secondary" position="top-center" />
</div>

<button data-testid="trigger" onclick={onClick}>Trigger</button>
