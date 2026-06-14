# Assessment Progress Saving Feature

## Overview
The assessment system now automatically saves user progress as they answer questions. This ensures that if users need to leave or accidentally close the browser, their answers are preserved and they can resume from where they left off.

## How It Works

### 1. **Auto-Save Functionality**
- Progress is automatically saved to browser localStorage after each question is answered
- No manual "Save" button needed - it happens in the background
- Saves include:
  - Current question number
  - All responses given so far
  - Timestamp of last save
  - Assessment type and user ID

### 2. **Resume Capability**
When a user starts an assessment:
- The system checks for any saved progress
- If found, shows a blue alert with the save timestamp
- Offers two options:
  - **Resume**: Continue from where they left off
  - **Start Fresh**: Clear saved data and begin anew

### 3. **Visual Indicators**
- **On intro screen**: Blue alert shows when saved progress exists
- **During assessment**: Small "Auto-saved" indicator with green checkmark in header
- **On resume**: Success toast notification confirms progress was restored

### 4. **Automatic Cleanup**
Progress is automatically cleared when:
- User successfully completes and submits the assessment
- User clicks "Cancel" to exit the assessment
- User chooses "Start Fresh" instead of resuming

## Technical Details

### New Type
```typescript
export interface AssessmentProgress {
  userId: string;
  assessmentType: 'kolb' | 'sternberg' | 'dual-process';
  isOrganizational: boolean;
  currentQuestion: number;
  responses: number[];
  lastSaved: string;
}
```

### Storage Functions
- `saveAssessmentProgress()`: Saves current progress
- `getAssessmentProgress()`: Retrieves saved progress
- `clearAssessmentProgress()`: Removes saved progress

### Storage Key Format
Each progress is stored with a unique key:
```
ts_assessment_progress_{userId}_{assessmentType}_{isOrganizational}
```

This ensures:
- Each user has separate progress
- Different assessment types don't conflict
- Organizational vs personal assessments are kept separate

## User Experience Flow

### First-Time User
1. Click to start assessment
2. See intro screen with assessment details
3. Click "Begin Assessment"
4. Answer questions (auto-saved after each answer)
5. Submit assessment
6. Progress automatically cleared

### Returning User (with saved progress)
1. Click to start assessment
2. See intro screen with "Progress Found!" alert
3. Choose to "Resume" or "Start Fresh"
4. If Resume: Jump to last question with all previous answers intact
5. Continue from where they left off
6. Submit assessment
7. Progress automatically cleared

### User Who Cancels
1. Start assessment
2. Answer some questions
3. Click "Cancel"
4. Progress automatically cleared
5. Next time: No saved progress found

## Benefits
- **No lost work**: Users can safely close browser or navigate away
- **Flexible**: Can resume or start over as needed
- **Transparent**: Clear indicators show when progress is saved
- **Clean**: Automatic cleanup prevents stale data accumulation
- **Reliable**: Uses browser localStorage for persistent storage
