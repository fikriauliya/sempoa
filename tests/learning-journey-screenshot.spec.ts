import { test, expect } from '@playwright/test'
import { TEST_CONFIG } from './test-config'

test('Learning journey UI screenshot', async ({ page }) => {
  await page.goto(TEST_CONFIG.BASE_URL)
  
  // Wait for the page to load completely
  await page.waitForLoadState('networkidle')
  
  // Wait for the learning journey component to be visible
  await page.waitForSelector('h2:has-text("Learning Journey")', { timeout: 10000 })
  
  // Take a screenshot of the full page showing the new learning journey component
  await page.screenshot({ 
    path: 'learning-journey-ui.png',
    fullPage: true
  })
})