import React, { useState } from 'react'; 
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AddScreen() {
  // สร้างตัวแปร State มารอรับข้อความที่ user พิมพ์
  const [title, setTitle] = useState('');
  const [imageUri, setImageUri] = useState('');
  const [Artist, SetArtist] = useState('');
  const [audioUri, setAudioUri] = useState(''); 

  // handleAdd: ฟังก์ชันกดปุ่ม "Add Song"
  const handleAdd = async () => {
    // 1. Validation: เช็คว่าช่องไหนว่างไหม ถ้าว่างให้แจ้งเตือนและหยุดทำงาน
    if (!title || !imageUri || !audioUri || !Artist) return Alert.alert('Error', 'กรุณากรอกให้ครบทุกช่อง');

    // 2. Create Object: ห่อข้อมูลเป็นก้อนเดียวกัน เตรียมบันทึก
    const newSong = { 
      id: Date.now().toString(), // ใช้เวลาปัจจุบัน (ms) เป็น ID เพราะมันจะไม่ซ้ำกันแน่นอน
      title, 
      imageUri, 
      audioUri, 
      Artist
    };
    
    // 3. Load Old Data: ดึงข้อมูลเก่าออกมาก่อน (ถ้ามี)
    const existing = await AsyncStorage.getItem('mySongs');
    const songs = existing ? JSON.parse(existing) : []; // ถ้าไม่มี ให้เริ่มด้วยอาเรย์ว่าง []
    
    // 4. Push: เอาเพลงใหม่ไปต่อท้ายรายการเดิม
    songs.push(newSong); 
    
    // 5. Save: แปลงกลับเป็น String แล้วยัดลงเครื่อง (AsyncStorage)
    await AsyncStorage.setItem('mySongs', JSON.stringify(songs));
    
    Alert.alert('Success', 'เพิ่มเพลงแล้ว!');
    
    // 6. Reset: ล้างช่องข้อความให้ว่าง เตรียมกรอกเพลงต่อไป
    setTitle(''); setImageUri(''); setAudioUri(''); SetArtist('')
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Add Song</Text>
      {/* TextInput: ช่องกรอกข้อมูล เชื่อมกับ State ผ่าน value และ onChangeText */}
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



const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 20, justifyContent: 'center' },
  header: { fontSize: 28, color: 'white', marginBottom: 20, textAlign: 'center' },
  input: { backgroundColor: '#333', color: 'white', padding: 15, borderRadius: 8, marginBottom: 15 },
  button: { backgroundColor: '#1DB954', padding: 15, borderRadius: 50, alignItems: 'center' },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});
