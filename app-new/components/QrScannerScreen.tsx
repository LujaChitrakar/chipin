// import React, { useEffect, useState } from 'react';
// import { View, StyleSheet, PermissionsAndroid } from 'react-native';
// import { Camera } from 'react-native-camera-kit';
// import LoadingScreen from './splash/LoadingScreen';

// interface QRScannerScreenProps {
//   onScan: (data: string) => void;
//   styles?: any;
//   laserColor?: string;
//   showFrame?: boolean;
// }

// const QRScannerScreen = ({
//   onScan,
//   styles,
//   laserColor = 'red',
//   showFrame = true,
// }: QRScannerScreenProps) => {
//   const [hasPermission, setHasPermission] = useState(false);
//   useEffect(() => {
//     const requestCameraPermission = async () => {
//       try {
//         const granted = await PermissionsAndroid.request(
//           PermissionsAndroid.PERMISSIONS.CAMERA,
//           {
//             title: 'Camera Permission',
//             message: 'This app needs camera access to scan QR codes.',
//             buttonPositive: 'OK',
//             buttonNegative: 'Cancel',
//           }
//         );
//         setHasPermission(granted === PermissionsAndroid.RESULTS.GRANTED);
//       } catch (err) {
//         console.warn(err);
//       }
//     };
//     requestCameraPermission();
//   }, []);

//   if (!hasPermission) {
//     return (
//       <View>
//         <LoadingScreen />
//       </View>
//     );
//   }

//   return (
//     <Camera
//       style={{
//         minHeight: 300,
//         minWidth: 600,
//         ...styles,
//       }}
//       scanBarcode
//       onReadCode={(event: any) => onScan(event.nativeEvent.codeStringValue)}
//       showFrame={showFrame || true}
//       laserColor={laserColor || 'red'}
//       frameColor='white'
//     />
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1 },
// });

// export default QRScannerScreen;



import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Linking } from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCodeScanner,
  CameraPermissionStatus,
} from 'react-native-vision-camera';
import LoadingScreen from './splash/LoadingScreen'; // Assuming this component exists

interface QRScannerScreenProps {
  onScan: (data: string) => void;
  styles?: any;
  // laserColor and showFrame are not directly supported like in camera-kit,
  // we will handle the frame visually if needed.
}

const QRScannerScreen = ({ onScan, styles }: QRScannerScreenProps) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const device = useCameraDevice('back');
  const [isScanning, setIsScanning] = useState(true);

  // 1. Request Permissions
  useEffect(() => {
    // Check and request camera permission
    (async () => {
      const status = await Camera.getCameraPermissionStatus();
      if (status === 'granted') {
        setHasPermission(true);
      } else if (status === 'denied') {
        setHasPermission(false);
      } else {
        const newStatus = await Camera.requestCameraPermission();
        setHasPermission(newStatus === 'granted');
      }
    })();
  }, []);

  // 2. Code Scanner Hook
  const codeScanner = useCodeScanner({
    codeTypes: ['qr'], // Only look for QR codes
    onCodeScanned: (codes) => {
      if (isScanning && codes.length > 0) {
        setIsScanning(false); // Stop scanning immediately after the first successful scan
        const codeValue = codes[0].value;
        if (codeValue) {
          onScan(codeValue);
        }
      }
    },
  });

  // 3. Render Logic
  if (hasPermission === null) {
    return (
      <View style={localStyles.centered}>
        <LoadingScreen />
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={localStyles.centered}>
        <Text>Camera access denied.</Text>
        <Text style={localStyles.link} onPress={() => Linking.openSettings()}>
          Open Settings
        </Text>
      </View>
    );
  }

  if (device == null) {
    return (
      <View style={localStyles.centered}>
        <Text>No camera device found on this device.</Text>
      </View>
    );
  }

  return (
    <View style={[localStyles.container, styles]}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={isScanning} // Only activate the camera when scanning is allowed
        codeScanner={codeScanner}
      />
      {/* Optional: Add a visual frame or indicator here */}
      <View style={localStyles.overlay}>
        <Text style={localStyles.scanText}>Scan QR Code</Text>
      </View>
    </View>
  );
};

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 300,
    minWidth: 600,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    // You can add a border or an image here to simulate a frame
  },
  scanText: {
    marginTop: 200, // Position the text below the scanner area
    color: 'white',
    fontSize: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 5,
  },
  link: {
    color: 'blue',
    marginTop: 10,
    textDecorationLine: 'underline',
  }
});

export default QRScannerScreen;