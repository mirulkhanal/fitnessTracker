import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FitTrackColors, FitTrackFonts } from '@/constants/fittrack-theme';

type Props = {
  children: React.ReactNode;
};

type State = {
  error: Error | null;
};

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    if (__DEV__) {
      console.error('[ErrorBoundary]', error, info.componentStack);
    }
  }

  private handleRetry = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>
            {this.state.error.message || 'An unexpected error occurred.'}
          </Text>
          <Pressable style={styles.button} onPress={this.handleRetry}>
            <Text style={styles.buttonLabel}>Try again</Text>
          </Pressable>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: FitTrackColors.background,
  },
  title: {
    fontFamily: FitTrackFonts.displaySemi,
    fontSize: 22,
    color: FitTrackColors.onBackground,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontFamily: FitTrackFonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: FitTrackColors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: FitTrackColors.primaryContainer,
  },
  buttonLabel: {
    fontFamily: FitTrackFonts.bodySemi,
    fontSize: 16,
    color: FitTrackColors.onPrimaryContainer,
  },
});
