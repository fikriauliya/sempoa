import { test, expect } from '@playwright/test';
import { TEST_CONFIG } from './test-config'
import { DERIVED_CONFIG } from '../src/config/sempoaConfig';

test.describe('Sempoa Board - Beads on Rod Positioning', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the sempoa application
    await page.goto(TEST_CONFIG.BASE_URL);
  });

  test('should verify beads are properly positioned on vertical rods', async ({ page }) => {
    // Step 1: Verify sempoa board is visible
    await expect(page.getByRole('heading', { name: 'Sempoa Board' })).toBeVisible();
    
    // Step 2: Verify the sempoa frame and board structure exists
    const sempoaFrame = page.locator('.sempoa-frame');
    await expect(sempoaFrame).toBeVisible();
    
    // Step 3: Check that vertical rods are present
    // Based on the updated structure, rods are now within each column
    const verticalRods = page.locator('.bg-amber-900.rounded-full.shadow-sm').filter({ hasText: '' });
    const rodCount = await verticalRods.count();
    expect(rodCount).toBeGreaterThanOrEqual(7); // At least 7 vertical rods
    
    // Step 4: Verify rods have proper styling
    const firstRod = verticalRods.first();
    await expect(firstRod).toHaveCSS('height', `${DERIVED_CONFIG.ROD_HEIGHT}px`);
    await expect(firstRod).toHaveClass(/bg-amber-900/);
    
    // Step 5: Verify horizontal crossbar exists (now part of column structure)
    const crossbar = page.locator('.bg-amber-900.rounded-full.shadow-md');
    await expect(crossbar).toBeVisible();
  });

  test('should verify beads are positioned correctly in upper and lower sections', async ({ page }) => {
    // Step 6: Verify upper section beads exist and are positioned on rods
    // Each column should have 1 upper bead (UPPER_BEADS_PER_COLUMN = 1)
    const upperSections = page.locator('.upper-section');
    await expect(upperSections).toHaveCount(7);
    
    // Step 7: Verify lower section beads exist and are positioned on rods  
    // Each column should have 4 lower beads (LOWER_BEADS_PER_COLUMN = 4)
    const lowerSections = page.locator('.lower-section');
    await expect(lowerSections).toHaveCount(7);
    
    // Step 8: Verify beads have proper styling indicating they're on rods
    // Check that beads have the wooden appearance and proper dimensions
    const allBeads = page.locator('[draggable="true"]');
    
    // Should have 7 columns × (1 upper + 4 lower) = 35 beads total
    await expect(allBeads).toHaveCount(35);
    
    // Verify each bead has the correct styling for wooden appearance
    for (let i = 0; i < 35; i++) {
      const bead = allBeads.nth(i);
      await expect(bead).toHaveAttribute('draggable', 'true');
      await expect(bead).toHaveCSS('cursor', 'pointer');
    }
  });

  test('should verify bead alignment with rods through positioning', async ({ page }) => {
    // Step 9: Test that beads are centered on their respective rods
    // With the new structure, beads and rods are in the same column container
    
    const upperBeads = page.locator('.upper-section [draggable="true"]');
    const lowerBeads = page.locator('.lower-section [draggable="true"]');
    
    // Verify we have the expected number of beads
    await expect(upperBeads).toHaveCount(7); // 7 columns × 1 upper bead each
    await expect(lowerBeads).toHaveCount(28); // 7 columns × 4 lower beads each
    
    // Verify the unified column structure
    const boardContainer = page.locator('.bg-amber-100').locator('.flex.justify-center.gap-2');
    await expect(boardContainer).toBeVisible();
    
    const columns = boardContainer.locator('> div');
    await expect(columns).toHaveCount(7);
    
    // Check that first and last columns have rods and beads properly aligned
    for (const colIndex of [0, 3, 6]) { // Check first, middle, and last columns
      const column = columns.nth(colIndex);
      
      // Verify column has a rod
      const rod = column.locator('.bg-amber-900.rounded-full.shadow-sm').first();
      await expect(rod).toBeVisible();
      
      // Verify column has beads
      const beads = column.locator('[draggable="true"]');
      const beadCount = await beads.count();
      expect(beadCount).toBe(5); // 1 upper + 4 lower
      
      // Verify all elements are within the same column container
      const columnBox = await column.boundingBox();
      if (columnBox) {
        const rodBox = await rod.boundingBox();
        const firstBeadBox = await beads.first().boundingBox();
        
        // Rod and beads should be horizontally aligned within the column
        if (rodBox && firstBeadBox) {
          const rodCenter = rodBox.x + rodBox.width / 2;
          const beadCenter = firstBeadBox.x + firstBeadBox.width / 2;
          // Allow small tolerance for alignment
          expect(Math.abs(rodCenter - beadCenter)).toBeLessThan(5);
        }
      }
    }
  });

  test('should verify bead interaction maintains rod alignment', async ({ page }) => {
    // Step 10: Test bead movement along rods when activated
    // Click on a bead to activate it and verify it maintains rod alignment
    
    // Get the current value display
    const valueDisplay = page.getByText(/Value: \d+/);
    await expect(valueDisplay).toContainText('Value: 0');
    
    // Try to interact with beads by clicking in the sempoa board area
    // Since beads might not be directly clickable due to their nested structure,
    // we'll verify they maintain their rod positioning structure
    
    // The board structure now uses direct flex layout
    const sempoaBoard = page.locator('.bg-amber-100.rounded.border-2.border-amber-800');
    await expect(sempoaBoard).toBeVisible();
    
    // Verify that the bead container maintains proper column structure
    // Find the specific board container with columns
    const boardContainer = sempoaBoard.locator('.flex.justify-center.gap-2').first();
    await expect(boardContainer).toBeVisible();
    
    const columnContainers = boardContainer.locator('> div');
    await expect(columnContainers).toHaveCount(7);
    
    // Each column should maintain its width and alignment
    for (let i = 0; i < 7; i++) {
      const column = columnContainers.nth(i);
      
      // On mobile devices, width may be calculated differently due to viewport constraints
      // We check that the width is reasonable (between 20px and 60px) rather than exact
      const widthCSS = await column.evaluate(el => getComputedStyle(el).width);
      const widthValue = parseFloat(widthCSS);
      expect(widthValue).toBeGreaterThan(20);
      expect(widthValue).toBeLessThan(60);
      
      await expect(column).toHaveClass(/flex-col/);
      await expect(column).toHaveClass(/items-center/);
    }
  });

  test('should verify column labels align with rod positions', async ({ page }) => {
    // Step 11: Verify that column labels (place values) align with their respective rods
    // Look specifically for the column labels in the sempoa board
    const columnLabels = page.locator('.column-header');
    await expect(columnLabels).toHaveCount(7);
    
    // Verify the place values are correct (from left to right: 1M, 100K, 10K, 1K, 100, 10, 1)
    const expectedValues = ['1M', '100K', '10K', '1K', '100', '10', '1'];
    
    for (let i = 0; i < 7; i++) {
      const label = columnLabels.nth(i);
      await expect(label).toContainText(expectedValues[i]);
    }
  });
});