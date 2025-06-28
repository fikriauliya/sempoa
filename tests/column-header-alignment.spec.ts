import { test, expect } from '@playwright/test';
import { TEST_CONFIG } from './test-config'

test.describe('Sempoa Board - Column Header Alignment', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(TEST_CONFIG.BASE_URL);
  });

  test('should verify column headers are centered above their respective bead columns', async ({ page }) => {
    // Wait for sempoa board to be visible
    await expect(page.getByRole('heading', { name: 'Sempoa Board' })).toBeVisible();
    
    // Get column headers and bead columns
    const columnHeaders = page.locator('.text-xs.text-gray-600.font-mono.text-center.flex.items-center.justify-center');
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
    const columnHeaders = page.locator('.text-xs.text-gray-600.font-mono.text-center.flex.items-center.justify-center');
    
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

  test('should maintain header alignment across different viewport sizes', async ({ page }) => {
    // Test desktop size (default)
    await expect(page.getByRole('heading', { name: 'Sempoa Board' })).toBeVisible();
    
    // Get initial alignment measurements
    const getAlignmentData = async () => {
      const headers = page.locator('.text-xs.text-gray-600.font-mono.text-center.flex.items-center.justify-center');
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
    
    // Test desktop alignment
    const desktopAlignments = await getAlignmentData();
    desktopAlignments.forEach(alignment => {
      expect(alignment).toBeLessThan(5); // Within 5px tolerance
    });
    
    // Test tablet size
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500); // Allow layout to adjust
    
    const tabletAlignments = await getAlignmentData();
    tabletAlignments.forEach(alignment => {
      expect(alignment).toBeLessThan(5); // Within 5px tolerance
    });
    
    // Test mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500); // Allow layout to adjust
    
    const mobileAlignments = await getAlignmentData();
    mobileAlignments.forEach(alignment => {
      expect(alignment).toBeLessThan(8); // Slightly more tolerance for mobile
    });
  });

  test('should not interfere with bead interaction areas', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Sempoa Board' })).toBeVisible();
    
    // Get headers and beads
    const columnHeaders = page.locator('.text-xs.text-gray-600.font-mono.text-center.flex.items-center.justify-center');
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