import { describe, it } from 'vitest';
import PropsToastTest from './PropsToastTest.svelte';
import MultiToasterTest from './MultiToasterTest.svelte';
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

describe('Toaster', () => {
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

	it('shows a toast created before the Toaster mounts', async () => {
		toast('Created before mount');

		const { getByText } = setup({ cb: () => {} });

		await waitFor(() => expect(getByText('Created before mount')).toBeVisible());
	});

	it('routes toasts to the toaster matching their toasterId', async () => {
		const user = userEvent.setup();
		const { getByTestId } = render(MultiToasterTest, {
			props: {
				cb: () => {
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
				cb: () => {
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
