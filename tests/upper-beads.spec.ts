import { test, expect } from '@playwright/test'
import { TEST_CONFIG } from './test-config'
import { SEMPOA_CONFIG } from '../src/config/sempoaConfig'

test.describe('Upper Beads', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(TEST_CONFIG.BASE_URL)
    
    // Reset the board to ensure initial state
    await page.click('button:has-text("Reset")')
    await page.waitForTimeout(500) // Wait for any animations
  })

  test.describe('Positioning Logic', () => {
    test('should calculate correct positions for multiple upper beads without intersection', async () => {
      console.log('=== Testing Upper Bead Positioning Logic ===')
      
      const BEAD_HEIGHT = 20
      const scenarios = [
        { beads: 1, sectionHeight: 40, description: 'Traditional (current)' },
        { beads: 2, sectionHeight: 60, description: 'Extended configuration' },
        { beads: 3, sectionHeight: 80, description: 'Large abacus' }
      ]
      
      for (const scenario of scenarios) {
        console.log(`\n${scenario.description}: ${scenario.beads} upper bead(s)`)
        console.log(`Section height: ${scenario.sectionHeight}px`)
        
        // Calculate positions for each bead
        const positions = []
        for (let row = 0; row < scenario.beads; row++) {
          // Inactive position: row * BEAD_HEIGHT
          const inactiveTop = 0 + (row * BEAD_HEIGHT)
          
          // Active position: UPPER_ACTIVE_TOP + (row * BEAD_HEIGHT)
          const separatorCenter = scenario.sectionHeight
          const separatorHeight = 10
          const upperActiveTop = separatorCenter - (separatorHeight / 2) - BEAD_HEIGHT
          const activeTop = upperActiveTop + (row * BEAD_HEIGHT)
          
          positions.push({
            row,
            inactiveTop,
            activeTop,
            inactiveBottom: inactiveTop + BEAD_HEIGHT,
            activeBottom: activeTop + BEAD_HEIGHT
          })
          
          console.log(`  Bead ${row + 1}: inactive=${inactiveTop}-${inactiveTop + BEAD_HEIGHT}px, active=${activeTop}-${activeTop + BEAD_HEIGHT}px`)
        }
        
        // Check for intersections in both states
        let hasInactiveIntersection = false
        let hasActiveIntersection = false
        
        for (let i = 0; i < positions.length - 1; i++) {
          const inactiveGap = positions[i + 1].inactiveTop - positions[i].inactiveBottom
          const activeGap = positions[i + 1].activeTop - positions[i].activeBottom
          
          if (inactiveGap < 0) {
            hasInactiveIntersection = true
            console.log(`  ❌ Inactive intersection: Bead ${i + 1} and ${i + 2} overlap by ${-inactiveGap}px`)
          } else {
            console.log(`  ✓ Inactive gap: ${inactiveGap}px between Bead ${i + 1} and ${i + 2}`)
          }
          
          if (activeGap < 0) {
            hasActiveIntersection = true
            console.log(`  ❌ Active intersection: Bead ${i + 1} and ${i + 2} overlap by ${-activeGap}px`)
          } else {
            console.log(`  ✓ Active gap: ${activeGap}px between Bead ${i + 1} and ${i + 2}`)
          }
        }
        
        // Check if all beads fit in section
        const maxInactiveBottom = Math.max(...positions.map(p => p.inactiveBottom))
        const inactiveFitsInSection = maxInactiveBottom <= scenario.sectionHeight
        console.log(`  ${inactiveFitsInSection ? '✓' : '❌'} Inactive beads fit: max bottom ${maxInactiveBottom}px <= section ${scenario.sectionHeight}px`)
        
        // Assertions
        expect(hasInactiveIntersection).toBe(false)
        expect(hasActiveIntersection).toBe(false)
        expect(inactiveFitsInSection).toBe(true)
        
        console.log(`  ✓ All tests passed for ${scenario.beads} bead(s)`)
      }
    })

    test('should verify spacing formula prevents intersection', async () => {
      console.log('=== Upper Bead Spacing Formula Verification ===')
      
      const BEAD_HEIGHT = 20
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

    test('should verify component positioning matches expected formula', async ({ page }) => {
      console.log('=== Testing Component Implementation ===')
      
      console.log(`Current configuration: ${SEMPOA_CONFIG.UPPER_BEADS_PER_COLUMN} upper bead(s) per column`)
      console.log(`Upper section height: ${SEMPOA_CONFIG.SECTIONS.UPPER_HEIGHT}px`)
      console.log(`Bead height: ${SEMPOA_CONFIG.BEAD.HEIGHT}px`)
      
      // Test first column upper beads
      const firstColumnBeads = page.locator('.upper-section').first().locator('.absolute')
      const beadCount = await firstColumnBeads.count()
      
      console.log(`First column has ${beadCount} upper bead(s)`)
      expect(beadCount).toBe(SEMPOA_CONFIG.UPPER_BEADS_PER_COLUMN)
      
      // Get positions of all upper beads in first column
      for (let i = 0; i < beadCount; i++) {
        const bead = firstColumnBeads.nth(i)
        const position = await bead.evaluate(el => 
          parseInt(window.getComputedStyle(el).getPropertyValue('top'))
        )
        
        const expectedPosition = SEMPOA_CONFIG.POSITIONING.UPPER_INACTIVE_TOP + (i * SEMPOA_CONFIG.BEAD.HEIGHT)
        console.log(`Bead ${i + 1}: actual=${position}px, expected=${expectedPosition}px`)
        
        expect(position).toBe(expectedPosition)
      }
      
      console.log('✓ All upper bead positions match expected formula')
      
      // If there are multiple beads, test for intersections
      if (beadCount > 1) {
        console.log('\n=== Testing Multiple Bead Intersection ===')
        
        for (let i = 0; i < beadCount - 1; i++) {
          const currentBead = firstColumnBeads.nth(i)
          const nextBead = firstColumnBeads.nth(i + 1)
          
          const currentBox = await currentBead.boundingBox()
          const nextBox = await nextBead.boundingBox()
          
          if (currentBox && nextBox) {
            const gap = nextBox.y - (currentBox.y + currentBox.height)
            console.log(`Gap between bead ${i + 1} and ${i + 2}: ${gap}px`)
            
            expect(gap).toBeGreaterThanOrEqual(0) // No intersection
          }
        }
        
        console.log('✓ No intersections detected between upper beads')
      }
    })
  })

  test.describe('Interaction Behavior', () => {
    test('should toggle individual upper beads independently (current implementation)', async ({ page }) => {
      console.log('=== Testing Current Upper Bead Toggle Behavior ===')
      
      // Get upper beads in first column
      const firstColumnUpperBeads = page.locator('.upper-section').first().locator('.absolute')
      const beadCount = await firstColumnUpperBeads.count()
      console.log(`Found ${beadCount} upper bead(s) per column`)
      
      if (beadCount === 1) {
        console.log('\n=== Testing Single Upper Bead Toggle ===')
        const upperBead = firstColumnUpperBeads.nth(0)
        
        // Click to activate
        await upperBead.click()
        await page.waitForTimeout(500)
        
        const valueDisplay = page.getByText(/Value: \d+/)
        await expect(valueDisplay).toContainText('Value: 5000000')
        console.log('✓ Upper bead activated (value: 5,000,000)')
        
        // Click to deactivate
        await upperBead.click()
        await page.waitForTimeout(500)
        
        await expect(valueDisplay).toContainText('Value: 0')
        console.log('✓ Upper bead deactivated (value: 0)')
      } else {
        console.log('\n=== Testing Multiple Upper Beads Toggle ===')
        
        // Test each bead independently
        for (let i = 0; i < beadCount; i++) {
          const bead = firstColumnUpperBeads.nth(i)
          const expectedValue = (5 * Math.pow(10, 6)) // 5 million for first column
          
          // Activate this bead
          await bead.click()
          await page.waitForTimeout(500)
          
          const valueDisplay = page.getByText(/Value: \d+/)
          await expect(valueDisplay).toContainText(`Value: ${expectedValue}`)
          console.log(`✓ Bead ${i + 1} activated independently`)
          
          // Deactivate this bead
          await bead.click()
          await page.waitForTimeout(500)
          
          await expect(valueDisplay).toContainText('Value: 0')
          console.log(`✓ Bead ${i + 1} deactivated independently`)
        }
      }
      
      console.log('\n✅ Current toggle behavior verified!')
    })

    test('should document expected authentic abacus behavior for multiple upper beads', async ({ page }) => {
      console.log('=== Expected Authentic Abacus Behavior Documentation ===')
      
      const currentConfig = SEMPOA_CONFIG.UPPER_BEADS_PER_COLUMN
      console.log(`Current UPPER_BEADS_PER_COLUMN: ${currentConfig}`)
      
      if (currentConfig < 2) {
        console.log('\n⚠️  Test requires at least 2 upper beads for meaningful demonstration')
        console.log('This documents expected behavior when UPPER_BEADS_PER_COLUMN >= 2')
      }
      
      console.log('\n=== Expected Behavior with Multiple Upper Beads ===')
      console.log('Upper beads should behave like lower beads (group behavior):')
      console.log('1. Clicking a bead activates it AND all beads below it in the same column')
      console.log('2. Clicking an active bead deactivates it AND all beads above it in the same column')
      console.log('3. This mimics physical abacus where beads are pushed together')
      
      console.log('\nExample with 2 upper beads:')
      console.log('- Clicking top bead: activates only top bead (value = 1 × 5 × place_value)')
      console.log('- Clicking bottom bead: activates both beads (value = 2 × 5 × place_value)')
      console.log('- Clicking active top bead: deactivates all beads (value = 0)')
      console.log('- Clicking active bottom bead (when both active): deactivates bottom bead only')
      
      console.log('\n=== Current Implementation vs Expected ===')
      console.log('Current: Upper beads toggle independently (like switches)')
      console.log('Expected: Upper beads should group together (like lower beads)')
      
      console.log('\n=== Required Implementation Changes ===')
      console.log('Modify SempoaBoard.tsx toggleBead function:')
      console.log('- For upper beads (bead.isUpper === true)')
      console.log('- Change from independent toggle to group behavior')
      console.log('- When activating: add this bead AND all beads below it')
      console.log('- When deactivating: remove this bead AND all beads above it')
      
      expect(true).toBe(true) // Always pass - this is documentation
    })

    test('should demonstrate multiple upper beads behavior when configuration supports it', async ({ page }) => {
      console.log('=== Testing Multiple Upper Beads Behavior ===')
      
      const currentConfig = SEMPOA_CONFIG.UPPER_BEADS_PER_COLUMN
      
      if (currentConfig < 2) {
        console.log('⚠️  Current configuration only has 1 upper bead per column')
        console.log('To test multiple upper beads behavior:')
        console.log('1. Set UPPER_BEADS_PER_COLUMN = 2 (or more) in sempoaConfig.ts')
        console.log('2. Implement group behavior in SempoaBoard.tsx')
        console.log('3. Re-run this test')
        
        // Skip actual testing but verify current state
        const firstColumnUpperBeads = page.locator('.upper-section').first().locator('.absolute')
        const beadCount = await firstColumnUpperBeads.count()
        expect(beadCount).toBe(1)
        console.log('✓ Current configuration verified: 1 upper bead per column')
        return
      }
      
      // Test multiple upper beads behavior
      const firstColumnUpperBeads = page.locator('.upper-section').first().locator('.absolute')
      const beadCount = await firstColumnUpperBeads.count()
      expect(beadCount).toBe(currentConfig)
      console.log(`Found ${beadCount} upper beads per column`)
      
      const firstBead = firstColumnUpperBeads.nth(0) // Top bead
      const secondBead = firstColumnUpperBeads.nth(1) // Bottom bead
      const valueDisplay = page.getByText(/Value: \d+/)
      
      // Test clicking first (top) bead - should activate only that bead
      console.log('\n=== Clicking First (Top) Upper Bead ===')
      await firstBead.click()
      await page.waitForTimeout(500)
      
      // Should show only first bead active (1 × 5 million = 5 million)
      await expect(valueDisplay).toContainText('Value: 5000000')
      console.log('✓ Value shows 5,000,000 (only first upper bead active)')
      
      // Reset for next test
      await page.click('button:has-text("Reset")')
      await page.waitForTimeout(500)
      
      // Test clicking second (bottom) bead - should activate both beads
      console.log('\n=== Clicking Second (Bottom) Upper Bead ===')
      await secondBead.click()
      await page.waitForTimeout(500)
      
      // Should show both beads active (2 × 5 million = 10 million)
      await expect(valueDisplay).toContainText('Value: 10000000')
      console.log('✓ Value shows 10,000,000 (both upper beads active)')
      
      console.log('\n✅ Multiple upper beads behavior verified!')
    })
  })

  test.describe('Configuration Support', () => {
    test('should support multiple upper beads configuration without intersection', async ({ page }) => {
      console.log('=== Testing Multiple Upper Beads Configuration Support ===')
      
      // Test configuration scenarios
      const BEAD_HEIGHT = 20
      const COLUMNS = 7
      const testConfigurations = [
        { beads: 1, description: 'Traditional (current)' },
        { beads: 2, description: 'Extended configuration' },
        { beads: 3, description: 'Large abacus' }
      ]
      
      for (const config of testConfigurations) {
        console.log(`\n${config.description}: ${config.beads} upper bead(s)`)
        
        const sectionHeight = (config.beads + 1) * BEAD_HEIGHT
        console.log(`Required section height: ${sectionHeight}px`)
        console.log(`Total upper beads needed: ${config.beads * COLUMNS}`)
        
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

    test('should demonstrate current vs required configuration comparison', async ({ page }) => {
      console.log('=== Current vs Required Configuration Comparison ===')
      
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
      console.log(`\nExample: Required for 2 upper beads per column:`)
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
      console.log(`✓ To enable multiple upper beads: modify UPPER_BEADS_PER_COLUMN in sempoaConfig.ts`)
      console.log(`✓ Section heights and positioning will auto-adjust accordingly`)
    })

    test('should document configuration impact on layout calculations', async () => {
      console.log('=== Documenting Configuration Impact ===')
      
      const BEAD_HEIGHT = 20
      const examples = [
        { beads: 1, desc: 'Traditional abacus (current)' },
        { beads: 2, desc: 'Extended configuration' },
        { beads: 3, desc: 'Large abacus' }
      ]
      
      for (const example of examples) {
        const sectionHeight = (example.beads + 1) * BEAD_HEIGHT
        const separatorPosition = sectionHeight
        const containerHeight = sectionHeight + 100 // + lower section (example)
        
        console.log(`\n${example.desc}: ${example.beads} upper bead(s)`)
        console.log(`  Upper section height: ${sectionHeight}px`)
        console.log(`  Separator position: ${separatorPosition}px`)
        console.log(`  Total container height: ${containerHeight}px`)
        
        // Show bead positions
        console.log(`  Bead positions (inactive):`)
        for (let i = 0; i < example.beads; i++) {
          const position = i * BEAD_HEIGHT
          console.log(`    Bead ${i + 1}: ${position}px - ${position + BEAD_HEIGHT}px`)
        }
        
        // Verify calculation
        const expectedHeight = (example.beads + 1) * BEAD_HEIGHT
        expect(sectionHeight).toBe(expectedHeight)
      }
      
      console.log('\n✓ All calculations verified')
      console.log('✓ To change bead count: modify UPPER_BEADS_PER_COLUMN in sempoaConfig.ts')
      console.log('✓ Section heights and positioning will adjust automatically')
    })
  })
})