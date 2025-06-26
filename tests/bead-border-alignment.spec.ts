import { test, expect } from '@playwright/test'

test.describe('Bead Border Alignment', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5175')
    
    // Reset the board to ensure initial state
    await page.click('button:has-text("Reset")')
    await page.waitForTimeout(500) // Wait for any animations
  })

  test('beads should align flush with board borders in initial position', async ({ page }) => {
    // Get the board container dimensions
    const boardContainer = page.locator('.bg-amber-100.p-4.rounded.border-2.border-amber-800')
    const boardBox = await boardContainer.boundingBox()
    expect(boardBox).toBeTruthy()

    // Test upper beads alignment with top border
    const upperBeads = page.locator('.upper-section .absolute')
    const upperBeadCount = await upperBeads.count()
    expect(upperBeadCount).toBe(7) // Should have 7 upper beads (one per column)

    for (let i = 0; i < upperBeadCount; i++) {
      const upperBead = upperBeads.nth(i)
      const upperBeadBox = await upperBead.boundingBox()
      expect(upperBeadBox).toBeTruthy()
      
      // In initial position, upper beads should be at top: '0px'
      // They should be flush with the top of their container
      const topPosition = await upperBead.evaluate(el => 
        window.getComputedStyle(el).getPropertyValue('top')
      )
      expect(topPosition).toBe('0px')
    }

    // Test lower beads alignment with bottom border
    const lowerBeads = page.locator('.lower-section .absolute')
    const lowerBeadCount = await lowerBeads.count()
    expect(lowerBeadCount).toBe(28) // Should have 28 lower beads (4 per column × 7 columns)

    // Check that the bottom-most beads are positioned correctly
    // In the DOM, beads are rendered in order, so the last 7 beads are the bottom ones
    for (let col = 0; col < 7; col++) {
      const columnLowerBeads = page.locator('.lower-section').nth(col).locator('.absolute')
      const bottomBeadIndex = 3 // Row 3 (4th bead, 0-indexed)
      const bottomBead = columnLowerBeads.nth(bottomBeadIndex)
      
      const topPosition = await bottomBead.evaluate(el => 
        window.getComputedStyle(el).getPropertyValue('top')
      )
      // In initial position, the bottom bead (row 3) should be at top: '74px' (20 + 3*18)
      expect(topPosition).toBe('74px')
    }

    // Verify section heights
    const upperSections = page.locator('.upper-section')
    const upperSectionCount = await upperSections.count()
    
    for (let i = 0; i < upperSectionCount; i++) {
      const section = upperSections.nth(i)
      const sectionHeight = await section.evaluate(el => 
        parseInt(window.getComputedStyle(el).getPropertyValue('height'))
      )
      expect(sectionHeight).toBe(70) // Upper section should be 70px high
    }

    const lowerSections = page.locator('.lower-section')
    const lowerSectionCount = await lowerSections.count()
    
    for (let i = 0; i < lowerSectionCount; i++) {
      const section = lowerSections.nth(i)
      const sectionHeight = await section.evaluate(el => 
        parseInt(window.getComputedStyle(el).getPropertyValue('height'))
      )
      expect(sectionHeight).toBe(80) // Lower section should be 80px high
    }
  })

  test('beads should maintain proper spacing in initial position', async ({ page }) => {
    // Verify the overall board structure - the main flex container
    const mainContainer = page.locator('div[style*="height: 150px"]')
    const containerHeight = await mainContainer.evaluate(el => 
      parseInt(el.style.height)
    )
    expect(containerHeight).toBe(150) // Main container should be 150px high

    // Verify that upper sections start at the top (no gap)
    const firstUpperSection = page.locator('.upper-section').first()
    const upperSectionPosition = await firstUpperSection.evaluate(el => {
      const rect = el.getBoundingClientRect()
      const parent = el.parentElement!.getBoundingClientRect()
      return rect.top - parent.top
    })
    
    // Upper section should start at the very top of its parent column
    expect(upperSectionPosition).toBeLessThanOrEqual(5) // Allow small margin for styling

    // Verify that lower sections follow immediately after upper sections
    const firstLowerSection = page.locator('.lower-section').first()
    const lowerSectionPosition = await firstLowerSection.evaluate(el => {
      const rect = el.getBoundingClientRect()
      const parent = el.parentElement!.getBoundingClientRect()
      return rect.top - parent.top
    })
    
    // Lower section should start right after upper section (70px)
    expect(lowerSectionPosition).toBeCloseTo(70, 5) // Allow 5px tolerance
  })
})