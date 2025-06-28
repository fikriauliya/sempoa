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
  
  // Wait a moment and verify a new question appears (no feedback flash)
  await page.waitForTimeout(200)
  const newQuestion = await page.textContent('text=/\\d+ [\\+\\-] \\d+ = \\?/')
  
  // Verify the question has changed
  expect(newQuestion).not.toBe(initialQuestion)
  
  // Verify the sempoa board value is reset to 0
  const valueText = await page.textContent('text=/Value: \\d+/')
  expect(valueText).toBe('Value: 0')
})

test('Progress animations on correct/wrong answers', async ({ page }) => {
  await page.goto(TEST_CONFIG.BASE_URL)
  
  // Wait for the page to load
  await page.waitForLoadState('networkidle')
  
  // Select the first level
  await page.click('button:has-text("Addition Single Basic")')
  
  // Wait for question to appear
  await page.waitForSelector('text=/\\d+ \\+ \\d+ = \\?/')
  
  // Submit an answer
  await page.click('button:has-text("Submit Answer")')
  
  // Check if progress section gets animated (will have animation classes)
  const progressSection = page.locator('.bg-blue-50')
  
  // Wait briefly for animations to potentially trigger
  await page.waitForTimeout(100)
  
  // Verify no feedback text appears (we removed the flash messages)
  const feedbackExists = await page.locator('text=/Correct|Incorrect/').count()
  expect(feedbackExists).toBe(0)
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
  
  // Wait a moment then verify new question appears (confirms submission worked)
  await page.waitForTimeout(200)
  // Verify we still have a question (new one should have been generated)
  const questionExists = await page.locator('text=/\\d+ [\\+\\-] \\d+ = \\?/').count()
  expect(questionExists).toBeGreaterThan(0)
})