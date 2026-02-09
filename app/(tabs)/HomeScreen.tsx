import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, Image, Modal, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { SongCard } from '@/components/SongCard';
import { Audio, AVPlaybackStatus } from 'expo-av'; 
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';

// ฟังก์ชันนี้เอาไว้แปลงหน่วยเวลาจาก Milliseconds (เช่น 185000) ให้เป็น "นาที:วินาที" (เช่น 3:05) เพื่อโชว์บนหน้าจอ
const formatTime = (millis: number) => {
  const minutes = Math.floor(millis / 60000);
  const seconds = Math.floor((millis % 60000) / 1000);
  return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
};

export default function HomeScreen() {
  // --- ส่วนประกาศตัวแปร State (ความจำชั่วคราวของหน้าจอ) ---
  const [songs, setSongs] = useState<any[]>([]); // เก็บรายการเพลงทั้งหมดที่โหลดมาจากเครื่อง
  const [sound, setSound] = useState<Audio.Sound | null>(null); // ตัวแปรสำคัญ! เก็บ Object ของไฟล์เสียงที่กำลังเล่น (ใช้สั่ง Play/Pause/Stop)
  const [isPlaying, setIsPlaying] = useState(false); // เอาไว้เช็คว่าตอนนี้เพลง "เล่นอยู่" หรือ "หยุด" (เพื่อเปลี่ยนไอคอน Play/Pause)
  const [currentSong, setCurrentSong] = useState<any>(null); // เก็บข้อมูลเพลงปัจจุบัน (ชื่อ, รูป, ศิลปิน) เพื่อเอาไปโชว์ใน Player
  const [position, setPosition] = useState(0); // ตัวเลขบอกว่าเพลงเล่นไปถึงวินาทีที่เท่าไหร่แล้ว (หน่วย ms)
  const [duration, setDuration] = useState(0); // ความยาวทั้งหมดของเพลงนี้ (หน่วย ms)
  
  // ตัวคุมเปิด/ปิด หน้าจอ Player ใหญ่ (ถ้า true = เปิด Modal เต็มจอ)
  const [isFullPlayerVisible, setFullPlayerVisible] = useState(false);

  // useFocusEffect: ฟังก์ชันนี้จะทำงาน "ทุกครั้งที่เราเปิดกลับมาหน้านี้" 
  // ประโยชน์: เวลาเราไปเพิ่มเพลงหน้า Add แล้วกลับมาหน้านี้ เพลงใหม่จะโผล่ขึ้นมาทันทีโดยไม่ต้องปิดแอป
  useFocusEffect(
    useCallback(() => {
      loadSongs(); 
    }, [])
  );

  // loadSongs: ไปดึงข้อมูลจากความจำเครื่อง (AsyncStorage) แปลงเป็นรายการเพลง แล้วนำไปแสดงผล
  const loadSongs = async () => {
    const storedSongs = await AsyncStorage.getItem('mySongs');
    if (storedSongs) setSongs(JSON.parse(storedSongs));
  };

  // onPlaybackStatusUpdate: ตัวนี้ทำงานเหมือน "นาฬิกาจับเวลา" จะทำงานรัวๆ ตลอดเวลาที่เพลงเล่น
  // หน้าที่: คอยอัปเดตว่าเพลงเล่นไปถึงไหนแล้ว (position) เพื่อให้หลอด Slider ขยับตามเพลง
  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis); 
      setDuration(status.durationMillis || 0); 
      setIsPlaying(status.isPlaying); 
      
      // ถ้าเพลงเล่นจบ (didJustFinish) ให้ปรับสถานะเป็นหยุด
      if (status.didJustFinish) setIsPlaying(false); 
    }
  };

  // playSong: เริ่มเล่นเพลงใหม่
  const playSong = async (song: any) => {
    try {
      // เช็คก่อนว่ามีเพลงเก่าเล่นค้างอยู่ไหม ถ้ามีให้สั่ง Unload (ล้างออก) ก่อน ไม่งั้นเสียงจะตีกัน
      if (sound) await sound.unloadAsync(); 
      
      // สร้าง Sound Object ใหม่จากลิงก์ (uri) ของเพลงนั้น
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: song.audioUri },
        { shouldPlay: true }, // สั่งให้เล่นทันทีที่โหลดเสร็จ
        onPlaybackStatusUpdate // ผูกฟังก์ชันจับเวลา เพื่อให้ Slider ขยับ
      );
      setSound(newSound);
      setCurrentSong(song);
      setFullPlayerVisible(true); // เด้งหน้าจอ Player ใหญ่อัตโนมัติ
    } catch (e) {
      Alert.alert('Error', 'ไม่สามารถเล่นเพลงนี้ได้');
    }
  };

  // togglePlayPause: ปุ่มสลับ ถ้าเล่นอยู่ก็หยุด ถ้าหยุดอยู่ก็เล่น
  const togglePlayPause = async () => {
    if (!sound) return; // ถ้าไม่มีเพลงโหลดอยู่ ก็ไม่ต้องทำอะไร
    isPlaying ? await sound.pauseAsync() : await sound.playAsync();
  };

  // onSliderValueChange: ทำงานเมื่อเราเอานิ้วลาก Slider (Seek เพลง)
  // มันจะสั่งให้เพลงกระโดดไปเล่นที่ตำแหน่งนั้นทันที
  const onSliderValueChange = async (value: number) => {
    if (sound) await sound.setPositionAsync(value); 
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.playingFrom}>PLAYING FROM PLAYLIST</Text>
        <Text style={styles.header}>My Library</Text>
      </View>
      
      {/* FlatList: ตัวแสดงรายการเพลงแบบ List ยาวๆ เลื่อนลงได้ */}
      <FlatList
        data={songs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SongCard 
            title={item.title} 
            imageUri={item.imageUri} 
            artist={item.Artist}
            onPress={() => playSong(item)} // ส่งฟังก์ชัน playSong ไปให้การ์ด เพื่อให้กดแล้วเพลงเล่น
          />
        )}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }} 
      />

      {/* --- Mini Player Bar (แถบเล็กด้านล่าง) --- */}
      {/* เงื่อนไข: จะโชว์ก็ต่อเมื่อมีเพลงถูกเลือก (currentSong ไม่เป็น null) */}
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
          {/* หลอด Progress Bar เล็กๆ สีเขียว คำนวณความกว้างตาม % ของเพลงที่เล่นไป */}
          <View style={{ height: 2, backgroundColor: '#333' }}>
             <View style={{ height: '100%', backgroundColor: '#1DB954', width: `${(position / duration) * 100}%` }} />
          </View>
        </TouchableOpacity>
      )}

      {/* --- Full Player Modal (หน้าจอใหญ่) --- */}
      <Modal
        animationType="slide" // ตั้งให้ Slide ขึ้นมาจากด้านล่าง
        transparent={false}
        visible={isFullPlayerVisible} // ควบคุมการโชว์ด้วยตัวแปร isFullPlayerVisible
        onRequestClose={() => setFullPlayerVisible(false)} // กด Back ของ Android แล้วปิดหน้าจอนี้
      >
        <SafeAreaView style={styles.modalContainer}>
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
              
              {/* Slider: แถบเลื่อนเพลง */}
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={duration} // ค่าสูงสุด = ความยาวเพลง
                value={position} // ค่าปัจจุบัน = ตำแหน่งที่เล่นอยู่
                minimumTrackTintColor="#1DB954"
                maximumTrackTintColor="#535353"
                thumbTintColor="#FFFFFF"
                onSlidingComplete={onSliderValueChange} // ปล่อยมือปุ๊บ เพลงกระโดดไปจุดนั้นปั๊บ
              />
              
              <View style={styles.timeContainer}>
                <Text style={styles.timeText}>{formatTime(position)}</Text>
                <Text style={styles.timeText}>{formatTime(duration)}</Text>
              </View>

              <View style={styles.controlsContainer}>
                {/* ปุ่มพวก Shuffle/Repeat ใส่มาสวยๆ ยังไม่ได้ใส่ Logic */}
                <Ionicons name="shuffle" size={30} color="#B3B3B3" />
                <Ionicons name="play-skip-back" size={45} color="white" />
                
                {/* ปุ่ม Play/Pause อันใหญ่ */}
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
  fullArtist: { color: '#B3B3B3', fontSize: 18 , alignItems : 'center',alignSelf: 'center'},

  slider: { width: '100%', height: 40 },
  timeContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 30 },
  timeText: { color: '#B3B3B3', fontSize: 12 },

  controlsContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' },
});
