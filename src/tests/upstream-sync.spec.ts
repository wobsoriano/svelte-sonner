import { describe, it } from 'vitest';
import PropsToastTest from './PropsToastTest.svelte';
import MultiToasterTest from './MultiToasterTest.svelte';
import TestIcon from './TestIcon.svelte';
import { render, waitFor } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import { toast, toastState } from '$lib/toast-state.svelte.js';
import { sleep } from './utils.js';
import type { ToasterProps } from '$lib/index.js';

function setup(props: { cb: (t: typeof toast) => void } & ToasterProps) {
	const user = userEvent.setup();
	const returned = render(PropsToastTest, { props });
	const trigger = returned.getByTestId('trigger');

	return {
		trigger,
		user,
		...returned
	};
}

// Ports of the fixes batched in emilkowalski/sonner#777
describe('upstream sonner#777 parity', () => {
	beforeEach(() => {
		toastState.reset();
	});

	it('applies classes.default only to toasts without a type', async () => {
		const { user, trigger, container } = setup({
			cb: (toast) => {
				toast('Plain toast');
				toast.success('Success toast');
			},
			toastOptions: {
				classes: {
					default: 'default-toast-class',
					success: 'success-toast-class'
				}
			}
		});

		await user.click(trigger);

		const plain = container.querySelector('[data-sonner-toast][data-type="default"]');
		const success = container.querySelector('[data-sonner-toast][data-type="success"]');

		expect(plain).toHaveClass('default-toast-class');
		expect(success).toHaveClass('success-toast-class');
		expect(success).not.toHaveClass('default-toast-class');
	});

	it('renders a custom icon only once in a settled promise toast', async () => {
		let resolve: (value: string) => void;
		const promise = new Promise<string>((res) => {
			resolve = res;
		});

		const { user, trigger, getAllByTestId, getByText } = setup({
			cb: (toast) => {
				toast.promise(promise, {
					loading: 'Loading...',
					success: 'Loaded',
					icon: TestIcon
				});
			}
		});

		await user.click(trigger);
		expect(getByText('Loading...')).toBeVisible();

		resolve!('done');
		await waitFor(() => expect(getByText('Loaded')).toBeVisible());
		expect(getAllByTestId('custom-icon').length).toBe(1);
	});

	it('hides default icons from assistive technology', async () => {
		const { user, trigger, container } = setup({
			cb: (toast) => toast.success('Success toast', { closeButton: true })
		});

		await user.click(trigger);

		const typeIcon = container.querySelector('[data-sonner-toast] [data-icon] svg');
		expect(typeIcon).toHaveAttribute('aria-hidden', 'true');

		const closeIcon = container.querySelector('[data-sonner-toast] [data-close-button] svg');
		expect(closeIcon).toHaveAttribute('aria-hidden', 'true');
	});

	it('clears the loading state when toast() reuses the id of a loading toast', async () => {
		const { user, trigger, container, getByText } = setup({
			cb: (toast) => {
				const id = toast.loading('Loading forever');
				setTimeout(() => toast('Done', { id }), 100);
			}
		});

		await user.click(trigger);
		expect(container.querySelector('[data-sonner-toast]')).toHaveAttribute(
			'data-type',
			'loading'
		);

		await sleep(200);
		expect(getByText('Done')).toBeVisible();
		expect(container.querySelector('[data-sonner-toast]')).toHaveAttribute(
			'data-type',
			'default'
		);
	});

	it('clears the loading state when toast.custom() reuses the id of a loading toast', async () => {
		const { user, trigger, container } = setup({
			cb: (toast) => {
				const id = toast.loading('Loading forever');
				setTimeout(() => toast.custom(TestIcon, { id }), 100);
			}
		});

		await user.click(trigger);
		expect(container.querySelector('[data-sonner-toast]')).toHaveAttribute(
			'data-type',
			'loading'
		);

		await sleep(200);
		expect(container.querySelector('[data-sonner-toast]')).not.toHaveAttribute(
			'data-type',
			'loading'
		);
	});

	it('shows a toast created before the Toaster mounts', async () => {
		toast('Created before mount');

		const { getByText } = setup({ cb: () => {} });

		await waitFor(() => expect(getByText('Created before mount')).toBeVisible());
	});

	it('does not leak props into a new toast reusing a dismissed toast id', async () => {
		const { user, trigger, getByText, queryByText } = setup({
			cb: (toast) => {
				const id = toast('With action', {
					action: { label: 'Undo', onClick: () => {} }
				});
				toast.dismiss(id);
				toast('Without action', { id });
			}
		});

		await user.click(trigger);
		await waitFor(() => expect(getByText('Without action')).toBeVisible());
		expect(queryByText('Undo')).toBeNull();
	});

	it('keeps a toast recreated during the exit animation window on screen', async () => {
		const { user, trigger, getByText } = setup({
			cb: (toast) => {
				const id = toast('Original toast');
				toast.dismiss(id);
				// recreate while the 200ms exit-animation removal is still pending
				setTimeout(() => toast('Remounted toast', { id }), 100);
			}
		});

		await user.click(trigger);
		await sleep(500);
		expect(getByText('Remounted toast')).toBeVisible();
		expect(document.querySelector('[data-sonner-toast][data-removed="true"]')).toBeNull();
	});

	it('treats an id reused after a close-button dismissal as a new toast', async () => {
		let onDismissCalls = 0;
		let toastId: string | number;
		const { user, trigger, container, getByText, queryByText } = setup({
			cb: (toast) => {
				toastId = toast('Closable toast', {
					closeButton: true,
					action: { label: 'Undo', onClick: () => {} },
					onDismiss: () => onDismissCalls++
				});
			}
		});

		await user.click(trigger);
		expect(getByText('Closable toast')).toBeVisible();

		const closeButton = container.querySelector<HTMLButtonElement>('[data-close-button]');
		await user.click(closeButton!);
		expect(onDismissCalls).toBe(1);

		toast('Recreated toast', { id: toastId! });
		await waitFor(() => expect(getByText('Recreated toast')).toBeVisible());
		expect(queryByText('Undo')).toBeNull();
		expect(onDismissCalls).toBe(1);
	});

	it('keeps an explicit id of 0 in toast.custom()', async () => {
		let returnedId: string | number | undefined;
		const { user, trigger } = setup({
			cb: (toast) => {
				returnedId = toast.custom(TestIcon, { id: 0 });
			}
		});

		await user.click(trigger);
		expect(returnedId).toBe(0);
		expect(toastState.toasts[0]?.id).toBe(0);
	});

	it('routes toasts to the toaster matching their toasterId', async () => {
		const user = userEvent.setup();
		const { getByTestId } = render(MultiToasterTest, {
			props: {
				cb: (toast: typeof import('$lib/toast-state.svelte.js').toast) => {
					toast('For the default toaster');
					toast('For the named toaster', { toasterId: 'secondary' });
				}
			}
		});

		await user.click(getByTestId('trigger'));

		const defaultToaster = getByTestId('default-toaster');
		const namedToaster = getByTestId('named-toaster');

		expect(defaultToaster).toHaveTextContent('For the default toaster');
		expect(defaultToaster).not.toHaveTextContent('For the named toaster');
		expect(namedToaster).toHaveTextContent('For the named toaster');
		expect(namedToaster).not.toHaveTextContent('For the default toaster');
	});

	it('dismisses toasts across all toasters with toast.dismiss()', async () => {
		const user = userEvent.setup();
		const { getByTestId } = render(MultiToasterTest, {
			props: {
				cb: (toast: typeof import('$lib/toast-state.svelte.js').toast) => {
					toast('Default toast');
					toast('Named toast', { toasterId: 'secondary' });
					setTimeout(() => toast.dismiss(), 100);
				}
			}
		});

		await user.click(getByTestId('trigger'));
		expect(getByTestId('default-toaster')).toHaveTextContent('Default toast');

		await sleep(500);
		expect(
			document.querySelectorAll('[data-sonner-toast]:not([data-removed="true"])').length
		).toBe(0);
	});

	it('uses the gap prop in the offset math', async () => {
		const { user, trigger, container } = setup({
			cb: (toast) => {
				toast('First toast');
				toast('Second toast');
			},
			gap: 20
		});

		await user.click(trigger);

		const offsets = Array.from(
			container.querySelectorAll<HTMLElement>('[data-sonner-toast]')
		).map((el) => el.style.getPropertyValue('--offset'));

		// jsdom measures zero heights, so the non-front toast's offset is exactly the gap
		expect(offsets).toContain('20px');
	});

	it('shows the close button when set via toastOptions', async () => {
		const { user, trigger, container } = setup({
			cb: (toast) => toast('With close button'),
			toastOptions: { closeButton: true }
		});

		await user.click(trigger);
		expect(container.querySelector('[data-close-button]')).not.toBeNull();
	});
});
