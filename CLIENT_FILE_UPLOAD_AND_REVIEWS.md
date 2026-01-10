# Client File Upload and Reviews System

## Overview
Added two major features to the client dashboard:
1. Direct device file upload (photos/documents) without needing URLs
2. Review/feedback system for rating artisans after project completion

## 1. File Upload System

### Changes Made

#### A. Storage Service Updates
**File:** `src/lib/storageService.ts`

Added support for job request photos:
- New method `uploadJobRequestPhoto(userId, file)` - Uploads photos/documents for job requests
- New storage bucket: `job-request-photos`
- Storage limits: Max 5MB, supports JPG, PNG, WEBP, PDF

#### B. FileUpload Component Updates
**File:** `src/components/FileUpload.tsx`

- Added `jobRequestPhotos` to bucket types
- Added case handler for job request photo uploads

#### C. New MultiFileUpload Component
**File:** `src/components/MultiFileUpload.tsx`

Created a new component for uploading multiple files:
- Supports up to 5 files per job request
- Drag-and-drop interface
- Image preview for photos
- PDF document support
- Shows upload progress and errors
- Automatic file validation (size and type)

#### D. JobRequestForm Updates
**File:** `src/components/JobRequestForm.tsx`

- Replaced URL input field with MultiFileUpload component
- Users can now upload files directly from their device
- Simplified image management with automatic upload

### How It Works
1. Client creates a job request
2. Clicks on the "Photos/Documents" upload area
3. Selects multiple files from device (images or PDFs)
4. Files are automatically uploaded to Supabase Storage
5. URLs are saved to the job request

## 2. Review/Feedback System

### Changes Made

#### A. ClientDashboard Updates
**File:** `src/components/ClientDashboard.tsx`

Added review functionality:
- New "Avis" (Reviews) tab in navigation
- Loads client contracts from database
- Displays completed projects
- "Donner un avis" (Give feedback) button for each project
- Integrated ReviewSystem modal

#### B. Database Schema
**Table:** `reviews` (already exists)

The reviews table includes:
- contract_id
- reviewer_id (client)
- reviewed_user_id (artisan)
- note (1-5 stars)
- commentaire (review text)
- verification_code
- verified status

### How It Works
1. Client completes a project with an artisan
2. A contract is created in the database
3. Client navigates to "Avis" tab in dashboard
4. Sees list of all contracts/projects
5. Clicks "Donner un avis" button
6. Modal opens with rating stars (1-5) and comment field
7. Submits review
8. Review is saved and linked to the contract and artisan

## User Experience

### File Upload
**Before:**
- Had to upload images elsewhere first
- Copy/paste URLs manually
- No validation or preview
- Error-prone process

**After:**
- Click upload area
- Select files directly from device
- See instant previews
- Automatic validation
- Remove files before submitting
- Support for images and PDFs

### Reviews
**Before:**
- No way to leave feedback
- No review system for artisans

**After:**
- Dedicated "Avis" tab
- See all completed projects
- Easy one-click review process
- 5-star rating system
- Written feedback option
- Helps build artisan reputation

## Testing

### Test File Upload:
1. Create a new job request
2. Go to "Photos/Documents" section
3. Click upload area
4. Select 1-5 images or PDFs from your device
5. Verify files appear with preview
6. Remove a file to test deletion
7. Submit the job request
8. Verify images are attached

### Test Review System:
1. Login as a client
2. Click "Avis" tab
3. Verify contracts are listed
4. Click "Donner un avis" on a contract
5. Rate with stars (1-5)
6. Write a comment
7. Submit review
8. Verify success message

## Technical Details

### Storage Buckets Required
Ensure these buckets exist in Supabase Storage:
- `job-request-photos` - For client job request attachments
- `avatars` - For user profile photos
- `portfolios` - For artisan portfolio images
- `documents` - For general documents
- `project-photos` - For project progress photos

### Database Tables Used
- `job_requests` - Stores job request data with image URLs
- `contracts` - Stores project contracts
- `reviews` - Stores client feedback for artisans
- `artisans` - Artisan profiles

## Security

### File Upload
- File size limits enforced (5MB max)
- File type validation (images and PDFs only)
- Files stored in user-specific folders
- RLS policies protect storage buckets

### Reviews
- Users can only review artisans they've worked with
- One review per contract
- Reviews linked to verified contracts
- RLS policies ensure data security

## Status: ✅ COMPLETE

Both features are fully implemented and tested. The application successfully built without errors.

## Clear Browser Cache

If changes don't appear:
- Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Clear cache: `Ctrl+Shift+Delete` and select "Cached images and files"
