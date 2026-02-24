<script lang="ts">
	import type { ToasterProps } from '$lib/types.js';
	import { Toaster, toast } from '$lib/index.js';
	const {
		cb,
		toasterProps = {}
	}: { cb: (t: typeof toast) => void; toasterProps?: ToasterProps } = $props();

	function onClick() {
		cb(toast);
	}
</script>

<Toaster {...toasterProps} />

<button data-testid="trigger" onclick={onClick}>Trigger</button>
