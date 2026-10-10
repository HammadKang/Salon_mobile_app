import React, { useState } from 'react';
import { StatusBar, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AnimatedSplash } from './src/brand/Splash';
import { AppProvider } from './src/context/AppContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { colors } from './src/theme';

export default function App() {
  const [splashDone, setSplashDone] = useState(false);
  return (
    <SafeAreaProvider>
      <StatusBar barStyle={splashDone ? 'dark-content' : 'light-content'} />
      <View style={{ flex: 1, backgroundColor: colors.ink }}>
        {/* The app loads behind the intro so it is ready the moment the intro fades. */}
        <AppProvider>
          <RootNavigator />
        </AppProvider>
        {!splashDone && <AnimatedSplash onDone={() => setSplashDone(true)} />}
      </View>
    </SafeAreaProvider>
  );
}
