import { test, expect } from '@playwright/test';
import { TEST_CONFIG } from './test-config'

test.describe('Sempoa Board - UI Layout & Responsive Design', () => {
  // Test viewport configurations for responsive testing
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

  test.beforeEach(async ({ page }) => {
    await page.goto(TEST_CONFIG.BASE_URL);
    await expect(page.getByRole('heading', { name: 'Sempoa Board' })).toBeVisible();
  });

  test.describe('Column Header Alignment', () => {
    test('should verify column headers are centered above their respective bead columns', async ({ page }) => {
      // Get column headers and bead columns
      const columnHeaders = page.locator('.column-header');
      const boardContainer = page.locator('.bg-amber-100.rounded.border-2.border-amber-800')
        .locator('.flex.justify-center.gap-2').first();
      const beadColumns = boardContainer.locator('> div');
      
      // Verify we have 7 headers and 7 columns
      await expect(columnHeaders).toHaveCount(7);
      await expect(beadColumns).toHaveCount(7);
      
      // Test alignment for each column
      for (let i = 0; i < 7; i++) {
        const header = columnHeaders.nth(i);
        const column = beadColumns.nth(i);
        
        // Get bounding boxes
        const headerBox = await header.boundingBox();
        const columnBox = await column.boundingBox();
        
        if (headerBox && columnBox) {
          // Calculate centers
          const headerCenter = headerBox.x + headerBox.width / 2;
          const columnCenter = columnBox.x + columnBox.width / 2;
          
          // Headers should be horizontally centered above their columns (within 5px tolerance)
          expect(Math.abs(headerCenter - columnCenter)).toBeLessThan(5);
          
          // Headers should be positioned above the columns
          expect(headerBox.y).toBeLessThan(columnBox.y);
        }
      }
    });

    test('should display place values in readable format within limited space', async ({ page }) => {
      const columnHeaders = page.locator('.column-header');
      
      // Verify all 7 headers are visible and readable
      await expect(columnHeaders).toHaveCount(7);
      
      // Check that headers contain place value information
      const expectedValues = ['1,000,000', '100,000', '10,000', '1,000', '100', '10', '1'];
      
      for (let i = 0; i < 7; i++) {
        const header = columnHeaders.nth(i);
        await expect(header).toBeVisible();
        
        // Verify the header contains the expected place value (allowing for abbreviated forms)
        const headerText = await header.textContent();
        const expectedValue = expectedValues[i];
        
        // Should contain either full number or abbreviated form
        const containsFullNumber = headerText?.includes(expectedValue);
        const containsAbbreviation = 
          (expectedValue === '1,000,000' && headerText?.includes('1M')) ||
          (expectedValue === '100,000' && headerText?.includes('100K')) ||
          (expectedValue === '10,000' && headerText?.includes('10K')) ||
          (expectedValue === '1,000' && headerText?.includes('1K')) ||
          (expectedValue === '100' && headerText?.includes('100')) ||
          (expectedValue === '10' && headerText?.includes('10')) ||
          (expectedValue === '1' && headerText?.includes('1'));
        
        expect(containsFullNumber || containsAbbreviation).toBeTruthy();
      }
    });

    test('should not interfere with bead interaction areas', async ({ page }) => {
      // Get headers and beads
      const columnHeaders = page.locator('.column-header');
      const allBeads = page.locator('[draggable="true"]');
      
      await expect(columnHeaders).toHaveCount(7);
      await expect(allBeads).toHaveCount(35);
      
      // Verify headers don't overlap with bead interaction areas
      for (let i = 0; i < 7; i++) {
        const header = columnHeaders.nth(i);
        const headerBox = await header.boundingBox();
        
        if (headerBox) {
          // Check that no beads overlap with the header area
          for (let j = 0; j < 35; j++) {
            const bead = allBeads.nth(j);
            const beadBox = await bead.boundingBox();
            
            if (beadBox) {
              // Beads should be below headers (no vertical overlap)
              const hasVerticalOverlap = !(headerBox.y + headerBox.height < beadBox.y || 
                                         beadBox.y + beadBox.height < headerBox.y);
              
              if (hasVerticalOverlap) {
                // If there's vertical overlap, there should be no horizontal overlap
                const hasHorizontalOverlap = !(headerBox.x + headerBox.width < beadBox.x || 
                                              beadBox.x + beadBox.width < headerBox.x);
                expect(hasHorizontalOverlap).toBeFalsy();
              }
            }
          }
        }
      }
      
      // Verify beads are still clickable after header positioning
      const firstBead = allBeads.first();
      await expect(firstBead).toHaveAttribute('draggable', 'true');
      await expect(firstBead).toHaveCSS('cursor', 'pointer');
    });
  });

  test.describe('Horizontal Separator Layout', () => {
    test('should span full board width and maintain proper alignment', async ({ page }) => {
      // Wait for the sempoa board to load
      await page.waitForSelector('[data-testid="sempoa-board"]', { timeout: 10000 });
      
      // Get the sempoa board container
      const sempoaBoard = page.locator('[data-testid="sempoa-board"]');
      await expect(sempoaBoard).toBeVisible();
      
      // Find the horizontal separator
      const separator = page.locator('.bg-amber-900.rounded-full').first();
      await expect(separator).toBeVisible();
      
      // Get bounding boxes
      const separatorBox = await separator.boundingBox();
      const boardBox = await sempoaBoard.boundingBox();
      
      expect(separatorBox).not.toBeNull();
      expect(boardBox).not.toBeNull();
      
      // Calculate the expected separator bounds based on columns
      const leftmostColumn = page.locator('[data-testid^="column-"]').first();
      const rightmostColumn = page.locator('[data-testid^="column-"]').last();
      
      const leftmostBox = await leftmostColumn.boundingBox();
      const rightmostBox = await rightmostColumn.boundingBox();
      
      expect(leftmostBox).not.toBeNull();
      expect(rightmostBox).not.toBeNull();
      
      // Calculate expected dimensions
      const expectedLeftEdge = leftmostBox!.x;
      const expectedRightEdge = rightmostBox!.x + rightmostBox!.width;
      const expectedWidth = expectedRightEdge - expectedLeftEdge;
      
      // Verify separator spans the full width with tolerance
      const tolerance = 8;
      expect(separatorBox!.x).toBeLessThanOrEqual(expectedLeftEdge + tolerance);
      expect(separatorBox!.x + separatorBox!.width).toBeGreaterThanOrEqual(expectedRightEdge - tolerance);
      
      // Separator width should be at least 90% of expected width
      const actualWidth = separatorBox!.width;
      expect(actualWidth).toBeGreaterThanOrEqual(expectedWidth * 0.9);
      
      // Check horizontal centering
      const separatorCenter = separatorBox!.x + separatorBox!.width / 2;
      const boardCenter = boardBox!.x + boardBox!.width / 2;
      const centerTolerance = 10;
      expect(Math.abs(separatorCenter - boardCenter)).toBeLessThanOrEqual(centerTolerance);
    });

    test('should capture visual alignment for manual verification', async ({ page }) => {
      await page.waitForSelector('[data-testid="sempoa-board"]');
      
      // Take screenshot for visual verification
      await page.screenshot({ 
        path: `tests/screenshots/ui-layout-alignment.png`,
        fullPage: true 
      });
      
      // Verify separator is visible for screenshot
      const separator = page.locator('.bg-amber-900.rounded-full').first();
      await expect(separator).toBeVisible();
    });
  });

  test.describe('Responsive Layout Behavior', () => {
    // Helper function to get alignment data for responsive testing
    const getAlignmentData = async (page: any) => {
      const headers = page.locator('.column-header');
      const boardContainer = page.locator('.bg-amber-100.rounded.border-2.border-amber-800')
        .locator('.flex.justify-center.gap-2').first();
      const columns = boardContainer.locator('> div');
      
      const alignments = [];
      for (let i = 0; i < 7; i++) {
        const headerBox = await headers.nth(i).boundingBox();
        const columnBox = await columns.nth(i).boundingBox();
        
        if (headerBox && columnBox) {
          const headerCenter = headerBox.x + headerBox.width / 2;
          const columnCenter = columnBox.x + columnBox.width / 2;
          alignments.push(Math.abs(headerCenter - columnCenter));
        }
      }
      return alignments;
    };

    test('should maintain header alignment across viewport sizes', async ({ page }) => {
      // Test desktop alignment (default)
      const desktopAlignments = await getAlignmentData(page);
      desktopAlignments.forEach(alignment => {
        expect(alignment).toBeLessThan(5); // Within 5px tolerance
      });
      
      // Test tablet size
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.waitForTimeout(500); // Allow layout to adjust
      
      const tabletAlignments = await getAlignmentData(page);
      tabletAlignments.forEach(alignment => {
        expect(alignment).toBeLessThan(5); // Within 5px tolerance
      });
      
      // Test mobile size
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(500); // Allow layout to adjust
      
      const mobileAlignments = await getAlignmentData(page);
      mobileAlignments.forEach(alignment => {
        expect(alignment).toBeLessThan(8); // Slightly more tolerance for mobile
      });
    });

    // Test separator width across key viewport sizes
    for (const viewport of [
      { width: 320, height: 568, name: 'iPhone SE' },
      { width: 768, height: 1024, name: 'iPad' },
      { width: 1200, height: 800, name: 'Desktop Small' },
      { width: 1920, height: 1080, name: 'Desktop Large' }
    ]) {
      test(`should maintain separator width on ${viewport.name} (${viewport.width}x${viewport.height})`, async ({ page }) => {
        // Set viewport size
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        
        // Wait for layout adjustment
        await page.waitForTimeout(500);
        await page.waitForSelector('[data-testid="sempoa-board"]', { timeout: 10000 });
        
        // Get the sempoa board and separator
        const sempoaBoard = page.locator('[data-testid="sempoa-board"]');
        const separator = page.locator('.bg-amber-900.rounded-full').first();
        
        await expect(sempoaBoard).toBeVisible();
        await expect(separator).toBeVisible();
        
        // Get bounding boxes
        const boardBox = await sempoaBoard.boundingBox();
        const separatorBox = await separator.boundingBox();
        
        expect(boardBox).not.toBeNull();
        expect(separatorBox).not.toBeNull();
        
        // Calculate expected separator bounds
        const leftmostColumn = page.locator('[data-testid^="column-"]').first();
        const rightmostColumn = page.locator('[data-testid^="column-"]').last();
        
        const leftmostBox = await leftmostColumn.boundingBox();
        const rightmostBox = await rightmostColumn.boundingBox();
        
        expect(leftmostBox).not.toBeNull();
        expect(rightmostBox).not.toBeNull();
        
        const expectedLeftEdge = leftmostBox!.x;
        const expectedRightEdge = rightmostBox!.x + rightmostBox!.width;
        const expectedWidth = expectedRightEdge - expectedLeftEdge;
        
        // Verify separator spans the full width with tolerance (more for smaller screens)
        const tolerance = viewport.width < 400 ? 12 : 8;
        
        expect(separatorBox!.x).toBeLessThanOrEqual(expectedLeftEdge + tolerance);
        expect(separatorBox!.x + separatorBox!.width).toBeGreaterThanOrEqual(expectedRightEdge - tolerance);
        
        // Separator width should be at least 85% of expected width on mobile, 90% on larger screens
        const actualWidth = separatorBox!.width;
        const widthThreshold = viewport.width < 400 ? 0.85 : 0.9;
        expect(actualWidth).toBeGreaterThanOrEqual(expectedWidth * widthThreshold);
        
        // Log for debugging
        console.log(`${viewport.name}: Board width: ${boardBox!.width}, Separator width: ${actualWidth}, Expected width: ${expectedWidth}`);
      });
    }
  });
});