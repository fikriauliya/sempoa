import { test } from '@playwright/test'
import { TEST_CONFIG } from './test-config'

test('Debug all level IDs and find Big Friend', async ({ page }) => {
  page.on('console', msg => {
    if (msg.text().includes('LEVEL_DEBUG:')) {
      console.log(msg.text())
    }
  })
  
  await page.goto(TEST_CONFIG.BASE_URL)
  await page.waitForLoadState('networkidle')
  
  // Inject debug code to log all levels
  await page.evaluate(() => {
    // Access the levels from localStorage or create them
    const saved = localStorage.getItem('learning-journey')
    let levels = []
    
    if (saved) {
      const data = JSON.parse(saved)
      levels = data.levels
    } else {
      // Recreate the level creation logic
      const operations = ['addition', 'subtraction', 'mixed']
      const difficulties = ['single', 'double', 'triple'] 
      const complementCombos = [
        { small: false, big: false, name: 'Basic' },
        { small: true, big: false, name: 'Small Friend' },
        { small: false, big: true, name: 'Big Friend' },
        { small: true, big: true, name: 'Both Friends' }
      ]
      
      operations.forEach(operation => {
        difficulties.forEach(difficulty => {
          complementCombos.forEach(combo => {
            const id = `${operation}-${difficulty}-${combo.small ? 's' : ''}${combo.big ? 'b' : ''}`
            const operationName = operation.charAt(0).toUpperCase() + operation.slice(1)
            const difficultyName = difficulty.charAt(0).toUpperCase() + difficulty.slice(1)
            
            levels.push({
              id,
              name: `${operationName} ${difficultyName} ${combo.name}`,
              operation,
              difficulty,
              useSmallFriend: combo.small,
              useBigFriend: combo.big,
              isUnlocked: levels.length === 0
            })
          })
        })
      })
    }
    
    // Log all levels
    levels.forEach((level, index) => {
      console.log(`LEVEL_DEBUG: ${index}: ID="${level.id}" NAME="${level.name}" UNLOCKED=${level.isUnlocked}`)
      
      if (level.name.includes('Big Friend')) {
        console.log(`LEVEL_DEBUG: *** BIG FRIEND FOUND *** ID="${level.id}" UNLOCKED=${level.isUnlocked}`)
      }
    })
    
    // Find the specific Big Friend level
    const bigFriend = levels.find(l => l.name === 'Addition Single Big Friend')
    if (bigFriend) {
      console.log(`LEVEL_DEBUG: Big Friend details:`, JSON.stringify(bigFriend, null, 2))
    } else {
      console.log(`LEVEL_DEBUG: Big Friend NOT FOUND in levels!`)
    }
  })
  
  // Also check what button is actually being clicked
  const bigFriendButton = page.locator('button:has-text("Addition Single Big Friend")')
  const buttonId = await bigFriendButton.getAttribute('key') || 'no-key'
  console.log('Button key attribute:', buttonId)
  
  // Try to get the onclick handler details
  const onclick = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'))
    const bigFriendBtn = buttons.find(btn => btn.textContent?.includes('Addition Single Big Friend'))
    if (bigFriendBtn) {
      return {
        disabled: bigFriendBtn.disabled,
        className: bigFriendBtn.className,
        textContent: bigFriendBtn.textContent
      }
    }
    return null
  })
  
  console.log('Big Friend button details:', JSON.stringify(onclick, null, 2))
})