<script lang="ts">
	import hljs from 'highlight.js/lib/core';
	import javascript from 'highlight.js/lib/languages/javascript';
	import xml from 'highlight.js/lib/languages/xml';
	import 'highlight.js/styles/github.css';
	import copy from 'copy-to-clipboard';
	import { createEventDispatcher } from 'svelte';

	hljs.registerLanguage('javascript', javascript);
	hljs.registerLanguage('xml', xml);

	let codeElement: HTMLElement;

	function escapeHtml(value: string): string {
		return value
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#x27;');
	}

	const dispatch = createEventDispatcher();

	export let autodetect = true;
	export let language = '';
	export let ignoreIllegals = true;
	export let code: string;

	let copying = 0;
	let highlightedCode: string;
	$: cannotDetectLanguage = !autodetect && !hljs.getLanguage(language);

	$: className = cannotDetectLanguage
		? ''
		: `hljs ${language} ${$$props.class ?? ''}`;
	$: {
		if (cannotDetectLanguage) {
			highlightedCode = escapeHtml(code);
		}

		if (autodetect) {
			const result = hljs.highlightAuto(code);
			dispatch('setLanguage', result.language ?? '');
			highlightedCode = result.value;
		} else {
			const result = hljs.highlight(code, {
				language,
				ignoreIllegals
			});
			highlightedCode = result.value;
		}
	}

	$: if (codeElement) {
		codeElement.innerHTML = highlightedCode;
	}

	const onCopy = () => {
		copy(code);
		copying++;
		setTimeout(() => {
			copying--;
		}, 2000);
	};
</script>

<div class="outerWrapper">
	<button class="copyButton" on:click={onCopy} aria-label="Copy code">
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

	<div class="wrapper">
		<div class={`${className} root`}>
			<div />
			<code bind:this={codeElement} />
		</div>
	</div>
</div>

<style>
	.root {
		padding: 16px;
		margin: 0;
		background: var(--gray1);
		border-radius: 0;
		position: relative;
		line-height: 17px;
		white-space: pre-wrap;
		background: linear-gradient(to top, var(--gray2), var(--gray1) 16px);
	}

	.wrapper {
		overflow: hidden;
		margin: 0;
		position: relative;
		border-radius: 6px;
		margin-top: 16px;
		border: 1px solid var(--gray3);
	}

	.copyButton {
		position: absolute;
		top: 12px;
		right: 12px;
		z-index: 1;
		width: 26px;
		height: 26px;
		border: 1px solid var(--gray4);
		border-radius: 6px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--gray0);
		cursor: pointer;
		opacity: 0;
		color: var(--gray12);
		transition:
			background 200ms,
			box-shadow 200ms,
			opacity 200ms;
	}

	.copyButton:hover {
		background: var(--gray1);
	}

	.copyButton:focus-visible {
		box-shadow: 0 0 0 1px var(--gray4);
	}

	.copyButton > div {
		display: flex;
	}

	.outerWrapper {
		position: relative;
	}

	.outerWrapper:hover .copyButton {
		opacity: 1;
	}
</style>
