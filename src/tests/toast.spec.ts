import { describe, it } from 'vitest';
import type { ToastTestProps } from './ToastTest.svelte';
import ToastTest from './ToastTest.svelte';
import { render, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { toastState } from '$lib/state';
import { sleep } from './utils';

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
});
