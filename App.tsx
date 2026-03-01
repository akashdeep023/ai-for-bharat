import React, { useEffect } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { localDatabase } from '@services/storage/LocalDatabase';
import { logger } from '@utils/logger';

function App(): React.JSX.Element {
  useEffect(() => {
    const initializeApp = async () => {
      try {
        logger.info('Initializing Farmer Decision Support Platform');
        await localDatabase.initialize();
        logger.info('Database initialized successfully');
      } catch (error) {
        logger.error('Failed to initialize app', error);
      }
    };

    initializeApp();

    return () => {
      localDatabase.close();
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.content}>
        <Text style={styles.title}>Farmer Decision Support Platform</Text>
        <Text style={styles.subtitle}>AI-Powered Farming Guidance</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#16a34a',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
});

export default App;
