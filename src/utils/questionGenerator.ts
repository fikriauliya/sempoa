import { Question } from '../types'

interface QuestionConfig {
  difficulty: 'single' | 'double' | 'triple'
  operation: 'addition' | 'subtraction' | 'mixed'
  useSmallFriend: boolean
  useBigFriend: boolean
}

const getRandomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const generateNumber = (difficulty: 'single' | 'double' | 'triple'): number => {
  switch (difficulty) {
    case 'single':
      return getRandomInt(1, 9)
    case 'double':
      return getRandomInt(10, 99)
    case 'triple':
      return getRandomInt(100, 999)
    default:
      return getRandomInt(1, 9)
  }
}

const needsSmallFriend = (a: number, b: number): boolean => {
  const aLastDigit = a % 10
  const bLastDigit = b % 10
  return aLastDigit + bLastDigit > 9
}

const needsBigFriend = (a: number, b: number): boolean => {
  return a + b >= 10 && (a % 10) + (b % 10) <= 9
}

const generateAdditionQuestion = (config: QuestionConfig): Question => {
  let num1 = generateNumber(config.difficulty)
  let num2 = generateNumber(config.difficulty)
  
  if (config.useSmallFriend && !needsSmallFriend(num1, num2)) {
    const digits = config.difficulty === 'single' ? 1 : 
                   config.difficulty === 'double' ? 2 : 3
    const maxForDigits = Math.pow(10, digits) - 1
    
    while (!needsSmallFriend(num1, num2) && num1 + num2 <= maxForDigits) {
      num2 = generateNumber(config.difficulty)
    }
  }
  
  if (config.useBigFriend && !needsBigFriend(num1, num2)) {
    while (!needsBigFriend(num1, num2)) {
      num1 = generateNumber(config.difficulty)
      num2 = generateNumber(config.difficulty)
    }
  }
  
  return {
    operands: [num1, num2],
    operation: 'addition',
    answer: num1 + num2,
    difficulty: config.difficulty,
    useSmallFriend: config.useSmallFriend,
    useBigFriend: config.useBigFriend
  }
}

const generateSubtractionQuestion = (config: QuestionConfig): Question => {
  let num1 = generateNumber(config.difficulty)
  let num2 = generateNumber(config.difficulty)
  
  if (num2 > num1) {
    [num1, num2] = [num2, num1]
  }
  
  if (config.useSmallFriend) {
    while ((num1 % 10) >= (num2 % 10)) {
      num2 = generateNumber(config.difficulty)
      if (num2 > num1) {
        [num1, num2] = [num2, num1]
      }
    }
  }
  
  return {
    operands: [num1, num2],
    operation: 'subtraction',
    answer: num1 - num2,
    difficulty: config.difficulty,
    useSmallFriend: config.useSmallFriend,
    useBigFriend: config.useBigFriend
  }
}

export const generateQuestion = (config: QuestionConfig): Question => {
  if (config.operation === 'mixed') {
    const operations: ('addition' | 'subtraction')[] = ['addition', 'subtraction']
    const randomOperation = operations[Math.floor(Math.random() * operations.length)]
    const mixedConfig = { ...config, operation: randomOperation }
    
    if (randomOperation === 'addition') {
      return generateAdditionQuestion(mixedConfig)
    } else {
      return generateSubtractionQuestion(mixedConfig)
    }
  }
  
  if (config.operation === 'addition') {
    return generateAdditionQuestion(config)
  } else {
    return generateSubtractionQuestion(config)
  }
}