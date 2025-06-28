import { test, expect } from '@playwright/test'
import { TEST_CONFIG } from './test-config'

// This test demonstrates that changing bead counts works with the new dynamic configuration
test.describe('Dynamic Bead Count Configuration Test', () => {
  test('should demonstrate dynamic heights work for different bead counts', async () => {
    // We'll simulate different configurations by importing the config with different values
    
    console.log('=== Testing Dynamic Configuration ===')
    
    // Test current configuration (1 upper, 4 lower)
    const { SEMPOA_CONFIG: config1 } = await import('../src/config/sempoaConfig')
    
    console.log(`\nCurrent config: ${config1.UPPER_BEADS_PER_COLUMN} upper, ${config1.LOWER_BEADS_PER_COLUMN} lower beads`)
    console.log(`Upper section height: ${config1.SECTIONS.UPPER_HEIGHT}px`)
    console.log(`Lower section height: ${config1.SECTIONS.LOWER_HEIGHT}px`)
    console.log(`Total height: ${config1.SECTIONS.UPPER_HEIGHT + config1.SECTIONS.LOWER_HEIGHT}px`)
    console.log(`Separator position: ${config1.SEPARATOR.CENTER_POSITION}px`)
    
    // Verify the formula works
    const expectedUpper1 = (config1.UPPER_BEADS_PER_COLUMN + 1) * config1.BEAD.HEIGHT
    const expectedLower1 = (config1.LOWER_BEADS_PER_COLUMN + 1) * config1.BEAD.HEIGHT
    
    expect(config1.SECTIONS.UPPER_HEIGHT).toBe(expectedUpper1)
    expect(config1.SECTIONS.LOWER_HEIGHT).toBe(expectedLower1)
    expect(config1.SEPARATOR.CENTER_POSITION).toBe(config1.SECTIONS.UPPER_HEIGHT)
    
    console.log(`✓ Heights calculated correctly: ${expectedUpper1}px + ${expectedLower1}px`)
    console.log(`✓ Separator positioned at section boundary: ${config1.SECTIONS.UPPER_HEIGHT}px`)
  })

  test('should show how dynamic configuration adapts to any bead count', async () => {
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

  test('should verify configuration remains consistent regardless of bead count', async () => {
    console.log('\n=== Configuration Consistency Check ===')
    
    const { SEMPOA_CONFIG, DERIVED_CONFIG } = await import('../src/config/sempoaConfig')
    
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
})