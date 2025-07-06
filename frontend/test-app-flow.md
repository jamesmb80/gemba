# GembaFix App Testing Guide

## Current Issues Identified:
1. **Database is empty** - No machines, documents, or chat data
2. **Storage bucket missing** - Documents storage not configured  
3. **Possible project reset** - Data that worked yesterday is gone

## Testing Plan

### Step 1: Check Authentication & Setup
1. **Login to app** with: James@example.com / Password
2. **Check if RLS is blocking data access** 
3. **Verify storage bucket exists**

### Step 2: Create Storage Bucket (if missing)
```sql
-- Run in Supabase SQL Editor
CREATE POLICY "Public read access" ON storage.objects 
FOR SELECT USING (bucket_id = 'documents');

CREATE POLICY "Authenticated users can upload" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'documents' AND auth.role() = 'authenticated');

-- Create bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', true);
```

### Step 3: Test Complete Flow
1. **Login** → Dashboard should load
2. **Create Machine** → Add a test CNC machine
3. **Upload PDF Manual** → Upload a sample PDF
4. **Wait for Processing** → PDF should be processed by Edge Function
5. **Test AI Chat** → Ask question about manual content
6. **Verify Context** → Check blue "Context from manuals" appears

### Step 4: Debug Tools Available
- **Context Debug**: `POST /api/debug-context` 
- **Test Data Setup**: `POST /api/setup-test-data`
- **Direct Database**: Check Supabase dashboard

## Manual Testing Checklist

### Authentication ✅
- [ ] App loads at localhost:3000
- [ ] Login form appears
- [ ] Can login with James@example.com/Password
- [ ] Redirects to dashboard after login

### Machine Management ✅
- [ ] Can create new machine
- [ ] Machine appears in dashboard
- [ ] Can click on machine to access features

### PDF Upload & Processing ✅
- [ ] Manual viewer loads for machine
- [ ] Can select and upload PDF file
- [ ] Upload progress shows
- [ ] Processing status updates
- [ ] "Processing complete" appears
- [ ] PDF shows as "completed" status

### AI Chat with Context ✅
- [ ] Chat interface loads
- [ ] Can send messages to AI
- [ ] AI responds (basic functionality)
- [ ] Blue "Context from manuals" indicator appears
- [ ] AI mentions manual content in responses
- [ ] AI references previous chat history

## Quick Recovery Steps

If data is completely missing:
1. **Login first** (RLS may be hiding data)
2. **Check Supabase dashboard** for tables/data
3. **Run our setup-test-data endpoint** to create sample data
4. **Manually create storage bucket** if missing
5. **Test upload → process → chat flow**

## Expected Results After Fix

- ✅ **AI Chat mentions specific manual sections**
- ✅ **Blue context indicator shows manual filenames**  
- ✅ **Higher confidence responses when context is found**
- ✅ **References to previous troubleshooting sessions**
- ✅ **PDF processing works end-to-end**