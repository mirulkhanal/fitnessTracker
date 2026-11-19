import { Redirect } from 'expo-router';
import React from 'react';

import { useLocalProfile } from '@/contexts/LocalProfileContext';

export default function Index() {
  const { profile } = useLocalProfile();
  return <Redirect href={profile.setup_complete ? '/(tabs)' : '/profile-setup'} />;
}
