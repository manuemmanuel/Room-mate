import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://svoxmassmgzdebagmcnf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2b3htYXNzbWd6ZGViYWdtY25mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5NDgxMDQsImV4cCI6MjA1NjUyNDEwNH0.7Sb1mUeDGuF92p6QdKY-8pkJ1yKjV41ZUEc48qtdIhA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
}); 