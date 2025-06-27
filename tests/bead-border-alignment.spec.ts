import { test, expect } from '@playwright/test'
import { SEMPOA_CONFIG, DERIVED_CONFIG } from '../src/config/sempoaConfig'

test.describe('Bead Border Alignment', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173')
    
    // Reset the board to ensure initial state
    await page.click('button:has-text("Reset")')
    await page.waitForTimeout(500) // Wait for any animations
  })

  test('beads should align flush with board borders in initial position', async ({ page }) => {
    // Get the board container dimensions
    const boardContainer = page.locator('.bg-amber-100.rounded.border-2.border-amber-800')
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
      // In initial position, the bottom bead (row 3) should be at calculated position
      const expectedPosition = DERIVED_CONFIG.LOWER_INACTIVE_TOP + (3 * DERIVED_CONFIG.LOWER_BEAD_SPACING)
      expect(topPosition).toBe(`${expectedPosition}px`)
    }

    // Verify section heights
    const upperSections = page.locator('.upper-section')
    const upperSectionCount = await upperSections.count()
    
    for (let i = 0; i < upperSectionCount; i++) {
      const section = upperSections.nth(i)
      const sectionHeight = await section.evaluate(el => 
        parseInt(window.getComputedStyle(el).getPropertyValue('height'))
      )
      expect(sectionHeight).toBe(SEMPOA_CONFIG.SECTIONS.UPPER_HEIGHT)
    }

    const lowerSections = page.locator('.lower-section')
    const lowerSectionCount = await lowerSections.count()
    
    for (let i = 0; i < lowerSectionCount; i++) {
      const section = lowerSections.nth(i)
      const sectionHeight = await section.evaluate(el => 
        parseInt(window.getComputedStyle(el).getPropertyValue('height'))
      )
      expect(sectionHeight).toBe(SEMPOA_CONFIG.SECTIONS.LOWER_HEIGHT)
    }
  })

  test('beads should maintain proper spacing in initial position', async ({ page }) => {
    // Verify the overall board structure - the main flex container
    const mainContainer = page.locator('.bg-amber-100.rounded.border-2.border-amber-800 .flex.justify-center.gap-2').first()
    const containerHeight = await mainContainer.evaluate(el => 
      parseInt(el.style.height)
    )
    expect(containerHeight).toBe(DERIVED_CONFIG.MAIN_CONTAINER_HEIGHT)

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
    
    // Lower section should start right after upper section
    expect(lowerSectionPosition).toBeCloseTo(SEMPOA_CONFIG.SECTIONS.UPPER_HEIGHT, 5) // Allow 5px tolerance
  })

  test('upper bead gap should equal one bead height when active', async ({ page }) => {
    // Use configuration values
    const EXPECTED_UPPER_SECTION_HEIGHT = SEMPOA_CONFIG.SECTIONS.UPPER_HEIGHT
    const EXPECTED_ACTIVE_POSITION = DERIVED_CONFIG.UPPER_ACTIVE_TOP

    // Verify upper section height
    const upperSections = page.locator('.upper-section')
    const upperSectionCount = await upperSections.count()
    
    for (let i = 0; i < upperSectionCount; i++) {
      const section = upperSections.nth(i)
      const sectionHeight = await section.evaluate(el => 
        parseInt(window.getComputedStyle(el).getPropertyValue('height'))
      )
      expect(sectionHeight).toBe(EXPECTED_UPPER_SECTION_HEIGHT)
    }

    // Check inactive bead position (should be at top)
    const firstUpperBead = page.locator('.upper-section').first().locator('.absolute').first()
    const inactivePosition = await firstUpperBead.evaluate(el => 
      window.getComputedStyle(el).getPropertyValue('top')
    )
    expect(inactivePosition).toBe(`${SEMPOA_CONFIG.POSITIONING.UPPER_INACTIVE_TOP}px`)

    // Click to activate the upper bead
    await firstUpperBead.click()
    await page.waitForTimeout(500) // Wait for animation
    
    // Check active bead position (should be one bead height down)
    const activePosition = await firstUpperBead.evaluate(el => 
      window.getComputedStyle(el).getPropertyValue('top')
    )
    expect(activePosition).toBe(`${EXPECTED_ACTIVE_POSITION}px`)

    // Verify the gap is approximately one bead height (adjusted for separator positioning)
    const gap = parseInt(activePosition) - 0 // Gap from top
    expect(gap).toBe(EXPECTED_ACTIVE_POSITION)
  })

  test('horizontal separator should be positioned between active upper and lower beads without intersection', async ({ page }) => {
    // Use configuration values
    const SEPARATOR_CENTER = SEMPOA_CONFIG.SEPARATOR.CENTER_POSITION
    const SEPARATOR_HEIGHT = SEMPOA_CONFIG.SEPARATOR.HEIGHT
    const SEPARATOR_TOP = DERIVED_CONFIG.SEPARATOR_TOP
    const SEPARATOR_BOTTOM = DERIVED_CONFIG.SEPARATOR_BOTTOM

    // Activate upper and lower beads to test separator positioning
    const firstUpperBead = page.locator('.upper-section').first().locator('.absolute').first()
    const firstLowerBead = page.locator('.lower-section').first().locator('.absolute').first()
    
    await firstUpperBead.click()
    await firstLowerBead.click()
    await page.waitForTimeout(500) // Wait for animations

    // Check separator position
    const separator = page.locator(`[style*="width: 100%"]`)
    const separatorPosition = await separator.evaluate(el => {
      const parentRect = el.parentElement!.getBoundingClientRect()
      const elementRect = el.getBoundingClientRect()
      return elementRect.top - parentRect.top + (elementRect.height / 2) // Center of separator
    })

    // Separator should be positioned at the boundary between sections
    // Allow for border effects - the 2px border affects the calculation
    expect(Math.abs(separatorPosition - SEPARATOR_CENTER)).toBeLessThanOrEqual(2) // Allow 2px tolerance due to borders

    // Get bead positions
    const upperBeadBottom = await firstUpperBead.evaluate(el => {
      const parentRect = el.parentElement!.getBoundingClientRect()
      const elementRect = el.getBoundingClientRect()
      return elementRect.bottom - parentRect.top
    })

    const lowerBeadTop = await firstLowerBead.evaluate(el => {
      const columnRect = el.closest('[style*="width: 48px"]')!.getBoundingClientRect()
      const elementRect = el.getBoundingClientRect()
      return elementRect.top - columnRect.top
    })

    // Upper bead bottom should touch but not intersect separator top (should be at 39px)
    expect(upperBeadBottom).toBeCloseTo(SEPARATOR_TOP, 1)
    
    // Lower bead top should touch but not intersect separator bottom (should be at 41px)  
    expect(lowerBeadTop).toBeCloseTo(SEPARATOR_BOTTOM, 1)

    // Verify no intersection: upper bead bottom should be <= separator top
    expect(upperBeadBottom).toBeLessThanOrEqual(SEPARATOR_TOP + 0.5)
    
    // Verify no intersection: lower bead top should be >= separator bottom
    expect(lowerBeadTop).toBeGreaterThanOrEqual(SEPARATOR_BOTTOM - 0.5)
  })

  test('rod height should equal total board height', async ({ page }) => {
    // Verify that the rod height matches the calculated total board height
    const rods = page.locator('.bg-amber-900.rounded-full.shadow-sm')
    const firstRod = rods.first()
    
    // Get the actual CSS height of the rod
    const rodHeight = await firstRod.evaluate(el => 
      parseInt(window.getComputedStyle(el).getPropertyValue('height'))
    )
    
    // Rod height should equal the calculated rod height (which now matches board container)
    expect(rodHeight).toBe(DERIVED_CONFIG.ROD_HEIGHT)
    expect(rodHeight).toBe(DERIVED_CONFIG.MAIN_CONTAINER_HEIGHT)
    
    // Get the visual board container dimensions for comparison
    const boardContainer = page.locator('.bg-amber-100.rounded.border-2.border-amber-800')
    const boardHeight = await boardContainer.evaluate(el => {
      const mainContainer = el.querySelector('.flex.justify-center.gap-2') as HTMLElement
      return mainContainer ? parseInt(mainContainer.style.height) : 0
    })
    
    // Document the current relationship - this test should initially fail if there's a mismatch
    console.log(`Rod height: ${rodHeight}px`)
    console.log(`Board container height: ${boardHeight}px`) 
    console.log(`Expected rod height (DERIVED_CONFIG.ROD_HEIGHT): ${DERIVED_CONFIG.ROD_HEIGHT}px`)
    console.log(`Expected total board height: ${DERIVED_CONFIG.TOTAL_BOARD_HEIGHT}px`)
    
    // The rod should span the full height of the board container  
    // Rod height should now equal board container height (150px)
    expect(rodHeight).toBe(boardHeight)
  })
})