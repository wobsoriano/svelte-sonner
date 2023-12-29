<script lang="ts" context="module">
	type ToastFn = (t: typeof toast) => void;

	export type ToastTestProps = {
		cb: ToastFn;
	};
</script>

<script lang="ts">
	import { Toaster, toast } from '$lib';

	type $$Props = ToastTestProps;

	export let cb: $$Props['cb'];

	function onClick() {
		cb(toast);
	}
</script>

<Toaster />

<button data-testid="trigger" on:click={onClick}>Trigger</button>
