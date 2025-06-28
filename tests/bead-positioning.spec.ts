import { test, expect } from '@playwright/test'
import { TEST_CONFIG } from './test-config'
import { SEMPOA_CONFIG, DERIVED_CONFIG } from '../src/config/sempoaConfig'

test.describe('Bead Positioning', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(TEST_CONFIG.BASE_URL)
    
    // Reset the board to ensure initial state
    await page.click('button:has-text("Reset")')
    await page.waitForTimeout(500) // Wait for any animations
  })

  test.describe('Rod Alignment and Structure', () => {
    test('should verify beads are properly positioned on vertical rods', async ({ page }) => {
      // Verify sempoa board is visible
      await expect(page.getByRole('heading', { name: 'Sempoa Board' })).toBeVisible()
      
      // Verify the sempoa frame and board structure exists
      const sempoaFrame = page.locator('.sempoa-frame')
      await expect(sempoaFrame).toBeVisible()
      
      // Check that vertical rods are present
      const verticalRods = page.locator('.bg-amber-900.rounded-full.shadow-sm').filter({ hasText: '' })
      const rodCount = await verticalRods.count()
      expect(rodCount).toBeGreaterThanOrEqual(SEMPOA_CONFIG.COLUMNS) // At least configured number of vertical rods
      
      // Verify rods have proper styling and height
      const firstRod = verticalRods.first()
      await expect(firstRod).toHaveCSS('height', `${DERIVED_CONFIG.ROD_HEIGHT}px`)
      await expect(firstRod).toHaveClass(/bg-amber-900/)
      
      // Verify horizontal crossbar exists
      const crossbar = page.locator('.bg-amber-900.rounded-full.shadow-md')
      await expect(crossbar).toBeVisible()
    })

    test('should verify rod height equals total board height', async ({ page }) => {
      // Verify that the rod height matches the calculated total board height
      const rods = page.locator('.bg-amber-900.rounded-full.shadow-sm')
      const firstRod = rods.first()
      
      // Get the actual CSS height of the rod
      const rodHeight = await firstRod.evaluate(el => 
        parseInt(window.getComputedStyle(el).getPropertyValue('height'))
      )
      
      // Rod height should equal the calculated rod height
      expect(rodHeight).toBe(DERIVED_CONFIG.ROD_HEIGHT)
      expect(rodHeight).toBe(DERIVED_CONFIG.MAIN_CONTAINER_HEIGHT)
      
      // Get the visual board container dimensions for comparison
      const boardContainer = page.locator('.bg-amber-100.rounded.border-2.border-amber-800')
      const boardHeight = await boardContainer.evaluate(el => {
        const mainContainer = el.querySelector('.flex.justify-center.gap-2') as HTMLElement
        return mainContainer ? parseInt(mainContainer.style.height) : 0
      })
      
      // The rod should span the full height of the board container
      expect(rodHeight).toBe(boardHeight)
    })

    test('should verify bead alignment with rods through positioning', async ({ page }) => {
      // Test that beads are centered on their respective rods
      const upperBeads = page.locator('.upper-section [draggable="true"]')
      const lowerBeads = page.locator('.lower-section [draggable="true"]')
      
      // Verify we have the expected number of beads
      await expect(upperBeads).toHaveCount(SEMPOA_CONFIG.COLUMNS * SEMPOA_CONFIG.UPPER_BEADS_PER_COLUMN) // Configured columns × upper beads each
      await expect(lowerBeads).toHaveCount(SEMPOA_CONFIG.COLUMNS * SEMPOA_CONFIG.LOWER_BEADS_PER_COLUMN) // Configured columns × lower beads each
      
      // Verify the unified column structure
      const boardContainer = page.locator('.bg-amber-100').locator('.flex.justify-center.gap-2')
      await expect(boardContainer).toBeVisible()
      
      const columns = boardContainer.locator('> div')
      await expect(columns).toHaveCount(SEMPOA_CONFIG.COLUMNS)
      
      // Check that first, middle, and last columns have rods and beads properly aligned
      for (const colIndex of [0, Math.floor(SEMPOA_CONFIG.COLUMNS / 2), SEMPOA_CONFIG.COLUMNS - 1]) {
        const column = columns.nth(colIndex)
        
        // Verify column has a rod
        const rod = column.locator('.bg-amber-900.rounded-full.shadow-sm').first()
        await expect(rod).toBeVisible()
        
        // Verify column has beads
        const beads = column.locator('[draggable="true"]')
        const beadCount = await beads.count()
        expect(beadCount).toBe(SEMPOA_CONFIG.UPPER_BEADS_PER_COLUMN + SEMPOA_CONFIG.LOWER_BEADS_PER_COLUMN) // configured upper + lower beads
        
        // Verify all elements are within the same column container
        const columnBox = await column.boundingBox()
        if (columnBox) {
          const rodBox = await rod.boundingBox()
          const firstBeadBox = await beads.first().boundingBox()
          
          // Rod and beads should be horizontally aligned within the column
          if (rodBox && firstBeadBox) {
            const rodCenter = rodBox.x + rodBox.width / 2
            const beadCenter = firstBeadBox.x + firstBeadBox.width / 2
            // Allow small tolerance for alignment
            expect(Math.abs(rodCenter - beadCenter)).toBeLessThan(5)
          }
        }
      }
    })

    test('should verify column labels align with rod positions', async ({ page }) => {
      // Verify that column labels (place values) align with their respective rods
      const columnLabels = page.locator('.column-header')
      await expect(columnLabels).toHaveCount(SEMPOA_CONFIG.COLUMNS)
      
      // Verify the place values are correct for 13-column board
      const expectedValues = ['1T', '100B', '10B', '1B', '100M', '10M', '1M', '100K', '10K', '1K', '100', '10', '1']
      
      for (let i = 0; i < SEMPOA_CONFIG.COLUMNS; i++) {
        const label = columnLabels.nth(i)
        await expect(label).toContainText(expectedValues[i])
      }
    })
  })

  test.describe('Bead Initial Positioning and Borders', () => {
    test('should align beads flush with board borders in initial position', async ({ page }) => {
      // Get the board container dimensions
      const boardContainer = page.locator('.bg-amber-100.rounded.border-2.border-amber-800')
      const boardBox = await boardContainer.boundingBox()
      expect(boardBox).toBeTruthy()

      // Test upper beads alignment with top border
      const upperBeads = page.locator('.upper-section .absolute')
      const upperBeadCount = await upperBeads.count()
      expect(upperBeadCount).toBe(SEMPOA_CONFIG.COLUMNS) // Should have upper beads (one per column)

      for (let i = 0; i < upperBeadCount; i++) {
        const upperBead = upperBeads.nth(i)
        const upperBeadBox = await upperBead.boundingBox()
        expect(upperBeadBox).toBeTruthy()
        
        // In initial position, upper beads should be at top: '0px'
        const topPosition = await upperBead.evaluate(el => 
          window.getComputedStyle(el).getPropertyValue('top')
        )
        expect(topPosition).toBe('0px')
      }

      // Test lower beads alignment with bottom border
      const lowerBeads = page.locator('.lower-section .absolute')
      const lowerBeadCount = await lowerBeads.count()
      expect(lowerBeadCount).toBe(SEMPOA_CONFIG.COLUMNS * SEMPOA_CONFIG.LOWER_BEADS_PER_COLUMN) // Should have lower beads (configured per column × columns)

      // Check that the bottom-most beads are positioned correctly
      for (let col = 0; col < SEMPOA_CONFIG.COLUMNS; col++) {
        const columnLowerBeads = page.locator('.lower-section').nth(col).locator('.absolute')
        const bottomBeadIndex = SEMPOA_CONFIG.LOWER_BEADS_PER_COLUMN - 1 // Last bead (0-indexed)
        const bottomBead = columnLowerBeads.nth(bottomBeadIndex)
        
        const topPosition = await bottomBead.evaluate(el => 
          window.getComputedStyle(el).getPropertyValue('top')
        )
        // In initial position, the bottom bead (row 3) should be at calculated position
        const expectedPosition = DERIVED_CONFIG.LOWER_INACTIVE_TOP + (bottomBeadIndex * DERIVED_CONFIG.LOWER_BEAD_SPACING)
        expect(topPosition).toBe(`${expectedPosition}px`)
      }
    })

    test('should maintain proper spacing in initial position', async ({ page }) => {
      // Verify the overall board structure
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

    test('should verify section heights', async ({ page }) => {
      // Verify upper section heights
      const upperSections = page.locator('.upper-section')
      const upperSectionCount = await upperSections.count()
      
      for (let i = 0; i < upperSectionCount; i++) {
        const section = upperSections.nth(i)
        const sectionHeight = await section.evaluate(el => 
          parseInt(window.getComputedStyle(el).getPropertyValue('height'))
        )
        expect(sectionHeight).toBe(SEMPOA_CONFIG.SECTIONS.UPPER_HEIGHT)
      }

      // Verify lower section heights
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
  })

  test.describe('Upper Bead Positioning and Separator Alignment', () => {
    test('should position all upper beads correctly relative to separator when activated', async ({ page }) => {
      const firstColumnUpperBeads = page.locator('.upper-section').first().locator('.absolute')
      const beadCount = await firstColumnUpperBeads.count()
      expect(beadCount).toBe(SEMPOA_CONFIG.UPPER_BEADS_PER_COLUMN)
      
      // Test each bead individually
      for (let i = 0; i < beadCount; i++) {
        const bead = firstColumnUpperBeads.nth(i)
        
        // Verify bead starts in correct position
        
        // Activate the bead
        await bead.click()
        await page.waitForTimeout(500)
        
        // Get active position
        const activePosition = await bead.evaluate(el => 
          parseInt(window.getComputedStyle(el).getPropertyValue('top'))
        )
        
        // Calculate expected active position using the formula
        const expectedActivePosition = DERIVED_CONFIG.SEPARATOR_TOP - SEMPOA_CONFIG.BEAD.HEIGHT - ((SEMPOA_CONFIG.UPPER_BEADS_PER_COLUMN - 1 - i) * SEMPOA_CONFIG.BEAD.HEIGHT)
        
        // Verify correct positioning
        expect(activePosition).toBe(expectedActivePosition)
        
        // For the lowest bead, verify separator alignment
        if (i === beadCount - 1) {
          const beadBottom = activePosition + SEMPOA_CONFIG.BEAD.HEIGHT
          expect(beadBottom).toBe(DERIVED_CONFIG.SEPARATOR_TOP)
        }
        
        // Deactivate for next test
        await bead.click()
        await page.waitForTimeout(500)
      }
    })

    test('should have upper bead gap equal one bead height when active', async ({ page }) => {
      // Use configuration values  
      const EXPECTED_ACTIVE_POSITION = DERIVED_CONFIG.UPPER_ACTIVE_TOP

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

      // Verify the gap is approximately one bead height
      const gap = parseInt(activePosition) - 0 // Gap from top
      expect(gap).toBe(EXPECTED_ACTIVE_POSITION)
    })

    test('should verify positioning formula works correctly for current configuration', async () => {
      // Test current configuration
      const currentBeadCount = SEMPOA_CONFIG.UPPER_BEADS_PER_COLUMN
      
      for (let row = 0; row < currentBeadCount; row++) {
        // Calculate positions using the formula
        const activeTop = DERIVED_CONFIG.SEPARATOR_TOP - SEMPOA_CONFIG.BEAD.HEIGHT - ((currentBeadCount - 1 - row) * SEMPOA_CONFIG.BEAD.HEIGHT)
        const activeBottom = activeTop + SEMPOA_CONFIG.BEAD.HEIGHT
        
        // Verify positioning is valid for current configuration
        expect(activeTop).toBeGreaterThanOrEqual(0)
        expect(activeBottom).toBeLessThanOrEqual(SEMPOA_CONFIG.SECTIONS.UPPER_HEIGHT)
      }
      
      // Verify lowest bead touches separator
      const lowestActiveTop = DERIVED_CONFIG.SEPARATOR_TOP - SEMPOA_CONFIG.BEAD.HEIGHT - ((currentBeadCount - 1 - (currentBeadCount - 1)) * SEMPOA_CONFIG.BEAD.HEIGHT)
      const lowestActiveBottom = lowestActiveTop + SEMPOA_CONFIG.BEAD.HEIGHT
      expect(lowestActiveBottom).toBe(DERIVED_CONFIG.SEPARATOR_TOP)
    })
  })

  test.describe('Separator Alignment and Intersection', () => {
    test('should position horizontal separator between active upper and lower beads without intersection', async ({ page }) => {
      // Use configuration values
      const SEPARATOR_CENTER = SEMPOA_CONFIG.SEPARATOR.CENTER_POSITION
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

      // Upper bead bottom should touch but not intersect separator top
      expect(upperBeadBottom).toBeCloseTo(SEPARATOR_TOP, 1)
      
      // Lower bead top should touch but not intersect separator bottom
      expect(lowerBeadTop).toBeCloseTo(SEPARATOR_BOTTOM, 1)

      // Verify no intersection
      expect(upperBeadBottom).toBeLessThanOrEqual(SEPARATOR_TOP + 0.5)
      expect(lowerBeadTop).toBeGreaterThanOrEqual(SEPARATOR_BOTTOM - 0.5)
    })

    test('should have lowest active upper bead touch but not intersect horizontal separator', async ({ page }) => {
      // Test with upper beads - activate the lowest one
      const firstColumnUpperBeads = page.locator('.upper-section').first().locator('.absolute')
      const beadCount = await firstColumnUpperBeads.count()
      expect(beadCount).toBe(SEMPOA_CONFIG.UPPER_BEADS_PER_COLUMN)
      
      // Activate the lowest upper bead (last one in the array)
      const lowestUpperBead = firstColumnUpperBeads.nth(beadCount - 1)
      await lowestUpperBead.click()
      await page.waitForTimeout(500)
      
      // Get the active position of the lowest upper bead
      const lowestBeadBox = await lowestUpperBead.boundingBox()
      expect(lowestBeadBox).toBeTruthy()
      
      if (lowestBeadBox) {
        const beadBottom = lowestBeadBox.y + lowestBeadBox.height
        
        // Get separator position relative to the same coordinate system
        const upperSection = page.locator('.upper-section').first()
        const upperSectionBox = await upperSection.boundingBox()
        expect(upperSectionBox).toBeTruthy()
        
        if (upperSectionBox) {
          // Calculate separator position in the same coordinate system as the bead
          const separatorTopAbsolute = upperSectionBox.y + DERIVED_CONFIG.SEPARATOR_TOP
          
          // Check for intersection
          const gapBetweenBeadAndSeparator = separatorTopAbsolute - beadBottom
          
          // The test should enforce that the bead touches but doesn't intersect the separator
          expect(gapBetweenBeadAndSeparator).toBe(0)
          
          // Verify bead bottom position matches separator top
          expect(beadBottom).toBeCloseTo(separatorTopAbsolute, 1) // Allow 1px tolerance for browser differences
          
          // Verify no intersection (bead bottom <= separator top)
          expect(beadBottom).toBeLessThanOrEqual(separatorTopAbsolute)
        }
      }
    })
  })

  test.describe('Bead Interaction and Structure', () => {
    test('should verify beads are positioned correctly in upper and lower sections', async ({ page }) => {
      // Each column should have correct number of beads
      const upperSections = page.locator('.upper-section')
      await expect(upperSections).toHaveCount(SEMPOA_CONFIG.COLUMNS)
      
      const lowerSections = page.locator('.lower-section')
      await expect(lowerSections).toHaveCount(SEMPOA_CONFIG.COLUMNS)
      
      // Verify beads have proper styling indicating they're on rods
      const allBeads = page.locator('[draggable="true"]')
      
      // Should have configured columns × (upper + lower) beads total
      await expect(allBeads).toHaveCount(SEMPOA_CONFIG.COLUMNS * (SEMPOA_CONFIG.UPPER_BEADS_PER_COLUMN + SEMPOA_CONFIG.LOWER_BEADS_PER_COLUMN))
      
      // Verify each bead has the correct styling for wooden appearance
      const totalBeads = SEMPOA_CONFIG.COLUMNS * (SEMPOA_CONFIG.UPPER_BEADS_PER_COLUMN + SEMPOA_CONFIG.LOWER_BEADS_PER_COLUMN)
      for (let i = 0; i < totalBeads; i++) {
        const bead = allBeads.nth(i)
        await expect(bead).toHaveAttribute('draggable', 'true')
        await expect(bead).toHaveCSS('cursor', 'pointer')
      }
    })

    test('should verify bead interaction maintains rod alignment', async ({ page }) => {
      // Get the current value display
      const valueDisplay = page.getByText(/Value: \d+/)
      await expect(valueDisplay).toContainText('Value: 0')
      
      // The board structure uses direct flex layout
      const sempoaBoard = page.locator('.bg-amber-100.rounded.border-2.border-amber-800')
      await expect(sempoaBoard).toBeVisible()
      
      // Verify that the bead container maintains proper column structure
      const boardContainer = sempoaBoard.locator('.flex.justify-center.gap-2').first()
      await expect(boardContainer).toBeVisible()
      
      const columnContainers = boardContainer.locator('> div')
      await expect(columnContainers).toHaveCount(SEMPOA_CONFIG.COLUMNS)
      
      // Each column should maintain its alignment
      for (let i = 0; i < SEMPOA_CONFIG.COLUMNS; i++) {
        const column = columnContainers.nth(i)
        // Check width is reasonable (may be responsive)
        const actualWidth = await column.evaluate(el => el.getBoundingClientRect().width)
        expect(actualWidth).toBeGreaterThan(20) // At least 20px wide
        await expect(column).toHaveClass(/flex-col/)
        await expect(column).toHaveClass(/items-center/)
      }
    })
  })
})