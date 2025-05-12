import { SonnerState } from '$lib/toast-state.svelte.js';
import { Context } from 'runed';

export const richColorsContext = new Context<{ setRichColors: (value: boolean) => void }>(
	'richColorsContext'
);

export const sonnerContext = new Context<SonnerState>('<Toaster/>');
