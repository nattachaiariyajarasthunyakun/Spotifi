import { SongCard } from '@/components/SongCard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

export default function DeleteScreen() {
  const [songs, setSongs] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadSongs();
    }, [])
  );

  const loadSongs = async () => {
    const stored = await AsyncStorage.getItem('mySongs');
    if (stored) setSongs(JSON.parse(stored));
  };

  const handleDelete = async (id: string) => {
    const filtered = songs.filter(song => song.id !== id);
    setSongs(filtered);
    await AsyncStorage.setItem('mySongs', JSON.stringify(filtered));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Remove Songs</Text>

      <FlatList
        data={songs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SongCard 
            title={item.title} 
            imageUri={item.imageUri} 
            artist={item.Artist}
            isDeleteMode={true}
            onPress={() => handleDelete(item.id)}
          />
        )}
        contentContainerStyle={{ padding: 20 }}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', paddingTop: 50 },
  header: { fontSize: 32, color: 'red', fontWeight: 'bold', marginLeft: 20, marginBottom: 10 }
});
