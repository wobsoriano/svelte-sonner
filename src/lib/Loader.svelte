<script lang="ts" module>
	const bars = Array(12).fill(0);
</script>

<script lang="ts">
	let { visible, class: className }: { visible: boolean; class?: string } =
		$props();
</script>

<div
	class={['sonner-loading-wrapper', className].filter(Boolean).join(' ')}
	data-visible={visible}
>
	<div class="sonner-spinner">
		{#each bars as _, i (`spinner-bar-${i}`)}
			<div class="sonner-loading-bar"></div>
		{/each}
	</div>
</div>
