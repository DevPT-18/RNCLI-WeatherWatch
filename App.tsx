import React from 'react';
import {StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import WeatherSearchScreen from './src/screens/WeatherSearchScreen';

// Define a simple theme object
const theme = {
  colors: {
    background: '#ffffff',
    text: '#000000',
  },
};

const App = () => {
  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <WeatherSearchScreen />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default App;
