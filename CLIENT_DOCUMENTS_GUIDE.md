# Client Documents & Photos Upload Guide

This feature allows clients to upload, manage, and download documents and photos from their dashboard.

## Features

### Upload Methods
1. **Click to Upload**: Click the "Choisir des fichiers" button
2. **Drag & Drop**: Drag files directly into the upload zone
3. **Paste (Ctrl+V)**: Copy an image and paste it anywhere on the documents page
4. **Multiple Files**: Select multiple files at once

### Supported File Types
- Images: JPG, PNG, WebP
- Documents: PDF
- Max file size: 10MB per file

### File Management
- **View**: Click on any file to see it full-screen
- **Download**: Download files to your device
- **Delete**: Remove unwanted files
- **Gallery View**: All files displayed in an organized grid

## Setup Instructions

### Option 1: Run Setup Script (Recommended)
```bash
npm run setup-documents
```

### Option 2: Manual SQL Setup
If the script doesn't work, run this SQL in your Supabase SQL Editor:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `setup-client-documents.sql`
4. Click "Run"

## Usage

1. **Login as a client**
2. Navigate to the **"Mes Documents"** tab in your dashboard
3. Upload files using any of these methods:
   - Click "Choisir des fichiers" button
   - Drag files into the drop zone
   - Press Ctrl+V to paste an image

4. **Manage files**:
   - Click any file to view it full-screen
   - Hover over files to see Download and Delete buttons
   - Download files by clicking the download icon

## Technical Details

### Database Table: `client_documents`
- Stores metadata for each uploaded file
- Links files to users and optionally to job requests
- Protected by Row Level Security (RLS)

### Storage
- Files are stored in Supabase Storage
- Bucket: `documents`
- Each user has their own folder

### Security
- Users can only see their own files
- RLS policies ensure data isolation
- File validation on upload

## Troubleshooting

### Files not uploading?
1. Check file size (max 10MB)
2. Verify file type is supported
3. Ensure storage bucket exists (run `npm run setup-storage`)

### Can't see uploaded files?
1. Refresh the page
2. Check browser console for errors
3. Verify RLS policies are in place

### Paste not working?
- Make sure you're on the "Mes Documents" tab
- Only images can be pasted
- Try copying the image again
