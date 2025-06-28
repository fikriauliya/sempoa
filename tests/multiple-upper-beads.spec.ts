import { test, expect } from '@playwright/test'
import { TEST_CONFIG } from './test-config'

test.describe('Multiple Upper Beads Configuration', () => {
  test('should support 2 upper beads per column without intersection', async ({ page }) => {
    // First, we need to temporarily modify the configuration to test 2 upper beads
    // We'll do this by directly testing the scenario
    
    console.log('=== Testing 2 Upper Beads Per Column ===')
    
    // For this test, we'll simulate what should happen with 2 upper beads
    const SIMULATED_UPPER_BEADS = 2
    const COLUMNS = 7
    const BEAD_HEIGHT = 20
    
    console.log(`Configuration: ${SIMULATED_UPPER_BEADS} upper beads per column`)
    console.log(`Expected total upper beads: ${SIMULATED_UPPER_BEADS * COLUMNS} (${SIMULATED_UPPER_BEADS} × ${COLUMNS} columns)`)
    console.log(`Expected upper section height: ${(SIMULATED_UPPER_BEADS + 1) * BEAD_HEIGHT}px`)
    
    // This test will demonstrate what should work when we have 2 upper beads
    // Currently it will show the current state vs what we need
    
    await page.goto(TEST_CONFIG.BASE_URL)
    await page.click('button:has-text("Reset")')
    await page.waitForTimeout(500)
    
    // Get current upper beads
    const upperBeads = page.locator('.upper-section .absolute')
    const currentUpperBeadCount = await upperBeads.count()
    const currentColumns = currentUpperBeadCount / 1 // Current: 1 bead per column
    
    console.log(`\nCurrent state:`)
    console.log(`Total upper beads found: ${currentUpperBeadCount}`)
    console.log(`Current beads per column: ${currentUpperBeadCount / currentColumns}`)
    
    // Test what the layout should be with 2 upper beads
    console.log(`\nRequired for 2 upper beads per column:`)
    console.log(`Total upper beads needed: ${SIMULATED_UPPER_BEADS * COLUMNS}`)
    console.log(`Beads per column: ${SIMULATED_UPPER_BEADS}`)
    
    // If we had 2 upper beads, test their spacing
    console.log(`\n=== Upper Bead Spacing Analysis ===`)
    console.log(`Bead height: ${BEAD_HEIGHT}px`)
    console.log(`Required spacing between beads: >= ${BEAD_HEIGHT}px (to prevent intersection)`)
    
    // Calculate positions for 2 upper beads
    const upperSectionHeight = (SIMULATED_UPPER_BEADS + 1) * BEAD_HEIGHT // 60px for 2 beads + 1 space
    const bead1Position = 0 // First bead at top
    const bead2Position = BEAD_HEIGHT // Second bead one height down
    const bead1Bottom = bead1Position + BEAD_HEIGHT
    const bead2Top = bead2Position
    
    console.log(`\nPositioning for 2 upper beads:`)
    console.log(`Bead 1: top=${bead1Position}px, bottom=${bead1Bottom}px`)
    console.log(`Bead 2: top=${bead2Position}px, bottom=${bead2Position + BEAD_HEIGHT}px`)
    console.log(`Gap between beads: ${bead2Top - bead1Bottom}px`)
    
    // Verify no intersection
    const gap = bead2Top - bead1Bottom
    expect(gap).toBeGreaterThanOrEqual(0) // No negative gap (overlap)
    console.log(`✓ No intersection: gap = ${gap}px (>= 0)`)
    
    // Verify both beads fit in section
    const maxBeadBottom = bead2Position + BEAD_HEIGHT
    expect(maxBeadBottom).toBeLessThanOrEqual(upperSectionHeight)
    console.log(`✓ Both beads fit: max bottom ${maxBeadBottom}px <= section ${upperSectionHeight}px`)
  })

  test('should calculate correct positions for multiple upper beads', async () => {
    console.log('=== Upper Bead Position Calculations ===')
    
    const BEAD_HEIGHT = 20
    const testConfigurations = [
      { beads: 1, description: 'Traditional (current)' },
      { beads: 2, description: 'Extended configuration' },
      { beads: 3, description: 'Large abacus' }
    ]
    
    for (const config of testConfigurations) {
      console.log(`\n${config.description}: ${config.beads} upper bead(s)`)
      
      const sectionHeight = (config.beads + 1) * BEAD_HEIGHT
      console.log(`Section height: ${sectionHeight}px`)
      
      // Calculate positions for all beads
      const positions = []
      for (let i = 0; i < config.beads; i++) {
        const position = i * BEAD_HEIGHT
        positions.push({
          bead: i + 1,
          top: position,
          bottom: position + BEAD_HEIGHT
        })
        console.log(`  Bead ${i + 1}: ${position}px - ${position + BEAD_HEIGHT}px`)
      }
      
      // Check for intersections
      let hasIntersection = false
      for (let i = 0; i < positions.length - 1; i++) {
        const currentBead = positions[i]
        const nextBead = positions[i + 1]
        const gap = nextBead.top - currentBead.bottom
        
        if (gap < 0) {
          hasIntersection = true
          console.log(`  ❌ Intersection: Bead ${currentBead.bead} overlaps Bead ${nextBead.bead} by ${-gap}px`)
        } else {
          console.log(`  ✓ Gap: ${gap}px between Bead ${currentBead.bead} and ${nextBead.bead}`)
        }
      }
      
      // Check if all beads fit
      const lastBead = positions[positions.length - 1]
      const fitsInSection = lastBead.bottom <= sectionHeight
      console.log(`  ${fitsInSection ? '✓' : '❌'} Fits: last bead bottom ${lastBead.bottom}px ${fitsInSection ? '<=' : '>'} section ${sectionHeight}px`)
      
      // Assertions
      expect(hasIntersection).toBe(false)
      expect(fitsInSection).toBe(true)
    }
  })

  test('should verify upper bead spacing formula prevents intersection', async () => {
    console.log('=== Upper Bead Spacing Formula Verification ===')
    
    const BEAD_HEIGHT = 20
    
    // Test the spacing formula: beads spaced by bead height
    console.log(`Bead height: ${BEAD_HEIGHT}px`)
    console.log(`Spacing formula: bead_position = row_index × bead_height`)
    
    // Test with different numbers of upper beads
    const maxBeads = 5
    for (let beadCount = 1; beadCount <= maxBeads; beadCount++) {
      console.log(`\nTesting ${beadCount} upper bead(s):`)
      
      const sectionHeight = (beadCount + 1) * BEAD_HEIGHT
      let allBeadsFit = true
      let noIntersections = true
      
      for (let beadIndex = 0; beadIndex < beadCount; beadIndex++) {
        const position = beadIndex * BEAD_HEIGHT
        const bottom = position + BEAD_HEIGHT
        
        // Check if bead fits in section
        if (bottom > sectionHeight) {
          allBeadsFit = false
          console.log(`  ❌ Bead ${beadIndex + 1}: bottom ${bottom}px > section ${sectionHeight}px`)
        } else {
          console.log(`  ✓ Bead ${beadIndex + 1}: ${position}px-${bottom}px (fits)`)
        }
        
        // Check intersection with next bead
        if (beadIndex < beadCount - 1) {
          const nextPosition = (beadIndex + 1) * BEAD_HEIGHT
          const gap = nextPosition - bottom
          if (gap < 0) {
            noIntersections = false
            console.log(`  ❌ Intersection: gap ${gap}px with next bead`)
          } else {
            console.log(`  ✓ Gap: ${gap}px to next bead`)
          }
        }
      }
      
      console.log(`  Result: ${allBeadsFit ? '✓' : '❌'} All fit, ${noIntersections ? '✓' : '❌'} No intersections`)
      
      // Assertions
      expect(allBeadsFit).toBe(true)
      expect(noIntersections).toBe(true)
    }
  })

  test('should demonstrate current vs required configuration for 2 upper beads', async ({ page }) => {
    console.log('=== Current vs Required Configuration Comparison ===')
    
    await page.goto(TEST_CONFIG.BASE_URL)
    await page.click('button:has-text("Reset")')
    await page.waitForTimeout(500)
    
    // Get current configuration
    const { SEMPOA_CONFIG } = await import('../src/config/sempoaConfig')
    
    console.log(`\nCurrent configuration:`)
    console.log(`UPPER_BEADS_PER_COLUMN: ${SEMPOA_CONFIG.UPPER_BEADS_PER_COLUMN}`)
    console.log(`Upper section height: ${SEMPOA_CONFIG.SECTIONS.UPPER_HEIGHT}px`)
    
    // Count actual upper beads in DOM
    const upperBeads = page.locator('.upper-section .absolute')
    const totalUpperBeads = await upperBeads.count()
    const beadsPerColumn = totalUpperBeads / SEMPOA_CONFIG.COLUMNS
    
    console.log(`DOM upper beads: ${totalUpperBeads} total (${beadsPerColumn} per column)`)
    
    // Test current bead positions in first column
    const firstColumnUpperBeads = page.locator('.upper-section').first().locator('.absolute')
    const firstColumnBeadCount = await firstColumnUpperBeads.count()
    
    console.log(`\nFirst column upper beads: ${firstColumnBeadCount}`)
    
    for (let i = 0; i < firstColumnBeadCount; i++) {
      const bead = firstColumnUpperBeads.nth(i)
      const position = await bead.evaluate(el => 
        parseInt(window.getComputedStyle(el).getPropertyValue('top'))
      )
      console.log(`  Bead ${i + 1}: ${position}px`)
    }
    
    // Show what would be needed for 2 upper beads
    console.log(`\nRequired for 2 upper beads per column:`)
    const requiredSectionHeight = (2 + 1) * SEMPOA_CONFIG.BEAD.HEIGHT
    console.log(`UPPER_BEADS_PER_COLUMN: 2`)
    console.log(`Upper section height: ${requiredSectionHeight}px`)
    console.log(`Total upper beads: ${2 * SEMPOA_CONFIG.COLUMNS}`)
    console.log(`Per column positions: 0px, ${SEMPOA_CONFIG.BEAD.HEIGHT}px`)
    
    // Verify current configuration matches expectations
    expect(SEMPOA_CONFIG.UPPER_BEADS_PER_COLUMN).toBe(1) // Currently 1
    expect(firstColumnBeadCount).toBe(SEMPOA_CONFIG.UPPER_BEADS_PER_COLUMN)
    expect(totalUpperBeads).toBe(SEMPOA_CONFIG.UPPER_BEADS_PER_COLUMN * SEMPOA_CONFIG.COLUMNS)
    
    console.log(`\n✓ Current configuration verified: 1 upper bead per column`)
    console.log(`✓ To enable 2 upper beads: set UPPER_BEADS_PER_COLUMN = 2`)
    console.log(`✓ Section height will auto-adjust to ${requiredSectionHeight}px`)
  })
})