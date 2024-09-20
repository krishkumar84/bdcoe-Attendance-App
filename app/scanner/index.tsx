import { Camera, CameraView } from "expo-camera";
import * as Haptics from 'expo-haptics';
import { Stack } from "expo-router";
import {
  AppState,
  Modal,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from "react-native";
import { Overlay } from "./Overlay";
import { useState,useEffect, useRef } from "react";

export default function Home() {
  const [modalVisible, setModalVisible] = useState(false);
  const [message, setMessage] = useState('');
  const qrLock = useRef(false);
  const appState = useRef(AppState.currentState);

  const handleScan = async (data: string) => {
    console.log("Scanned data:", data);
    if (data && !qrLock.current) {
      qrLock.current = true; 
  
      try {
        const response = await fetch("https://qr-attendance-black.vercel.app/qr/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ encrypted: data }),
        });
           console.log("Response:", response);
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const responseData = await response.json();
          // Show the response message in the modal
          setMessage(responseData.msg ||responseData.error || "Some Error Occurred");
          if(responseData.err){
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          }
          setModalVisible(true);
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
          // Handle unexpected response type
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          console.error("Unexpected response type:", contentType);
          const responseText = await response.text(); // Read response as text
          console.log("Response text:", responseText);
        }
  
      } catch (error) {
        // Handle any errors
        console.error("Error sending data:", error);
      } finally {
        qrLock.current = false; // Unlock QR code scanning after processing
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
  };
  

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        qrLock.current = false;
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <SafeAreaView style={StyleSheet.absoluteFillObject}>
      <Stack.Screen
        options={{
          title: "Overview",
          headerShown: false,
        }}
      />
      {Platform.OS === "android" ? <StatusBar hidden /> : null}
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={({ data }) => {
          if (data && !qrLock.current) {
            // qrLock.current = true;
            setTimeout(async () => {
              handleScan(data);
              // await Linking.openURL(data);
            }, 400);
          }
        }}
      />
      <Overlay />
      <Modal
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalMessage}>{message}</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
  },
});
