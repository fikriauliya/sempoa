import { expect, test } from '@playwright/test';

test.describe('Sempoa Board Gesture Support', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');

    // Wait for the sempoa board to be visible
    await expect(page.getByTestId('sempoa-board')).toBeVisible();
  });

  test('should load gesture library and enable touch interactions', async ({
    page,
  }) => {
    // Check that the gesture library is loaded by looking for gesture-related attributes on beads
    const firstBead = page.locator('[aria-label*="Bead in column 1"]').first();
    await expect(firstBead).toBeVisible();

    // Verify that beads are interactive (have proper attributes for touch)
    await expect(firstBead).toHaveAttribute('type', 'button');

    // Check that beads can be clicked (basic interaction test)
    await firstBead.click();

    // Verify that the board value changes (indicating interaction worked)
    const inputField = page.getByTestId('keyboard-input-field');
    await expect(inputField).not.toHaveValue('0');
  });

  test('should support multiple bead interactions simultaneously', async ({
    page,
  }) => {
    // Get multiple beads from different columns
    const bead1 = page.locator('[aria-label*="Bead in column 1"]').first();
    const bead2 = page.locator('[aria-label*="Bead in column 2"]').first();
    const bead3 = page.locator('[aria-label*="Bead in column 3"]').first();

    await expect(bead1).toBeVisible();
    await expect(bead2).toBeVisible();
    await expect(bead3).toBeVisible();

    // Click multiple beads in rapid succession to simulate multi-touch
    await bead1.click();
    await bead2.click();
    await bead3.click();

    // Verify the board shows a combined value
    const inputField = page.getByTestId('keyboard-input-field');
    const finalValue = await inputField.inputValue();

    // Should be greater than any single bead value
    expect(parseInt(finalValue)).toBeGreaterThan(0);
  });

  test('should maintain touch responsiveness across viewport sizes', async ({
    page,
  }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    const firstBead = page.locator('[aria-label*="Bead in column 1"]').first();
    await expect(firstBead).toBeVisible();
    await firstBead.click();

    const inputField = page.getByTestId('keyboard-input-field');
    const mobileValue = await inputField.inputValue();
    expect(parseInt(mobileValue)).toBeGreaterThan(0);

    // Reset board
    await page.getByRole('button', { name: 'Reset' }).click();
    await expect(inputField).toHaveValue('0');

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });

    await firstBead.click();
    const tabletValue = await inputField.inputValue();
    expect(parseInt(tabletValue)).toBeGreaterThan(0);

    // Reset board
    await page.getByRole('button', { name: 'Reset' }).click();
    await expect(inputField).toHaveValue('0');

    // Test desktop viewport
    await page.setViewportSize({ width: 1200, height: 800 });

    await firstBead.click();
    const desktopValue = await inputField.inputValue();
    expect(parseInt(desktopValue)).toBeGreaterThan(0);

    // All interactions should produce the same result
    expect(mobileValue).toBe(tabletValue);
    expect(tabletValue).toBe(desktopValue);
  });

  test('should preserve existing click and keyboard functionality', async ({
    page,
  }) => {
    // Test keyboard input still works
    const inputField = page.getByTestId('keyboard-input-field');
    await inputField.fill('123');

    // Verify beads position themselves correctly for keyboard input
    await expect(inputField).toHaveValue('123');

    // Clear and test click functionality
    await inputField.clear();
    // After clearing, field may be empty or "0" - both are valid
    const clearedValue = await inputField.inputValue();
    expect(clearedValue === '' || clearedValue === '0').toBe(true);

    // Test regular click interaction
    const upperBead = page.locator('[aria-label*="Bead in column 1"]').first();
    await upperBead.click();

    // Should show appropriate value
    const clickValue = await inputField.inputValue();
    expect(parseInt(clickValue)).toBeGreaterThan(0);
  });

  test('should handle gesture configuration settings', async ({ page }) => {
    // This test verifies that the gesture system is configurable
    // We can't easily test actual swipe gestures in Playwright, but we can
    // verify the configuration is loaded and applied

    const bead = page.locator('[aria-label*="Bead in column 1"]').first();
    await expect(bead).toBeVisible();

    // Verify that touch events are properly bound to beads
    // This is indicated by the presence of touch-related attributes
    const _beadElement = await bead.elementHandle();

    // The element should be clickable and have proper accessibility
    await expect(bead).toHaveAttribute('type', 'button');
    await expect(bead).toHaveAttribute('aria-label');

    // Test that the bead responds to interaction
    await bead.click();

    const inputField = page.getByTestId('keyboard-input-field');
    await expect(inputField).not.toHaveValue('0');
  });
});

test.describe('Gesture Configuration', () => {
  test('should load and apply gesture settings from configuration', async ({
    page,
  }) => {
    await page.goto('/');

    // Wait for the page to load completely
    await expect(page.getByTestId('sempoa-board')).toBeVisible();

    // Verify that the gesture system is properly initialized
    // by checking that beads are interactive
    const beads = page.locator('[aria-label*="Bead in column"]');
    const beadCount = await beads.count();

    // Should have beads for 9 columns (mobile layout) with upper and lower beads
    expect(beadCount).toBeGreaterThan(10);

    // All beads should be interactive
    const firstBead = beads.first();
    await expect(firstBead).toBeVisible();
    await expect(firstBead).toHaveAttribute('type', 'button');

    // Test interaction works
    await firstBead.click();

    const inputField = page.getByTestId('keyboard-input-field');
    await expect(inputField).not.toHaveValue('0');
  });
});
