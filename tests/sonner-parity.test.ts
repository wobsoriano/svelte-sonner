import { expect, test } from '@playwright/test';

// Browser-level ports of the regression tests added in emilkowalski/sonner#777,
// driven by the dedicated /test route.
test.describe.configure({ mode: 'parallel' });

test.beforeEach(async ({ page }) => {
	await page.goto('/test');
});

test('classNames.default is only applied to toasts without a type', async ({ page }) => {
	await page.getByTestId('default-button').click();
	await expect(page.locator('[data-sonner-toast]')).toHaveClass(/default-toast-classname/);

	await page.getByTestId('success').click();
	const successToast = page.locator('[data-sonner-toast][data-type="success"]');
	await expect(successToast).toHaveClass(/success-toast-classname/);
	await expect(successToast).not.toHaveClass(/default-toast-classname/);
});

test('custom icon is only rendered once in a promise toast', async ({ page }) => {
	await page.getByTestId('promise-custom-icon').click();
	await expect(page.getByText('Loading...')).toHaveCount(1);

	await expect(page.getByText('Loaded')).toHaveCount(1);
	await expect(page.getByTestId('custom-success-icon')).toHaveCount(1);
});

test('icons are hidden from assistive technology', async ({ page }) => {
	await page.getByTestId('success').click();
	await expect(page.locator('[data-sonner-toast] [data-icon] svg')).toHaveAttribute(
		'aria-hidden',
		'true'
	);
});

test('toast created before the Toaster mounts is still shown', async ({ page }) => {
	await page.goto('/test?toastOnMount');
	await expect(page.getByText('Toast rendered on mount')).toHaveCount(1);
});

test('toast recreated right after being dismissed stays on screen', async ({ page }) => {
	await page.getByTestId('dismiss-and-recreate').click();

	// The pending removal must not take the newly created toast down with it
	await page.waitForTimeout(500);
	await expect(page.getByText('Remounted toast')).toHaveCount(1);
});

test('toast is not dismissed by a fast swipe in a direction that is not allowed', async ({
	page
}) => {
	await page.goto('/test?position=top-center&swipeDirections=top,right');
	await page.getByTestId('default-button').click();

	const toast = page.locator('[data-sonner-toast]');
	// hover() waits for the enter animation to finish, so the toast is where
	// boundingBox() says it is before the pointer gestures start
	await toast.hover();
	const box = await toast.boundingBox();
	if (!box) throw new Error('Toast not rendered');

	// Fast flick to the left; `left` is not in swipeDirections
	await page.mouse.down();
	await page.mouse.move(box.x - 200, box.y + box.height / 2, { steps: 5 });
	await page.mouse.up();

	// Long enough for the exit animation to have removed the toast if it had been dismissed
	await page.waitForTimeout(500);
	await expect(toast).toHaveCount(1);
});

test('toast is dismissed by a fast swipe in an allowed direction', async ({ page }) => {
	await page.goto('/test?position=top-center&swipeDirections=top,right');
	await page.getByTestId('default-button').click();

	const toast = page.locator('[data-sonner-toast]');
	await toast.hover();
	const box = await toast.boundingBox();
	if (!box) throw new Error('Toast not rendered');

	await page.mouse.down();
	await page.mouse.move(box.x + box.width + 200, box.y + box.height / 2, { steps: 5 });
	await page.mouse.up();

	// Well below the 4s auto-close, so this only passes if the swipe dismissed it
	await expect(toast).toHaveCount(0, { timeout: 2000 });
});

test('toast is dismissed by a fast flick below the distance threshold', async ({ page }) => {
	await page.goto('/test?position=top-center&swipeDirections=right');
	await page.getByTestId('default-button').click();

	const toast = page.locator('[data-sonner-toast]');
	await toast.hover();
	const box = await toast.boundingBox();
	if (!box) throw new Error('Toast not rendered');

	await page.mouse.down();
	await page.mouse.move(box.x + box.width / 2 + 20, box.y + box.height / 2);
	await page.mouse.up();

	// The 20px movement is below SWIPE_THRESHOLD, so only velocity can dismiss it.
	await expect(toast).toHaveCount(0, { timeout: 2000 });
});

test('description fills the width of the toast', async ({ page }) => {
	await page.getByTestId('component-description').click();

	const description = await page.getByTestId('wide-description').boundingBox();
	const toast = await page.locator('[data-sonner-toast]').boundingBox();
	if (!description || !toast) throw new Error('Toast not rendered');

	// Full width minus the padding and the icon-less content offset
	expect(description.width).toBeGreaterThan(toast.width - 60);
});

test('action button stays right aligned', async ({ page }) => {
	await page.getByTestId('action').click();

	const button = await page.locator('[data-button]').boundingBox();
	const toast = await page.locator('[data-sonner-toast]').boundingBox();
	if (!button || !toast) throw new Error('Toast not rendered');

	expect(button.x + button.width).toBeGreaterThan(toast.x + toast.width - 30);
});

test('toasts are routed to the toaster matching their toasterId', async ({ page }) => {
	await page.goto('/test?secondToaster');

	await page.getByTestId('toast-to-secondary').click();
	await page.getByTestId('default-button').click();

	// The secondary toaster sits top-left, the default one bottom-right
	const secondaryList = page.locator('[data-sonner-toaster][data-y-position="top"]');
	const defaultList = page.locator('[data-sonner-toaster][data-y-position="bottom"]');

	await expect(secondaryList.getByText('Secondary toast')).toHaveCount(1);
	await expect(secondaryList.getByText('My default toast')).toHaveCount(0);
	await expect(defaultList.getByText('My default toast')).toHaveCount(1);
	await expect(defaultList.getByText('Secondary toast')).toHaveCount(0);
});
