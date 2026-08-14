<script lang="ts">
	import { Toaster, toast } from '$lib/index.js';
	import type { ToasterProps } from '$lib/index.js';

	const {
		cb,
		...toasterProps
	}: { cb: (t: typeof toast) => void } & ToasterProps = $props();

	function onClick() {
		cb(toast);
	}
</script>

<Toaster {...toasterProps} />

<button data-testid="trigger" onclick={onClick}>Trigger</button>
