import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, Image, Modal, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { SongCard } from '@/components/SongCard';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';

const formatTime = (millis: number) => {
  const minutes = Math.floor(millis / 60000);
  const seconds = Math.floor((millis % 60000) / 1000);
  return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
};

export default function HomeScreen() {
  const [songs, setSongs] = useState<any[]>([]);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState<any>(null);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  
  // State สำหรับควบคุมการเปิด/ปิดหน้าจอ Player เต็มจอ
  const [isFullPlayerVisible, setFullPlayerVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadSongs();
      // หมายเหตุ: ไม่ต้อง unload sound ที่นี่ เพื่อให้เพลงเล่นต่อเนื่องแม้เปลี่ยนหน้า Tab ไปมา
    }, [])
  );

  const loadSongs = async () => {
    const storedSongs = await AsyncStorage.getItem('mySongs');
    if (storedSongs) setSongs(JSON.parse(storedSongs));
  };

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setDuration(status.durationMillis || 0);
      setIsPlaying(status.isPlaying);
      if (status.didJustFinish) setIsPlaying(false);
    }
  };

  const playSong = async (song: any) => {
    try {
      if (sound) await sound.unloadAsync();
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: song.audioUri },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );
      setSound(newSound);
      setCurrentSong(song);
      setFullPlayerVisible(true); // เปิดหน้าจอใหญ่ทันทีเมื่อกดเล่น
    } catch (e) {
      Alert.alert('Error', 'ไม่สามารถเล่นเพลงนี้ได้');
    }
  };

  const togglePlayPause = async () => {
    if (!sound) return;
    isPlaying ? await sound.pauseAsync() : await sound.playAsync();
  };

  const onSliderValueChange = async (value: number) => {
    if (sound) await sound.setPositionAsync(value);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.playingFrom}>PLAYING FROM PLAYLIST</Text>
        <Text style={styles.header}>My Library</Text>
      </View>
      
      <FlatList
        data={songs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SongCard 
            title={item.title} 
            imageUri={item.imageUri} 
            artist={item.Artist}
            onPress={() => playSong(item)} 
          />
        )}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }} // เว้นที่ให้ Mini Player
      />

      {/* --- 1. Mini Player Bar (แถบเล็กด้านล่าง) --- */}
      {currentSong && (
        <TouchableOpacity onPress={() => setFullPlayerVisible(true)} activeOpacity={0.9}>
          <View style={styles.miniPlayerBar}>
            <Image source={{ uri: currentSong.imageUri }} style={styles.miniImage} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.miniTitle} numberOfLines={1}>{currentSong.title}</Text>
              <Text style={styles.miniArtist} numberOfLines={1}>{currentSong.Artist}</Text>
            </View>
            <TouchableOpacity onPress={togglePlayPause}>
              <Ionicons name={isPlaying ? "pause" : "play"} size={30} color="white" />
            </TouchableOpacity>
          </View>
          {/* Progress Bar เส้นเล็กๆ ด้านบน Mini Player */}
          <View style={{ height: 2, backgroundColor: '#333' }}>
             <View style={{ height: '100%', backgroundColor: '#1DB954', width: `${(position / duration) * 100}%` }} />
          </View>
        </TouchableOpacity>
      )}

      {/* --- 2. Full Player Modal (หน้าจอใหญ่ Slide ขึ้นมา) --- */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={isFullPlayerVisible}
        onRequestClose={() => setFullPlayerVisible(false)} // รองรับปุ่ม Back ของ Android
      >
        <SafeAreaView style={styles.modalContainer}>
          {/* ปุ่มปิด (Minimize) */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setFullPlayerVisible(false)}>
              <Ionicons name="chevron-down" size={35} color="white" />
            </TouchableOpacity>
            <Text style={styles.modalHeaderText}>Now Playing</Text>
            <View style={{ width: 35 }} /> 
          </View>

          {currentSong && (
            <View style={styles.fullPlayerContent}>
              <Image source={{ uri: currentSong.imageUri }} style={styles.fullImage} />

              <View style={styles.songInfoContainer}>
                 <Text style={styles.fullTitle}>{currentSong.title}</Text>
                 <Text style={styles.fullArtist}>{currentSong.Artist}</Text>
              </View>
              
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={duration}
                value={position}
                minimumTrackTintColor="#1DB954"
                maximumTrackTintColor="#535353"
                thumbTintColor="#FFFFFF"
                onSlidingComplete={onSliderValueChange}
              />
              <View style={styles.timeContainer}>
                <Text style={styles.timeText}>{formatTime(position)}</Text>
                <Text style={styles.timeText}>{formatTime(duration)}</Text>
              </View>

              <View style={styles.controlsContainer}>
                <Ionicons name="shuffle" size={30} color="#B3B3B3" />
                <Ionicons name="play-skip-back" size={45} color="white" />
                <TouchableOpacity onPress={togglePlayPause}>
                  <Ionicons name={isPlaying ? "pause-circle" : "play-circle"} size={80} color="white" />
                </TouchableOpacity>
                <Ionicons name="play-skip-forward" size={45} color="white" />
                <Ionicons name="repeat" size={30} color="#B3B3B3" />
              </View>
            </View>
          )}
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', paddingTop: 50 },
  headerContainer: { paddingHorizontal: 20, marginBottom: 20 },
  playingFrom: { color: '#B3B3B3', fontSize: 12, marginBottom: 4 },
  header: { fontSize: 24, color: 'white', fontWeight: 'bold' },

  // Styles สำหรับ Mini Player Bar (แถบเล็ก)
  miniPlayerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#282828',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#333'
  },
  miniImage: { width: 40, height: 40, borderRadius: 4, backgroundColor: '#333' },
  miniTitle: { color: 'white', fontWeight: 'bold', fontSize: 14 },
  miniArtist: { color: '#B3B3B3', fontSize: 12 },

  // Styles สำหรับ Full Player Modal (หน้าจอใหญ่)
  modalContainer: { flex: 1, backgroundColor: '#121212' },
  modalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingTop: 20,
    marginBottom: 40
  },
  modalHeaderText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  
  fullPlayerContent: { alignItems: 'center', paddingHorizontal: 30 },
  fullImage: {
    width: 300,
    height: 300,
    borderRadius: 10,
    marginBottom: 40,
    backgroundColor: '#333',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  songInfoContainer: { width: '100%', alignItems: 'flex-start', marginBottom: 20 },
  fullTitle: { color: 'white', fontWeight: 'bold', fontSize: 24, marginBottom: 5 , alignItems: 'center',alignSelf: 'center'},
  fullArtist: { color: '#B3B3B3', fontSize: 18 },

  slider: { width: '100%', height: 40 },
  timeContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 30 },
  timeText: { color: '#B3B3B3', fontSize: 12 },

  controlsContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' },
});