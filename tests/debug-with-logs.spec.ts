import { test, expect } from '@playwright/test'
import { TEST_CONFIG } from './test-config'

test('Debug with console logs', async ({ page }) => {
  // Listen to console logs
  page.on('console', msg => {
    console.log('BROWSER:', msg.text())
  })
  
  await page.goto(TEST_CONFIG.BASE_URL)
  await page.waitForLoadState('networkidle')
  
  console.log('=== Trying to click Addition Single Big Friend ===')
  
  // Try to click the Big Friend level
  const bigFriendLevel = page.locator('button:has-text("Addition Single Big Friend")')
  await bigFriendLevel.click({ force: true }) // Force click to bypass disabled state
  
  // Wait a moment to see what happens
  await page.waitForTimeout(1000)
  
  console.log('=== After clicking Big Friend level ===')
  
  // Check if any questions appeared
  const questionCount = await page.locator('text=/\\d+ \\+ \\d+ = \\?/').count()
  console.log('Question count after clicking locked level:', questionCount)
  
  // Now try clicking the first level to verify app is still responsive
  console.log('=== Clicking first level ===')
  await page.click('button:has-text("Addition Single Basic")')
  await page.waitForSelector('text=/\\d+ \\+ \\d+ = \\?/')
  
  console.log('=== App is responsive ===')
})