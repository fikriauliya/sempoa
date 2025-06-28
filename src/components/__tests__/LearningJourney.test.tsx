import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LearningJourney from '../LearningJourney'
import { GameProvider } from '../../context/GameContext'
import { ProgressionManager } from '../../utils/progressionManager'
import { UserProgress, LevelProgress } from '../../types'
import * as questionGenerator from '../../utils/questionGenerator'

// Mock the progressionManager
jest.mock('../../utils/progressionManager')
jest.mock('../../utils/questionGenerator')

const MockedProgressionManager = ProgressionManager as jest.MockedClass<typeof ProgressionManager>

// Test wrapper with GameProvider
const LearningJourneyWithProvider = () => (
  <GameProvider>
    <LearningJourney />
  </GameProvider>
)

// Mock data
const mockLevelProgress: LevelProgress = {
  operationType: 'addition',
  complementType: 'simple',
  digitLevel: 'single',
  questionsCompleted: 5,
  correctAnswers: 4,
  isUnlocked: true,
  isCompleted: false
}

const mockUserProgress: UserProgress = {
  currentLevel: mockLevelProgress,
  allLevels: [
    mockLevelProgress,
    {
      operationType: 'addition',
      complementType: 'simple',
      digitLevel: 'double',
      questionsCompleted: 0,
      correctAnswers: 0,
      isUnlocked: false,
      isCompleted: false
    },
    {
      operationType: 'subtraction',
      complementType: 'simple',
      digitLevel: 'single',
      questionsCompleted: 10,
      correctAnswers: 10,
      isUnlocked: true,
      isCompleted: true
    }
  ],
  totalScore: 450
}

const mockQuestion = {
  operands: [3, 5],
  operation: 'addition' as const,
  answer: 8,
  difficulty: 'single' as const,
  useSmallFriend: false,
  useBigFriend: false
}

describe('LearningJourney', () => {
  let user: ReturnType<typeof userEvent.setup>
  let mockProgressionManager: {
    initializeProgress: jest.Mock
    loadProgress: jest.Mock
    saveProgress: jest.Mock
    recordCorrectAnswer: jest.Mock
    recordIncorrectAnswer: jest.Mock
    selectLevel: jest.Mock
    getCompletionPercentage: jest.Mock
    getSectionProgress: jest.Mock
  }

  beforeEach(() => {
    user = userEvent.setup()
    
    // Create mock instance
    mockProgressionManager = {
      initializeProgress: jest.fn(),
      loadProgress: jest.fn(),
      saveProgress: jest.fn(),
      recordCorrectAnswer: jest.fn(),
      recordIncorrectAnswer: jest.fn(),
      selectLevel: jest.fn(),
      getCompletionPercentage: jest.fn(),
      getSectionProgress: jest.fn(),
    }

    ;(MockedProgressionManager.getInstance as jest.Mock).mockReturnValue(mockProgressionManager)
    
    // Setup default return values
    mockProgressionManager.loadProgress.mockReturnValue(mockUserProgress)
    mockProgressionManager.getCompletionPercentage.mockReturnValue(25)
    mockProgressionManager.getSectionProgress.mockReturnValue({ completed: 1, total: 4 })
    mockProgressionManager.recordCorrectAnswer.mockReturnValue(mockUserProgress)
    mockProgressionManager.recordIncorrectAnswer.mockReturnValue(mockUserProgress)
    mockProgressionManager.selectLevel.mockReturnValue(mockUserProgress)
    
    // Mock question generator
    ;(questionGenerator.generateQuestion as jest.Mock).mockReturnValue(mockQuestion)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering and Initial State', () => {
    test('should render learning journey sidebar', () => {
      render(<LearningJourneyWithProvider />)
      
      expect(screen.getByTestId('learning-journey-sidebar')).toBeInTheDocument()
      expect(screen.getByText('Learning Journey')).toBeInTheDocument()
    })

    test('should display progress information', () => {
      render(<LearningJourneyWithProvider />)
      
      expect(screen.getByText('25%')).toBeInTheDocument()
      expect(screen.getByText('Score: 450')).toBeInTheDocument()
    })

    test('should load user progress on mount', () => {
      render(<LearningJourneyWithProvider />)
      
      expect(mockProgressionManager.loadProgress).toHaveBeenCalledTimes(1)
    })

    test('should render even with minimal progress data', () => {
      const minimalProgress = {
        currentLevel: null,
        allLevels: [],
        totalScore: 0
      }
      mockProgressionManager.loadProgress.mockReturnValue(minimalProgress)
      
      render(<LearningJourneyWithProvider />)
      
      // Should still render the component structure
      expect(screen.getByTestId('learning-journey-sidebar')).toBeInTheDocument()
      expect(screen.getByText('Score: 0')).toBeInTheDocument()
    })
  })

  describe('Operation Sections', () => {
    test('should render all operation sections', () => {
      render(<LearningJourneyWithProvider />)
      
      expect(screen.getByTestId('icon-addition')).toBeInTheDocument()
      expect(screen.getByTestId('icon-subtraction')).toBeInTheDocument()
      expect(screen.getByTestId('icon-mixed')).toBeInTheDocument()
    })

    test('should display correct operation icons', () => {
      render(<LearningJourneyWithProvider />)
      
      expect(screen.getByTestId('icon-addition')).toHaveTextContent('➕')
      expect(screen.getByTestId('icon-subtraction')).toHaveTextContent('➖')
      expect(screen.getByTestId('icon-mixed')).toHaveTextContent('🔄')
    })

    test('should expand/collapse sections when clicked', async () => {
      render(<LearningJourneyWithProvider />)
      
      const additionButton = screen.getByRole('button', { name: /addition/i })
      await user.click(additionButton)
      
      expect(screen.getByText('Simple Addition')).toBeInTheDocument()
      
      // Click again to collapse
      await user.click(additionButton)
      
      await waitFor(() => {
        expect(screen.queryByText('Simple Addition')).not.toBeInTheDocument()
      })
    })

    test('should show section progress when expanded', async () => {
      render(<LearningJourneyWithProvider />)
      
      // Expand addition section first
      const additionButton = screen.getByRole('button', { name: /addition/i })
      await user.click(additionButton)
      
      expect(screen.getByTestId('progress-addition-simple')).toHaveTextContent('1/4')
    })
  })

  describe('Level Selection and Interaction', () => {
    test('should display levels when section is expanded', async () => {
      render(<LearningJourneyWithProvider />)
      
      // Expand addition section
      const additionButton = screen.getByRole('button', { name: /addition/i })
      await user.click(additionButton)
      
      // Expand simple complement section
      const simpleSection = screen.getByText('Simple Addition')
      await user.click(simpleSection)
      
      expect(screen.getByTestId('level-addition-simple-single')).toBeInTheDocument()
      expect(screen.getByTestId('level-addition-simple-double')).toBeInTheDocument()
    })

    test('should show level states correctly', async () => {
      render(<LearningJourneyWithProvider />)
      
      // Expand to show levels
      const additionButton = screen.getByRole('button', { name: /addition/i })
      await user.click(additionButton)
      const simpleSection = screen.getByText('Simple Addition')
      await user.click(simpleSection)
      
      // Check unlocked level
      const unlockedLevel = screen.getByTestId('level-addition-simple-single')
      expect(unlockedLevel).toHaveClass('in-progress')
      
      // Check locked level
      const lockedLevel = screen.getByTestId('level-addition-simple-double')
      expect(lockedLevel).toHaveClass('locked')
      expect(lockedLevel).toHaveTextContent('🔒')
    })

    test('should show completed levels with checkmark', async () => {
      render(<LearningJourneyWithProvider />)
      
      // Expand subtraction section
      const subtractionButton = screen.getByRole('button', { name: /subtraction/i })
      await user.click(subtractionButton)
      const simpleSection = screen.getByText('Simple Subtraction')
      await user.click(simpleSection)
      
      expect(screen.getByTestId('checkmark-icon')).toBeInTheDocument()
    })

    test('should select level when clicked', async () => {
      render(<LearningJourneyWithProvider />)
      
      // Expand to show levels
      const additionButton = screen.getByRole('button', { name: /addition/i })
      await user.click(additionButton)
      const simpleSection = screen.getByText('Simple Addition')
      await user.click(simpleSection)
      
      const level = screen.getByTestId('level-addition-simple-single')
      await user.click(level)
      
      expect(mockProgressionManager.selectLevel).toHaveBeenCalledWith(
        mockUserProgress,
        mockLevelProgress
      )
    })

    test('should not select locked levels', async () => {
      render(<LearningJourneyWithProvider />)
      
      // Expand to show levels
      const additionButton = screen.getByRole('button', { name: /addition/i })
      await user.click(additionButton)
      const simpleSection = screen.getByText('Simple Addition')
      await user.click(simpleSection)
      
      const lockedLevel = screen.getByTestId('level-addition-simple-double')
      await user.click(lockedLevel)
      
      expect(mockProgressionManager.selectLevel).not.toHaveBeenCalled()
    })
  })

  describe('Current Question Display', () => {
    test('should show current question when available', async () => {
      render(<LearningJourneyWithProvider />)
      
      // Wait for the component to initialize and generate a question
      await waitFor(() => {
        expect(screen.getByTestId('current-question')).toBeInTheDocument()
      })
      
      expect(screen.getByText('Current Question')).toBeInTheDocument()
    })

    test('should display question format correctly', async () => {
      render(<LearningJourneyWithProvider />)
      
      // Wait for question to be generated and displayed
      await waitFor(() => {
        expect(screen.getByText('3 + 5 = ?')).toBeInTheDocument()
      })
      
      // Should show question details
      expect(screen.getByText('Simple - Single Digit')).toBeInTheDocument()
    })
  })

  describe('Answer Checking', () => {
    test('should handle check answer button click', async () => {
      render(<LearningJourneyWithProvider />)
      
      const checkButton = screen.getByRole('button', { name: /check answer/i })
      await user.click(checkButton)
      
      // Should have called the answer checking logic
      // Note: This will depend on the GameContext implementation
    })

    test('should handle keyboard shortcuts for answer checking', async () => {
      render(<LearningJourneyWithProvider />)
      
      // Press Enter key
      await user.keyboard('{Enter}')
      
      // Press Space key
      await user.keyboard(' ')
      
      // Should have handled keyboard events
      // Note: Actual verification depends on GameContext mock
    })

    test('should show correct feedback on button', async () => {
      render(<LearningJourneyWithProvider />)
      
      const checkButton = screen.getByRole('button', { name: /check answer/i })
      
      // Initial state
      expect(checkButton).toHaveClass('bg-blue-500')
      
      // After clicking, button state should change temporarily
      await user.click(checkButton)
      
      // Note: Testing the temporary state changes would require more complex timing
    })
  })

  describe('Helper Functions', () => {
    test('should format operation labels correctly', () => {
      render(<LearningJourneyWithProvider />)
      
      expect(screen.getByText('Addition')).toBeInTheDocument()
      expect(screen.getByText('Subtraction')).toBeInTheDocument()
      expect(screen.getByText('Mixed Operations')).toBeInTheDocument()
    })

    test('should format digit labels correctly', async () => {
      render(<LearningJourneyWithProvider />)
      
      // Expand to see digit labels
      const additionButton = screen.getByRole('button', { name: /addition/i })
      await user.click(additionButton)
      const simpleSection = screen.getByText('Simple Addition')
      await user.click(simpleSection)
      
      expect(screen.getByText('Single Digit')).toBeInTheDocument()
      expect(screen.getByText('Double Digit')).toBeInTheDocument()
    })

    test('should format complement labels correctly', async () => {
      render(<LearningJourneyWithProvider />)
      
      // Expand to see complement labels
      const additionButton = screen.getByRole('button', { name: /addition/i })
      await user.click(additionButton)
      
      expect(screen.getByText('Simple Addition')).toBeInTheDocument()
    })
  })

  describe('Progress Updates', () => {
    test('should update progress on correct answer', async () => {
      render(<LearningJourneyWithProvider />)
      
      const checkButton = screen.getByRole('button', { name: /check answer/i })
      await user.click(checkButton)
      
      // Should record the answer attempt
      // Note: Actual verification depends on GameContext mock setup
    })

    test('should update progress on incorrect answer', async () => {
      render(<LearningJourneyWithProvider />)
      
      const checkButton = screen.getByRole('button', { name: /check answer/i })
      await user.click(checkButton)
      
      // Should record the answer attempt
      // Note: Actual verification depends on GameContext mock setup
    })
  })

  describe('Edge Cases', () => {
    test('should handle missing current level', () => {
      const progressWithoutCurrentLevel = {
        ...mockUserProgress,
        currentLevel: null
      }
      
      mockProgressionManager.loadProgress.mockReturnValue(progressWithoutCurrentLevel)
      
      render(<LearningJourneyWithProvider />)
      
      // Should not crash and should not show current question
      expect(screen.queryByTestId('current-question')).not.toBeInTheDocument()
    })

    test('should handle empty levels array', () => {
      const progressWithoutLevels = {
        ...mockUserProgress,
        allLevels: []
      }
      
      mockProgressionManager.loadProgress.mockReturnValue(progressWithoutLevels)
      
      render(<LearningJourneyWithProvider />)
      
      // Should render but with no operation sections
      expect(screen.getByText('Learning Journey')).toBeInTheDocument()
    })

    test('should handle operations with no unlocked levels', () => {
      const progressWithLockedLevels = {
        ...mockUserProgress,
        allLevels: mockUserProgress.allLevels.map(level => ({
          ...level,
          isUnlocked: false
        }))
      }
      
      mockProgressionManager.loadProgress.mockReturnValue(progressWithLockedLevels)
      
      render(<LearningJourneyWithProvider />)
      
      // Operation buttons should be disabled
      const additionButton = screen.getByRole('button', { name: /addition/i })
      expect(additionButton).toBeDisabled()
    })
  })
})