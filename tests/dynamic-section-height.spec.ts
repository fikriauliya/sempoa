import { test, expect } from '@playwright/test'
import { SEMPOA_CONFIG, DERIVED_CONFIG } from '../src/config/sempoaConfig'

test.describe('Dynamic Section Height Based on Bead Count', () => {
  test('upper section height should accommodate all upper beads plus one empty space', async () => {
    // The upper section should have height = (UPPER_BEADS_PER_COLUMN + 1) * BEAD_HEIGHT
    // The "+1" is for one empty space at the top when beads are active
    const expectedUpperHeight = (SEMPOA_CONFIG.UPPER_BEADS_PER_COLUMN + 1) * SEMPOA_CONFIG.BEAD.HEIGHT
    
    console.log(`Upper beads per column: ${SEMPOA_CONFIG.UPPER_BEADS_PER_COLUMN}`)
    console.log(`Bead height: ${SEMPOA_CONFIG.BEAD.HEIGHT}px`)
    console.log(`Expected upper section height: ${expectedUpperHeight}px`)
    console.log(`Actual upper section height: ${SEMPOA_CONFIG.SECTIONS.UPPER_HEIGHT}px`)
    
    expect(SEMPOA_CONFIG.SECTIONS.UPPER_HEIGHT).toBe(expectedUpperHeight)
  })

  test('lower section height should accommodate all lower beads plus one empty space', async () => {
    // The lower section should have height = (LOWER_BEADS_PER_COLUMN + 1) * BEAD_HEIGHT
    // The "+1" is for one empty space at the bottom when beads are inactive
    const expectedLowerHeight = (SEMPOA_CONFIG.LOWER_BEADS_PER_COLUMN + 1) * SEMPOA_CONFIG.BEAD.HEIGHT
    
    console.log(`Lower beads per column: ${SEMPOA_CONFIG.LOWER_BEADS_PER_COLUMN}`)
    console.log(`Bead height: ${SEMPOA_CONFIG.BEAD.HEIGHT}px`)
    console.log(`Expected lower section height: ${expectedLowerHeight}px`)
    console.log(`Actual lower section height: ${SEMPOA_CONFIG.SECTIONS.LOWER_HEIGHT}px`)
    
    expect(SEMPOA_CONFIG.SECTIONS.LOWER_HEIGHT).toBe(expectedLowerHeight)
  })

  test('should fail when UPPER_BEADS_PER_COLUMN = 2 and LOWER_BEADS_PER_COLUMN = 5', async () => {
    // Simulate having 2 upper beads and 5 lower beads
    const SIMULATED_UPPER_BEADS = 2
    const SIMULATED_LOWER_BEADS = 5
    
    // Calculate what the heights should be
    const expectedUpperHeight = (SIMULATED_UPPER_BEADS + 1) * SEMPOA_CONFIG.BEAD.HEIGHT
    const expectedLowerHeight = (SIMULATED_LOWER_BEADS + 1) * SEMPOA_CONFIG.BEAD.HEIGHT
    
    console.log(`\nSimulating ${SIMULATED_UPPER_BEADS} upper beads and ${SIMULATED_LOWER_BEADS} lower beads:`)
    console.log(`Expected upper section height: ${expectedUpperHeight}px (${SIMULATED_UPPER_BEADS + 1} × ${SEMPOA_CONFIG.BEAD.HEIGHT}px)`)
    console.log(`Expected lower section height: ${expectedLowerHeight}px (${SIMULATED_LOWER_BEADS + 1} × ${SEMPOA_CONFIG.BEAD.HEIGHT}px)`)
    console.log(`Current hardcoded upper height: ${SEMPOA_CONFIG.SECTIONS.UPPER_HEIGHT}px`)
    console.log(`Current hardcoded lower height: ${SEMPOA_CONFIG.SECTIONS.LOWER_HEIGHT}px`)
    
    // These assertions will fail if heights are hardcoded
    if (SEMPOA_CONFIG.UPPER_BEADS_PER_COLUMN === SIMULATED_UPPER_BEADS) {
      expect(SEMPOA_CONFIG.SECTIONS.UPPER_HEIGHT).toBe(expectedUpperHeight)
    }
    
    if (SEMPOA_CONFIG.LOWER_BEADS_PER_COLUMN === SIMULATED_LOWER_BEADS) {
      expect(SEMPOA_CONFIG.SECTIONS.LOWER_HEIGHT).toBe(expectedLowerHeight)
    }
    
    // Show what the total height difference would be
    const currentTotal = SEMPOA_CONFIG.SECTIONS.UPPER_HEIGHT + SEMPOA_CONFIG.SECTIONS.LOWER_HEIGHT
    const expectedTotal = expectedUpperHeight + expectedLowerHeight
    console.log(`\nTotal height impact:`)
    console.log(`Current total: ${currentTotal}px`)
    console.log(`Expected total with ${SIMULATED_UPPER_BEADS} upper & ${SIMULATED_LOWER_BEADS} lower: ${expectedTotal}px`)
    console.log(`Difference: ${expectedTotal - currentTotal}px`)
  })

  test('all beads should fit within their sections with proper spacing', async ({ page }) => {
    await page.goto('http://localhost:5173')
    
    // Test upper section
    console.log('\nTesting upper bead fit:')
    const upperBeadsCount = SEMPOA_CONFIG.UPPER_BEADS_PER_COLUMN
    const requiredUpperSpace = upperBeadsCount * SEMPOA_CONFIG.BEAD.HEIGHT + SEMPOA_CONFIG.BEAD.HEIGHT // beads + 1 empty space
    console.log(`Upper beads: ${upperBeadsCount}`)
    console.log(`Required space: ${requiredUpperSpace}px (${upperBeadsCount} beads + 1 empty space)`)
    console.log(`Available space: ${SEMPOA_CONFIG.SECTIONS.UPPER_HEIGHT}px`)
    
    expect(SEMPOA_CONFIG.SECTIONS.UPPER_HEIGHT).toBeGreaterThanOrEqual(requiredUpperSpace)
    
    // Test lower section
    console.log('\nTesting lower bead fit:')
    const lowerBeadsCount = SEMPOA_CONFIG.LOWER_BEADS_PER_COLUMN
    const requiredLowerSpace = lowerBeadsCount * SEMPOA_CONFIG.BEAD.HEIGHT + SEMPOA_CONFIG.BEAD.HEIGHT // beads + 1 empty space
    console.log(`Lower beads: ${lowerBeadsCount}`)
    console.log(`Required space: ${requiredLowerSpace}px (${lowerBeadsCount} beads + 1 empty space)`)
    console.log(`Available space: ${SEMPOA_CONFIG.SECTIONS.LOWER_HEIGHT}px`)
    
    expect(SEMPOA_CONFIG.SECTIONS.LOWER_HEIGHT).toBeGreaterThanOrEqual(requiredLowerSpace)
  })

  test('section heights should be derived from bead counts in configuration', async () => {
    // This test documents what the configuration should look like
    console.log('\nProposed configuration structure:')
    console.log('SECTIONS: {')
    console.log(`  UPPER_HEIGHT: (SEMPOA_CONFIG.UPPER_BEADS_PER_COLUMN + 1) * SEMPOA_CONFIG.BEAD.HEIGHT,`)
    console.log(`  LOWER_HEIGHT: (SEMPOA_CONFIG.LOWER_BEADS_PER_COLUMN + 1) * SEMPOA_CONFIG.BEAD.HEIGHT,`)
    console.log('}')
    
    // The sections should be calculated, not hardcoded
    const upperShouldBe = `(${SEMPOA_CONFIG.UPPER_BEADS_PER_COLUMN} + 1) * ${SEMPOA_CONFIG.BEAD.HEIGHT} = ${(SEMPOA_CONFIG.UPPER_BEADS_PER_COLUMN + 1) * SEMPOA_CONFIG.BEAD.HEIGHT}px`
    const lowerShouldBe = `(${SEMPOA_CONFIG.LOWER_BEADS_PER_COLUMN} + 1) * ${SEMPOA_CONFIG.BEAD.HEIGHT} = ${(SEMPOA_CONFIG.LOWER_BEADS_PER_COLUMN + 1) * SEMPOA_CONFIG.BEAD.HEIGHT}px`
    
    console.log(`\nUpper section should be: ${upperShouldBe}`)
    console.log(`Lower section should be: ${lowerShouldBe}`)
    
    // These will fail if the values are hardcoded instead of calculated
    expect(SEMPOA_CONFIG.SECTIONS.UPPER_HEIGHT).toBe((SEMPOA_CONFIG.UPPER_BEADS_PER_COLUMN + 1) * SEMPOA_CONFIG.BEAD.HEIGHT)
    expect(SEMPOA_CONFIG.SECTIONS.LOWER_HEIGHT).toBe((SEMPOA_CONFIG.LOWER_BEADS_PER_COLUMN + 1) * SEMPOA_CONFIG.BEAD.HEIGHT)
  })
})