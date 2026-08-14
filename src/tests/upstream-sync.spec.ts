import { describe, it } from 'vitest';
import PropsToastTest from './PropsToastTest.svelte';
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
});
