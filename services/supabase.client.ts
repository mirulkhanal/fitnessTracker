import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import 'react-native-url-polyfill/auto';

const url =
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? Constants.expoConfig?.extra?.supabaseUrl;
const key =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? Constants.expoConfig?.extra?.supabaseKey;

export const supabaseConfigured = Boolean(url && key);
const fallbackUrl = url ?? 'https://invalid.supabase.co';
const fallbackKey = key ?? 'invalid-anon-key';

export const supabase = createClient(fallbackUrl, fallbackKey, {
  auth: {
    flowType: 'pkce',
    storage: AsyncStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});
