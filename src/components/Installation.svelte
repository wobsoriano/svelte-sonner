<script lang="ts">
	import copy from 'copy-to-clipboard';

	let copying = 0;

	function onCopy() {
		copy('npm install svelte-sonner');
		copying++;
		setTimeout(() => {
			copying--;
		}, 2000);
	}
</script>

<div>
	<h2>Installation</h2>
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
	<code class="code" onclick={onCopy}>
		npm install svelte-sonner{' '}
		<button aria-label="Copy code" class="copy">
			{#if copying}
				<div>
					<svg
						viewBox="0 0 24 24"
						width="14"
						height="14"
						stroke="currentColor"
						stroke-width="1.5"
						stroke-linecap="round"
						stroke-linejoin="round"
						fill="none"
						shape-rendering="geometricPrecision"
					>
						<path d="M20 6L9 17l-5-5" />
					</svg>
				</div>
			{:else}
				<div>
					<svg
						viewBox="0 0 24 24"
						width="14"
						height="14"
						stroke="currentColor"
						stroke-width="1.5"
						stroke-linecap="round"
						stroke-linejoin="round"
						fill="none"
						shape-rendering="geometricPrecision"
					>
						<path
							d="M8 17.929H6c-1.105 0-2-.912-2-2.036V5.036C4 3.91 4.895 3 6 3h8c1.105 0 2 .911 2 2.036v1.866m-6 .17h8c1.105 0 2 .91 2 2.035v10.857C20 21.09 19.105 22 18 22h-8c-1.105 0-2-.911-2-2.036V9.107c0-1.124.895-2.036 2-2.036z"
						/>
					</svg>
				</div>
			{/if}
		</button>
	</code>
</div>

<style>
	.code {
		padding: 0 62px 0 12px;
		border-radius: 6px;
		background: linear-gradient(to top, var(--gray2), var(--gray1) 8px);
		font-family: var(--font-mono);
		font-size: 14px;
		position: relative;
		cursor: copy;
		height: 40px;
		border: 1px solid var(--gray3);
		display: flex;
		align-items: center;
	}

	.copy {
		position: absolute;
		right: 6px;
		top: 50%;
		transform: translateY(-50%);
		cursor: pointer;
		border-radius: 50%;
		border: none;
		border: 1px solid var(--gray4);
		background: #fff;
		color: var(--gray12);
		border-radius: 5px;
		width: 26px;
		height: 26px;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.copy div {
		display: flex;
	}
</style>
