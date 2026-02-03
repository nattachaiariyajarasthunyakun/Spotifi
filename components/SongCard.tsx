import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// กำหนด Type ของ Props เพื่อความชัดเจนและป้องกัน Error
type Props = {
  title: string;
  imageUri: string;
  artist: string; 
  onPress?: () => void; // ฟังก์ชันเมื่อกดที่การ์ด (อาจมีหรือไม่มีก็ได้)
  isDeleteMode?: boolean; // ตัวบอกว่าอยู่ในหน้าลบหรือเปล่า
};

export const SongCard = ({ title, imageUri, artist, onPress, isDeleteMode }: Props) => {
  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={onPress} 
      activeOpacity={0.7} 
      disabled={!onPress} // ถ้าไม่มีฟังก์ชัน onPress ส่งมา ปุ่มจะกดไม่ได้
    >
      <Image source={{ uri: imageUri }} style={styles.image} />
      
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <Text style={styles.subTitle} numberOfLines={1}>
          {artist || 'Unknown Artist'} {/* ถ้าไม่มีชื่อ Artist ให้ขึ้น Unknown */}
        </Text> 
      </View>

      {/* ถ้าอยู่ในโหมดลบ (isDeleteMode = true) ให้แสดงไอคอนถังขยะ */}
      {isDeleteMode && (
        <View>
          <Ionicons name="trash" size={24} color="red" />
        </View>
      )}
    </TouchableOpacity>
  );
};
// ... styles

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
