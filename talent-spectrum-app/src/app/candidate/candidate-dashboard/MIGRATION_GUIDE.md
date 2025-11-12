# Candidate Dashboard - File Splitting Migration Guide

## Overview
This guide documents the refactoring of the candidate-dashboard component from a single 2650-line monolithic file into a modular, maintainable architecture.

## Files Created

### 1. Types Module
**File:** `types.ts`
**Purpose:** Centralized type definitions for all dashboard-related data structures
**Exports:**
- `Environment` - Work environment preferences
- `Education` - Educational background
- `Experience` - Work experience
- `LanguageProficiency` - Language skills
- `CandidateProfile` - Complete candidate profile
- `Application` - Job applications
- `SavedJob` - Saved job listings

### 2. Components

#### DashboardSidebar Component
**File:** `components/DashboardSidebar.tsx`
**Purpose:** Navigation sidebar with profile summary and menu
**Props:**
```typescript
{
  candidateProfile: CandidateProfile;
  activeTab: string;
  openDropdowns: Record<string, boolean>;
  onTabChange: (tabId: string) => void;
  onDropdownToggle: (key: string) => void;
}
```
**Features:**
- Profile avatar with initials
- Profile completion progress bar
- Collapsible navigation menu with nested items
- Active tab highlighting

#### OverviewTab Component
**File:** `components/OverviewTab.tsx`
**Purpose:** Dashboard overview with stats and recent applications
**Props:**
```typescript
{
  applications: Application[];
  savedJobsCount: number;
  candidateProfile: CandidateProfile;
  onTabChange: (tabId: string) => void;
  getStatusIcon: (status: string) => React.ReactNode;
  getStatusBadge: (status: string) => React.ReactNode;
}
```
**Features:**
- Stats cards (Applications, Profile Views, Saved Jobs) - clickable to navigate
- Recent applications list (first 3)
- Accommodations profile summary

#### ApplicationsTab Component
**File:** `components/ApplicationsTab.tsx`
**Purpose:** Job applications list with expandable details
**Props:**
```typescript
{
  applications: Application[];
  expandedApplicationId: string | null;
  onToggleExpand: (id: string) => void;
  getStatusIcon: (status: string) => React.ReactNode;
  getStatusBadge: (status: string) => React.ReactNode;
}
```
**Features:**
- Application count badge
- Empty state with "Browse Jobs" CTA
- Expandable cards with smooth animations
- Status badges and icons
- Match score display
- Accommodations indicators

#### SavedJobsTab Component
**File:** `components/SavedJobsTab.tsx`
**Purpose:** Saved jobs list with expandable details and apply functionality
**Props:**
```typescript
{
  savedJobs: SavedJob[];
  expandedSavedJobId: string | null;
  isApplyingFromSaved: string | null;
  onToggleExpand: (id: string) => void;
  onRemoveSavedJob: (jobId: string) => Promise<void>;
  onApplyToSavedJob: (job: SavedJob) => Promise<void>;
  onNavigateToBrowseJobs: () => void;
}
```
**Features:**
- Saved jobs count badge
- Empty state with "Browse Jobs" CTA
- Expandable cards with smooth animations
- Direct "Apply Now" functionality with loading states
- Remove job button
- Inclusive employer badges

### 3. Utilities

#### Status Helpers
**File:** `utils/statusHelpers.tsx`
**Purpose:** Application status rendering utilities
**Exports:**
- `getStatusIcon(status: string)` - Returns appropriate icon for status
- `getStatusBadge(status: string)` - Returns styled badge for status

**Status Types:**
- Applied (blue)
- Under Review (yellow)
- Interviewing (green)
- Rejected (red)

#### Profile Calculations
**File:** `utils/profileCalculations.ts`
**Purpose:** Profile completion calculation
**Exports:**
- `calculateProfileCompletion(profile: CandidateProfile)` - Calculates completion percentage

**Completion Criteria:** (8 total)
1. Name
2. Email
3. Education level
4. Employer (experience)
5. Hard skills
6. Accommodations
7. Environment preferences
8. Personal identifiers

## Migration Steps

### Step 1: Update Imports in Main Dashboard
Replace the inline type definitions with imports from the types module:

```typescript
// Remove inline type definitions (lines ~40-130)
// Add these imports at the top:
import {
  Environment,
  Education,
  Experience,
  LanguageProficiency,
  CandidateProfile,
  Application,
  SavedJob,
} from "./types";
import { DashboardSidebar } from "./components/DashboardSidebar";
import { OverviewTab } from "./components/OverviewTab";
import { ApplicationsTab } from "./components/ApplicationsTab";
import { SavedJobsTab } from "./components/SavedJobsTab";
import { getStatusIcon, getStatusBadge } from "./utils/statusHelpers";
import { calculateProfileCompletion } from "./utils/profileCalculations";
```

### Step 2: Remove Duplicate Helper Functions
Delete the inline `getStatusIcon`, `getStatusBadge`, and `calculateProfileCompletion` functions from the main file since they're now imported from utils.

### Step 3: Replace Sidebar Rendering
Find the sidebar rendering code (the section with profile info, progress bar, and navigation menu) and replace with:

```typescript
<DashboardSidebar
  candidateProfile={candidateProfile}
  activeTab={activeTab}
  openDropdowns={openDropdowns}
  onTabChange={handleTabChange}
  onDropdownToggle={handleDropdownToggle}
/>
```

### Step 4: Replace Overview Tab Rendering
Find the overview tab rendering (stats cards, recent applications, accommodations profile) and replace with:

```typescript
{activeTab === "overview" && (
  <OverviewTab
    applications={applications}
    savedJobsCount={savedJobs.length}
    candidateProfile={candidateProfile}
    onTabChange={handleTabChange}
    getStatusIcon={getStatusIcon}
    getStatusBadge={getStatusBadge}
  />
)}
```

### Step 5: Replace Applications Tab Rendering
Find the applications tab rendering code and replace with:

```typescript
{activeTab === "applications" && (
  <ApplicationsTab
    applications={applications}
    expandedApplicationId={expandedApplicationId}
    onToggleExpand={handleToggleExpandApplication}
    getStatusIcon={getStatusIcon}
    getStatusBadge={getStatusBadge}
  />
)}
```

Add this helper function:
```typescript
const handleToggleExpandApplication = (id: string) => {
  setExpandedApplicationId(expandedApplicationId === id ? null : id);
};
```

### Step 6: Replace Saved Jobs Tab Rendering
Find the saved jobs tab rendering code and replace with:

```typescript
{activeTab === "saved" && (
  <SavedJobsTab
    savedJobs={savedJobs}
    expandedSavedJobId={expandedSavedJobId}
    isApplyingFromSaved={isApplyingFromSaved}
    onToggleExpand={handleToggleExpandSavedJob}
    onRemoveSavedJob={handleRemoveSavedJob}
    onApplyToSavedJob={handleApplyToSavedJob}
    onNavigateToBrowseJobs={() => handleTabChange("browseJobs")}
  />
)}
```

Add this helper function:
```typescript
const handleToggleExpandSavedJob = (id: string) => {
  setExpandedSavedJobId(expandedSavedJobId === id ? null : id);
};
```

### Step 7: Keep Existing Business Logic
The following functions and state should remain in the main page.tsx:
- All useState hooks for state management
- All useEffect hooks for data fetching and event listeners
- `fetchCandidateProfile()` - Fetches profile data
- `refetchApplications()` - Refetches applications
- `refetchSavedJobs()` - Refetches saved jobs
- `handleTabChange()` - Tab navigation with refetch logic
- `handleDropdownToggle()` - Sidebar dropdown toggle
- `handleRemoveSavedJob()` - Removes saved job
- `handleApplyToSavedJob()` - Applies to job from saved
- Event listener callbacks (`onJobApplied`, `onJobSaved`, `onJobUnsaved`)

## Field Name Differences to Watch

### SavedJob Type
The SavedJob type uses these field names:
- `title` (not `jobTitle`)
- `type` (not `jobType`)

When passing SavedJob data to components or making API calls, ensure field names match the type definition.

## Benefits of This Refactoring

1. **Improved Maintainability**: Each component has a single, focused responsibility
2. **Better Testability**: Smaller components are easier to unit test
3. **Code Reusability**: Components can be reused across different parts of the app
4. **Easier Collaboration**: Multiple developers can work on different components
5. **Better IDE Performance**: Smaller files reduce IDE lag
6. **Clearer Code Organization**: Related code is grouped logically
7. **Type Safety**: Centralized types prevent inconsistencies

## File Size Reduction Estimate

- **Before**: 2650 lines in single file
- **After**: ~300-400 lines in main file + modular components
- **Reduction**: ~85% reduction in main file size

## Next Steps (Optional Future Enhancements)

1. Extract remaining tab components:
   - ProfileConfigTab
   - EducationTab
   - ExperienceTab
   - SkillsTab
   - NeuroStrengthTab
   - EnvironmentTab

2. Create custom hooks:
   - `useProfileData` - Profile fetching logic
   - `useApplicationsData` - Applications/saved jobs fetching
   - `useEventListeners` - Job action event listeners

3. Extract shared UI components:
   - EmptyState component (reusable empty state)
   - JobCard component (reusable job display)
   - StatsCard component (reusable stats display)

## Important Notes

- All new components use `"use client"` directive for Next.js App Router
- Components use proper TypeScript typing with interfaces
- Event listeners for real-time updates remain in main component
- Framer Motion animations are preserved in extracted components
- All components follow the existing design system (colors, spacing, etc.)
