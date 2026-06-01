import {
  Anybody_600SemiBold,
  Anybody_700Bold,
} from '@expo-google-fonts/anybody';
import {
  HankenGrotesk_400Regular,
  HankenGrotesk_600SemiBold,
} from '@expo-google-fonts/hanken-grotesk';
import { JetBrainsMono_500Medium } from '@expo-google-fonts/jetbrains-mono';
import { useFonts } from 'expo-font';

export const useAppFonts = () => {
  const [loaded, error] = useFonts({
    Anybody_700Bold,
    Anybody_600SemiBold,
    HankenGrotesk_400Regular,
    HankenGrotesk_600SemiBold,
    JetBrainsMono_500Medium,
  });

  return { loaded: loaded || Boolean(error), error };
};
