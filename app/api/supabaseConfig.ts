// supabaseConfig.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gvtklhbxspizkggawxyy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2dGtsaGJ4c3BpemtnZ2F3eHl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY1MTIwNTYsImV4cCI6MjA0MjA4ODA1Nn0.dcNWB96NGQXmaRRECeD5MXdhfQqJ7PjiQYhMxLNSeN4';

export const supabase = createClient(supabaseUrl, supabaseKey);