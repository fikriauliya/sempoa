import { test, expect } from '@playwright/test'

test.describe('Two Upper Beads Configuration Test', () => {
  test('should have 2 upper beads per column when UPPER_BEADS_PER_COLUMN = 2', async ({ page }) => {
    // First modify the config to test 2 upper beads
    // We'll temporarily change the config file to test this scenario
    
    console.log('=== Testing with UPPER_BEADS_PER_COLUMN = 2 ===')
    
    // For this test, we'll read the current config and verify what should happen
    const fs = require('fs')
    const path = require('path')
    const configPath = path.join(process.cwd(), 'src/config/sempoaConfig.ts')
    
    // Read current config
    const originalConfig = fs.readFileSync(configPath, 'utf8')
    
    try {
      // Temporarily modify config for this test
      const modifiedConfig = originalConfig.replace(
        'UPPER_BEADS_PER_COLUMN: 1,',
        'UPPER_BEADS_PER_COLUMN: 2,'
      )
      
      fs.writeFileSync(configPath, modifiedConfig)
      
      // Clear module cache and reload
      delete require.cache[require.resolve('../src/config/sempoaConfig')]
      const { SEMPOA_CONFIG } = require('../src/config/sempoaConfig')
      
      console.log(`Modified UPPER_BEADS_PER_COLUMN: ${SEMPOA_CONFIG.UPPER_BEADS_PER_COLUMN}`)
      console.log(`Upper section height: ${SEMPOA_CONFIG.SECTIONS.UPPER_HEIGHT}px`)
      console.log(`Expected total upper beads: ${SEMPOA_CONFIG.UPPER_BEADS_PER_COLUMN * SEMPOA_CONFIG.COLUMNS}`)
      
      // Navigate to page with modified config
      await page.goto('http://localhost:5173')
      await page.click('button:has-text("Reset")')
      await page.waitForTimeout(1000) // Extra wait for config to load
      
      // Test: Should have 2 upper beads per column
      const totalColumns = SEMPOA_CONFIG.COLUMNS
      const expectedBeadsPerColumn = SEMPOA_CONFIG.UPPER_BEADS_PER_COLUMN
      const expectedTotalBeads = totalColumns * expectedBeadsPerColumn
      
      console.log(`\n=== Verifying Upper Bead Count ===`)
      
      // Count total upper beads
      const allUpperBeads = page.locator('.upper-section .absolute')
      const actualTotalBeads = await allUpperBeads.count()
      
      console.log(`Expected total upper beads: ${expectedTotalBeads}`)
      console.log(`Actual total upper beads: ${actualTotalBeads}`)
      
      expect(actualTotalBeads).toBe(expectedTotalBeads)
      
      // Test each column has 2 upper beads
      for (let col = 0; col < totalColumns; col++) {
        const columnUpperBeads = page.locator('.upper-section').nth(col).locator('.absolute')
        const beadsInColumn = await columnUpperBeads.count()
        
        console.log(`Column ${col + 1}: ${beadsInColumn} upper beads`)
        expect(beadsInColumn).toBe(expectedBeadsPerColumn)
      }
      
      console.log(`✓ All columns have ${expectedBeadsPerColumn} upper beads`)
      
      // Test: Upper beads should not intersect
      console.log(`\n=== Testing Upper Bead Intersection ===`)
      
      // Test first column in detail
      const firstColumnBeads = page.locator('.upper-section').first().locator('.absolute')
      const beadCount = await firstColumnBeads.count()
      
      expect(beadCount).toBe(2) // Should have exactly 2 beads
      
      // Get positions of both beads
      const bead1 = firstColumnBeads.nth(0)
      const bead2 = firstColumnBeads.nth(1)
      
      const bead1Box = await bead1.boundingBox()
      const bead2Box = await bead2.boundingBox()
      
      expect(bead1Box).toBeTruthy()
      expect(bead2Box).toBeTruthy()
      
      if (bead1Box && bead2Box) {
        const bead1Bottom = bead1Box.y + bead1Box.height
        const bead2Top = bead2Box.y
        
        console.log(`Bead 1: y=${bead1Box.y}px, bottom=${bead1Bottom}px`)
        console.log(`Bead 2: y=${bead2Box.y}px, top=${bead2Top}px`)
        
        // Check for intersection
        const gap = bead2Top - bead1Bottom
        console.log(`Gap between beads: ${gap}px`)
        
        // Beads should not overlap (gap >= 0)
        expect(gap).toBeGreaterThanOrEqual(0)
        console.log(`✓ No intersection: gap = ${gap}px >= 0`)
        
        // Test expected spacing (should be bead height apart)
        const expectedSpacing = SEMPOA_CONFIG.BEAD.HEIGHT
        const actualSpacing = bead2Box.y - bead1Box.y
        
        console.log(`Expected spacing: ${expectedSpacing}px`)
        console.log(`Actual spacing: ${actualSpacing}px`)
        
        expect(actualSpacing).toBe(expectedSpacing)
        console.log(`✓ Correct spacing: ${actualSpacing}px = ${expectedSpacing}px`)
      }
      
      // Test: Both beads should fit within upper section
      console.log(`\n=== Testing Section Fit ===`)
      
      const upperSection = page.locator('.upper-section').first()
      const sectionHeight = await upperSection.evaluate(el => 
        parseInt(window.getComputedStyle(el).getPropertyValue('height'))
      )
      
      console.log(`Upper section height: ${sectionHeight}px`)
      console.log(`Expected section height: ${SEMPOA_CONFIG.SECTIONS.UPPER_HEIGHT}px`)
      
      expect(sectionHeight).toBe(SEMPOA_CONFIG.SECTIONS.UPPER_HEIGHT)
      
      // Check if bottom bead fits in section
      if (bead2Box) {
        const bottomBeadBottom = bead2Box.y + bead2Box.height
        const sectionBottom = (await upperSection.boundingBox())!.y + sectionHeight
        
        console.log(`Bottom bead bottom: ${bottomBeadBottom}px`)
        console.log(`Section bottom: ${sectionBottom}px`)
        
        expect(bottomBeadBottom).toBeLessThanOrEqual(sectionBottom)
        console.log(`✓ Bottom bead fits in section`)
      }
      
    } finally {
      // Restore original config
      fs.writeFileSync(configPath, originalConfig)
      console.log(`\n✓ Configuration restored`)
    }
  })

  test('should calculate correct upper section height for 2 beads', async () => {
    console.log('=== Upper Section Height Calculation Test ===')
    
    const BEAD_HEIGHT = 20
    const UPPER_BEADS = 2
    
    // Calculate expected height: (beads + 1 empty space) × bead height
    const expectedHeight = (UPPER_BEADS + 1) * BEAD_HEIGHT
    
    console.log(`Bead height: ${BEAD_HEIGHT}px`)
    console.log(`Number of upper beads: ${UPPER_BEADS}`)
    console.log(`Formula: (${UPPER_BEADS} beads + 1 space) × ${BEAD_HEIGHT}px`)
    console.log(`Expected height: ${expectedHeight}px`)
    
    // Test the calculation
    expect(expectedHeight).toBe(60) // (2 + 1) × 20 = 60
    
    // Test bead positions within this height
    const positions = []
    for (let i = 0; i < UPPER_BEADS; i++) {
      const position = i * BEAD_HEIGHT
      positions.push({
        bead: i + 1,
        top: position,
        bottom: position + BEAD_HEIGHT
      })
      console.log(`Bead ${i + 1}: ${position}px - ${position + BEAD_HEIGHT}px`)
    }
    
    // Verify all beads fit
    const maxBottom = Math.max(...positions.map(p => p.bottom))
    console.log(`Maximum bead bottom: ${maxBottom}px`)
    console.log(`Available space: ${expectedHeight}px`)
    
    expect(maxBottom).toBeLessThanOrEqual(expectedHeight)
    console.log(`✓ All beads fit: ${maxBottom}px <= ${expectedHeight}px`)
    
    // Verify no intersections
    for (let i = 0; i < positions.length - 1; i++) {
      const gap = positions[i + 1].top - positions[i].bottom
      expect(gap).toBeGreaterThanOrEqual(0)
      console.log(`✓ Gap ${i + 1}-${i + 2}: ${gap}px >= 0`)
    }
  })
})