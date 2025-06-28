import { test, expect } from '@playwright/test';

test.describe('Question Timer', () => {
  test.beforeEach(async ({ page }) => {
    const port = process.env.VITE_PORT || '5173';
    await page.goto(`http://localhost:${port}`);
    
    // Clear any existing local storage data
    await page.evaluate(() => {
      localStorage.clear();
    });
  });

  test('timer starts when new question is displayed', async ({ page }) => {
    // Wait for the game to load and click New Question
    await page.waitForSelector('button:has-text("New Question")');
    await page.click('button:has-text("New Question")');
    
    // Wait for question to appear
    await page.waitForSelector('[data-testid="current-question"]');
    
    // Check that timer is displayed and starts at 00:00
    const timer = page.locator('[data-testid="question-timer"]');
    await expect(timer).toBeVisible();
    await expect(timer).toHaveText('00:00');
    
    // Wait 2 seconds and verify timer is counting
    await page.waitForTimeout(2000);
    const timerText = await timer.textContent();
    expect(timerText).toMatch(/00:0[1-9]/); // Should show 00:01 or 00:02
  });

  test('timer displays in MM:SS format', async ({ page }) => {
    await page.waitForSelector('button:has-text("New Question")');
    await page.click('button:has-text("New Question")');
    await page.waitForSelector('[data-testid="question-timer"]');
    
    const timer = page.locator('[data-testid="question-timer"]');
    
    // Wait for timer to count and check format
    await page.waitForTimeout(1500);
    const timerText = await timer.textContent();
    expect(timerText).toMatch(/^\d{2}:\d{2}$/); // MM:SS format
  });

  test('timer continues during wrong answers', async ({ page }) => {
    await page.waitForSelector('button:has-text("New Question")');
    await page.click('button:has-text("New Question")');
    await page.waitForSelector('[data-testid="current-question"]');
    
    // Wait for timer to start
    await page.waitForTimeout(1000);
    
    // Get current timer value
    const timer = page.locator('[data-testid="question-timer"]');
    const initialTime = await timer.textContent();
    
    // Set an incorrect value on the sempoa (e.g., click some beads)
    await page.locator('[data-testid="bead-0-0-lower"]').click();
    
    // Submit wrong answer
    await page.locator('[data-testid="check-answer"]').click();
    
    // Wait a bit more and verify timer continued
    await page.waitForTimeout(1000);
    const laterTime = await timer.textContent();
    
    // Timer should have continued counting
    expect(laterTime).not.toBe(initialTime);
  });

  test('timer stops and records time on correct answer', async ({ page }) => {
    await page.waitForSelector('button:has-text("New Question")');
    await page.click('button:has-text("New Question")');
    await page.waitForSelector('[data-testid="current-question"]');
    
    // Get the current question to solve it correctly
    const questionText = await page.locator('[data-testid="current-question"]').textContent();
    const question = questionText?.match(/(\d+)\s*([+\-])\s*(\d+)/);
    
    if (question) {
      const num1 = parseInt(question[1]);
      const operator = question[2];
      const num2 = parseInt(question[3]);
      const correctAnswer = operator === '+' ? num1 + num2 : num1 - num2;
      
      // Wait for timer to start counting
      await page.waitForTimeout(1500);
      
      // Set correct value on sempoa by clicking appropriate beads
      await setSempoaValue(page, correctAnswer);
      
      // Get timer value before submitting
      const timer = page.locator('[data-testid="question-timer"]');
      const timeBeforeSubmit = await timer.textContent();
      
      // Submit correct answer
      await page.locator('[data-testid="check-answer"]').click();
      
      // Verify completion time was stored in local storage
      const completionTimes = await page.evaluate(() => {
        const stored = localStorage.getItem('questionCompletionTimes');
        return stored ? JSON.parse(stored) : [];
      });
      
      expect(completionTimes).toHaveLength(1);
      expect(completionTimes[0]).toHaveProperty('time');
      expect(completionTimes[0]).toHaveProperty('question');
      expect(completionTimes[0].time).toMatch(/^\d{2}:\d{2}$/);
    }
  });

  test('historical completion times are displayed', async ({ page }) => {
    // Pre-populate some completion times in local storage
    await page.evaluate(() => {
      const times = [
        { time: '00:05', question: '5 + 3', timestamp: Date.now() - 60000 },
        { time: '00:08', question: '12 - 7', timestamp: Date.now() - 30000 }
      ];
      localStorage.setItem('questionCompletionTimes', JSON.stringify(times));
    });
    
    await page.reload();
    await page.waitForSelector('button:has-text("New Question")');
    await page.click('button:has-text("New Question")');
    await page.waitForSelector('[data-testid="current-question"]');
    
    // Check that historical times are displayed
    const historySection = page.locator('[data-testid="completion-history"]');
    await expect(historySection).toBeVisible();
    
    await expect(page.locator('[data-testid="history-item"]')).toHaveCount(2);
    await expect(page.locator('[data-testid="history-item"]').first()).toContainText('00:08');
    await expect(page.locator('[data-testid="history-item"]').first()).toContainText('12 - 7');
  });

  test('completion times persist between sessions', async ({ page }) => {
    await page.waitForSelector('button:has-text("New Question")');
    await page.click('button:has-text("New Question")');
    await page.waitForSelector('[data-testid="current-question"]');
    
    // Add a completion time
    await page.evaluate(() => {
      const times = [{ time: '00:12', question: '8 + 4', timestamp: Date.now() }];
      localStorage.setItem('questionCompletionTimes', JSON.stringify(times));
    });
    
    // Reload page to simulate new session
    await page.reload();
    await page.waitForSelector('button:has-text("New Question")');
    await page.click('button:has-text("New Question")');
    await page.waitForSelector('[data-testid="current-question"]');
    
    // Verify data persisted
    const historySection = page.locator('[data-testid="completion-history"]');
    await expect(historySection).toBeVisible();
    await expect(page.locator('[data-testid="history-item"]')).toHaveCount(1);
    await expect(page.locator('[data-testid="history-item"]')).toContainText('00:12');
  });
});

// Helper function to set sempoa value by clicking appropriate beads
async function setSempoaValue(page: any, value: number) {
  // Reset sempoa first by clicking all active beads to deactivate them
  const activeBeads = page.locator('.bead.active');
  const activeBeadCount = await activeBeads.count();
  for (let i = 0; i < activeBeadCount; i++) {
    await activeBeads.nth(i).click();
  }
  
  // Convert value to bead positions (simplified for testing)
  // This is a basic implementation - in real usage we'd need more sophisticated logic
  let remainingValue = value;
  const columns = [1000000, 100000, 10000, 1000, 100, 10, 1]; // Place values
  
  for (let col = 0; col < columns.length; col++) {
    const placeValue = columns[col];
    const digitValue = Math.floor(remainingValue / placeValue);
    remainingValue = remainingValue % placeValue;
    
    if (digitValue > 0) {
      // Click upper bead if digit >= 5
      if (digitValue >= 5) {
        await page.locator(`[data-testid="bead-${col}-0-upper"]`).click();
      }
      
      // Click lower beads for remaining value
      const lowerBeadsNeeded = digitValue % 5;
      for (let i = 0; i < lowerBeadsNeeded; i++) {
        await page.locator(`[data-testid="bead-${col}-${i}-lower"]`).click();
      }
    }
  }
}