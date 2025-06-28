import { LevelProgress, UserProgress } from '../types'

const STORAGE_KEY = 'sempoa_user_progress'
const QUESTIONS_TO_COMPLETE = 10

export class ProgressionManager {
  private static instance: ProgressionManager
  
  private constructor() {}
  
  static getInstance(): ProgressionManager {
    if (!ProgressionManager.instance) {
      ProgressionManager.instance = new ProgressionManager()
    }
    return ProgressionManager.instance
  }
  
  initializeProgress(): UserProgress {
    const allLevels = this.generateAllLevels()
    
    // Unlock only the first level
    allLevels[0].isUnlocked = true
    
    return {
      currentLevel: allLevels[0],
      allLevels,
      totalScore: 0
    }
  }
  
  loadProgress(): UserProgress {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
    return this.initializeProgress()
  }
  
  saveProgress(progress: UserProgress): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  }
  
  private generateAllLevels(): LevelProgress[] {
    const levels: LevelProgress[] = []
    const operations: Array<'addition' | 'subtraction' | 'mixed'> = ['addition', 'subtraction', 'mixed']
    const complements: Array<'simple' | 'smallFriend' | 'bigFriend' | 'both'> = ['simple', 'smallFriend', 'bigFriend', 'both']
    const digits: Array<'single' | 'double' | 'triple' | 'four' | 'five'> = ['single', 'double', 'triple', 'four', 'five']
    
    for (const operation of operations) {
      for (const complement of complements) {
        for (const digit of digits) {
          levels.push({
            operationType: operation,
            complementType: complement,
            digitLevel: digit,
            questionsCompleted: 0,
            correctAnswers: 0,
            isUnlocked: false,
            isCompleted: false
          })
        }
      }
    }
    
    return levels
  }
  
  recordCorrectAnswer(progress: UserProgress): UserProgress {
    if (!progress.currentLevel) return progress
    
    const updatedProgress = { ...progress }
    const currentLevel = updatedProgress.allLevels.find(
      level => 
        level.operationType === progress.currentLevel!.operationType &&
        level.complementType === progress.currentLevel!.complementType &&
        level.digitLevel === progress.currentLevel!.digitLevel
    )
    
    if (currentLevel) {
      currentLevel.questionsCompleted++
      currentLevel.correctAnswers++
      updatedProgress.totalScore++
      
      // Check if level is completed
      if (currentLevel.correctAnswers >= QUESTIONS_TO_COMPLETE) {
        currentLevel.isCompleted = true
        
        // Unlock next level
        const nextLevel = this.getNextLevel(updatedProgress.allLevels, currentLevel)
        if (nextLevel) {
          nextLevel.isUnlocked = true
          updatedProgress.currentLevel = nextLevel
        } else {
          updatedProgress.currentLevel = null // All levels completed!
        }
      }
    }
    
    this.saveProgress(updatedProgress)
    return updatedProgress
  }
  
  recordIncorrectAnswer(progress: UserProgress): UserProgress {
    if (!progress.currentLevel) return progress
    
    const updatedProgress = { ...progress }
    const currentLevel = updatedProgress.allLevels.find(
      level => 
        level.operationType === progress.currentLevel!.operationType &&
        level.complementType === progress.currentLevel!.complementType &&
        level.digitLevel === progress.currentLevel!.digitLevel
    )
    
    if (currentLevel) {
      currentLevel.questionsCompleted++
    }
    
    this.saveProgress(updatedProgress)
    return updatedProgress
  }
  
  private getNextLevel(allLevels: LevelProgress[], currentLevel: LevelProgress): LevelProgress | null {
    const currentIndex = allLevels.findIndex(
      level => 
        level.operationType === currentLevel.operationType &&
        level.complementType === currentLevel.complementType &&
        level.digitLevel === currentLevel.digitLevel
    )
    
    if (currentIndex >= 0 && currentIndex < allLevels.length - 1) {
      return allLevels[currentIndex + 1]
    }
    
    return null
  }
  
  selectLevel(progress: UserProgress, level: LevelProgress): UserProgress {
    if (!level.isUnlocked) return progress
    
    const updatedProgress = { ...progress }
    updatedProgress.currentLevel = level
    
    this.saveProgress(updatedProgress)
    return updatedProgress
  }
  
  getCompletionPercentage(progress: UserProgress): number {
    const completedCount = progress.allLevels.filter(level => level.isCompleted).length
    return Math.round((completedCount / progress.allLevels.length) * 100)
  }
  
  getSectionProgress(progress: UserProgress, operationType: 'addition' | 'subtraction' | 'mixed', complementType: 'simple' | 'smallFriend' | 'bigFriend' | 'both'): { completed: number, total: number } {
    const sectionLevels = progress.allLevels.filter(
      level => level.operationType === operationType && level.complementType === complementType
    )
    
    const completed = sectionLevels.filter(level => level.isCompleted).length
    
    return {
      completed,
      total: sectionLevels.length
    }
  }
}