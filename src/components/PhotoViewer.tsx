import React, { useState } from 'react';
import {
  Modal,
  View,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../theme';

export interface PhotoData {
  url: string;
  title: string;
  timestamp: string;
  type: 'checkin' | 'checkout';
}

interface PhotoViewerProps {
  visible: boolean;
  photos: PhotoData[];
  initialIndex: number;
  onClose: () => void;
}

export const PhotoViewer: React.FC<PhotoViewerProps> = ({
  visible,
  photos,
  initialIndex,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [compareMode, setCompareMode] = useState(false);

  React.useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
  };

  const currentPhoto = photos[currentIndex];

  // Find check-in and check-out photos for comparison
  const checkInPhoto = photos.find((p) => p.type === 'checkin');
  const checkOutPhoto = photos.find((p) => p.type === 'checkout');
  const canCompare = checkInPhoto && checkOutPhoto;

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.title}>
                {compareMode ? 'Comparação de Fotos' : currentPhoto?.title}
              </Text>
              {!compareMode && currentPhoto && (
                <Text style={styles.headerTimestamp}>
                  {formatTimestamp(currentPhoto.timestamp)}
                </Text>
              )}
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Photo Display */}
          <ScrollView
            contentContainerStyle={styles.photoContainer}
            showsVerticalScrollIndicator={false}
          >
            {compareMode ? (
              // Compare Mode
              <View style={styles.compareContainer}>
                {checkInPhoto && (
                  <View style={styles.photoCard}>
                    <Text style={styles.photoLabel}>{checkInPhoto.title}</Text>
                    <Image
                      source={{ uri: checkInPhoto.url }}
                      style={styles.comparePhoto}
                      resizeMode="contain"
                    />
                    <Text style={styles.photoTimestamp}>
                      {formatTimestamp(checkInPhoto.timestamp)}
                    </Text>
                  </View>
                )}

                {checkOutPhoto && (
                  <View style={styles.photoCard}>
                    <Text style={styles.photoLabel}>{checkOutPhoto.title}</Text>
                    <Image
                      source={{ uri: checkOutPhoto.url }}
                      style={styles.comparePhoto}
                      resizeMode="contain"
                    />
                    <Text style={styles.photoTimestamp}>
                      {formatTimestamp(checkOutPhoto.timestamp)}
                    </Text>
                  </View>
                )}
              </View>
            ) : (
              // Single Photo Mode
              <View style={styles.singlePhotoContainer}>
                {currentPhoto && (
                  <Image
                    source={{ uri: currentPhoto.url }}
                    style={styles.singlePhoto}
                    resizeMode="contain"
                  />
                )}
              </View>
            )}
          </ScrollView>

          {/* Footer Controls */}
          <View style={styles.footer}>
            <View style={styles.footerLeft}>
              {!compareMode && photos.length > 1 && (
                <View style={styles.counter}>
                  <Text style={styles.counterText}>
                    {currentIndex + 1} de {photos.length}
                  </Text>
                </View>
              )}
            </View>

            {canCompare && (
              <TouchableOpacity
                style={[
                  styles.compareButton,
                  compareMode && styles.compareButtonActive,
                ]}
                onPress={() => setCompareMode(!compareMode)}
              >
                <Text
                  style={[
                    styles.compareButtonText,
                    compareMode && styles.compareButtonTextActive,
                  ]}
                >
                  {compareMode ? 'Único' : 'Comparar'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Navigation */}
          {!compareMode && photos.length > 1 && (
            <View style={styles.navigation}>
              <TouchableOpacity
                style={styles.navButton}
                onPress={handlePrevious}
              >
                <Text style={styles.navButtonText}>←</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.navButton} onPress={handleNext}>
                <Text style={styles.navButtonText}>→</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: borderRadius['3xl'],
    padding: spacing.lg,
    maxHeight: height * 0.75,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginRight: spacing.md,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.warmGrey[900],
  },
  headerTimestamp: {
    fontSize: fontSize.sm,
    color: colors.warmGrey[600],
  },
  counter: {
    backgroundColor: 'rgba(120, 113, 108, 0.1)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  counterText: {
    fontSize: fontSize.sm,
    color: colors.warmGrey[600],
  },
  compareButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  compareButtonActive: {
    backgroundColor: colors.primary[600],
  },
  compareButtonText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.warmGrey[700],
  },
  compareButtonTextActive: {
    color: colors.white,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: fontSize['2xl'],
    color: colors.warmGrey[700],
  },
  photoContainer: {
    flexGrow: 1,
  },
  singlePhotoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  singlePhoto: {
    width: width - spacing.lg * 4,
    height: height * 0.45,
    borderRadius: borderRadius.xl,
  },
  compareContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  photoCard: {
    flex: 1,
    alignItems: 'center',
  },
  photoLabel: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.warmGrey[900],
    marginBottom: spacing.sm,
  },
  comparePhoto: {
    width: (width - spacing.lg * 5) / 2,
    height: height * 0.35,
    borderRadius: borderRadius.xl,
  },
  photoTimestamp: {
    fontSize: fontSize.sm,
    color: colors.warmGrey[600],
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(120, 113, 108, 0.2)',
  },
  footerLeft: {
    flex: 1,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    gap: spacing.md,
  },
  navButton: {
    flex: 1,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary[600],
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: fontSize['2xl'],
    color: colors.white,
    fontWeight: fontWeight.bold,
  },
});
