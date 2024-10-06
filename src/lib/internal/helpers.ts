export function cn(...classes: (string | undefined)[]) {
	return classes.filter(Boolean).join(' ');
}

export const isBrowser = typeof document !== 'undefined';
