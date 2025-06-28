# SP-006: Extend Sempoa Board to Support 13-Digit Calculations

## Product Requirements Document (PRD)

### Problem Statement
The current sempoa board only supports 7 columns, limiting calculations to millions place value (up to 9,999,999). Users need to perform calculations with larger numbers up to trillions place value.

### Objective
Extend the sempoa board from 7 columns to 13 columns to support calculations up to 13-digit numbers (trillions place value: 9,999,999,999,999).

### Requirements

#### Functional Requirements
1. **Column Extension**: Increase from 7 to 13 columns
2. **Place Value Support**: Support place values from 1 to 1,000,000,000,000 (1 trillion)
3. **Label Display**: Update column headers to show appropriate place value labels (handle large numbers with K, M, B, T suffixes)
4. **Value Calculation**: Ensure bead value calculations support 13-digit arithmetic
5. **Layout Responsiveness**: Maintain visual alignment and spacing across all screen sizes

#### Non-Functional Requirements
1. **Performance**: No significant performance degradation with additional columns
2. **Compatibility**: Maintain backward compatibility with existing tests
3. **User Experience**: Preserve intuitive bead interaction and visual clarity
4. **Accessibility**: Ensure column labels remain readable

### Technical Requirements

#### Configuration Changes
- Update `SEMPOA_CONFIG.COLUMNS` from 7 to 13
- Ensure all derived calculations scale appropriately
- Verify board width calculations support 13 columns

#### Component Updates
- Update `SempoaBoard.tsx` to handle 13 columns
- Ensure column header display logic supports larger numbers
- Verify bead positioning and spacing remains consistent

#### Label Display Logic
- 1-999: Display as number
- 1,000-999,999: Display with "K" suffix (e.g., "100K")
- 1,000,000-999,999,999: Display with "M" suffix (e.g., "100M") 
- 1,000,000,000-999,999,999,999: Display with "B" suffix (e.g., "100B")
- 1,000,000,000,000+: Display with "T" suffix (e.g., "1T")

### Success Criteria
1. Sempoa board displays 13 columns with proper spacing
2. All bead interactions work correctly across all columns
3. Column headers display appropriate place value labels
4. Value calculations produce correct results for 13-digit numbers
5. Existing tests continue to pass
6. Visual layout remains aesthetically pleasing and functional

### Risks & Mitigation
- **Layout Issues**: Comprehensive testing across different screen sizes
- **Performance**: Monitor rendering performance with additional DOM elements
- **User Confusion**: Clear labeling and consistent spacing to maintain usability