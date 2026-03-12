<script lang="ts">
	import { Toaster, toast } from '$lib/index.js';

	function showGlobalToast() {
		toast('Global Toaster Toast');
	}

	function showSecondaryToast() {
		toast('Secondary Toaster Toast', { toasterId: 'secondary' });
	}
</script>

<Toaster position="bottom-right" />
<Toaster id="secondary" position="top-left" />

<button data-testid="toast-global" onclick={showGlobalToast}>
	Show in Global Toaster
</button>
<button data-testid="toast-secondary" onclick={showSecondaryToast}>
	Show in Secondary Toaster
</button>
