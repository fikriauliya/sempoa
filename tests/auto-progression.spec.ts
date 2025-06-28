import { test, expect } from '@playwright/test'
import { TEST_CONFIG } from './test-config'

test('Auto progression after answer submission', async ({ page }) => {
  await page.goto(TEST_CONFIG.BASE_URL)
  
  // Wait for the page to load
  await page.waitForLoadState('networkidle')
  
  // Select the first level
  await page.click('button:has-text("Addition Single Basic")')
  
  // Wait for first question to appear
  await page.waitForSelector('text=/\\d+ \\+ \\d+ = \\?/')
  
  // Get the initial question text
  const initialQuestion = await page.textContent('text=/\\d+ \\+ \\d+ = \\?/')
  
  // Submit an answer (any value)
  await page.click('button:has-text("Submit Answer")')
  
  // Wait for feedback to appear
  await page.waitForSelector('text=/Correct|Incorrect/')
  
  // Wait a moment and verify a new question appears
  await page.waitForTimeout(500)
  const newQuestion = await page.textContent('text=/\\d+ [\\+\\-] \\d+ = \\?/')
  
  // Verify the question has changed
  expect(newQuestion).not.toBe(initialQuestion)
  
  // Verify the sempoa board value is reset to 0
  const valueText = await page.textContent('text=/Value: \\d+/')
  expect(valueText).toBe('Value: 0')
})

test('Enter key submits answer', async ({ page }) => {
  await page.goto(TEST_CONFIG.BASE_URL)
  
  // Wait for the page to load
  await page.waitForLoadState('networkidle')
  
  // Select the first level
  await page.click('button:has-text("Addition Single Basic")')
  
  // Wait for question to appear
  await page.waitForSelector('text=/\\d+ \\+ \\d+ = \\?/')
  
  // Press Enter key
  await page.keyboard.press('Enter')
  
  // Wait for feedback to appear (confirms submission worked)
  await page.waitForSelector('text=/Correct|Incorrect/')
})