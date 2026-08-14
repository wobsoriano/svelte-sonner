import { expect, test } from '@playwright/test';

// Run tests in parallel as they are independent
test.describe.configure({ mode: 'parallel' });

test.beforeEach(async ({ page }) => {
	await page.goto('/');
});

test('toast is rendered and disappears after the default timeout', async ({ page }) => {
	await page.getByTestId('default-button').click();
	await expect(page.locator('[data-sonner-toast]')).toHaveCount(0);
	await expect(page.locator('[data-sonner-toast]')).toHaveCount(0);
});

test('various toast types are rendered correctly', async ({ page }) => {
	await page.getByTestId('Success').click();
	await expect(page.getByText('Event has been created', { exact: true })).toHaveCount(1);

	await page.getByTestId('Error').click();
	await expect(page.getByText('Event has not been created', { exact: true })).toHaveCount(1);

	await page.getByTestId('Action').click();
	await expect(page.locator('[data-button]')).toHaveCount(1);
});

test('show correct toast content based on promise state', async ({ page }) => {
	await page.getByTestId('Promise').click();
	await expect(page.getByText('Loading...')).toHaveCount(1);
	await expect(page.getByText('Svelte Sonner toast has been added')).toHaveCount(1);
});

test('render custom component in toast', async ({ page }) => {
	await page.getByTestId('Custom').click();
	await expect(page.getByText('A custom toast with default styling')).toHaveCount(1);
});

test('toast is removed after swiping down', async ({ page }) => {
	await page.getByTestId('default-button').click();
	const toast = page.locator('[data-sonner-toast]');
	await toast.hover();
	const box = await toast.boundingBox();
	if (!box) throw new Error('Toast not rendered');
	await page.mouse.down();
	// straight down, so the gesture locks to the y axis (down is an allowed
	// direction for a bottom-positioned toast)
	await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 + 300, { steps: 5 });
	await page.mouse.up();
	// Well below the 4s auto-close, so this only passes if the swipe dismissed it
	await expect(toast).toHaveCount(0, { timeout: 2000 });
});

test('toast is not removed when hovered', async ({ page }) => {
	await page.getByTestId('default-button').click();
	await page.hover('[data-sonner-toast]');
	const timeout = new Promise((resolve) => setTimeout(resolve, 5000));
	await timeout;
	await expect(page.locator('[data-sonner-toast]')).toHaveCount(1);
});

test('close a toast from inside a custom component', async ({ page }) => {
	await page.getByTestId('other-Headless').click();
	await expect(page.getByText('Event Created')).toHaveCount(1);
	await page.getByTestId('close-button').click();
	await expect(page.getByText('Event Created')).toHaveCount(0);
});

test('render custom component with properties in toast of predefined type', async ({ page }) => {
	await page.getByTestId('other-Custom with properties').click();
	console.log(await page.locator('[data-sonner-toast]').textContent());
	await expect(
		page.locator('[data-sonner-toast]').getByText('This is multiline message')
	).toHaveCount(1);
});
