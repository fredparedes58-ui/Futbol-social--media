import { createClient } from '@supabase/supabase-js';
import * as tus from 'tus-js-client';

const supabaseUrl = 'https://hefqoxbdktzxheemijao.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhlZnFveGJka3R6eGhlZW1pamFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyMzA0NDcsImV4cCI6MjA4NzgwNjQ0N30._g7vu-qXJZl7AUR2T9g9qWWboQInSC6fePdNp4jPmwk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
        headers: { 'x-application-name': 'kickbase' },
    },
    // Explicitly provide TUS client for resumable uploads
    storage: {
        tusClient: tus
    }
});
