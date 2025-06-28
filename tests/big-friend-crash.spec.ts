import { test, expect } from '@playwright/test'
import { TEST_CONFIG } from './test-config'

test('Reproduce crash when clicking Addition Single Big Friend', async ({ page }) => {
  // Listen to console logs and errors
  page.on('console', msg => {
    console.log('BROWSER:', msg.text())
  })
  
  page.on('pageerror', err => {
    console.log('PAGE ERROR:', err.message)
  })
  
  await page.goto(TEST_CONFIG.BASE_URL)
  await page.waitForLoadState('networkidle')
  
  console.log('=== Page loaded successfully ===')
  
  // Find the "Addition Single Big Friend" button
  const bigFriendButton = page.locator('button:has-text("Addition Single Big Friend")')
  
  // Verify the button exists
  await expect(bigFriendButton).toBeVisible()
  console.log('=== Big Friend button is visible ===')
  
  // Check if it's disabled
  const isDisabled = await bigFriendButton.getAttribute('disabled')
  console.log('Button disabled state:', isDisabled)
  
  // Try to click it
  console.log('=== About to click Big Friend button ===')
  try {
    await bigFriendButton.click({ timeout: 5000 })
    console.log('=== Click completed without immediate error ===')
  } catch (error) {
    console.log('=== Click failed with error:', error.message, '===')
  }
  
  // Wait a moment to see if app freezes
  await page.waitForTimeout(2000)
  console.log('=== Waited 2 seconds after click ===')
  
  // Try to interact with the app to see if it's frozen
  try {
    // Try to click the first level
    await page.click('button:has-text("Addition Single Basic")', { timeout: 3000 })
    console.log('=== Successfully clicked first level - app is responsive ===')
    
    // Wait for question to appear
    await page.waitForSelector('text=/\\d+ \\+ \\d+ = \\?/', { timeout: 3000 })
    console.log('=== Question appeared - app is working ===')
    
  } catch (error) {
    console.log('=== APP APPEARS TO BE FROZEN - Error:', error.message, '===')
    
    // Take a screenshot of the frozen state
    await page.screenshot({ path: 'frozen-app.png', fullPage: true })
    console.log('=== Screenshot saved as frozen-app.png ===')
    
    throw new Error('App appears to be frozen after clicking Big Friend level')
  }
})

test('Try clicking Big Friend with force option', async ({ page }) => {
  page.on('console', msg => console.log('BROWSER:', msg.text()))
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message))
  
  await page.goto(TEST_CONFIG.BASE_URL)
  await page.waitForLoadState('networkidle')
  
  const bigFriendButton = page.locator('button:has-text("Addition Single Big Friend")')
  
  console.log('=== Trying force click on Big Friend ===')
  try {
    // Force click to bypass disabled state
    await bigFriendButton.click({ force: true, timeout: 5000 })
    console.log('=== Force click completed ===')
  } catch (error) {
    console.log('=== Force click failed:', error.message, '===')
  }
  
  await page.waitForTimeout(1000)
  
  // Check if app is still responsive
  try {
    await page.click('button:has-text("Addition Single Basic")', { timeout: 2000 })
    await page.waitForSelector('text=/\\d+ \\+ \\d+ = \\?/', { timeout: 2000 })
    console.log('=== App remains responsive after force click ===')
  } catch (error) {
    console.log('=== App frozen after force click ===')
    throw new Error('App frozen after force clicking Big Friend level')
  }
})