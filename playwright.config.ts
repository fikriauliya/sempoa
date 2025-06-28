import { defineConfig, devices } from '@playwright/test'
import dotenv from 'dotenv'

dotenv.config()
const port = process.env.VITE_PORT || '5173'

export default defineConfig({
  testDir: './tests',
  timeout: 30 * 1000,
  expect: {
    timeout: 5 * 1000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: `http://localhost:${port}`,
    trace: 'on-first-retry',
    hasTouch: true, // Enable touch support for all tests
  },
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        hasTouch: true
      },
    },
    {
      name: 'Mobile Chrome',
      use: { 
        ...devices['Pixel 5'],
        hasTouch: true
      },
    },
    // Disabled due to WebKit Bus error: 10 on this system
    // {
    //   name: 'Mobile Safari',
    //   use: { 
    //     ...devices['iPhone 12'],
    //     hasTouch: true
    //   },
    // },
  ],
  webServer: {
    command: 'npm run dev',
    port: parseInt(port),
    reuseExistingServer: !process.env.CI,
  },
})