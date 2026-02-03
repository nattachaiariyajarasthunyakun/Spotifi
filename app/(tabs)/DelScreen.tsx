import { SongCard } from '@/components/SongCard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

export default function DeleteScreen() {
  const [songs, setSongs] = useState<any[]>([]);

  // โหลดเพลงใหม่ทุกครั้งที่เข้าหน้านี้ (เพื่อให้ข้อมูลตรงกับที่เพิ่มมาล่าสุด)
  useFocusEffect(
    useCallback(() => {
      loadSongs();
    }, [])
  );

  const loadSongs = async () => {
    const stored = await AsyncStorage.getItem('mySongs');
    if (stored) setSongs(JSON.parse(stored));
  };

  // ฟังก์ชันลบเพลง
  const handleDelete = async (id: string) => {
    // สร้าง Array ใหม่ โดยเอาเพลงที่มี ID ตรงกับที่กด "ออกไป" (filter)
    const filtered = songs.filter(song => song.id !== id);
    
    setSongs(filtered); // อัปเดตหน้าจอ
    await AsyncStorage.setItem('mySongs', JSON.stringify(filtered)); // บันทึกข้อมูลที่เหลือลงเครื่อง
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
            isDeleteMode={true} // เปิดโหมดลบ (เพื่อโชว์ไอคอนถังขยะใน SongCard)
            onPress={() => handleDelete(item.id)} // เมื่อกดการ์ด ให้ลบ ID นั้น
          />
        )}
        contentContainerStyle={{ padding: 20 }}
      />
    </View>
  );
}
// ... styles

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', paddingTop: 50 },
  header: { fontSize: 32, color: 'red', fontWeight: 'bold', marginLeft: 20, marginBottom: 10 }
});


