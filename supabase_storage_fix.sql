-- ============================================================
-- KICKBASE - Robust Storage & Database Fix
-- Run this ENTIRE file in Supabase SQL Editor
-- ============================================================

-- 1. Ensure the 'posts' bucket exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('posts', 'posts', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Safely drop existing policies to avoid "already exists" errors
DO $$ 
BEGIN
    -- Objects policies
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'storage_posts_select' AND tablename = 'objects') THEN
        DROP POLICY "storage_posts_select" ON storage.objects;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'storage_posts_insert' AND tablename = 'objects') THEN
        DROP POLICY "storage_posts_insert" ON storage.objects;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'storage_posts_update' AND tablename = 'objects') THEN
        DROP POLICY "storage_posts_update" ON storage.objects;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'storage_posts_delete' AND tablename = 'objects') THEN
        DROP POLICY "storage_posts_delete" ON storage.objects;
    END IF;
    
    -- Posts table policies
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'posts_select_all' AND tablename = 'posts') THEN
        DROP POLICY "posts_select_all" ON public.posts;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'posts_insert_auth' AND tablename = 'posts') THEN
        DROP POLICY "posts_insert_auth" ON public.posts;
    END IF;
END $$;

-- 3. Re-create storage policies
CREATE POLICY "storage_posts_select" ON storage.objects FOR SELECT 
USING (bucket_id = 'posts');

CREATE POLICY "storage_posts_insert" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'posts' AND auth.role() = 'authenticated');

CREATE POLICY "storage_posts_update" ON storage.objects FOR UPDATE 
WITH CHECK (bucket_id = 'posts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "storage_posts_delete" ON storage.objects FOR DELETE 
USING (bucket_id = 'posts' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 4. Re-create posts table policies (Ensure table exists first)
ALTER TABLE IF EXISTS public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "posts_select_all" ON public.posts FOR SELECT 
USING (true);

CREATE POLICY "posts_insert_auth" ON public.posts FOR INSERT 
WITH CHECK (auth.role() = 'authenticated' AND author_id = auth.uid());
