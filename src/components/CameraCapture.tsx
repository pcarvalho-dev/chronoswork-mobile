import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../theme';

interface CameraCaptureProps {
  visible: boolean;
  onClose: () => void;
  onCapture: (photo: { uri: string; type: string; name: string }) => void;
  title?: string;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  visible,
  onClose,
  onCapture,
  title = 'Tirar Foto',
}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  const handleTakePhoto = async () => {
    if (!cameraRef.current) return;

    try {
      setIsProcessing(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
      });

      if (photo) {
        setCapturedPhoto(photo.uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Erro', 'Falha ao capturar foto');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetake = () => {
    setCapturedPhoto(null);
  };

  const handleConfirm = () => {
    if (!capturedPhoto) return;

    const photoData = {
      uri: capturedPhoto,
      type: 'image/jpeg',
      name: `photo_${Date.now()}.jpg`,
    };

    onCapture(photoData);
    setCapturedPhoto(null);
    onClose();
  };

  const handleCancel = () => {
    setCapturedPhoto(null);
    onClose();
  };

  if (!permission) {
    return null;
  }

  if (!permission.granted) {
    return (
      <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.permissionContainer}>
          <View style={styles.permissionCard}>
            <Text style={styles.permissionTitle}>Permissão de Câmera</Text>
            <Text style={styles.permissionText}>
              Precisamos de acesso à câmera para registrar seu ponto
            </Text>
            <TouchableOpacity
              style={styles.permissionButton}
              onPress={requestPermission}
            >
              <Text style={styles.permissionButtonText}>Permitir Acesso</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        {capturedPhoto ? (
          // Photo Preview
          <View style={styles.previewContainer}>
            <Image source={{ uri: capturedPhoto }} style={styles.preview} />

            <View style={styles.previewButtons}>
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={handleRetake}
              >
                <Text style={styles.secondaryButtonText}>Tirar Novamente</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={handleConfirm}
              >
                <Text style={styles.primaryButtonText}>Confirmar</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.closeButton} onPress={handleCancel}>
              <Text style={styles.closeButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Camera View
          <>
            <CameraView
              ref={cameraRef}
              style={styles.camera}
              facing="front"
            >
              <View style={styles.cameraOverlay}>
                <Text style={styles.title}>{title}</Text>

                {/* Face Guide Circle */}
                <View style={styles.faceGuide}>
                  <View style={styles.guideCircle} />
                </View>

                <Text style={styles.instruction}>
                  Posicione seu rosto no círculo
                </Text>
              </View>
            </CameraView>

            <View style={styles.controls}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.captureButton}
                onPress={handleTakePhoto}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <View style={styles.captureButtonInner} />
                )}
              </TouchableOpacity>

              <View style={{ width: 80 }} />
            </View>
          </>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.warmGrey[900],
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  permissionCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius['2xl'],
    padding: spacing.xl,
    margin: spacing.lg,
    alignItems: 'center',
  },
  permissionTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.warmGrey[900],
    marginBottom: spacing.md,
  },
  permissionText: {
    fontSize: fontSize.base,
    color: colors.warmGrey[700],
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  permissionButton: {
    backgroundColor: colors.primary[600],
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  permissionButtonText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    padding: spacing.xl,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.white,
    textAlign: 'center',
    marginTop: spacing.xxl,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  faceGuide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideCircle: {
    width: 250,
    height: 250,
    borderRadius: 125,
    borderWidth: 3,
    borderColor: colors.white,
    borderStyle: 'dashed',
    opacity: 0.7,
  },
  instruction: {
    fontSize: fontSize.base,
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.xl,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.warmGrey[900],
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: colors.primary[600],
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary[600],
  },
  cancelButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  cancelButtonText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
  closeButton: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  closeButtonText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
  previewContainer: {
    flex: 1,
    backgroundColor: colors.warmGrey[900],
  },
  preview: {
    flex: 1,
    resizeMode: 'contain',
  },
  previewButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: spacing.xl,
    gap: spacing.md,
  },
  button: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: colors.primary[600],
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
  secondaryButton: {
    backgroundColor: colors.warmGrey[700],
  },
  secondaryButtonText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
});
