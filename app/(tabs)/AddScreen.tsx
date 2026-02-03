import React, { use, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AddScreen() {
  const [title, setTitle] = useState('');
  const [imageUri, setImageUri] = useState('');
  const [Artist,SetArtist] = useState('');
  const [audioUri, setAudioUri] = useState(''); // เพิ่ม State สำหรับ Audio URL

  const handleAdd = async () => {
    if (!title || !imageUri || !audioUri || !Artist) return Alert.alert('Error', 'กรุณากรอกให้ครบทุกช่อง');

    const newSong = { 
      id: Date.now().toString(), 
      title, 
      imageUri, 
      audioUri, // บันทึกลิงก์เสียง
      Artist
    };
    
    const existing = await AsyncStorage.getItem('mySongs');
    const songs = existing ? JSON.parse(existing) : [];
    songs.push(newSong);
    
    await AsyncStorage.setItem('mySongs', JSON.stringify(songs));
    
    Alert.alert('Success', 'เพิ่มเพลงแล้ว!');
    setTitle(''); setImageUri(''); setAudioUri(''); SetArtist('')
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Add Song</Text>
      <TextInput placeholder="Song Title" placeholderTextColor="#888" style={styles.input} value={title} onChangeText={setTitle} />
      <TextInput placeholder="Image URL" placeholderTextColor="#888" style={styles.input} value={imageUri} onChangeText={setImageUri} />
      <TextInput placeholder="Audio URL (.mp3)" placeholderTextColor="#888" style={styles.input} value={audioUri} onChangeText={setAudioUri} />
      <TextInput placeholder="Artist" placeholderTextColor="#888" style={styles.input} value={Artist} onChangeText={SetArtist} />
      <TouchableOpacity style={styles.button} onPress={handleAdd}>
        <Text style={styles.btnText}>Add to Library</Text>
      </TouchableOpacity>
    </View>
  );
}
// Styles เหมือนเดิม...



const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 20, justifyContent: 'center' },
  header: { fontSize: 28, color: 'white', marginBottom: 20, textAlign: 'center' },
  input: { backgroundColor: '#333', color: 'white', padding: 15, borderRadius: 8, marginBottom: 15 },
  button: { backgroundColor: '#1DB954', padding: 15, borderRadius: 50, alignItems: 'center' },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});