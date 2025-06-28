import { test, expect } from '@playwright/test'

test('Learning journey UI screenshot', async ({ page }) => {
  await page.goto('http://localhost:5178')
  
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