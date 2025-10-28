import React, { useEffect, useState } from "react";
import { View, StyleSheet, PermissionsAndroid } from "react-native";
import { Camera } from "react-native-camera-kit";
import LoadingScreen from "./splash/LoadingScreen";

interface QRScannerScreenProps {
  onScan: (data: string) => void;
  styles: any;
}

const QRScannerScreen = ({ onScan }: QRScannerScreenProps) => {
  const [hasPermission, setHasPermission] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    const requestCameraPermission = async () => {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: "Camera Permission",
            message: "This app needs camera access to scan QR codes.",
            buttonPositive: "OK",
            buttonNegative: "Cancel",
          }
        );
        setHasPermission(granted === PermissionsAndroid.RESULTS.GRANTED);
      } catch (err) {
        console.warn("Camera permission error:", err);
        setHasPermission(false);
      }
    };
    requestCameraPermission();
  }, []);

  const handleScan = (data: string) => {
    if (isScanning) return; // Prevent multiple scans

    setIsScanning(true);
    try {
      console.log("QR Code scanned:", data);
      onScan(data);
    } catch (error) {
      console.error("Error processing QR code:", error);
    } finally {
      // Reset scanning state after a short delay
      setTimeout(() => setIsScanning(false), 1000);
    }
  };

  if (!hasPermission) {
    return (
      <View>
        <LoadingScreen />
      </View>
    );
  }

  return (
    <Camera
      style={{
        minHeight: 300,
        minWidth: 600,
        ...styles,
      }}
      scanBarcode
      onReadCode={(event: any) => handleScan(event.nativeEvent.codeStringValue)}
      showFrame={true}
      laserColor="red"
      frameColor="white"
      zoomMode="off"
    />
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
});

export default QRScannerScreen;
