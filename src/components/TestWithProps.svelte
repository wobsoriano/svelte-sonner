<script lang="ts">
	let { message }: { message: string } = $props();
</script>

<div>
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html message}
</div>
