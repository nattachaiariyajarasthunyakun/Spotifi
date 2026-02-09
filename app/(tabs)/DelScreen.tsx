import { SongCard } from '@/components/SongCard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

export default function DeleteScreen() {
  const [songs, setSongs] = useState<any[]>([]);

  // useFocusEffect: โหลดเพลงใหม่ทุกครั้งที่เข้ามาหน้านี้ (เพื่อให้ข้อมูลตรงกับล่าสุดเสมอ)
  useFocusEffect(
    useCallback(() => {
      loadSongs();
    }, [])
  );

  const loadSongs = async () => {
    const stored = await AsyncStorage.getItem('mySongs');
    if (stored) setSongs(JSON.parse(stored));
  };

  // handleDelete: ฟังก์ชันลบเพลง รับ ID เพลงที่จะลบมา
  const handleDelete = async (id: string) => {
    // filter: สร้าง Array ใหม่ โดยเอาเฉพาะเพลงที่ "ID ไม่ตรงกับตัวที่กดลบ"
    // (พูดง่ายๆ คือ คัดตัวที่จะลบทิ้งไป เก็บตัวที่เหลือไว้)
    const filtered = songs.filter(song => song.id !== id);
    
    setSongs(filtered); // อัปเดตหน้าจอให้เพลงหายไปทันที
    await AsyncStorage.setItem('mySongs', JSON.stringify(filtered)); // บันทึกรายการใหม่ลงเครื่อง
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
            isDeleteMode={true} // **จุดสำคัญ** ส่งค่า true ไปบอก SongCard ว่า "ขอโชว์ปุ่มถังขยะนะ"
            onPress={() => handleDelete(item.id)} // เมื่อกดที่การ์ด ให้ส่ง ID ไปลบ
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
