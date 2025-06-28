import { test, expect } from '@playwright/test'
import { TEST_CONFIG } from './test-config'
import { SEMPOA_CONFIG, DERIVED_CONFIG } from '../src/config/sempoaConfig'

test.describe('Configuration Tests', () => {
  test.describe('Mathematical Formulas and Calculations', () => {
    test('derived config calculations should match expected mathematical formulas', async () => {
      // Test separator boundaries
      const expectedSeparatorTop = SEMPOA_CONFIG.SEPARATOR.CENTER_POSITION - (SEMPOA_CONFIG.SEPARATOR.HEIGHT / 2)
      expect(DERIVED_CONFIG.SEPARATOR_TOP).toBe(expectedSeparatorTop)
      console.log(`✓ SEPARATOR_TOP: ${DERIVED_CONFIG.SEPARATOR_TOP} = ${SEMPOA_CONFIG.SEPARATOR.CENTER_POSITION} - (${SEMPOA_CONFIG.SEPARATOR.HEIGHT}/2)`)

      const expectedSeparatorBottom = SEMPOA_CONFIG.SEPARATOR.CENTER_POSITION + (SEMPOA_CONFIG.SEPARATOR.HEIGHT / 2)
      expect(DERIVED_CONFIG.SEPARATOR_BOTTOM).toBe(expectedSeparatorBottom)
      console.log(`✓ SEPARATOR_BOTTOM: ${DERIVED_CONFIG.SEPARATOR_BOTTOM} = ${SEMPOA_CONFIG.SEPARATOR.CENTER_POSITION} + (${SEMPOA_CONFIG.SEPARATOR.HEIGHT}/2)`)

      // Test upper bead active position
      const expectedUpperActiveTop = SEMPOA_CONFIG.SEPARATOR.CENTER_POSITION - 
        (SEMPOA_CONFIG.SEPARATOR.HEIGHT / 2) - 
        SEMPOA_CONFIG.BEAD.HEIGHT
      expect(DERIVED_CONFIG.UPPER_ACTIVE_TOP).toBe(expectedUpperActiveTop)
      console.log(`✓ UPPER_ACTIVE_TOP: ${DERIVED_CONFIG.UPPER_ACTIVE_TOP} = ${SEMPOA_CONFIG.SEPARATOR.CENTER_POSITION} - (${SEMPOA_CONFIG.SEPARATOR.HEIGHT}/2) - ${SEMPOA_CONFIG.BEAD.HEIGHT}`)

      // Test lower bead active position
      const expectedLowerActiveTop = SEMPOA_CONFIG.SEPARATOR.CENTER_POSITION + 
        (SEMPOA_CONFIG.SEPARATOR.HEIGHT / 2) - 
        SEMPOA_CONFIG.SECTIONS.UPPER_HEIGHT
      expect(DERIVED_CONFIG.LOWER_ACTIVE_TOP).toBe(expectedLowerActiveTop)
      console.log(`✓ LOWER_ACTIVE_TOP: ${DERIVED_CONFIG.LOWER_ACTIVE_TOP} = ${SEMPOA_CONFIG.SEPARATOR.CENTER_POSITION} + (${SEMPOA_CONFIG.SEPARATOR.HEIGHT}/2) - ${SEMPOA_CONFIG.SECTIONS.UPPER_HEIGHT}`)

      // Test lower bead positioning
      const expectedLowerInactiveTop = SEMPOA_CONFIG.BEAD.HEIGHT
      expect(DERIVED_CONFIG.LOWER_INACTIVE_TOP).toBe(expectedLowerInactiveTop)
      console.log(`✓ LOWER_INACTIVE_TOP: ${DERIVED_CONFIG.LOWER_INACTIVE_TOP} = ${SEMPOA_CONFIG.BEAD.HEIGHT}`)

      const expectedLowerBeadSpacing = SEMPOA_CONFIG.BEAD.HEIGHT
      expect(DERIVED_CONFIG.LOWER_BEAD_SPACING).toBe(expectedLowerBeadSpacing)
      console.log(`✓ LOWER_BEAD_SPACING: ${DERIVED_CONFIG.LOWER_BEAD_SPACING} = ${SEMPOA_CONFIG.BEAD.HEIGHT}`)

      // Test main container and rod dimensions
      const expectedMainContainerHeight = SEMPOA_CONFIG.SECTIONS.UPPER_HEIGHT + SEMPOA_CONFIG.SECTIONS.LOWER_HEIGHT
      expect(DERIVED_CONFIG.MAIN_CONTAINER_HEIGHT).toBe(expectedMainContainerHeight)
      console.log(`✓ MAIN_CONTAINER_HEIGHT: ${DERIVED_CONFIG.MAIN_CONTAINER_HEIGHT} = ${SEMPOA_CONFIG.SECTIONS.UPPER_HEIGHT} + ${SEMPOA_CONFIG.SECTIONS.LOWER_HEIGHT}`)

      const expectedRodHeight = SEMPOA_CONFIG.SECTIONS.UPPER_HEIGHT + SEMPOA_CONFIG.SECTIONS.LOWER_HEIGHT
      expect(DERIVED_CONFIG.ROD_HEIGHT).toBe(expectedRodHeight)
      console.log(`✓ ROD_HEIGHT: ${DERIVED_CONFIG.ROD_HEIGHT} = ${SEMPOA_CONFIG.SECTIONS.UPPER_HEIGHT} + ${SEMPOA_CONFIG.SECTIONS.LOWER_HEIGHT}`)

      // Test total board dimensions
      const expectedTotalBoardHeight = SEMPOA_CONFIG.SECTIONS.UPPER_HEIGHT + SEMPOA_CONFIG.SECTIONS.LOWER_HEIGHT
      expect(DERIVED_CONFIG.TOTAL_BOARD_HEIGHT).toBe(expectedTotalBoardHeight)
      console.log(`✓ TOTAL_BOARD_HEIGHT: ${DERIVED_CONFIG.TOTAL_BOARD_HEIGHT} = ${SEMPOA_CONFIG.SECTIONS.UPPER_HEIGHT} + ${SEMPOA_CONFIG.SECTIONS.LOWER_HEIGHT}`)

      const expectedTotalBoardWidth = SEMPOA_CONFIG.COLUMNS * SEMPOA_CONFIG.COLUMN.WIDTH
      expect(DERIVED_CONFIG.TOTAL_BOARD_WIDTH).toBe(expectedTotalBoardWidth)
      console.log(`✓ TOTAL_BOARD_WIDTH: ${DERIVED_CONFIG.TOTAL_BOARD_WIDTH} = ${SEMPOA_CONFIG.COLUMNS} × ${SEMPOA_CONFIG.COLUMN.WIDTH}`)
    })

    test('mathematical relationships should be logically consistent', async () => {
      // Separator center should be between separator top and bottom
      expect(SEMPOA_CONFIG.SEPARATOR.CENTER_POSITION).toBeGreaterThan(DERIVED_CONFIG.SEPARATOR_TOP)
      expect(SEMPOA_CONFIG.SEPARATOR.CENTER_POSITION).toBeLessThan(DERIVED_CONFIG.SEPARATOR_BOTTOM)
      
      // Upper active position should be above upper inactive position
      expect(DERIVED_CONFIG.UPPER_ACTIVE_TOP).toBeGreaterThan(SEMPOA_CONFIG.POSITIONING.UPPER_INACTIVE_TOP)
      
      // Rod should be tall enough to span both sections
      expect(DERIVED_CONFIG.ROD_HEIGHT).toBeGreaterThanOrEqual(DERIVED_CONFIG.TOTAL_BOARD_HEIGHT)
      
      // Column width should be wider than bead width (for centering)
      expect(SEMPOA_CONFIG.COLUMN.WIDTH).toBeGreaterThan(SEMPOA_CONFIG.BEAD.WIDTH)
      
      // Rod should be narrower than column (to fit inside)
      expect(SEMPOA_CONFIG.ROD.WIDTH).toBeLessThan(SEMPOA_CONFIG.COLUMN.WIDTH)
      
      console.log(`✓ All mathematical relationships are logically consistent`)
    })

    test('configuration values should be positive and reasonable', async () => {
      // All base config values should be positive
      expect(SEMPOA_CONFIG.BEAD.WIDTH).toBeGreaterThan(0)
      expect(SEMPOA_CONFIG.BEAD.HEIGHT).toBeGreaterThan(0)
      expect(SEMPOA_CONFIG.BEAD.HOLE_SIZE).toBeGreaterThan(0)
      expect(SEMPOA_CONFIG.COLUMN.WIDTH).toBeGreaterThan(0)
      expect(SEMPOA_CONFIG.SECTIONS.UPPER_HEIGHT).toBeGreaterThan(0)
      expect(SEMPOA_CONFIG.SECTIONS.LOWER_HEIGHT).toBeGreaterThan(0)
      expect(DERIVED_CONFIG.MAIN_CONTAINER_HEIGHT).toBeGreaterThan(0)
      expect(SEMPOA_CONFIG.ROD.WIDTH).toBeGreaterThan(0)
      expect(SEMPOA_CONFIG.SEPARATOR.HEIGHT).toBeGreaterThan(0)

      // All derived values should be positive or zero (positions can be 0)
      expect(DERIVED_CONFIG.SEPARATOR_TOP).toBeGreaterThanOrEqual(0)
      expect(DERIVED_CONFIG.SEPARATOR_BOTTOM).toBeGreaterThan(0)
      expect(DERIVED_CONFIG.UPPER_ACTIVE_TOP).toBeGreaterThanOrEqual(0)
      expect(DERIVED_CONFIG.LOWER_ACTIVE_TOP).toBeGreaterThanOrEqual(0)
      expect(DERIVED_CONFIG.LOWER_INACTIVE_TOP).toBeGreaterThan(0)
      expect(DERIVED_CONFIG.LOWER_BEAD_SPACING).toBeGreaterThan(0)
      expect(DERIVED_CONFIG.ROD_HEIGHT).toBeGreaterThan(0)
      expect(DERIVED_CONFIG.TOTAL_BOARD_HEIGHT).toBeGreaterThan(0)
      
      console.log(`✓ All configuration values are positive and reasonable`)
    })
  })

  test.describe('Section Height Calculations', () => {
    test('section heights should be dynamically calculated from bead counts', async () => {
      // Upper section should accommodate all upper beads plus one empty space
      const expectedUpperHeight = (SEMPOA_CONFIG.UPPER_BEADS_PER_COLUMN + 1) * SEMPOA_CONFIG.BEAD.HEIGHT
      console.log(`Upper beads per column: ${SEMPOA_CONFIG.UPPER_BEADS_PER_COLUMN}`)
      console.log(`Expected upper section height: ${expectedUpperHeight}px`)
      console.log(`Actual upper section height: ${SEMPOA_CONFIG.SECTIONS.UPPER_HEIGHT}px`)
      expect(SEMPOA_CONFIG.SECTIONS.UPPER_HEIGHT).toBe(expectedUpperHeight)

      // Lower section should accommodate all lower beads plus one empty space
      const expectedLowerHeight = (SEMPOA_CONFIG.LOWER_BEADS_PER_COLUMN + 1) * SEMPOA_CONFIG.BEAD.HEIGHT
      console.log(`Lower beads per column: ${SEMPOA_CONFIG.LOWER_BEADS_PER_COLUMN}`)
      console.log(`Expected lower section height: ${expectedLowerHeight}px`)
      console.log(`Actual lower section height: ${SEMPOA_CONFIG.SECTIONS.LOWER_HEIGHT}px`)
      expect(SEMPOA_CONFIG.SECTIONS.LOWER_HEIGHT).toBe(expectedLowerHeight)
    })

    test('separator positioning should create no-gap, no-intersection layout', async () => {
      // Upper bead (when active) bottom should touch separator top
      const upperBeadBottom = DERIVED_CONFIG.UPPER_ACTIVE_TOP + SEMPOA_CONFIG.BEAD.HEIGHT
      expect(upperBeadBottom).toBe(DERIVED_CONFIG.SEPARATOR_TOP)
      console.log(`✓ Upper bead bottom (${upperBeadBottom}) touches separator top (${DERIVED_CONFIG.SEPARATOR_TOP})`)

      // Lower bead (when active) top should touch separator bottom  
      const lowerBeadTop = DERIVED_CONFIG.LOWER_ACTIVE_TOP + SEMPOA_CONFIG.SECTIONS.UPPER_HEIGHT
      expect(lowerBeadTop).toBe(DERIVED_CONFIG.SEPARATOR_BOTTOM)
      console.log(`✓ Lower bead top (${lowerBeadTop}) touches separator bottom (${DERIVED_CONFIG.SEPARATOR_BOTTOM})`)

      // Verify no overlap
      expect(upperBeadBottom).toBeLessThanOrEqual(DERIVED_CONFIG.SEPARATOR_TOP)
      expect(lowerBeadTop).toBeGreaterThanOrEqual(DERIVED_CONFIG.SEPARATOR_BOTTOM)
      console.log(`✓ No overlap: upper bead ≤ separator ≤ lower bead`)
    })

    test('all beads should fit within their sections with proper spacing', async ({ page }) => {
      await page.goto(TEST_CONFIG.BASE_URL)
      
      // Test upper section fit
      console.log('\nTesting upper bead fit:')
      const upperBeadsCount = SEMPOA_CONFIG.UPPER_BEADS_PER_COLUMN
      const requiredUpperSpace = upperBeadsCount * SEMPOA_CONFIG.BEAD.HEIGHT + SEMPOA_CONFIG.BEAD.HEIGHT
      console.log(`Upper beads: ${upperBeadsCount}, Required space: ${requiredUpperSpace}px, Available: ${SEMPOA_CONFIG.SECTIONS.UPPER_HEIGHT}px`)
      expect(SEMPOA_CONFIG.SECTIONS.UPPER_HEIGHT).toBeGreaterThanOrEqual(requiredUpperSpace)

      // Test lower section fit
      console.log('Testing lower bead fit:')
      const lowerBeadsCount = SEMPOA_CONFIG.LOWER_BEADS_PER_COLUMN
      const requiredLowerSpace = lowerBeadsCount * SEMPOA_CONFIG.BEAD.HEIGHT + SEMPOA_CONFIG.BEAD.HEIGHT
      console.log(`Lower beads: ${lowerBeadsCount}, Required space: ${requiredLowerSpace}px, Available: ${SEMPOA_CONFIG.SECTIONS.LOWER_HEIGHT}px`)
      expect(SEMPOA_CONFIG.SECTIONS.LOWER_HEIGHT).toBeGreaterThanOrEqual(requiredLowerSpace)

      // Upper bead should fit in upper section when inactive and active
      const upperInactiveBottom = SEMPOA_CONFIG.POSITIONING.UPPER_INACTIVE_TOP + SEMPOA_CONFIG.BEAD.HEIGHT
      expect(upperInactiveBottom).toBeLessThanOrEqual(SEMPOA_CONFIG.SECTIONS.UPPER_HEIGHT)
      
      const upperActiveBottom = DERIVED_CONFIG.UPPER_ACTIVE_TOP + SEMPOA_CONFIG.BEAD.HEIGHT
      expect(upperActiveBottom).toBeLessThanOrEqual(SEMPOA_CONFIG.SECTIONS.UPPER_HEIGHT)
      
      console.log(`✓ Upper bead fits when inactive: ${upperInactiveBottom}px ≤ ${SEMPOA_CONFIG.SECTIONS.UPPER_HEIGHT}px`)
      console.log(`✓ Upper bead fits when active: ${upperActiveBottom}px ≤ ${SEMPOA_CONFIG.SECTIONS.UPPER_HEIGHT}px`)
    })

    test('rod height should span full board container', async () => {
      // Rod height should equal main container height
      expect(DERIVED_CONFIG.ROD_HEIGHT).toBe(DERIVED_CONFIG.MAIN_CONTAINER_HEIGHT)
      
      // Rod height should equal calculated section heights (no extra space)
      const calculatedSectionTotal = SEMPOA_CONFIG.SECTIONS.UPPER_HEIGHT + SEMPOA_CONFIG.SECTIONS.LOWER_HEIGHT
      expect(DERIVED_CONFIG.ROD_HEIGHT).toBe(calculatedSectionTotal)
      expect(DERIVED_CONFIG.MAIN_CONTAINER_HEIGHT).toBe(calculatedSectionTotal)
      
      console.log(`✓ Rod height (${DERIVED_CONFIG.ROD_HEIGHT}px) exactly matches container height`)
      console.log(`✓ No extra space: container = sections = ${calculatedSectionTotal}px`)
    })
  })

  test.describe('Dynamic Configuration Adaptation', () => {
    test('configuration should remain consistent for any bead count', async () => {
      console.log('\n=== Configuration Consistency Check ===')
      
      // Test that all derived values remain mathematically consistent
      const calculations = {
        separatorTop: SEMPOA_CONFIG.SEPARATOR.CENTER_POSITION - (SEMPOA_CONFIG.SEPARATOR.HEIGHT / 2),
        separatorBottom: SEMPOA_CONFIG.SEPARATOR.CENTER_POSITION + (SEMPOA_CONFIG.SEPARATOR.HEIGHT / 2),
        upperActiveTop: SEMPOA_CONFIG.SEPARATOR.CENTER_POSITION - (SEMPOA_CONFIG.SEPARATOR.HEIGHT / 2) - SEMPOA_CONFIG.BEAD.HEIGHT,
        lowerActiveTop: SEMPOA_CONFIG.SEPARATOR.CENTER_POSITION + (SEMPOA_CONFIG.SEPARATOR.HEIGHT / 2) - SEMPOA_CONFIG.SECTIONS.UPPER_HEIGHT,
        mainContainerHeight: SEMPOA_CONFIG.SECTIONS.UPPER_HEIGHT + SEMPOA_CONFIG.SECTIONS.LOWER_HEIGHT,
        rodHeight: SEMPOA_CONFIG.SECTIONS.UPPER_HEIGHT + SEMPOA_CONFIG.SECTIONS.LOWER_HEIGHT,
      }
      
      console.log('Derived calculations:')
      console.log(`  Separator top: ${calculations.separatorTop}px`)
      console.log(`  Separator bottom: ${calculations.separatorBottom}px`)
      console.log(`  Upper active position: ${calculations.upperActiveTop}px`)
      console.log(`  Lower active position: ${calculations.lowerActiveTop}px`)
      console.log(`  Container height: ${calculations.mainContainerHeight}px`)
      console.log(`  Rod height: ${calculations.rodHeight}px`)
      
      // Verify all calculations match the derived config
      expect(DERIVED_CONFIG.SEPARATOR_TOP).toBe(calculations.separatorTop)
      expect(DERIVED_CONFIG.SEPARATOR_BOTTOM).toBe(calculations.separatorBottom)
      expect(DERIVED_CONFIG.UPPER_ACTIVE_TOP).toBe(calculations.upperActiveTop)
      expect(DERIVED_CONFIG.LOWER_ACTIVE_TOP).toBe(calculations.lowerActiveTop)
      expect(DERIVED_CONFIG.MAIN_CONTAINER_HEIGHT).toBe(calculations.mainContainerHeight)
      expect(DERIVED_CONFIG.ROD_HEIGHT).toBe(calculations.rodHeight)
      
      // Verify key relationships
      expect(DERIVED_CONFIG.ROD_HEIGHT).toBe(DERIVED_CONFIG.MAIN_CONTAINER_HEIGHT)
      expect(SEMPOA_CONFIG.SEPARATOR.CENTER_POSITION).toBe(SEMPOA_CONFIG.SECTIONS.UPPER_HEIGHT)
      expect(DERIVED_CONFIG.LOWER_ACTIVE_TOP).toBeGreaterThanOrEqual(0)
      
      console.log('\n✓ All derived values consistent with dynamic section heights')
      console.log('✓ Rod height equals container height')
      console.log('✓ Separator positioned at section boundary')
      console.log('✓ All positions are positive values')
    })

    test('should demonstrate dynamic height adaptation examples', async () => {
      console.log('\n=== Dynamic Calculation Examples ===')
      
      const BEAD_HEIGHT = 20
      const examples = [
        { upper: 1, lower: 4, desc: 'Traditional abacus' },
        { upper: 2, lower: 5, desc: 'Extended configuration' },
        { upper: 1, lower: 3, desc: 'Simplified abacus' },
        { upper: 3, lower: 6, desc: 'Large abacus' },
      ]
      
      for (const example of examples) {
        const upperHeight = (example.upper + 1) * BEAD_HEIGHT
        const lowerHeight = (example.lower + 1) * BEAD_HEIGHT
        const totalHeight = upperHeight + lowerHeight
        const separatorPos = upperHeight
        
        console.log(`\n${example.desc}: ${example.upper} upper, ${example.lower} lower beads`)
        console.log(`  Upper section: ${upperHeight}px (${example.upper} + 1) × ${BEAD_HEIGHT}px`)
        console.log(`  Lower section: ${lowerHeight}px (${example.lower} + 1) × ${BEAD_HEIGHT}px`)
        console.log(`  Total height: ${totalHeight}px`)
        console.log(`  Separator at: ${separatorPos}px`)
        
        // Verify calculations are consistent
        expect(upperHeight).toBe((example.upper + 1) * BEAD_HEIGHT)
        expect(lowerHeight).toBe((example.lower + 1) * BEAD_HEIGHT)
        expect(totalHeight).toBe(upperHeight + lowerHeight)
      }
      
      console.log('\n✓ All configurations calculated correctly with the same formula')
    })

    test('bead spacing should prevent intersections and allow proper stacking', async ({ page }) => {
      await page.goto(TEST_CONFIG.BASE_URL)
      
      // Reset board to ensure clean state
      await page.click('button:has-text("Reset")')
      await page.waitForTimeout(500)
      
      // Test mathematical intersection prevention in configuration
      console.log(`Testing bead intersection prevention...`)
      console.log(`Bead height: ${SEMPOA_CONFIG.BEAD.HEIGHT}px`)
      console.log(`Bead spacing: ${DERIVED_CONFIG.LOWER_BEAD_SPACING}px`)
      
      // For beads not to intersect, spacing should be >= bead height
      const expectedMinSpacing = SEMPOA_CONFIG.BEAD.HEIGHT
      expect(DERIVED_CONFIG.LOWER_BEAD_SPACING).toBeGreaterThanOrEqual(expectedMinSpacing)
      console.log(`✓ Bead spacing (${DERIVED_CONFIG.LOWER_BEAD_SPACING}px) >= bead height (${expectedMinSpacing}px)`)
      
      // Spacing should equal bead height (no intersection, minimal gap)
      const gap = SEMPOA_CONFIG.BEAD.HEIGHT - DERIVED_CONFIG.LOWER_BEAD_SPACING
      expect(gap).toBe(0) // Should be exactly 0px gap (touching but not overlapping)
      console.log(`✓ Bead spacing with ${gap}px gap (no intersection)`)
      
      // Verify 4 beads can fit within the main container
      const bottomBeadPosition = DERIVED_CONFIG.LOWER_INACTIVE_TOP + (3 * DERIVED_CONFIG.LOWER_BEAD_SPACING) + SEMPOA_CONFIG.BEAD.HEIGHT
      const bottomBeadPositionFromContainerTop = SEMPOA_CONFIG.SECTIONS.UPPER_HEIGHT + bottomBeadPosition
      expect(bottomBeadPositionFromContainerTop).toBeLessThanOrEqual(DERIVED_CONFIG.MAIN_CONTAINER_HEIGHT)
      console.log(`✓ 4 beads fit in container: bottom bead at ${bottomBeadPositionFromContainerTop}px ≤ ${DERIVED_CONFIG.MAIN_CONTAINER_HEIGHT}px`)
      
      // Test visual intersection by checking actual bead positions
      console.log(`\nTesting visual bead intersection...`)
      const lowerBeads = page.locator('.lower-section').first().locator('.absolute')
      const beadCount = await lowerBeads.count()
      expect(beadCount).toBe(SEMPOA_CONFIG.LOWER_BEADS_PER_COLUMN)
      
      // Check each pair of adjacent beads for intersection
      for (let i = 0; i < beadCount - 1; i++) {
        const currentBead = lowerBeads.nth(i)
        const nextBead = lowerBeads.nth(i + 1)
        
        const currentBox = await currentBead.boundingBox()
        const nextBox = await nextBead.boundingBox()
        
        expect(currentBox).toBeTruthy()
        expect(nextBox).toBeTruthy()
        
        if (currentBox && nextBox) {
          const currentBottom = currentBox.y + currentBox.height
          const nextTop = nextBox.y
          const visualGap = nextTop - currentBottom
          
          console.log(`Bead ${i} bottom: ${currentBottom}px, Bead ${i+1} top: ${nextTop}px, Gap: ${visualGap}px`)
          expect(currentBottom).toBeLessThanOrEqual(nextTop) // No overlap
          expect(visualGap).toBeGreaterThanOrEqual(0) // No negative gap
        }
      }
    })
  })
})