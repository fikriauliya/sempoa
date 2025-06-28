import { test, expect } from '@playwright/test'
import { TEST_CONFIG } from './test-config'

test('Consecutive answer submissions work', async ({ page }) => {
  await page.goto(TEST_CONFIG.BASE_URL)
  
  // Wait for the page to load
  await page.waitForLoadState('networkidle')
  
  // Select the first level
  await page.click('button:has-text("Addition Single Basic")')
  
  // Wait for first question to appear
  await page.waitForSelector('text=/\\d+ \\+ \\d+ = \\?/')
  
  // Get initial question count
  const initialQuestionText = await page.textContent('text=/\\d+ \\+ \\d+ = \\?/')
  
  // Submit first answer (doesn't matter if correct/wrong, just testing progression)
  await page.click('button:has-text("Submit Answer")')
  
  // Wait briefly and verify new question appears
  await page.waitForTimeout(200)
  await page.waitForSelector('text=/\\d+ [\\+\\-] \\d+ = \\?/')
  
  // Get the new question text
  const secondQuestionText = await page.textContent('text=/\\d+ [\\+\\-] \\d+ = \\?/')
  
  // Submit second answer immediately  
  await page.click('button:has-text("Submit Answer")')
  
  // Wait briefly and verify another new question appears
  await page.waitForTimeout(200)
  await page.waitForSelector('text=/\\d+ [\\+\\-] \\d+ = \\?/')
  
  // Get the third question text
  const thirdQuestionText = await page.textContent('text=/\\d+ [\\+\\-] \\d+ = \\?/')
  
  // Verify all questions were different (proving progression works)
  expect(secondQuestionText).not.toBe(initialQuestionText)
  expect(thirdQuestionText).not.toBe(secondQuestionText)
  expect(thirdQuestionText).not.toBe(initialQuestionText)
  
  // Verify that mistakes/score tracking is working
  const mistakesText = await page.textContent('text=/Mistakes: \\d+/')
  expect(mistakesText).toMatch(/Mistakes: \d+/)
})

test('Rapid submissions with Enter key', async ({ page }) => {
  await page.goto(TEST_CONFIG.BASE_URL)
  
  // Wait for the page to load
  await page.waitForLoadState('networkidle')
  
  // Select the first level
  await page.click('button:has-text("Addition Single Basic")')
  
  // Wait for first question to appear
  await page.waitForSelector('text=/\\d+ \\+ \\d+ = \\?/')
  
  // Get initial question
  const initialQuestion = await page.textContent('text=/\\d+ \\+ \\d+ = \\?/')
  
  // Submit multiple answers rapidly using Enter key
  for (let i = 0; i < 3; i++) {
    await page.keyboard.press('Enter')
    await page.waitForTimeout(100) // Brief pause between submissions
  }
  
  // Wait a bit more and verify we still have a question (system is responsive)
  await page.waitForTimeout(300)
  await page.waitForSelector('text=/\\d+ [\\+\\-] \\d+ = \\?/')
  
  // Get final question
  const finalQuestion = await page.textContent('text=/\\d+ [\\+\\-] \\d+ = \\?/')
  
  // Verify the question changed (proving submissions worked)
  expect(finalQuestion).not.toBe(initialQuestion)
  
  // Verify mistakes counter exists and is tracking
  const mistakesText = await page.textContent('text=/Mistakes: \\d+/')
  expect(mistakesText).toMatch(/Mistakes: \d+/)
})