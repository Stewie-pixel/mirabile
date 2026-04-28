# Requirements Document

## 1. Application Overview

### 1.1 Application Name
Mirabile

### 1.2 Application Description
Mirabile is a full-stack Career Roadmap Web Application that provides AI-powered roadmap generation, curated resource preparation, and comprehensive user progress tracking to help users achieve their career goals at target companies.

## 2. Users and Usage Scenarios

### 2.1 Target Users
- Career seekers preparing for roles at top tech companies
- Students planning their career development path
- Professionals seeking career transitions or advancement

### 2.2 Core Usage Scenarios
- Generate personalized career roadmaps based on target role and company
- Access curated learning resources and practice materials
- Track progress and maintain learning momentum
- Receive AI-powered recommendations for next steps

## 3. Page Structure and Functional Description

### 3.1 Overall Structure
```
Mirabile Application
├── Authentication Pages
│   ├── Login Page
│   └── Registration Page
├── Home Page
├── Dashboard
├── Roadmap Generator
├── Roadmap Viewer
├── User Profile
└── Progress Tracking
```

### 3.2 Authentication Pages

#### 3.2.1 Login Page
- Email and password input fields
- Login button
- Link to registration page
- Use provided auth.jpg as background or design reference

#### 3.2.2 Registration Page
- Email, password, and confirm password fields
- Registration button
- Link to login page

### 3.3 Home Page
- Application logo (use provided logo.png and Mirabile.png)
- Brief introduction to Mirabile
- Call-to-action button to start generating roadmap
- Navigation to other main sections

### 3.4 Dashboard
- Display current active roadmap summary
- Show progress percentage and completion statistics
- Display recommended next steps
- Show AI-suggested improvements based on user progress
- Quick access buttons to Roadmap Viewer and Progress Tracking

### 3.5 Roadmap Generator

#### 3.5.1 Input Section
- Career goal input field (e.g., Software Engineer, Data Scientist, Cloud Engineer, Cybersecurity Specialist)
- Target company selector with options:
  - Google
  - Microsoft
  - Meta
  - Amazon (use provided Amazon.jpg as company icon)
  - Apple (use provided Apple.jpg as company icon)
  - Other supported companies
- Timeline selector with options:
  - 1 week
  - 1 month
  - 3 months
  - 6 months
  - 1 year
- Generate Roadmap button

#### 3.5.2 Generation Process
- Display loading indicator during AI generation
- Show generation progress or status messages

#### 3.5.3 Result Display
- Preview generated roadmap structure
- Option to view full roadmap in Roadmap Viewer
- Option to regenerate with different parameters

### 3.6 Roadmap Viewer

#### 3.6.1 Timeline Display
- Vertical or horizontal timeline UI showing roadmap phases
- Each phase displays:
  - Phase name and description
  - Duration based on selected timeline
  - Difficulty level indicator
  - Estimated time per task

#### 3.6.2 Expandable Steps
- Each roadmap step can be expanded to show:
  - Detailed task description
  - Daily or weekly task breakdown
  - Associated learning resources
  - Practice problems
  - Video tutorials
  - Documentation links
  - Company-specific interview preparation materials
  - Progress checkbox for task completion

#### 3.6.3 Resource Cards
- Display curated resources for each step
- Resource types include:
  - Learning materials
  - Practice problems
  - Video content
  - Documentation
  - Interview preparation guides

### 3.7 Progress Tracking

#### 3.7.1 Progress Overview
- Overall completion percentage
- Completed tasks count vs total tasks
- Current phase indicator
- Streak counter (consecutive days of activity)
- Milestone achievements display

#### 3.7.2 Task Management
- List of all tasks with completion status
- Ability to mark tasks as complete
- Filter tasks by phase or status
- Resume roadmap from last checkpoint

#### 3.7.3 Progress Visualization
- Progress bar or chart showing completion over time
- Phase-by-phase completion breakdown

### 3.8 User Profile
- Display user information
- Show active roadmaps
- Display achievement badges or milestones
- Settings for notifications and preferences

## 4. Business Rules and Logic

### 4.1 AI Roadmap Generation Rules
- AI must generate structured, actionable roadmaps tailored to:
  - Selected career goal
  - Target company requirements and culture
  - Chosen timeline duration
- Roadmap structure includes:
  - Multiple phases with clear progression
  - Daily or weekly tasks based on timeline
  - Difficulty levels for each task
  - Estimated time commitment per task
- Content must be specific and actionable, avoiding generic filler

### 4.2 AI Resource Generation Rules
- For each roadmap step, AI generates:
  - Relevant learning resources
  - Practice problems aligned with step objectives
  - Video tutorials
  - Official documentation links
  - Company-specific interview preparation materials
- Resources must be high-quality and curated
- Resources should match the difficulty level of the step

### 4.3 Timeline Adjustment Logic
- 1 week timeline: Focus on essential skills, intensive daily tasks
- 1 month timeline: Balanced approach with weekly milestones
- 3 months timeline: Comprehensive coverage with moderate pacing
- 6 months timeline: In-depth learning with practice integration
- 1 year timeline: Thorough preparation with mastery focus

### 4.4 Progress Tracking Rules
- User progress is saved automatically when tasks are marked complete
- Progress percentage calculated as: (completed tasks / total tasks) × 100
- Streak counter increments for consecutive days with at least one completed task
- Milestones triggered at 25%, 50%, 75%, and 100% completion
- Users can resume roadmap from last accessed step

### 4.5 Company-Specific Tailoring
- Roadmap content adjusted based on target company:
  - Company culture and values
  - Known interview processes
  - Required technical skills
  - Preferred technologies and frameworks

## 5. Exceptions and Edge Cases

| Scenario | Handling Method |
|----------|----------------|
| AI generation fails | Display error message, offer retry option |
| No internet connection during generation | Show offline message, queue request for retry |
| User selects invalid timeline | Validate input, prompt user to select valid option |
| Empty roadmap result | Regenerate with adjusted parameters, notify user |
| User attempts to access roadmap without login | Redirect to login page |
| Progress save fails | Retry save operation, show warning if persistent |
| User marks task complete without viewing resources | Allow completion, track in analytics |
| Timeline change after roadmap generation | Prompt user to regenerate roadmap with new timeline |

## 6. Acceptance Criteria

1. User can successfully register and login to the application
2. User can input career goal, select target company, and choose timeline
3. AI generates a structured roadmap with phases, tasks, difficulty levels, and time estimates
4. Roadmap displays in timeline format (vertical or horizontal)
5. Each roadmap step can be expanded to show detailed tasks and resources
6. AI generates relevant learning resources, practice problems, videos, and documentation for each step
7. User can mark tasks as complete using checkboxes
8. Progress is saved to database and persists across sessions
9. Dashboard displays current roadmap, progress summary, and AI recommendations
10. Progress Tracking page shows completion percentage, streak counter, and milestones
11. User can resume roadmap from last checkpoint
12. Application uses light blue as primary color throughout the interface
13. UI is clean, modern, and matches the design reference
14. All uploaded images (auth.jpg, logo.png, Mirabile.png, Amazon.jpg, Apple.jpg) are properly integrated
15. Application supports all specified career paths: SWE, Data Science, Cloud, Cybersecurity, etc.
16. Application supports all specified companies: Google, Microsoft, Meta, Amazon, Apple, etc.
17. All five timeline options (1 week, 1 month, 3 months, 6 months, 1 year) function correctly

## 7. Features Not Implemented in This Version

1. OAuth authentication (only email/password supported)
2. Social sharing of roadmaps
3. Collaborative roadmaps or team features
4. Mobile native applications
5. Offline mode for viewing roadmaps
6. Export roadmap to PDF or other formats
7. Custom roadmap creation without AI
8. Integration with external calendar applications
9. Gamification elements beyond streaks and milestones
10. Community features or user forums
11. Mentor matching or coaching services
12. Job application tracking
13. Salary negotiation resources
14. Company review or rating system