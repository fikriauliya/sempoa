import { test, expect } from '@playwright/test';
import { TEST_CONFIG } from './test-config'

test.describe('Horizontal Separator Width', () => {
  // Test different viewport dimensions where the issue might occur
  const viewports = [
    { width: 320, height: 568, name: 'iPhone SE' },
    { width: 375, height: 667, name: 'iPhone 8' },
    { width: 414, height: 896, name: 'iPhone 11 Pro Max' },
    { width: 768, height: 1024, name: 'iPad' },
    { width: 1024, height: 768, name: 'iPad Landscape' },
    { width: 1200, height: 800, name: 'Desktop Small' },
    { width: 1440, height: 900, name: 'Desktop Medium' },
    { width: 1920, height: 1080, name: 'Desktop Large' }
  ];

  for (const viewport of viewports) {
    test(`horizontal separator should fill entire board width on ${viewport.name} (${viewport.width}x${viewport.height})`, async ({ page }) => {
      // Set viewport size
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      
      // Navigate to the sempoa application
      await page.goto(TEST_CONFIG.BASE_URL);
      
      // Wait for the sempoa board to load
      await page.waitForSelector('[data-testid="sempoa-board"]', { timeout: 10000 });
      
      // Get the sempoa board container
      const sempoaBoard = page.locator('[data-testid="sempoa-board"]');
      await expect(sempoaBoard).toBeVisible();
      
      // Get the board's bounding box
      const boardBox = await sempoaBoard.boundingBox();
      expect(boardBox).not.toBeNull();
      
      // Find the horizontal separator
      const separator = page.locator('.bg-amber-900.rounded-full').first();
      await expect(separator).toBeVisible();
      
      // Get the separator's bounding box
      const separatorBox = await separator.boundingBox();
      expect(separatorBox).not.toBeNull();
      
      // Calculate the expected separator bounds
      // The separator should span from the leftmost to rightmost column
      const leftmostColumn = page.locator('[data-testid^="column-"]').first();
      const rightmostColumn = page.locator('[data-testid^="column-"]').last();
      
      const leftmostBox = await leftmostColumn.boundingBox();
      const rightmostBox = await rightmostColumn.boundingBox();
      
      expect(leftmostBox).not.toBeNull();
      expect(rightmostBox).not.toBeNull();
      
      // The separator should start at or before the leftmost column
      // and end at or after the rightmost column
      const expectedLeftEdge = leftmostBox!.x;
      const expectedRightEdge = rightmostBox!.x + rightmostBox!.width;
      const expectedWidth = expectedRightEdge - expectedLeftEdge;
      
      // Verify separator spans the full width with some tolerance
      const tolerance = 8; // 8px tolerance for minor rendering differences on small screens
      
      expect(separatorBox!.x).toBeLessThanOrEqual(expectedLeftEdge + tolerance);
      expect(separatorBox!.x + separatorBox!.width).toBeGreaterThanOrEqual(expectedRightEdge - tolerance);
      
      // Additional check: separator width should be at least 90% of expected width
      const actualWidth = separatorBox!.width;
      expect(actualWidth).toBeGreaterThanOrEqual(expectedWidth * 0.9);
      
      // Log dimensions for debugging
      console.log(`${viewport.name}: Board width: ${boardBox!.width}, Separator width: ${actualWidth}, Expected width: ${expectedWidth}`);
    });
  }
  
  test('horizontal separator visual alignment', async ({ page }) => {
    await page.goto(TEST_CONFIG.BASE_URL);
    await page.waitForSelector('[data-testid="sempoa-board"]');
    
    // Take screenshot for visual verification
    await page.screenshot({ 
      path: `tests/screenshots/separator-alignment.png`,
      fullPage: true 
    });
    
    // Check that separator is horizontally centered
    const separator = page.locator('.bg-amber-900.rounded-full').first();
    const board = page.locator('[data-testid="sempoa-board"]');
    
    const separatorBox = await separator.boundingBox();
    const boardBox = await board.boundingBox();
    
    expect(separatorBox).not.toBeNull();
    expect(boardBox).not.toBeNull();
    
    // Calculate center positions
    const separatorCenter = separatorBox!.x + separatorBox!.width / 2;
    const boardCenter = boardBox!.x + boardBox!.width / 2;
    
    // Separator should be centered within the board (with tolerance)
    const centerTolerance = 10;
    expect(Math.abs(separatorCenter - boardCenter)).toBeLessThanOrEqual(centerTolerance);
  });
});