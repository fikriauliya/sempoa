import { test, expect } from '@playwright/test'

test.describe('Swipe Gestures', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173')
    // Wait for the sempoa board to be ready
    await page.waitForSelector('[data-testid="sempoa-board"]')
  })

  test('swipe up on lower bead activates bead group', async ({ page }) => {
    // Target the bottom lower bead in the ones column (index 3, representing value 4)
    const lowerBead = page.locator('[data-testid="bead-0-3-lower"]')
    
    // Verify bead is initially inactive
    await expect(lowerBead).not.toHaveClass(/bg-red-500/)
    
    // Get bead position for swipe gesture
    const boundingBox = await lowerBead.boundingBox()
    expect(boundingBox).toBeTruthy()
    
    const centerX = boundingBox!.x + boundingBox!.width / 2
    const startY = boundingBox!.y + boundingBox!.height - 5
    const endY = startY - 40 // 40px swipe up
    
    // Perform swipe up gesture
    await page.touchscreen.tap(centerX, startY)
    await page.touchscreen.tap(centerX, endY)
    
    // Verify that this bead and the one above it are now active (representing value 4)
    await expect(lowerBead).toHaveClass(/bg-red-500/)
    const upperLowerBead = page.locator('[data-testid="bead-0-2-lower"]')
    await expect(upperLowerBead).toHaveClass(/bg-red-500/)
    
    // Verify the current value shows 4
    const currentValue = page.locator('[data-testid="current-value"]')
    await expect(currentValue).toContainText('4')
  })

  test('swipe down on active lower bead deactivates bead group', async ({ page }) => {
    // First activate some beads by clicking
    const lowerBead = page.locator('[data-testid="bead-0-3-lower"]')
    await lowerBead.click()
    
    // Verify beads are active (value should be 4)
    await expect(lowerBead).toHaveClass(/bg-red-500/)
    const currentValue = page.locator('[data-testid="current-value"]')
    await expect(currentValue).toContainText('4')
    
    // Get bead position for swipe gesture
    const boundingBox = await lowerBead.boundingBox()
    expect(boundingBox).toBeTruthy()
    
    const centerX = boundingBox!.x + boundingBox!.width / 2
    const startY = boundingBox!.y + 5
    const endY = startY + 40 // 40px swipe down
    
    // Perform swipe down gesture
    await page.touchscreen.tap(centerX, startY)
    await page.touchscreen.tap(centerX, endY)
    
    // Verify beads are now deactivated
    await expect(lowerBead).not.toHaveClass(/bg-red-500/)
    await expect(currentValue).toContainText('0')
  })

  test('swipe up on upper bead activates it', async ({ page }) => {
    // Target the upper bead in the ones column
    const upperBead = page.locator('[data-testid="bead-0-0-upper"]')
    
    // Verify bead is initially inactive
    await expect(upperBead).not.toHaveClass(/bg-red-500/)
    
    // Get bead position for swipe gesture
    const boundingBox = await upperBead.boundingBox()
    expect(boundingBox).toBeTruthy()
    
    const centerX = boundingBox!.x + boundingBox!.width / 2
    const startY = boundingBox!.y + boundingBox!.height - 5
    const endY = startY - 40 // 40px swipe up
    
    // Perform swipe up gesture
    await page.touchscreen.tap(centerX, startY)
    await page.touchscreen.tap(centerX, endY)
    
    // Verify upper bead is now active
    await expect(upperBead).toHaveClass(/bg-red-500/)
    
    // Verify the current value shows 5
    const currentValue = page.locator('[data-testid="current-value"]')
    await expect(currentValue).toContainText('5')
  })

  test('swipe down on active upper bead deactivates it', async ({ page }) => {
    // First activate the upper bead by clicking
    const upperBead = page.locator('[data-testid="bead-0-0-upper"]')
    await upperBead.click()
    
    // Verify bead is active
    await expect(upperBead).toHaveClass(/bg-red-500/)
    const currentValue = page.locator('[data-testid="current-value"]')
    await expect(currentValue).toContainText('5')
    
    // Get bead position for swipe gesture
    const boundingBox = await upperBead.boundingBox()
    expect(boundingBox).toBeTruthy()
    
    const centerX = boundingBox!.x + boundingBox!.width / 2
    const startY = boundingBox!.y + 5
    const endY = startY + 40 // 40px swipe down
    
    // Perform swipe down gesture
    await page.touchscreen.tap(centerX, startY)
    await page.touchscreen.tap(centerX, endY)
    
    // Verify upper bead is now deactivated
    await expect(upperBead).not.toHaveClass(/bg-red-500/)
    await expect(currentValue).toContainText('0')
  })

  test('short swipes fallback to tap behavior', async ({ page }) => {
    // Target a lower bead
    const lowerBead = page.locator('[data-testid="bead-0-3-lower"]')
    
    // Verify bead is initially inactive
    await expect(lowerBead).not.toHaveClass(/bg-red-500/)
    
    // Get bead position for short swipe gesture
    const boundingBox = await lowerBead.boundingBox()
    expect(boundingBox).toBeTruthy()
    
    const centerX = boundingBox!.x + boundingBox!.width / 2
    const startY = boundingBox!.y + boundingBox!.height / 2
    const endY = startY - 15 // 15px swipe (below 30px threshold)
    
    // Perform short swipe that should fallback to tap
    await page.touchscreen.tap(centerX, startY)
    await page.touchscreen.tap(centerX, endY)
    
    // Should behave like a tap and activate the bead group
    await expect(lowerBead).toHaveClass(/bg-red-500/)
    const currentValue = page.locator('[data-testid="current-value"]')
    await expect(currentValue).toContainText('4')
  })

  test('tap functionality remains unchanged', async ({ page }) => {
    // Test that regular tapping still works as before
    const lowerBead = page.locator('[data-testid="bead-0-3-lower"]')
    const upperBead = page.locator('[data-testid="bead-0-0-upper"]')
    const currentValue = page.locator('[data-testid="current-value"]')
    
    // Tap lower bead
    await lowerBead.click()
    await expect(lowerBead).toHaveClass(/bg-red-500/)
    await expect(currentValue).toContainText('4')
    
    // Tap upper bead
    await upperBead.click()
    await expect(upperBead).toHaveClass(/bg-red-500/)
    await expect(currentValue).toContainText('9') // 4 + 5
    
    // Tap to deactivate
    await lowerBead.click()
    await expect(lowerBead).not.toHaveClass(/bg-red-500/)
    await expect(currentValue).toContainText('5')
  })
})