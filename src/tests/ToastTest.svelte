<script lang="ts" module>
	type ToastFn = (t: typeof toast) => void;

	export type ToastTestProps = {
		cb: ToastFn;
	};
</script>

<script lang="ts">
	import { Toaster, toast } from '$lib/index.js';
	const { cb }: ToastTestProps = $props();

	function onClick() {
		cb(toast);
	}
</script>

<Toaster />

<button data-testid="trigger" onclick={onClick}>Trigger</button>
