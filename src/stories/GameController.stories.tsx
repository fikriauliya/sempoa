import type { Meta, StoryObj } from '@storybook/react'
import GameController from '../components/GameController'
import { GameProvider } from '../context/GameContext'
import { GameState } from '../types'

// Wrapper component to provide context
const GameControllerWithProvider = (args: { initialGameState?: Partial<GameState> }) => {
  return (
    <GameProvider>
      <div style={{ maxWidth: '400px' }}>
        <GameController />
      </div>
    </GameProvider>
  )
}

const meta: Meta<typeof GameControllerWithProvider> = {
  title: 'Components/GameController',
  component: GameControllerWithProvider,
  parameters: {
    layout: 'centered'
  },
  decorators: [
    (Story) => (
      <div style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px' }}>
        <Story />
      </div>
    )
  ]
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {}
}

export const WithCustomStyling: Story = {
  args: {},
  decorators: [
    (Story) => (
      <div style={{ 
        backgroundColor: '#e8f4fd', 
        padding: '30px', 
        borderRadius: '12px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
      }}>
        <Story />
      </div>
    )
  ]
}

export const NarrowContainer: Story = {
  args: {},
  decorators: [
    (Story) => (
      <div style={{ 
        backgroundColor: '#f9f9f9', 
        padding: '20px', 
        borderRadius: '8px',
        width: '300px'
      }}>
        <Story />
      </div>
    )
  ]
}

export const DarkTheme: Story = {
  args: {},
  decorators: [
    (Story) => (
      <div style={{ 
        backgroundColor: '#2d3748', 
        padding: '20px', 
        borderRadius: '8px',
        color: 'white'
      }}>
        <Story />
      </div>
    )
  ]
}