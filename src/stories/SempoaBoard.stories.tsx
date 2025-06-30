import type { Meta, StoryObj } from '@storybook/react';
import SempoaBoard from '../components/SempoaBoard';
import { GameProvider } from '../context/GameContext';

// Wrapper component to provide context
const SempoaBoardWithProvider = () => {
  return (
    <GameProvider>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <SempoaBoard />
      </div>
    </GameProvider>
  );
};

const meta: Meta<typeof SempoaBoardWithProvider> = {
  title: 'Components/SempoaBoard',
  component: SempoaBoardWithProvider,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div
        style={{
          backgroundColor: '#f8f9fa',
          padding: '20px',
          minHeight: '100vh',
        }}
      >
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const InCompactContainer: Story = {
  decorators: [
    (Story) => (
      <div
        style={{
          backgroundColor: '#f0f2f5',
          padding: '15px',
          maxWidth: '600px',
          margin: '0 auto',
        }}
      >
        <Story />
      </div>
    ),
  ],
};

export const WithGameBackground: Story = {
  decorators: [
    (Story) => (
      <div
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '40px',
          minHeight: '100vh',
        }}
      >
        <Story />
      </div>
    ),
  ],
};

export const ClassicWoodTheme: Story = {
  decorators: [
    (Story) => (
      <div
        style={{
          backgroundColor: '#8B4513',
          backgroundImage:
            'radial-gradient(circle, rgba(139,69,19,1) 0%, rgba(101,67,33,1) 100%)',
          padding: '30px',
          minHeight: '100vh',
        }}
      >
        <Story />
      </div>
    ),
  ],
};

export const MinimalLayout: Story = {
  decorators: [
    (Story) => (
      <div
        style={{
          backgroundColor: 'white',
          padding: '10px',
        }}
      >
        <Story />
      </div>
    ),
  ],
};

export const ScaledDown: Story = {
  decorators: [
    (Story) => (
      <div
        style={{
          backgroundColor: '#e9ecef',
          padding: '20px',
          transform: 'scale(0.8)',
          transformOrigin: 'top center',
        }}
      >
        <Story />
      </div>
    ),
  ],
};
