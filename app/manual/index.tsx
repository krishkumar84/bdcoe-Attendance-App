import React, { useState } from "react";
import {
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Text,
  View,
  Modal,
  StyleSheet,
} from "react-native";
import { Stack } from "expo-router";
import * as Haptics from 'expo-haptics';

export default function ManualVerification() {
  const [rollNo, setRollNo] = useState('');
  const [studentNo, setStudentNo] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    if (!rollNo || !studentNo) {
      setMessage("Please fill all fields");
      setModalVisible(true);
      return;
    }

    try {
      const response = await fetch("https://qr-attendance-black.vercel.app/qr/manualVerify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rollNo, studentNo }),
      });

      const responseData = await response.json();
      setMessage(responseData.msg || responseData.error || "Some Error Occurred");
      setModalVisible(true);

      if (responseData.error) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } else {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error("Error sending data:", error);
      setMessage("Error sending data");
      setModalVisible(true);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "Manual Verification",
          headerShown: true,
        }}
      />
      <TextInput
        style={styles.input}
        placeholder="Roll Number"
        value={rollNo}
        onChangeText={setRollNo}
        keyboardType="numeric"  // Opens the number keyboard
      />
      <TextInput
        style={styles.input}
        placeholder="Student Number"
        value={studentNo}
        onChangeText={setStudentNo}
        keyboardType="numeric"  // Opens the number keyboard
      />
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Verify</Text>
      </TouchableOpacity>
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
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: "white",
    fontSize: 16,
  },
});
