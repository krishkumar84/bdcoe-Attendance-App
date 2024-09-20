import { View, Text, StyleSheet, SafeAreaView, Pressable,Animated,Image  } from "react-native";
import { Link, Stack } from "expo-router";
import { useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import { useEffect, useState, useRef  } from "react";

export default function Home() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;


  useEffect(() => {
    checkCameraPermission();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500, // animation duration in milliseconds
      useNativeDriver: true,
    }).start();
  }, []);

  const checkCameraPermission = async () => {
    if (permission?.granted) {
      setIsPermissionGranted(true);
    } else {
      const { granted } = await requestPermission();
      setIsPermissionGranted(granted);
    }
  };

  const handlePress = async (action: any) => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  };

  return (
    <SafeAreaView style={styles.container}>
    <Stack.Screen options={{ title: "Overview", headerShown: false }} />
    <Animated.View style={[styles.headerContainer, { opacity: fadeAnim }]}>
    <Image source={require('../assets/images/bdcoe.png')} style={styles.logo} />
      <Text style={styles.title}>Attendance</Text>
      <Text style={styles.subtitle}>QR Code Scanner</Text>
    </Animated.View>
    <Animated.View style={[styles.buttonContainer, { opacity: fadeAnim }]}>
      <Link href={"/scanner"} asChild>
        <Pressable
          style={styles.button}
          disabled={!isPermissionGranted}
          onPress={() => handlePress(() => {})}
        >
          <Text style={styles.buttonText}>Scan Code</Text>
        </Pressable>
      </Link>
      <Link href={"/manual"} asChild>
        <Pressable
          onPress={() => handlePress(() => {})}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Manual Verification</Text>
        </Pressable>
      </Link>
    </Animated.View>
  </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E1E1E",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  headerContainer: {
    marginBottom: 50,
    alignItems: "center",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 36,
    fontWeight: "bold",
  },
  subtitle: {
    color: "#0E7AFE",
    fontSize: 24,
    marginTop: 10,
  },
  buttonContainer: {
    alignItems: "center",
  },
  button: {
    backgroundColor: "#0E7AFE",
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 30,
    marginVertical: 10,
    width: "100%",
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    textAlign: "center",
    fontWeight: "bold",
  },
  logo: {
    width: 120, // Set the size of the logo
    height: 100,
  },
});
