import type { Meta, StoryObj } from '@storybook/react'
import DraggableBead from '../components/DraggableBead'
import { BeadPosition } from '../types'

const meta: Meta<typeof DraggableBead> = {
  title: 'Components/DraggableBead',
  component: DraggableBead,
  parameters: {
    layout: 'centered'
  },
  argTypes: {
    bead: {
      description: 'The bead position and value information'
    },
    isActive: {
      description: 'Whether the bead is in active/moved state'
    },
    onClick: {
      description: 'Callback function when bead is clicked'
    }
  },
  args: {
    onClick: () => console.log('Bead clicked!')
  }
}

export default meta
type Story = StoryObj<typeof meta>

// Sample bead data for stories
const upperBead: BeadPosition = {
  column: 3,
  row: 0,
  isUpper: true
}

const lowerBead: BeadPosition = {
  column: 3,
  row: 1,
  isUpper: false
}

export const UpperBeadInactive: Story = {
  args: {
    bead: upperBead,
    isActive: false
  }
}

export const UpperBeadActive: Story = {
  args: {
    bead: upperBead,
    isActive: true
  }
}

export const LowerBeadInactive: Story = {
  args: {
    bead: lowerBead,
    isActive: false
  }
}

export const LowerBeadActive: Story = {
  args: {
    bead: lowerBead,
    isActive: true
  }
}

export const HighValueBead: Story = {
  args: {
    bead: {
      column: 0,
      row: 0,
      isUpper: true
    },
    isActive: false
  }
}

export const UnitValueBead: Story = {
  args: {
    bead: {
      column: 6,
      row: 0,
      isUpper: false
    },
    isActive: false
  }
}

export const Interactive: Story = {
  args: {
    bead: upperBead,
    isActive: false
  }
}