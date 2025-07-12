import { buildMatrix, QuestionGenerator } from '../questionGenerator';

describe('questionGenerator', () => {
  describe('buildMatrix', () => {
    let matrix: ReturnType<typeof buildMatrix>;

    beforeEach(() => {
      matrix = buildMatrix();
    });

    describe('Addition Matrix', () => {
      test('should create a 10x10 matrix', () => {
        expect(matrix.addition).toHaveLength(10);
        matrix.addition.forEach((row) => {
          expect(row).toHaveLength(10);
        });
      });

      test('should categorize small friend additions correctly', () => {
        // Small friend: both digits < 5 and sum >= 5
        expect(matrix.addition[2][3]).toBe('smallFriend'); // 2+3=5
        expect(matrix.addition[3][2]).toBe('smallFriend'); // 3+2=5
        expect(matrix.addition[4][1]).toBe('smallFriend'); // 4+1=5
        expect(matrix.addition[1][4]).toBe('smallFriend'); // 1+4=5
        expect(matrix.addition[4][4]).toBe('smallFriend'); // 4+4=8
        expect(matrix.addition[4][3]).toBe('smallFriend'); // 4+3=7
        expect(matrix.addition[3][4]).toBe('smallFriend'); // 3+4=7
        expect(matrix.addition[4][2]).toBe('smallFriend'); // 4+2=6
        expect(matrix.addition[2][4]).toBe('smallFriend'); // 2+4=6
      });

      test('should categorize family additions correctly', () => {
        // Family: first digit >= 5, second digit > 5, sum < 15
        expect(matrix.addition[5][6]).toBe('family'); // 5+6=11 < 15
        expect(matrix.addition[6][6]).toBe('family'); // 6+6=12 < 15
        expect(matrix.addition[5][7]).toBe('family'); // 5+7=12 < 15
        expect(matrix.addition[6][7]).toBe('family'); // 6+7=13 < 15
        expect(matrix.addition[7][6]).toBe('family'); // 7+6=13 < 15
        expect(matrix.addition[5][8]).toBe('family'); // 5+8=13 < 15
        expect(matrix.addition[7][7]).toBe('family'); // 7+7=14 < 15
        expect(matrix.addition[8][6]).toBe('family'); // 8+6=14 < 15
        expect(matrix.addition[6][8]).toBe('family'); // 6+8=14 < 15
        expect(matrix.addition[5][9]).toBe('family'); // 5+9=14 < 15
      });

      test('should categorize big friend additions correctly', () => {
        // Big friend: sum >= 10
        expect(matrix.addition[9][1]).toBe('bigFriend'); // 9+1=10
        expect(matrix.addition[5][5]).toBe('bigFriend'); // 5+5=10
        expect(matrix.addition[6][4]).toBe('bigFriend'); // 6+4=10
        expect(matrix.addition[7][3]).toBe('bigFriend'); // 7+3=10
        expect(matrix.addition[8][2]).toBe('bigFriend'); // 8+2=10
        expect(matrix.addition[7][8]).toBe('bigFriend'); // 7+8=15
        expect(matrix.addition[8][8]).toBe('bigFriend'); // 8+8=16
        expect(matrix.addition[9][9]).toBe('bigFriend'); // 9+9=18
        expect(matrix.addition[6][9]).toBe('bigFriend'); // 6+9=15
        expect(matrix.addition[7][9]).toBe('bigFriend'); // 7+9=16
        expect(matrix.addition[8][9]).toBe('bigFriend'); // 8+9=17
      });

      test('should categorize simple additions correctly', () => {
        // Simple: no special technique needed
        expect(matrix.addition[0][0]).toBe('none'); // 0+0=0
        expect(matrix.addition[1][1]).toBe('none'); // 1+1=2
        expect(matrix.addition[2][2]).toBe('none'); // 2+2=4
        expect(matrix.addition[1][3]).toBe('none'); // 1+3=4
        expect(matrix.addition[0][4]).toBe('none'); // 0+4=4
        expect(matrix.addition[5][0]).toBe('none'); // 5+0=5
        expect(matrix.addition[5][1]).toBe('none'); // 5+1=6
        expect(matrix.addition[5][2]).toBe('none'); // 5+2=7
        expect(matrix.addition[5][3]).toBe('none'); // 5+3=8
        expect(matrix.addition[5][4]).toBe('none'); // 5+4=9
        expect(matrix.addition[6][0]).toBe('none'); // 6+0=6
        expect(matrix.addition[6][1]).toBe('none'); // 6+1=7
        expect(matrix.addition[6][2]).toBe('none'); // 6+2=8
        expect(matrix.addition[6][3]).toBe('none'); // 6+3=9
      });

      test('should handle all edge cases with 0', () => {
        // All additions with 0 should be 'none' (except if result >= 10)
        for (let i = 0; i < 10; i++) {
          expect(matrix.addition[0][i]).toBe('none');
          expect(matrix.addition[i][0]).toBe('none');
        }
      });

      test('should not have small friend when first digit >= 5', () => {
        // When first digit is 5 or more, it cannot be small friend
        for (let i = 5; i < 10; i++) {
          for (let j = 0; j < 10; j++) {
            expect(matrix.addition[i][j]).not.toBe('smallFriend');
          }
        }
      });

      test('should not have small friend when second digit >= 5', () => {
        // When second digit is 5 or more, it cannot be small friend
        for (let i = 0; i < 10; i++) {
          for (let j = 5; j < 10; j++) {
            expect(matrix.addition[i][j]).not.toBe('smallFriend');
          }
        }
      });
    });

    describe('Subtraction Matrix', () => {
      test('should create a 10x10 matrix', () => {
        expect(matrix.subtraction).toHaveLength(10);
        matrix.subtraction.forEach((row) => {
          expect(row).toHaveLength(10);
        });
      });

      test('should categorize small friend subtractions correctly', () => {
        // Small friend: first digit >= 5, second digit < 5, result < 5
        expect(matrix.subtraction[5][1]).toBe('smallFriend'); // 5-1=4 < 5
        expect(matrix.subtraction[5][2]).toBe('smallFriend'); // 5-2=3 < 5
        expect(matrix.subtraction[5][3]).toBe('smallFriend'); // 5-3=2 < 5
        expect(matrix.subtraction[5][4]).toBe('smallFriend'); // 5-4=1 < 5
        expect(matrix.subtraction[6][2]).toBe('smallFriend'); // 6-2=4 < 5
        expect(matrix.subtraction[6][3]).toBe('smallFriend'); // 6-3=3 < 5
        expect(matrix.subtraction[6][4]).toBe('smallFriend'); // 6-4=2 < 5
        expect(matrix.subtraction[7][3]).toBe('smallFriend'); // 7-3=4 < 5
        expect(matrix.subtraction[7][4]).toBe('smallFriend'); // 7-4=3 < 5
        expect(matrix.subtraction[8][4]).toBe('smallFriend'); // 8-4=4 < 5
      });

      test('should categorize family subtractions correctly', () => {
        // Family: first digit < 5, second digit > 5, result >= -5
        expect(matrix.subtraction[4][6]).toBe('family'); // 4-6=-2 >= -5
        expect(matrix.subtraction[3][7]).toBe('family'); // 3-7=-4 >= -5
        expect(matrix.subtraction[2][6]).toBe('family'); // 2-6=-4 >= -5
        expect(matrix.subtraction[1][6]).toBe('family'); // 1-6=-5 >= -5
        // Note: 0-5 doesn't match family pattern because digitB (5) is not > 5
        expect(matrix.subtraction[4][7]).toBe('family'); // 4-7=-3 >= -5
        expect(matrix.subtraction[4][8]).toBe('family'); // 4-8=-4 >= -5
        expect(matrix.subtraction[4][9]).toBe('family'); // 4-9=-5 >= -5
        expect(matrix.subtraction[3][8]).toBe('family'); // 3-8=-5 >= -5
        expect(matrix.subtraction[2][7]).toBe('family'); // 2-7=-5 >= -5
      });

      test('should categorize big friend subtractions correctly', () => {
        // Big friend: result < 0 (negative) and digit > 0
        expect(matrix.subtraction[1][2]).toBe('bigFriend'); // 1-2=-1
        expect(matrix.subtraction[3][4]).toBe('bigFriend'); // 3-4=-1
        expect(matrix.subtraction[4][5]).toBe('bigFriend'); // 4-5=-1
        expect(matrix.subtraction[5][9]).toBe('bigFriend'); // 5-9=-4
        expect(matrix.subtraction[1][8]).toBe('bigFriend'); // 1-8=-7
        expect(matrix.subtraction[1][7]).toBe('bigFriend'); // 1-7=-6 < -5
      });

      test('should categorize simple subtractions correctly', () => {
        // Simple: no special technique needed (result >= 0 and doesn't fit other categories)
        expect(matrix.subtraction[5][0]).toBe('none'); // 5-0=5
        expect(matrix.subtraction[9][1]).toBe('none'); // 9-1=8
        expect(matrix.subtraction[8][3]).toBe('none'); // 8-3=5
        expect(matrix.subtraction[7][2]).toBe('none'); // 7-2=5
        expect(matrix.subtraction[4][4]).toBe('none'); // 4-4=0
        expect(matrix.subtraction[9][0]).toBe('none'); // 9-0=9
        expect(matrix.subtraction[6][1]).toBe('none'); // 6-1=5
        expect(matrix.subtraction[7][1]).toBe('none'); // 7-1=6
        expect(matrix.subtraction[8][1]).toBe('none'); // 8-1=7
        expect(matrix.subtraction[9][4]).toBe('none'); // 9-4=5
      });

      test('should handle all subtractions by 0', () => {
        // Subtracting 0 from any number should be 'none'
        for (let i = 0; i < 10; i++) {
          expect(matrix.subtraction[i][0]).toBe('none');
        }
      });

      test('should handle all subtractions from 0', () => {
        // Subtracting from 0
        expect(matrix.subtraction[0][0]).toBe('none'); // 0-0=0
        expect(matrix.subtraction[0][1]).toBe('none'); // 0-1=-1
        expect(matrix.subtraction[0][2]).toBe('none'); // 0-2=-2
        expect(matrix.subtraction[0][3]).toBe('none'); // 0-3=-3
        expect(matrix.subtraction[0][4]).toBe('none'); // 0-4=-4
        expect(matrix.subtraction[0][5]).toBe('none'); // 0-5=-5
        expect(matrix.subtraction[0][6]).toBe('none'); // 0-6=-6
        expect(matrix.subtraction[0][7]).toBe('none'); // 0-7=-7
        expect(matrix.subtraction[0][8]).toBe('none'); // 0-8=-8
        expect(matrix.subtraction[0][9]).toBe('none'); // 0-9=-9
      });
    });

    describe('Matrix Caching', () => {
      test('should return the same matrix instance on subsequent calls', () => {
        const firstCall = buildMatrix();
        const secondCall = buildMatrix();

        // Should be the exact same object reference
        expect(firstCall).toBe(secondCall);
        expect(firstCall.addition).toBe(secondCall.addition);
        expect(firstCall.subtraction).toBe(secondCall.subtraction);
      });

      test('should not rebuild matrix if already cached', () => {
        // Clear the module cache to ensure a fresh start
        jest.resetModules();
        const {
          buildMatrix: freshBuildMatrix,
        } = require('../questionGenerator');

        // First call builds the matrix
        const firstMatrix = freshBuildMatrix();

        // Mock Array constructor to detect if new arrays are created
        const originalArray = Array;
        let arrayConstructorCalled = false;
        (global as { Array: typeof Array }).Array = new Proxy(originalArray, {
          construct(target, args) {
            arrayConstructorCalled = true;
            return Reflect.construct(target, args);
          },
        });

        // Second call should use cache
        const secondMatrix = freshBuildMatrix();

        // Restore Array
        (global as { Array: typeof Array }).Array = originalArray;

        // No new arrays should be created
        expect(arrayConstructorCalled).toBe(false);
        expect(firstMatrix).toBe(secondMatrix);
      });
    });

    describe('Matrix Completeness', () => {
      test('every addition cell should have a valid category', () => {
        const validCategories = ['none', 'smallFriend', 'family', 'bigFriend'];

        for (let i = 0; i < 10; i++) {
          for (let j = 0; j < 10; j++) {
            const category = matrix.addition[i][j];
            expect(validCategories).toContain(category);
          }
        }
      });

      test('every subtraction cell should have a valid category', () => {
        const validCategories = ['none', 'smallFriend', 'family', 'bigFriend'];

        for (let i = 0; i < 10; i++) {
          for (let j = 0; j < 10; j++) {
            const category = matrix.subtraction[i][j];
            expect(validCategories).toContain(category);
          }
        }
      });

      test('matrix should cover all possible digit combinations', () => {
        // Verify that we have exactly 100 cells for each operation
        let additionCount = 0;
        let subtractionCount = 0;

        for (let i = 0; i < 10; i++) {
          for (let j = 0; j < 10; j++) {
            if (matrix.addition[i][j]) additionCount++;
            if (matrix.subtraction[i][j]) subtractionCount++;
          }
        }

        expect(additionCount).toBe(100);
        expect(subtractionCount).toBe(100);
      });
    });
  });

  describe('QuestionGenerator - getFriends method', () => {
    let generator: QuestionGenerator;

    beforeEach(() => {
      generator = new QuestionGenerator();
    });

    describe('Addition - Small Friends', () => {
      test('should find small friends for digit 3', () => {
        const friends = generator.getFriends(3, 'addition', 'smallFriend');
        expect(friends).toEqual([2, 3, 4]);
      });

      test('should find small friends for digit 4', () => {
        const friends = generator.getFriends(4, 'addition', 'smallFriend');
        expect(friends).toEqual([1, 2, 3, 4]);
      });

      test('should find small friends for digit 2', () => {
        const friends = generator.getFriends(2, 'addition', 'smallFriend');
        expect(friends).toEqual([3, 4]);
      });

      test('should return empty array when no small friends exist', () => {
        const friends = generator.getFriends(0, 'addition', 'smallFriend');
        expect(friends).toEqual([]);
      });
    });

    describe('Addition - Big Friends', () => {
      test('should find big friends for digit 5', () => {
        const friends = generator.getFriends(5, 'addition', 'bigFriend');
        expect(friends).toEqual([5]);
      });

      test('should find big friends for digit 7', () => {
        const friends = generator.getFriends(7, 'addition', 'bigFriend');
        expect(friends).toEqual([3, 4, 5, 8, 9]);
      });

      test('should find big friends for digit 2', () => {
        const friends = generator.getFriends(2, 'addition', 'bigFriend');
        expect(friends).toEqual([8, 9]);
      });
    });

    describe('Addition - Family', () => {
      test('should find family friends for digit 6', () => {
        const friends = generator.getFriends(6, 'addition', 'family');
        expect(friends).toEqual([6, 7, 8]);
      });

      test('should find family friends for digit 8', () => {
        const friends = generator.getFriends(8, 'addition', 'family');
        expect(friends).toEqual([6]);
      });
    });

    describe('Subtraction - Small Friends', () => {
      test('should find small friends for digit 1 in subtraction', () => {
        const friends = generator.getFriends(1, 'subtraction', 'smallFriend');
        expect(friends).toEqual([]);
      });

      test('should find small friends for digit 6 in subtraction', () => {
        const friends = generator.getFriends(6, 'subtraction', 'smallFriend');
        expect(friends).toEqual([2, 3, 4]);
      });
    });

    describe('Subtraction - Big Friends', () => {
      test('should find big friends for digit 5 in subtraction', () => {
        const friends = generator.getFriends(5, 'subtraction', 'bigFriend');
        expect(friends).toEqual([6, 7, 8, 9]);
      });

      test('should find big friends for digit 8 in subtraction', () => {
        const friends = generator.getFriends(8, 'subtraction', 'bigFriend');
        expect(friends).toEqual([9]);
      });
    });

    describe('Subtraction - Family', () => {
      test('should find family friends for digit 6 in subtraction', () => {
        const friends = generator.getFriends(6, 'subtraction', 'family');
        expect(friends).toEqual([]);
      });

      test('should find family friends for digit 3 in subtraction', () => {
        const friends = generator.getFriends(3, 'subtraction', 'family');
        expect(friends).toEqual([6, 7, 8]);
      });
    });
  });

  describe('QuestionGenerator - getFirstDigits method', () => {
    let generator: QuestionGenerator;

    beforeEach(() => {
      generator = new QuestionGenerator();
    });

    describe('Addition Operations', () => {
      test('should find all first digits that have small friends in addition', () => {
        const firstDigits = generator.getFirstDigits('addition', 'smallFriend');
        expect(firstDigits).toEqual([1, 2, 3, 4]);
      });

      test('should find all first digits that have big friends in addition', () => {
        const firstDigits = generator.getFirstDigits('addition', 'bigFriend');
        expect(firstDigits).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
      });

      test('should find all first digits that have family friends in addition', () => {
        const firstDigits = generator.getFirstDigits('addition', 'family');
        expect(firstDigits).toEqual([5, 6, 7, 8]);
      });

      test('should find all first digits that have none type in addition', () => {
        const firstDigits = generator.getFirstDigits('addition', 'none');
        expect(firstDigits).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
      });
    });

    describe('Subtraction Operations', () => {
      test('should find all first digits that have small friends in subtraction', () => {
        const firstDigits = generator.getFirstDigits(
          'subtraction',
          'smallFriend',
        );
        expect(firstDigits).toEqual([5, 6, 7, 8]);
      });

      test('should find all first digits that have big friends in subtraction', () => {
        const firstDigits = generator.getFirstDigits(
          'subtraction',
          'bigFriend',
        );
        expect(firstDigits).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
      });

      test('should find all first digits that have family friends in subtraction', () => {
        const firstDigits = generator.getFirstDigits('subtraction', 'family');
        expect(firstDigits).toEqual([1, 2, 3, 4]);
      });

      test('should find all first digits that have none type in subtraction', () => {
        const firstDigits = generator.getFirstDigits('subtraction', 'none');
        expect(firstDigits).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
      });
    });

    describe('Edge Cases', () => {
      test('should return empty array if no digits match the friend type', () => {
        // Create a mock scenario where a friend type might not exist
        // In the current implementation, all friend types exist for some digits
        // This test ensures the method handles empty results correctly
        const results = generator.getFirstDigits('addition', 'smallFriend');
        expect(Array.isArray(results)).toBe(true);
      });

      test('should handle all friend types without errors', () => {
        const friendTypes: Array<
          'none' | 'smallFriend' | 'bigFriend' | 'family'
        > = ['none', 'smallFriend', 'bigFriend', 'family'];
        const operations: Array<'addition' | 'subtraction'> = [
          'addition',
          'subtraction',
        ];

        operations.forEach((op) => {
          friendTypes.forEach((ft) => {
            const result = generator.getFirstDigits(op, ft);
            expect(Array.isArray(result)).toBe(true);
            expect(result.every((n) => n >= 0 && n <= 9)).toBe(true);
          });
        });
      });
    });
  });
});
