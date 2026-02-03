import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// กำหนด Type ของ Props ให้ชัดเจน
type Props = {
  title: string;
  imageUri: string;
  artist: string; // เพิ่ม Type ตรงนี้
  onPress?: () => void;
  isDeleteMode?: boolean;
};

export const SongCard = ({ title, imageUri, artist, onPress, isDeleteMode }: Props) => {
  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={onPress} 
      activeOpacity={0.7} 
      disabled={!onPress}
    >
      {/* แก้ไขลบเครื่องหมาย √ ที่เกินมา */}
      <Image source={{ uri: imageUri }} style={styles.image} />
      
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        {/* แสดงชื่อ Artist ที่รับเข้ามา */}
        <Text style={styles.subTitle} numberOfLines={1}>
          {artist || 'Unknown Artist'}
        </Text> 
      </View>

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