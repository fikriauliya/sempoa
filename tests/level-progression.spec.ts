import { test, expect } from '@playwright/test'
import { TEST_CONFIG } from './test-config'

test('Initial level unlocking state is correct', async ({ page }) => {
  await page.goto(TEST_CONFIG.BASE_URL)
  
  // Wait for the page to load
  await page.waitForLoadState('networkidle')
  
  // Verify only first level is unlocked initially
  const firstLevel = page.locator('button:has-text("Addition Single Basic")')
  const secondLevel = page.locator('button:has-text("Addition Single Small Friend")')
  
  // First level should be selectable
  await expect(firstLevel).not.toHaveClass(/cursor-not-allowed/)
  
  // Second level should be locked
  await expect(secondLevel).toHaveClass(/cursor-not-allowed/)
  
  // Select first level
  await firstLevel.click()
  
  // Wait for question to appear
  await page.waitForSelector('text=/\\d+ \\+ \\d+ = \\?/')
  
  // Verify we can interact with the level
  const submitButton = page.locator('button:has-text("Submit Answer")')
  await expect(submitButton).toBeVisible()
})

test('All 36 levels are present in learning journey', async ({ page }) => {
  await page.goto(TEST_CONFIG.BASE_URL)
  
  // Wait for the page to load
  await page.waitForLoadState('networkidle')
  
  // Check that all level buttons are present in the scrollable area
  const levelContainer = page.locator('.max-h-64.overflow-y-auto.space-y-2')
  const levelButtons = levelContainer.locator('button')
  const count = await levelButtons.count()
  
  // Should have 36 levels total (3 operations × 3 difficulties × 4 complement types)
  expect(count).toBe(36)
  
  // Verify first level is unlocked
  const firstButton = levelButtons.first()
  await expect(firstButton).not.toHaveClass(/cursor-not-allowed/)
  
  // Verify second level is locked
  const secondButton = levelButtons.nth(1)
  await expect(secondButton).toHaveClass(/cursor-not-allowed/)
})