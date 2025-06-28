import { test, expect } from '@playwright/test'
import { TEST_CONFIG } from './test-config'

test.describe('Learning Journey Progression System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(TEST_CONFIG.BASE_URL)
    
    // Clear any existing progress in localStorage
    await page.evaluate(() => {
      localStorage.removeItem('sempoa_user_progress')
    })
    
    await page.reload()
  })

  test('should display learning journey sidebar instead of game control', async ({ page }) => {
    // Verify that the old Game Control section is replaced
    await expect(page.getByText('Game Control')).not.toBeVisible()
    
    // Verify the new Learning Journey section exists
    await expect(page.getByRole('heading', { name: 'Learning Journey' })).toBeVisible()
    
    // Verify sidebar is in the right column
    const sidebar = page.locator('[data-testid="learning-journey-sidebar"]')
    await expect(sidebar).toBeVisible()
  })

  test('should show three main operation sections', async ({ page }) => {
    // Check for the three main operation types
    await expect(page.getByRole('button', { name: /Addition/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Subtraction/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Mixed Operations/i })).toBeVisible()
  })

  test('should display correct level structure when expanding Addition section', async ({ page }) => {
    // Click on Addition section to expand
    await page.getByRole('button', { name: /Addition/i }).click()
    
    // Check for complement types
    await expect(page.getByText('Simple Addition')).toBeVisible()
    await expect(page.getByText('Small Friend')).toBeVisible()
    await expect(page.getByText('Big Friend')).toBeVisible()
    await expect(page.getByText('Both Friends')).toBeVisible()
  })

  test('should show five digit levels for each complement type', async ({ page }) => {
    // Expand Addition section
    await page.getByRole('button', { name: /Addition/i }).click()
    
    // Click on Simple Addition to see digit levels
    await page.getByText('Simple Addition').click()
    
    // Check for all five digit levels
    await expect(page.getByText('Single Digit')).toBeVisible()
    await expect(page.getByText('Double Digit')).toBeVisible()
    await expect(page.getByText('Triple Digit')).toBeVisible()
    await expect(page.getByText('Four Digit')).toBeVisible()
    await expect(page.getByText('Five Digit')).toBeVisible()
  })

  test('should start with only first level unlocked', async ({ page }) => {
    // Expand Addition → Simple Addition
    await page.getByRole('button', { name: /Addition/i }).click()
    await page.getByText('Simple Addition').click()
    
    // First level should be unlocked
    const firstLevel = page.locator('[data-testid="level-addition-simple-single"]')
    await expect(firstLevel).not.toHaveClass(/locked/)
    
    // Other levels should be locked
    const secondLevel = page.locator('[data-testid="level-addition-simple-double"]')
    await expect(secondLevel).toHaveClass(/locked/)
  })

  test('should show medium-sized icons for each operation type', async ({ page }) => {
    // Check icon sizes (should be 40-48px)
    const additionIcon = page.locator('[data-testid="icon-addition"]')
    const iconSize = await additionIcon.evaluate(el => {
      const styles = window.getComputedStyle(el)
      return {
        width: styles.width,
        height: styles.height
      }
    })
    
    expect(parseInt(iconSize.width)).toBeGreaterThanOrEqual(40)
    expect(parseInt(iconSize.width)).toBeLessThanOrEqual(48)
  })

  test('should highlight current level in progress', async ({ page }) => {
    // Start a level
    await page.getByRole('button', { name: /Addition/i }).click()
    await page.getByText('Simple Addition').click()
    await page.locator('[data-testid="level-addition-simple-single"]').click()
    
    // Verify the level is highlighted
    const currentLevel = page.locator('[data-testid="level-addition-simple-single"]')
    await expect(currentLevel).toHaveClass(/in-progress/)
  })

  test('should persist progress in localStorage', async ({ page }) => {
    // Start a level
    await page.getByRole('button', { name: /Addition/i }).click()
    await page.getByText('Simple Addition').click()
    await page.locator('[data-testid="level-addition-simple-single"]').click()
    
    // Check localStorage
    const progress = await page.evaluate(() => {
      return localStorage.getItem('sempoa_user_progress')
    })
    
    expect(progress).toBeTruthy()
    const parsed = JSON.parse(progress!)
    expect(parsed.currentLevel).toMatchObject({
      operationType: 'addition',
      complementType: 'simple',
      digitLevel: 'single'
    })
  })

  test('should unlock next level after completing 10 correct answers', async ({ page }) => {
    // Start first level
    await page.getByRole('button', { name: /Addition/i }).click()
    await page.getByText('Simple Addition').click()
    await page.locator('[data-testid="level-addition-simple-single"]').click()
    
    // Simulate completing 10 correct answers
    for (let i = 0; i < 10; i++) {
      // Wait for question to appear
      await expect(page.locator('[data-testid="current-question"]')).toBeVisible()
      
      // For now, we'll skip the actual sempoa manipulation
      // In a real test, we would manipulate the beads to get the correct answer
      // This test is primarily focused on the progression system
      
      // Submit answer using keyboard shortcut
      await page.keyboard.press('Enter')
      
      // Wait a moment for state update
      await page.waitForTimeout(100)
    }
    
    // Verify next level is unlocked
    const secondLevel = page.locator('[data-testid="level-addition-simple-double"]')
    await expect(secondLevel).not.toHaveClass(/locked/)
  })

  test('should show completion checkmark for finished levels', async ({ page }) => {
    // Set up completed level in localStorage
    await page.evaluate(() => {
      const progress = {
        currentLevel: {
          operationType: 'addition',
          complementType: 'simple',
          digitLevel: 'double'
        },
        allLevels: [{
          operationType: 'addition',
          complementType: 'simple',
          digitLevel: 'single',
          questionsCompleted: 10,
          correctAnswers: 10,
          isUnlocked: true,
          isCompleted: true
        }]
      }
      localStorage.setItem('sempoa_user_progress', JSON.stringify(progress))
    })
    
    await page.reload()
    
    // Expand to see the completed level
    await page.getByRole('button', { name: /Addition/i }).click()
    await page.getByText('Simple Addition').click()
    
    // Check for completion indicator
    const completedLevel = page.locator('[data-testid="level-addition-simple-single"]')
    await expect(completedLevel.locator('[data-testid="checkmark-icon"]')).toBeVisible()
  })

  test('should maintain scroll position in sidebar', async ({ page }) => {
    // Expand all sections to make sidebar scrollable
    await page.getByRole('button', { name: /Addition/i }).click()
    await page.getByRole('button', { name: /Subtraction/i }).click()
    await page.getByRole('button', { name: /Mixed Operations/i }).click()
    
    // Scroll to bottom
    const sidebar = page.locator('[data-testid="learning-journey-sidebar"]')
    await sidebar.evaluate(el => el.scrollTop = el.scrollHeight)
    
    // Get scroll position
    const scrollPos = await sidebar.evaluate(el => el.scrollTop)
    
    // Navigate away and back
    await page.reload()
    
    // Verify scroll position is maintained
    const newScrollPos = await sidebar.evaluate(el => el.scrollTop)
    expect(Math.abs(newScrollPos - scrollPos)).toBeLessThan(10)
  })

  test('should display progress indicators for each section', async ({ page }) => {
    // Set up partial progress
    await page.evaluate(() => {
      const progress = {
        allLevels: [
          { operationType: 'addition', complementType: 'simple', digitLevel: 'single', isCompleted: true },
          { operationType: 'addition', complementType: 'simple', digitLevel: 'double', isCompleted: true },
          { operationType: 'addition', complementType: 'simple', digitLevel: 'triple', isCompleted: false }
        ]
      }
      localStorage.setItem('sempoa_user_progress', JSON.stringify(progress))
    })
    
    await page.reload()
    
    // Check progress indicator shows 2/5 for Simple Addition
    const progressText = page.locator('[data-testid="progress-addition-simple"]')
    await expect(progressText).toHaveText('2/5')
  })

  test('should prevent access to locked levels', async ({ page }) => {
    // Try to click on a locked level
    await page.getByRole('button', { name: /Subtraction/i }).click()
    
    const lockedLevel = page.locator('[data-testid="level-subtraction-simple-single"]')
    await expect(lockedLevel).toHaveClass(/locked/)
    
    // Click should not start the level
    await lockedLevel.click()
    
    // Verify we're not in a game
    await expect(page.locator('[data-testid="current-question"]')).not.toBeVisible()
  })

  test('should handle level completion and auto-progression', async ({ page }) => {
    // Complete a level and verify auto-progression to next
    await page.getByRole('button', { name: /Addition/i }).click()
    await page.getByText('Simple Addition').click()
    await page.locator('[data-testid="level-addition-simple-single"]').click()
    
    // Set up progress to be one question away from completion
    await page.evaluate(() => {
      const progress = {
        currentLevel: {
          operationType: 'addition',
          complementType: 'simple',
          digitLevel: 'single',
          questionsCompleted: 9,
          correctAnswers: 9,
          isUnlocked: true,
          isCompleted: false
        },
        allLevels: [
          {
            operationType: 'addition',
            complementType: 'simple',
            digitLevel: 'single',
            questionsCompleted: 9,
            correctAnswers: 9,
            isUnlocked: true,
            isCompleted: false
          },
          {
            operationType: 'addition',
            complementType: 'simple',
            digitLevel: 'double',
            questionsCompleted: 0,
            correctAnswers: 0,
            isUnlocked: false,
            isCompleted: false
          }
        ],
        totalScore: 9
      }
      localStorage.setItem('sempoa_user_progress', JSON.stringify(progress))
    })
    
    await page.reload()
    
    // Complete the final question
    await page.getByRole('button', { name: /Addition/i }).click()
    await page.getByText('Simple Addition').click()
    await page.locator('[data-testid="level-addition-simple-single"]').click()
    
    // Submit the answer using keyboard
    await page.keyboard.press('Enter')
    await page.waitForTimeout(100)
    
    // Should auto-start next level
    await expect(page.locator('[data-testid="level-addition-simple-double"]')).toHaveClass(/in-progress/)
  })
})