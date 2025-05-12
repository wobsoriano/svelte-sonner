import { describe, it } from 'vitest';
import ToastTest, { type ToastTestProps } from './ToastTest.svelte';
import { render, waitFor } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import { toastState } from '$lib/toast-state.svelte.js';
import { sleep } from './utils.js';

function setup(props: ToastTestProps) {
	const user = userEvent.setup();
	const returned = render(ToastTest, { props });
	const trigger = returned.getByTestId('trigger');

	return {
		trigger,
		user,
		...returned
	};
}

describe('Toast', () => {
	beforeEach(() => {
		toastState.reset();
	});

	it('should show a toast', async () => {
		const { user, trigger, container, getByText } = setup({
			cb: (toast) => toast('Hello world')
		});

		await user.click(trigger);
		expect(getByText('Hello world')).toBeVisible();

		const toasts = Array.from(container.querySelectorAll<HTMLElement>('[data-sonner-toast]'));
		expect(toasts.length).toBe(1);
	});

	it('should show a toast with a custom duration', async () => {
		const { user, trigger, queryByText } = setup({
			cb: (toast) => toast('Hello world', { duration: 300 })
		});

		expect(queryByText('Hello world')).toBeNull();

		await user.click(trigger);
		waitFor(() => expect(queryByText('Hello world')).not.toBeNull());

		await sleep(500);
		expect(queryByText('Hello world')).toBeNull();
	});

	it('should focus the toast when hotkey is pressed', async () => {
		const { user, trigger, getByText } = setup({
			cb: (toast) => toast('Hello world', { duration: 5000 })
		});

		await user.click(trigger);
		expect(getByText('Hello world')).toBeVisible();

		await user.keyboard('{Alt>}T{/Alt}');
		await sleep(100);
		expect(document.activeElement).toBeInstanceOf(HTMLOListElement);
	});

	it('should not immediately close the toast when reset', async () => {
		const { user, trigger, getByText, queryByText } = setup({
			cb: (toast) => {
				const id = toast('Loading', { duration: 4000 });

				setTimeout(() => {
					toast.success('Finished loading!', { id });
				}, 1000);
			}
		});

		await user.click(trigger);
		expect(getByText('Loading')).toBeVisible();
		await sleep(2050);
		expect(queryByText('Loading')).toBeNull();
		expect(getByText('Finished loading!')).toBeVisible();
		await sleep(1000);
		expect(getByText('Finished loading!')).toBeVisible();
	});

	it('should reset duration on a toast update', async () => {
		const { user, trigger, getByText, queryByText } = setup({
			cb: (toast) => {
				const id = toast('Loading', { duration: 1000 });

				setTimeout(() => {
					toast.success('Finished loading!', { id });
				}, 750);
			}
		});

		await user.click(trigger);
		expect(getByText('Loading')).toBeVisible();
		await sleep(800);
		expect(queryByText('Loading')).toBeNull();
		expect(getByText('Finished loading!')).toBeVisible();
		// there would only be ~.5 second left on the original toast
		// so we're gonna wait 2 seconds to make sure the timer is reset
		await sleep(600);
		expect(getByText('Finished loading!')).toBeVisible();
		// finally we'll wait another 1500ms to make sure the toast closes after 2 seconds
		// since the original toast had a duration of 2 seconds
		await sleep(600);
		expect(queryByText('Finished loading!')).toBeNull();
	});

	it('should allow duration updates on toast update', async () => {
		const { user, trigger, getByText, queryByText } = setup({
			cb: (toast) => {
				const id = toast('Loading', { duration: 2000 });

				setTimeout(() => {
					toast.success('Finished loading!', { id, duration: 4000 });
				}, 1000);
			}
		});

		await user.click(trigger);
		expect(getByText('Loading')).toBeVisible();
		await sleep(1200);
		expect(queryByText('Loading')).toBeNull();
		expect(getByText('Finished loading!')).toBeVisible();
		await sleep(2200);
		expect(getByText('Finished loading!')).toBeVisible();
	});
});
