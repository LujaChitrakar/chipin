import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  TextInput,
  Image,
  ToastAndroid,
  RefreshControl,
} from 'react-native';
import Constants from 'expo-constants';
import React, { useEffect, useState } from 'react';
import { useLoginWithOAuth, usePrivy } from '@privy-io/expo';
import { router } from 'expo-router';
import colors from '@/assets/colors';
import ScreenHeader from '@/components/navigation/ScreenHeader';
import ScreenContainer from '@/components/ScreenContainer';
import { deleteItemAsync } from 'expo-secure-store';
import {
  Feather,
  MaterialCommunityIcons,
} from '@expo/vector-icons';
import { useGetMyProfile, useUpdateProfile } from '@/services/api/authApi';
import LoadingScreen from '@/components/splash/LoadingScreen';
import { useUploadImage } from '@/services/api/uploadApi';
import { launchImageLibrary } from 'react-native-image-picker';
import { useQueryClient } from '@tanstack/react-query';
import {
  useGetMyReferalCode,
} from '@/services/api/friendsApi';
import Button from '@/components/common/Button';
import { LogOut, SquarePen } from 'lucide-react-native';
import WalletAddressDisplay from '@/components/common/WalletAddressDisplay';
import ShareProfileModal from '@/components/home/ShareProfileModal';
import ReferalCodeQrModal from '@/components/rewards/ReferalCodeQrModal';
import ScanUserQrButton from '@/components/home/ScanUserQrButton';

const AccountPage = () => {

  const queryClient = useQueryClient();
  const { logout } = usePrivy();
  const {
    data: userProfile,
    isLoading: myProfileLoading,
    error: myProfileError,
    refetch: refetchProfile,
  } = useGetMyProfile();

  const {
    data: referalCodeData,
    isPending: loadingReferalCode,
    error: errorReferalCode,
  } = useGetMyReferalCode();

  const { mutate: updateMyProfile, isPending: updatingProfile } =
    useUpdateProfile();

  const { mutate: uploadImage, isPending: uploadingImage } = useUploadImage();

  const [showQRModal, setShowQRModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editedFullName, setEditedFullName] = useState('');
  const [editedPhone, setEditedPhone] = useState('');
  const [editedAddress, setEditedAddress] = useState('');
  const [profileVisible, setProfileVisible] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');

  useEffect(() => {
    if (showEditModal && userProfile?.data) {
      setEditedFullName(userProfile.data.fullname || '');
      setEditedPhone(userProfile.data.phone_number || '');
      setEditedAddress(userProfile.data.address || '');
      setProfileVisible(userProfile.data.profile_visible);
      setUploadedImageUrl(userProfile.data.profile_picture || '');
    }
  }, [showEditModal, userProfile]);

  const pickImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 1,
    });

    if (!result.didCancel) {
      setSelectedImage(result.assets?.[0]?.uri || '');
    }
  };

  const handleSaveProfile = () => {
    const updatedData = {
      fullname: editedFullName,
      phone_number: editedPhone,
      address: editedAddress,
      profile_visible: profileVisible,
      profile_picture: uploadedImageUrl,
    };

    if (selectedImage && selectedImage !== uploadedImageUrl) {
      uploadImage(selectedImage, {
        onSuccess: (response) => {
          const imageUrl = response?.data?.uri;
          console.log('IMAGE UPLOAD RESPONSE:::', response);
          setUploadedImageUrl(imageUrl);
          updateMyProfile(
            { ...updatedData, profile_picture: imageUrl },
            {
              onSuccess: () => {
                setShowEditModal(false);
                setSelectedImage(null);
                queryClient.invalidateQueries({
                  queryKey: ['myprofile'],
                });
                queryClient.invalidateQueries({
                  queryKey: ['wallet-balance'],
                });
              },
            }
          );
        },
        onError: () => {},
      });
    } else {
      updateMyProfile(updatedData, {
        onSuccess: () => {
          setShowEditModal(false);
          setSelectedImage(null);
          queryClient.invalidateQueries({
            queryKey: ['myprofile'],
          });
          queryClient.invalidateQueries({
            queryKey: ['wallet-balance'],
          });
        },
      });
    }
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
    setSelectedImage(null);
  };

  const handleLogout = async () => {
    await logout();
    await deleteItemAsync('token');
    router.push('/');
  };

  return (
    <ScreenContainer>
      <ScreenHeader
        title='Profile'
        onBackPress={() => {
          router.back();
        }}
      />
      <Modal
        visible={showEditModal}
        transparent={true}
        animationType='fade'
        onRequestClose={handleCancelEdit}
      >
        <View style={editStyles.modalOverlay}>
          <View style={editStyles.modalContent}>
            {/* Header */}
            <View style={editStyles.modalHeader}>
              <Text style={editStyles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={handleCancelEdit}>
                <Feather
                  name='x'
                  size={24}
                  color={colors.grayTextColor.DEFAULT}
                />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Avatar Section */}
              <View style={editStyles.avatarSection}>
                <TouchableOpacity onPress={pickImage}>
                  <View style={editStyles.editAvatar}>
                    {selectedImage ? (
                      <Image
                        source={{ uri: selectedImage }}
                        style={editStyles.avatarImage}
                      />
                    ) : uploadedImageUrl ? (
                      <Image
                        source={{ uri: uploadedImageUrl }}
                        style={editStyles.avatarImage}
                      />
                    ) : (
                      <Text style={editStyles.editAvatarText}>
                        {editedFullName?.[0]?.toUpperCase() || 'J'}
                      </Text>
                    )}
                    <View style={editStyles.cameraButton}>
                      <Feather name='camera' size={16} color={colors.white} />
                    </View>
                  </View>
                </TouchableOpacity>
                <Text style={editStyles.changePhotoText}>
                  Click to change photo
                </Text>
              </View>

              {/* Full Name Input */}
              <View style={editStyles.inputGroup}>
                <Text style={editStyles.inputLabel}>Full Name</Text>
                <View style={editStyles.inputContainer}>
                  <Feather
                    name='user'
                    size={18}
                    color={colors.grayTextColor.DEFAULT}
                    style={editStyles.inputIcon}
                  />
                  <TextInput
                    value={editedFullName}
                    onChangeText={setEditedFullName}
                    placeholder='John Doe'
                    placeholderTextColor={colors.grayTextColor.DEFAULT}
                    style={editStyles.textInput}
                  />
                </View>
              </View>

              {/* Email (Read-only) */}
              <View style={editStyles.inputGroup}>
                <Text style={editStyles.inputLabel}>Email</Text>
                <View style={[editStyles.inputContainer, { opacity: 0.6 }]}>
                  <Feather
                    name='mail'
                    size={18}
                    color={colors.grayTextColor.DEFAULT}
                    style={editStyles.inputIcon}
                  />
                  <TextInput
                    value={userProfile?.data?.email || ''}
                    editable={false}
                    style={editStyles.textInput}
                  />
                </View>
              </View>

              {/* Phone Number Input */}
              {/* <View style={editStyles.inputGroup}>
                <Text style={editStyles.inputLabel}>
                  Phone Number (optional)
                </Text>
                <View style={editStyles.inputContainer}>
                  <Feather
                    name='phone'
                    size={18}
                    color={colors.grayTextColor.DEFAULT}
                    style={editStyles.inputIcon}
                  />
                  <TextInput
                    value={editedPhone}
                    onChangeText={setEditedPhone}
                    placeholder='+1234567890'
                    placeholderTextColor={colors.grayTextColor.DEFAULT}
                    keyboardType='phone-pad'
                    style={editStyles.textInput}
                  />
                </View>
              </View> */}

              {/* Address Input */}
              {/* <View style={editStyles.inputGroup}>
                <Text style={editStyles.inputLabel}>Address (optional)</Text>
                <View style={editStyles.inputContainer}>
                  <Feather
                    name='map-pin'
                    size={18}
                    color={colors.grayTextColor.DEFAULT}
                    style={editStyles.inputIcon}
                  />
                  <TextInput
                    value={editedAddress}
                    onChangeText={setEditedAddress}
                    placeholder='123 Main St'
                    placeholderTextColor={colors.grayTextColor.DEFAULT}
                    style={editStyles.textInput}
                  />
                </View>
              </View> */}

              {/* <View style={editStyles.inputGroup}>
                <Text style={editStyles.inputLabel}>Profile Visibility</Text>
                <TouchableOpacity
                  onPress={() => setProfileVisible(!profileVisible)}
                  style={editStyles.toggleContainer}
                >
                  <Text style={editStyles.toggleText}>
                    Profile Discoverable
                  </Text>
                  <MaterialCommunityIcons
                    name={
                      profileVisible ? 'toggle-switch' : 'toggle-switch-off'
                    }
                    size={48}
                    color={
                      profileVisible
                        ? colors.green.DEFAULT
                        : colors.gray.DEFAULT
                    }
                  />
                </TouchableOpacity>
              </View> */}
            </ScrollView>

            <View style={editStyles.buttonRow}>
              <TouchableOpacity
                style={editStyles.cancelButton}
                onPress={handleCancelEdit}
              >
                <Text style={editStyles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={editStyles.saveButton}
                onPress={handleSaveProfile}
                disabled={uploadingImage || updatingProfile}
              >
                <Text style={editStyles.saveButtonText}>
                  {uploadingImage || updatingProfile
                    ? 'Saving...'
                    : 'Save Changes'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            onRefresh={() => {
              refetchProfile();
            }}
            refreshing={myProfileLoading}
          />
        }
      >
        <View
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            gap: 30,
          }}
        >
          {myProfileLoading ? (
            <View
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <LoadingScreen />
            </View>
          ) : (
            <>
              <View style={styles.profileCard}>
                {/* Avatar and Info */}
                <View style={styles.profileHeader}>
                  <View style={styles.avatar}>
                    {userProfile?.data?.profile_picture ? (
                      <Image
                        source={{ uri: userProfile.data.profile_picture }}
                        style={styles.avatarImage}
                      />
                    ) : (
                      <Text style={styles.avatarText}>
                        {(userProfile?.data?.fullname ||
                          userProfile?.data?.username)?.[0]?.toUpperCase() ||
                          'U'}
                      </Text>
                    )}
                  </View>
                  <View style={styles.profileInfo}>
                    <Text style={styles.profileName}>
                      {userProfile?.data?.fullname ||
                        userProfile?.data?.username ||
                        'User'}
                    </Text>
                    <Text style={styles.profileDetail}>
                      {userProfile?.data?.email || ''}
                    </Text>
                  </View>
                  <ScanUserQrButton />
                </View>

                <View style={styles.qrButtonsRow}>
                  <Button
                    style={{ flex: 1 }}
                    title='Share'
                    onPress={() => setShowQRModal(true)}
                    icon={
                      <MaterialCommunityIcons
                        name='qrcode'
                        size={20}
                        color={colors.black}
                      />
                    }
                  />

                  <Button
                    onPress={() => setShowEditModal(true)}
                    icon={<SquarePen size={16} color={colors.white} />}
                    title='Edit Profile'
                    style={{
                      backgroundColor: colors.grayTextColor.DEFAULT,
                      flex: 1,
                    }}
                    textColor={colors.white}
                  />
                </View>
              </View>
            </>
          )}

          <View
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 15,
              padding: 15,
              backgroundColor: colors.cardBackground.DEFAULT,
              borderRadius: 15,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                color: colors.grayTextColor.DEFAULT,
              }}
            >
              INVITE A FRIEND
            </Text>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 9,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: colors.grayTextColor.DEFAULT,
                }}
              >
                REFER CODE:
              </Text>
              <WalletAddressDisplay
                address={
                  loadingReferalCode
                    ? 'XXXX'
                    : referalCodeData?.data?.code || ''
                }
                copySize={12}
                displayCharacters={20}
              />
            </View>
            <ReferalCodeQrModal referalCodeData={referalCodeData} />
          </View>

          {/* <View
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
            }}
          >
            <Button
              style={{
                backgroundColor: colors.cardBackground.light,
              }}
              loading={oauth.state.status === 'loading'}
              textColor={colors.white}
              onPress={handleLinkWithGoogle}
              title='Link To Google'
              icon={
                <Image
                  source={require('@/assets/images/google.png')}
                  style={{
                    width: 26,
                    height: 26,
                    resizeMode: 'contain',
                  }}
                />
              }
            />
            <Button
              style={{
                backgroundColor: colors.cardBackground.light,
              }}
              loading={
                passKey.state.status === 'awaiting-passkey' ||
                passKey.state.status === 'submitting-response'
              }
              textColor={colors.white}
              onPress={handleLinkPasskey}
              title='Link Passkey'
              icon={
                <View
                  style={{
                    backgroundColor: colors.white,
                    padding: 4,
                    borderRadius: 40,
                    width: 26,
                    height: 26,
                  }}
                >
                  <Octicons name='passkey-fill' size={19} color='black' />
                </View>
              }
            />
          </View> */}

          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 16,
              paddingHorizontal: 16,
              borderRadius: 50,
              borderWidth: 1,
              backgroundColor: '#410E0E',
              gap: 8,
              marginTop: 24,
            }}
            onPress={handleLogout}
          >
            <LogOut size={18} color={colors.white} />
            <Text
              style={{
                color: colors.white,
                fontSize: 16,
                fontWeight: '600',
              }}
            >
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <ShareProfileModal visible={showQRModal} setVisible={setShowQRModal} />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  profileCard: {
    backgroundColor: colors.cardBackground.DEFAULT,
    borderRadius: 12,
    padding: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.grayTextColor.DEFAULT,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
  },
  avatarText: {
    color: colors.white,
    fontSize: 28,
    fontWeight: 'bold',
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  profileName: {
    color: colors.white,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  profileDetail: {
    color: colors.cardBackground.light,
    fontSize: 14,
    marginTop: 2,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardBackground.light,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  editButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  qrButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  qrButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardBackground.light,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  qrButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  sectionTitle: {
    color: colors.grayTextColor.DEFAULT || '#9ca3af',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  qrModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  qrModalContent: {
    backgroundColor: colors.background.light,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 362,
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: 30,
  },
  qrModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  qrModalTitle: {
    color: colors.white,
    fontSize: 22,
    fontWeight: 'bold',
  },
  qrCodeContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
  },
  qrIdContainer: {
    width: '100%',
    backgroundColor: colors.background.light,
    padding: 12,
    borderRadius: 8,
  },
  qrIdLabel: {
    color: colors.grayTextColor.dark,
    fontSize: 12,
  },
  qrIdText: {
    color: colors.white,
    fontSize: 14,
    fontFamily: 'monospace',
  },
  qrInstructions: {
    color: colors.grayTextColor.DEFAULT || '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
  },
  qrCloseButton: {
    backgroundColor: colors.cardBackground.light,
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 50,
    width: '100%',
  },
  qrCloseButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});

const editStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.background.light,
    borderRadius: 18,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    color: colors.white,
    fontSize: 22,
    fontWeight: 'bold',
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  editAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary.DEFAULT || '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  editAvatarText: {
    color: colors.white,
    fontSize: 32,
    fontWeight: 'bold',
  },
  cameraButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: colors.cardBackground.dark + '77',
    width: '100%',
    height: 32,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changePhotoText: {
    color: colors.grayTextColor.DEFAULT,
    fontSize: 14,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    color: colors.grayTextColor.DEFAULT,
    fontSize: 14,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.textInputBackground.DEFAULT,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    color: colors.white,
    fontSize: 16,
    paddingVertical: 12,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.textInputBackground.DEFAULT,
    borderRadius: 8,
    padding: 4,
    paddingHorizontal: 16,
  },
  toggleText: {
    color: colors.grayTextColor.DEFAULT,
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row-reverse',
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.cardBackground.light,
    paddingVertical: 14,
    borderRadius: 36,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: colors.white,
    paddingVertical: 14,
    borderRadius: 36,
    alignItems: 'center',
  },
  saveButtonText: {
    color: colors.black,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default AccountPage;
