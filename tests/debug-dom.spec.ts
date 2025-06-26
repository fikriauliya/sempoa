import { test, expect } from '@playwright/test';

test('Debug DOM structure', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Wait for page to load
  await expect(page.getByRole('heading', { name: 'Sempoa Board' })).toBeVisible();
  
  // Check column labels structure - be more specific to avoid selector conflict
  const columnLabelsContainer = page.locator('.flex.justify-between.mb-4').nth(1); // Second one is the column labels
  await expect(columnLabelsContainer).toBeVisible();
  
  const columnLabels = columnLabelsContainer.locator('> div');
  const labelCount = await columnLabels.count();
  console.log('Column labels count:', labelCount);
  
  // Print all column label texts
  for (let i = 0; i < labelCount; i++) {
    const text = await columnLabels.nth(i).textContent();
    console.log(`Label ${i}:`, text);
  }
  
  // Check bead structure
  const upperBeads = page.locator('.upper-section [draggable="true"]');
  const upperBeadCount = await upperBeads.count();
  console.log('Upper beads count:', upperBeadCount);
  
  if (upperBeadCount > 0) {
    // Check first upper bead's parent positioning
    const firstUpperBead = upperBeads.first();
    const parentDiv = firstUpperBead.locator('..');
    
    const leftStyle = await parentDiv.evaluate(el => getComputedStyle(el).left);
    const transformStyle = await parentDiv.evaluate(el => getComputedStyle(el).transform);
    
    console.log('First upper bead parent left:', leftStyle);
    console.log('First upper bead parent transform:', transformStyle);
    
    // Also check the actual positioning
    const bbox = await parentDiv.boundingBox();
    console.log('First upper bead parent bounding box:', bbox);
  }
});