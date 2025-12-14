import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Image } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { useGetMyProfile, useRegisterPin, useVerifyPin } from '@/services/api/authApi';

interface PassKeyAuthProps {
    isRegisterPin: boolean,
    setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>,
    handleTransaction?: (isTransactionAuthenticated: boolean) => void,
}
const PasskeyAuth = ({ isRegisterPin = false, setIsAuthenticated, handleTransaction }: PassKeyAuthProps) => {

    const [pin, setPin] = useState('');
    const [error, setError] = useState('');

    const [pressedButton, setPressedButton] = useState<null | string>(null);
    const buttonPressAnim = useRef(new Animated.Value(1)).current;

    const [scaleAnim] = useState(new Animated.Value(1));

    const { mutateAsync: registerMyPin, isPending: pendingUpdatePin } = useRegisterPin()
    const { mutateAsync: verifyMyPin, isPending: pendingVerifyPin } = useVerifyPin()

    const { data: userProfile, isLoading: myProfileLoading } = useGetMyProfile();
    // Create animated values for each pin dot
    const dotAnimations = useRef([...Array(6)].map(() => ({
        scale: new Animated.Value(0.8),
        opacity: new Animated.Value(0),
    }))).current;

    const maxPinLength = 6;

    // Animate dot when pin changes
    useEffect(() => {


        if (pin.length > 0) {
            const index = pin.length - 1;

            Animated.parallel([
                Animated.spring(dotAnimations[index].scale, {
                    toValue: 1,
                    friction: 4,
                    tension: 100,
                    useNativeDriver: true,
                }),
                Animated.timing(dotAnimations[index].opacity, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [pin]);


    const handleButtonPress = (num: string, callback: () => void) => {
        setPressedButton(num);

        // Scale down animation
        Animated.sequence([
            Animated.timing(buttonPressAnim, {
                toValue: 0.9,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(buttonPressAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setPressedButton(null);
        });

        callback();
    };
    const handleNumberPress = (num: string) => {
        if (pin.length < maxPinLength) {
            const newPin = pin + num;
            setPin(newPin);
            setError('');

            // Auto-verify when 6 digits entered
            // if (newPin.length === maxPinLength) {
            //     submitPin(newPin);
            // }
        }
    };

    const submitPin = async (pinToVerify: string) => {
        let isPinAuthenticated = (isRegisterPin) ? await registerMyPin({ email: userProfile?.data?.email, userPin: pin }) : await verifyMyPin({ email: userProfile?.data?.email, userPin: pin })

        console.log("verify pin", isPinAuthenticated)
        if (isPinAuthenticated) {
            resetPin()
            handleTransaction ? handleTransaction(true) : setIsAuthenticated(true)

        } else {
            setError('Incorrect PIN')
            setTimeout(() => resetPin(), 500);
        }

    };

    const resetPin = () => {
        // Animate all dots out
        const animations = dotAnimations.map((anim) =>
            Animated.parallel([
                Animated.timing(anim.scale, {
                    toValue: 0.8,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(anim.opacity, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ])
        );

        Animated.parallel(animations).start(() => {
            setPin('');
        });
    };



    const handleDelete = () => {
        if (pin.length > 0) {
            const index = pin.length - 1;

            // Animate the dot disappearing
            Animated.parallel([
                Animated.timing(dotAnimations[index].scale, {
                    toValue: 0.8,
                    duration: 150,
                    useNativeDriver: true,
                }),
                Animated.timing(dotAnimations[index].opacity, {
                    toValue: 0,
                    duration: 150,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                setPin(pin.slice(0, -1));
            });
        }
        setError('');
    };

    const handleFingerprintPress = async () => {
        try {
            setError('');

            // Animate fingerprint icon
            Animated.sequence([
                Animated.timing(scaleAnim, {
                    toValue: 1.2,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();

            // Check if biometric authentication is available
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            const isEnrolled = await LocalAuthentication.isEnrolledAsync();

            if (!hasHardware || !isEnrolled) {
                setError('Biometric authentication not available');
                setIsAuthenticated(false);
                return;
            }

            // Authenticate with biometrics
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Authenticate with biometrics',
                cancelLabel: 'Dismiss', //Usually in android it is not shown, but here as the disableDeviceFallback is true instead of showing PIN option it shows this cancelLabel
                disableDeviceFallback: true
            });

            setIsAuthenticated(false);

            if (result.success) {
                handleTransaction ? handleTransaction(true) : setIsAuthenticated(true)

            } else {
                setError('Authentication failed');
            }
        } catch (error) {
            setIsAuthenticated(false);
            setError('Authentication error');
        }
    };

    const renderPinDots = () => {
        return (
            <View style={styles.pinContainer}>
                {[...Array(maxPinLength)].map((_, index) => {
                    const isFilled = index < pin.length;

                    return (
                        <View key={index} style={styles.pinDotWrapper}>
                            <View style={styles.pinDotEmpty} />
                            {isFilled && (
                                <Animated.View
                                    style={[
                                        styles.pinDotFilled,
                                        {
                                            transform: [{ scale: dotAnimations[index].scale }],
                                            opacity: dotAnimations[index].opacity,
                                        },
                                    ]}
                                />
                            )}
                        </View>
                    );
                })}
            </View>
        );
    };

    const renderNumberPad = () => {
        const numbers = [
            [1, 2, 3],
            [4, 5, 6],
            [7, 8, 9],
        ];

        return (
            <View style={styles.numberPadContainer}>
                {numbers.map((row, rowIndex) => (
                    <View key={rowIndex} style={styles.numberRow}>
                        {row.map((num) => (
                            <TouchableOpacity
                                key={num}
                                style={styles.numberButton}
                                onPress={() => handleButtonPress(num.toString(), () => handleNumberPress(num.toString()))}
                                activeOpacity={1}
                            >
                                <Animated.View
                                    style={[
                                        styles.numberButtonInner,
                                        pressedButton === num.toString() && styles.numberButtonPressed,
                                        {
                                            transform: [{ scale: pressedButton === num.toString() ? buttonPressAnim : 1 }]
                                        }
                                    ]}
                                >
                                    <Text style={styles.numberText}>{num}</Text>
                                </Animated.View>
                            </TouchableOpacity>
                        ))}
                    </View>
                ))}

                <View style={styles.numberRow}>
                    {!isRegisterPin ? <TouchableOpacity
                        style={styles.numberButton}
                        onPress={handleFingerprintPress}
                        activeOpacity={0.7}
                    >
                        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                            <Image style={{
                                width: 72, height: 72,
                            }} source={require("@/assets/images/fingerprint-icon.webp")} />
                        </Animated.View>
                    </TouchableOpacity> : <Text style={{ width: 72, height: 72 }}></Text>}

                    <TouchableOpacity
                        style={styles.numberButton}
                        onPress={() => handleButtonPress('0', () => handleNumberPress('0'))}
                        activeOpacity={0.7}
                    >
                        <Animated.View
                            style={[
                                styles.numberButtonInner,
                                pressedButton === '0' && styles.numberButtonPressed,
                                {
                                    transform: [{ scale: pressedButton === '0' ? buttonPressAnim : 1 }]
                                }
                            ]}
                        >
                            <Text style={styles.numberText}>0</Text>
                        </Animated.View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.numberButton}
                        onPress={handleDelete}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.deleteText}>⌫</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{isRegisterPin ? "Register new" : "Enter"} Passkey</Text>
                {isRegisterPin || <Text style={styles.subtitle}>Enter your 6-digit PIN or use fingerprint</Text>}
            </View>

            {renderPinDots()}

            {error ? (
                <Text style={styles.errorText}>{error}</Text>
            ) : (
                <View style={styles.errorPlaceholder} />
            )}

            {renderNumberPad()}
            <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                    submitPin(pin)
                    setError('');
                }}
            >
                <Text style={styles.cancelText}>{isRegisterPin ? "Register" : "Submit"}</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
        padding: 20,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#8E8E93',
    },
    pinContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        gap: 16,
    },
    pinDotWrapper: {
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pinDotEmpty: {
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#3A3A3C',
        backgroundColor: 'transparent',
        position: 'absolute',
    },
    pinDotFilled: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#0A84FF',
        position: 'absolute',
    },
    errorText: {
        color: '#FF453A',
        textAlign: 'center',
        fontSize: 14,
        marginBottom: 20,
        minHeight: 20,
    },
    errorPlaceholder: {
        minHeight: 20,
        marginBottom: 20,
    },

    numberPadContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    numberRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 16,
        gap: 24,
    },
    numberButton: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#1C1C1E',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#3A3A3C',
    },
    numberText: {
        fontSize: 28,
        fontWeight: '300',
        color: '#FFFFFF',
    },

    numberButtonInner: {
        width: '100%',
        height: '100%',
        borderRadius: 36,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1d314a',
    },
    numberButtonPressed: {
        backgroundColor: '#4071ad',
    },
    fingerprintIcon: {
        fontSize: 32,
    },
    deleteText: {
        fontSize: 28,
        color: '#FFFFFF',
    },
    cancelButton: {
        marginTop: 32,
        padding: 16,
        alignItems: 'center',
    },
    cancelText: {
        color: '#0A84FF',
        fontSize: 17,
        fontWeight: '600',
    },
});

export default PasskeyAuth;