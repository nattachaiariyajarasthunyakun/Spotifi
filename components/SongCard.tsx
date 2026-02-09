import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Props: เป็นการกำหนด "สเปค" ว่าใครจะใช้การ์ดนี้ ต้องส่งข้อมูลอะไรมาบ้าง
type Props = {
  title: string;
  imageUri: string;
  artist: string; 
  onPress?: () => void; // ฟังก์ชันเมื่อกด (ใส่เครื่องหมาย ? แปลว่าไม่ส่งมาก็ได้)
  isDeleteMode?: boolean; // ตัวแปรเงื่อนไข: ถ้า true = โหมดลบ, ถ้า false/ไม่ส่งมา = โหมดปกติ
};

export const SongCard = ({ title, imageUri, artist, onPress, isDeleteMode }: Props) => {
  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={onPress} 
      activeOpacity={0.7} 
      // disabled: ถ้าคนเรียกใช้ไม่ส่ง onPress มา ปุ่มนี้จะกดไม่ติด (เพื่อกัน Error)
      disabled={!onPress} 
    >
      <Image source={{ uri: imageUri }} style={styles.image} />
      
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <Text style={styles.subTitle} numberOfLines={1}>
          {artist || 'Unknown Artist'} {/* Logic: ถ้าไม่มีชื่อ Artist ให้ขึ้นคำว่า Unknown แทน */}
        </Text> 
      </View>

      {/* Conditional Rendering: ถ้า isDeleteMode เป็นจริง ให้วาดไอคอนถังขยะออกมา */}
      {isDeleteMode && (
        <View>
          <Ionicons name="trash" size={24} color="red" />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'transparent', 
    marginVertical: 8, 
    padding: 10 
  },
  image: { width: 60, height: 60, borderRadius: 4, backgroundColor: '#333' },
  info: { flex: 1, marginLeft: 12 },
  title: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  subTitle: { color: '#b3b3b3', fontSize: 14, marginTop: 4 }
});
