import { test, expect } from '@playwright/test'
import { TEST_CONFIG } from './test-config'

test('Debug clicking locked Addition Single Big Friend level', async ({ page }) => {
  await page.goto(TEST_CONFIG.BASE_URL)
  
  // Wait for the page to load
  await page.waitForLoadState('networkidle')
  
  // Find the "Addition Single Big Friend" level
  const bigFriendLevel = page.locator('button:has-text("Addition Single Big Friend")')
  
  // Check if it exists
  await expect(bigFriendLevel).toBeVisible()
  
  // Check if it's disabled
  const isDisabled = await bigFriendLevel.getAttribute('disabled')
  console.log('Big Friend level disabled attribute:', isDisabled)
  
  // Check the classes
  const className = await bigFriendLevel.getAttribute('class')
  console.log('Big Friend level classes:', className)
  
  // Try to click it (this should not work if properly disabled)
  try {
    await bigFriendLevel.click({ timeout: 1000 })
    console.log('Click succeeded (this might be the problem)')
  } catch (error) {
    console.log('Click failed (which is expected for disabled button)')
  }
  
  // Verify no question appears after clicking locked level
  const questionExists = await page.locator('text=/\\d+ \\+ \\d+ = \\?/').count()
  expect(questionExists).toBe(0)
  
  // Now click the first level to make sure the app still works
  await page.click('button:has-text("Addition Single Basic")')
  await page.waitForSelector('text=/\\d+ \\+ \\d+ = \\?/')
  
  // Verify the app is responsive
  const submitButton = page.locator('button:has-text("Submit Answer")')
  await expect(submitButton).toBeVisible()
})

test('Check level order and IDs', async ({ page }) => {
  await page.goto(TEST_CONFIG.BASE_URL)
  await page.waitForLoadState('networkidle')
  
  // Get all level buttons and their text
  const levelButtons = page.locator('.max-h-64 button')
  const count = await levelButtons.count()
  
  console.log(`Total levels: ${count}`)
  
  // Log first few level names to check the order
  for (let i = 0; i < Math.min(5, count); i++) {
    const levelText = await levelButtons.nth(i).textContent()
    const isDisabled = await levelButtons.nth(i).getAttribute('disabled')
    console.log(`Level ${i}: "${levelText}" - Disabled: ${isDisabled}`)
  }
})