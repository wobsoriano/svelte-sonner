import { beforeEach, describe, expect, it } from 'vitest';
import { render, waitFor, within } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import MultipleToasterTest from './MultipleToasterTest.svelte';
import { toastState } from '$lib/toast-state.svelte.js';

function setup() {
	const user = userEvent.setup();
	const returned = render(MultipleToasterTest);

	return {
		user,
		...returned
	};
}

function getToaster(
	container: HTMLElement,
	y: 'top' | 'bottom',
	x: 'right' | 'left'
): HTMLOListElement {
	const toaster = container.querySelector<HTMLOListElement>(
		`[data-sonner-toaster][data-y-position="${y}"][data-x-position="${x}"]`
	);

	if (!toaster) {
		throw new Error(`Expected toaster at ${y}-${x} to be rendered`);
	}

	return toaster;
}

describe('Toaster id', () => {
	beforeEach(() => {
		toastState.reset();
	});

	it('toast with toasterId only appears in the correct Toaster', async () => {
		const { user, getByTestId, container } = setup();

		await user.click(getByTestId('toast-secondary'));
		const secondaryToaster = getToaster(container, 'top', 'left');

		await waitFor(() => {
			expect(within(secondaryToaster).queryAllByText('Secondary Toaster Toast')).toHaveLength(
				1
			);
		});

		const globalToaster = container.querySelector<HTMLOListElement>(
			'[data-sonner-toaster][data-x-position="right"][data-y-position="bottom"]'
		);
		expect(
			globalToaster
				? within(globalToaster).queryAllByText('Secondary Toaster Toast').length
				: 0
		).toBe(0);
	});

	it('toast without toasterId only appears in the global Toaster', async () => {
		const { user, getByTestId, container } = setup();

		await user.click(getByTestId('toast-global'));
		const globalToaster = getToaster(container, 'bottom', 'right');
		await waitFor(() => {
			expect(within(globalToaster).queryAllByText('Global Toaster Toast')).toHaveLength(1);
		});

		const secondaryToaster = container.querySelector<HTMLOListElement>(
			'[data-sonner-toaster][data-x-position="left"][data-y-position="top"]'
		);
		expect(
			secondaryToaster
				? within(secondaryToaster).queryAllByText('Global Toaster Toast').length
				: 0
		).toBe(0);
	});
});
