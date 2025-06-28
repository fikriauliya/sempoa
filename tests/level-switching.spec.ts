import { test, expect } from '@playwright/test'
import { TEST_CONFIG } from './test-config'

test('Can switch between levels without crashing', async ({ page }) => {
  await page.goto(TEST_CONFIG.BASE_URL)
  
  // Wait for the page to load
  await page.waitForLoadState('networkidle')
  
  // Click the first level multiple times
  const firstLevel = page.locator('button:has-text("Addition Single Basic")')
  
  for (let i = 0; i < 3; i++) {
    await firstLevel.click()
    
    // Wait for question to appear
    await page.waitForSelector('text=/\\d+ \\+ \\d+ = \\?/')
    
    // Verify app is still responsive
    const submitButton = page.locator('button:has-text("Submit Answer")')
    await expect(submitButton).toBeVisible()
    
    // Wait a moment
    await page.waitForTimeout(100)
  }
  
  // Click the level multiple times rapidly
  await firstLevel.click()
  await firstLevel.click()
  await firstLevel.click()
  
  // Verify app is still responsive after rapid clicks
  await page.waitForSelector('text=/\\d+ \\+ \\d+ = \\?/')
  const submitButton = page.locator('button:has-text("Submit Answer")')
  await expect(submitButton).toBeVisible()
})

test('App remains stable during level interaction', async ({ page }) => {
  await page.goto(TEST_CONFIG.BASE_URL)
  
  // Wait for the page to load
  await page.waitForLoadState('networkidle')
  
  // Select first level
  await page.click('button:has-text("Addition Single Basic")')
  
  // Wait for question
  await page.waitForSelector('text=/\\d+ \\+ \\d+ = \\?/')
  
  // Submit an answer
  await page.click('button:has-text("Submit Answer")')
  
  // Wait for next question
  await page.waitForTimeout(200)
  await page.waitForSelector('text=/\\d+ [\\+\\-] \\d+ = \\?/')
  
  // Click the same level again (should not crash)
  await page.click('button:has-text("Addition Single Basic")')
  
  // Wait for new question 
  await page.waitForSelector('text=/\\d+ \\+ \\d+ = \\?/')
  
  // Verify everything is still working
  const valueDisplay = page.locator('text=/Value: \\d+/')
  await expect(valueDisplay).toBeVisible()
  
  const submitButton = page.locator('button:has-text("Submit Answer")')
  await expect(submitButton).toBeVisible()
})