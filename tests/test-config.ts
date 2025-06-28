import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

export const TEST_CONFIG = {
  PORT: process.env.VITE_PORT || '5173',
  BASE_URL: `http://localhost:${process.env.VITE_PORT || '5173'}`
}