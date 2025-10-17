import React, { useEffect, useState } from 'react';
import { View, StyleSheet, PermissionsAndroid } from 'react-native';
import { Camera } from 'react-native-camera-kit';
import ScreenContainer from './ScreenContainer';
import LoadingScreen from './splash/LoadingScreen';

interface QRScannerScreenProps {
  onScan: (data: string) => void;
  styles: any;
}

const QRScannerScreen = ({ onScan }: QRScannerScreenProps) => {
  const [hasPermission, setHasPermission] = useState(false);
  useEffect(() => {
    const requestCameraPermission = async () => {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'This app needs camera access to scan QR codes.',
            buttonPositive: 'OK',
            buttonNegative: 'Cancel',
          }
        );
        setHasPermission(granted === PermissionsAndroid.RESULTS.GRANTED);
      } catch (err) {
        console.warn(err);
      }
    };
    requestCameraPermission();
  }, []);

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
      onReadCode={(event: any) => onScan(event.nativeEvent.codeStringValue)}
      showFrame={true}
      laserColor='red'
      frameColor='white'
      zoomMode='off'
    />
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
});

export default QRScannerScreen;
