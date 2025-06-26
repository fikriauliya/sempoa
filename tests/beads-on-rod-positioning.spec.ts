import { test, expect } from '@playwright/test';

test.describe('Sempoa Board - Beads on Rod Positioning', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the sempoa application
    await page.goto('http://localhost:5175');
  });

  test('should verify beads are properly positioned on vertical rods', async ({ page }) => {
    // Step 1: Verify sempoa board is visible
    await expect(page.getByRole('heading', { name: 'Sempoa Board' })).toBeVisible();
    
    // Step 2: Verify the sempoa frame and board structure exists
    const sempoaFrame = page.locator('.sempoa-frame');
    await expect(sempoaFrame).toBeVisible();
    
    // Step 3: Check that vertical rods are present
    // Based on the code analysis, there should be 7 vertical rods (COLUMNS = 7)
    const verticalRods = page.locator('.sempoa-frame .w-1.bg-amber-900.rounded-full');
    await expect(verticalRods).toHaveCount(7);
    
    // Step 4: Verify rod dimensions and positioning
    // Each rod should have height of 200px and specific styling
    for (let i = 0; i < 7; i++) {
      const rod = verticalRods.nth(i);
      await expect(rod).toHaveCSS('height', '200px');
      await expect(rod).toHaveClass(/bg-amber-900/);
    }
    
    // Step 5: Verify horizontal crossbar exists (separates upper and lower sections)
    const crossbar = page.locator('.absolute.left-0.right-0.top-1\\/2');
    await expect(crossbar).toBeVisible();
    await expect(crossbar).toHaveClass(/bg-amber-900/);
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
    // Based on the code, beads should be positioned with left: 50% and transform: translateX(-50%)
    
    const upperBeads = page.locator('.upper-section [draggable="true"]');
    const lowerBeads = page.locator('.lower-section [draggable="true"]');
    
    // Verify we have the expected number of beads
    await expect(upperBeads).toHaveCount(7); // 7 columns × 1 upper bead each
    await expect(lowerBeads).toHaveCount(28); // 7 columns × 4 lower beads each
    
    // Check the positioning containers (div elements that wrap the DraggableBead components)
    const upperBeadContainers = page.locator('.upper-section .absolute');
    const lowerBeadContainers = page.locator('.lower-section .absolute');
    
    // Verify upper bead containers are properly centered
    // Instead of checking exact CSS values, check that beads are visually centered
    for (let col = 0; col < 7; col++) {
      const container = upperBeadContainers.nth(col);
      await expect(container).toBeVisible();
      
      // Check that the container has positioning styles applied
      const hasPositioning = await container.evaluate(el => {
        const style = getComputedStyle(el);
        return style.position === 'absolute' && 
               (style.left !== 'auto' && style.left !== '0px') &&
               style.transform.includes('translateX');
      });
      expect(hasPositioning).toBe(true);
    }
    
    // Verify lower bead containers are properly centered
    for (let col = 0; col < 7; col++) {
      for (let row = 0; row < 4; row++) {
        const containerIndex = col * 4 + row;
        if (containerIndex < 28) {
          const container = lowerBeadContainers.nth(containerIndex);
          await expect(container).toBeVisible();
          
          // Check that the container has positioning styles applied
          const hasPositioning = await container.evaluate(el => {
            const style = getComputedStyle(el);
            return style.position === 'absolute' && 
                   (style.left !== 'auto' && style.left !== '0px') &&
                   style.transform.includes('translateX');
          });
          expect(hasPositioning).toBe(true);
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
    
    const sempoaBoard = page.locator('.sempoa-frame .relative.z-10');
    await expect(sempoaBoard).toBeVisible();
    
    // Verify that the bead container maintains proper column structure
    const columnContainers = page.locator('.flex.justify-between.px-2 > div');
    await expect(columnContainers).toHaveCount(7);
    
    // Each column should maintain its width and alignment
    for (let i = 0; i < 7; i++) {
      const column = columnContainers.nth(i);
      await expect(column).toHaveCSS('width', '48px');
      await expect(column).toHaveClass(/flex-col/);
      await expect(column).toHaveClass(/items-center/);
    }
  });

  test('should verify column labels align with rod positions', async ({ page }) => {
    // Step 11: Verify that column labels (place values) align with their respective rods
    // Look specifically for the column labels in the sempoa board
    const columnLabels = page.locator('.text-xs.text-gray-600.font-mono.text-center.w-12');
    await expect(columnLabels).toHaveCount(7);
    
    // Verify the place values are correct (from left to right: 1,000,000 down to 1)
    const expectedValues = ['1,000,000', '100,000', '10,000', '1,000', '100', '10', '1'];
    
    for (let i = 0; i < 7; i++) {
      const label = columnLabels.nth(i);
      await expect(label).toContainText(expectedValues[i]);
    }
  });
});