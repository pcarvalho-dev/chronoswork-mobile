import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { Button, Card, Loading, CameraCapture, PhotoViewer, PhotoData } from '../components';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../theme';
import type { TimeLog } from '../types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Dashboard: undefined;
};

type DashboardScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Dashboard'>;

interface DashboardScreenProps {
  navigation: DashboardScreenNavigationProp;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentSession, setCurrentSession] = useState<TimeLog | null>(null);
  const [currentTime, setCurrentTime] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [cameraAction, setCameraAction] = useState<'checkin' | 'checkout'>('checkin');
  const [showPhotoViewer, setShowPhotoViewer] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<PhotoData[]>([]);
  const [photoInitialIndex, setPhotoInitialIndex] = useState(0);

  useEffect(() => {
    fetchTimeLogs();

    // Update time every second
    const timeInterval = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }));
    }, 1000);

    // Refresh data every minute
    const refreshInterval = setInterval(() => {
      fetchTimeLogs();
    }, 60000);

    return () => {
      clearInterval(timeInterval);
      clearInterval(refreshInterval);
    };
  }, []);

  const fetchTimeLogs = async () => {
    try {
      console.log('📊 Fetching time logs...');
      const logs = await api.getTimeLogs();
      console.log('✅ Time logs fetched:', logs.length, 'logs');
      setTimeLogs(logs);

      // Check for active session (no checkout time)
      const activeSession = logs.find(log => !log.checkOut);
      setCurrentSession(activeSession || null);
    } catch (err) {
      console.error('❌ Failed to fetch time logs:', err);
      const errorMessage = err instanceof Error ? err.message : 'Falha ao buscar registros';

      // Don't show alert on initial load, just set empty array
      if (!loading) {
        Alert.alert('Erro', errorMessage);
      }

      // Set empty array so UI can still render
      setTimeLogs([]);
      setCurrentSession(null);
    } finally {
      console.log('🏁 Finished fetching time logs');
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTimeLogs();
  };

  const handleCheckIn = () => {
    setCameraAction('checkin');
    setShowCamera(true);
  };

  const handleCheckOut = () => {
    setCameraAction('checkout');
    setShowCamera(true);
  };

  const handlePhotoCapture = async (photo: { uri: string; type: string; name: string }) => {
    setShowCamera(false);
    setActionLoading(true);

    try {
      // Get location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permissão Negada',
          'Precisamos de acesso à localização para registrar seu ponto'
        );
        setActionLoading(false);
        return;
      }

      // Get current location with faster settings
      console.log('📍 Getting current location...');
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Low, // Changed to Low for faster GPS
        timeInterval: 1000,
        distanceInterval: 0,
      });
      console.log('✅ Location obtained:', location.coords.latitude, location.coords.longitude);

      // Call API with photo and location
      console.log('📤 Uploading...');
      if (cameraAction === 'checkin') {
        await api.checkIn(photo, location.coords.latitude, location.coords.longitude);
        Alert.alert('Sucesso', 'Entrada registrada com sucesso!');
      } else {
        await api.checkOut(photo, location.coords.latitude, location.coords.longitude);
        Alert.alert('Sucesso', 'Saída registrada com sucesso!');
      }

      await fetchTimeLogs();
    } catch (err) {
      console.error('❌ Error during check-in/out:', err);
      const errorMessage = err instanceof Error ? err.message : 'Falha ao registrar ponto';
      Alert.alert('Erro', errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            await logout();
            // Navigation happens automatically via RootNavigator when isAuthenticated becomes false
          },
        },
      ]
    );
  };

  const handleViewPhoto = (log: TimeLog, type: 'checkin' | 'checkout') => {
    const photos: PhotoData[] = [];

    if (log.checkInPhoto) {
      const checkInUrl = api.getPhotoUrl(log.checkInPhoto);
      if (checkInUrl) {
        photos.push({
          url: checkInUrl,
          title: 'Entrada',
          timestamp: log.checkIn,
          type: 'checkin',
        });
      }
    }

    if (log.checkOutPhoto) {
      const checkOutUrl = api.getPhotoUrl(log.checkOutPhoto);
      if (checkOutUrl) {
        photos.push({
          url: checkOutUrl,
          title: 'Saída',
          timestamp: log.checkOut!,
          type: 'checkout',
        });
      }
    }

    if (photos.length === 0) return;

    const initialIndex = type === 'checkin' ? 0 : photos.length - 1;
    setSelectedPhotos(photos);
    setPhotoInitialIndex(initialIndex);
    setShowPhotoViewer(true);
  };

  const handleOpenLocation = (latitude: number, longitude: number, type: 'checkin' | 'checkout') => {
    const label = type === 'checkin' ? 'Entrada' : 'Saída';

    // Different URL schemes for iOS and Android
    const scheme = Platform.select({
      ios: `maps:0,0?q=${label}@${latitude},${longitude}`,
      android: `geo:0,0?q=${latitude},${longitude}(${label})`,
    });

    // Fallback to Google Maps web if native app fails
    const fallbackUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

    Linking.canOpenURL(scheme!).then((supported) => {
      if (supported) {
        Linking.openURL(scheme!);
      } else {
        Linking.openURL(fallbackUrl);
      }
    }).catch(() => {
      Alert.alert('Erro', 'Não foi possível abrir o aplicativo de mapas');
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateDuration = (checkIn: string, checkOut: string | null) => {
    const start = new Date(checkIn).getTime();
    const end = checkOut ? new Date(checkOut).getTime() : Date.now();
    const durationMs = end - start;

    // Prevent negative values (can happen due to server/client clock drift)
    const safeDurationMs = Math.max(0, durationMs);

    const hours = Math.floor(safeDurationMs / (1000 * 60 * 60));
    const minutes = Math.floor((safeDurationMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  };

  const getTodayWorkedHours = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayLogs = timeLogs.filter(log => {
      const logDate = new Date(log.checkIn);
      logDate.setHours(0, 0, 0, 0);
      return logDate.getTime() === today.getTime();
    });

    const completedLogs = todayLogs.filter(log => log.checkOut !== null);

    const totalMs = completedLogs.reduce((total, log) => {
      const start = new Date(log.checkIn).getTime();
      const end = new Date(log.checkOut!).getTime();
      const duration = Math.max(0, end - start); // Prevent negative durations
      return total + duration;
    }, 0);

    const hours = Math.floor(totalMs / (1000 * 60 * 60));
    const minutes = Math.floor((totalMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const getTimeSinceLastCheckpoint = () => {
    const lastCheckpoint = getLastCheckpoint();
    if (!lastCheckpoint) return '-';

    const now = Date.now();
    const checkpointTime = new Date(lastCheckpoint).getTime();
    const diffMs = now - checkpointTime;

    // Prevent negative values (can happen due to server/client clock drift)
    // Use Math.max to ensure we never calculate with negative values
    const safeDiffMs = Math.max(0, diffMs);

    const hours = Math.floor(safeDiffMs / (1000 * 60 * 60));
    const minutes = Math.floor((safeDiffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const getTodayBreakTime = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayLogs = timeLogs.filter(log => {
      const logDate = new Date(log.checkIn);
      logDate.setHours(0, 0, 0, 0);
      return logDate.getTime() === today.getTime();
    }).sort((a, b) => new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime());

    if (todayLogs.length < 2) {
      return 'Previsto: 1h 0m';
    }

    let totalBreakMs = 0;
    for (let i = 0; i < todayLogs.length - 1; i++) {
      const currentLog = todayLogs[i];
      const nextLog = todayLogs[i + 1];

      if (currentLog.checkOut) {
        const breakStart = new Date(currentLog.checkOut).getTime();
        const breakEnd = new Date(nextLog.checkIn).getTime();
        const breakDuration = Math.max(0, breakEnd - breakStart); // Prevent negative breaks
        totalBreakMs += breakDuration;
      }
    }

    const hours = Math.floor(totalBreakMs / (1000 * 60 * 60));
    const minutes = Math.floor((totalBreakMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const getTotalHoursBank = () => {
    if (timeLogs.length === 0) return '0h 0m';

    // Get all completed logs (excluding weekends)
    const completedLogs = timeLogs.filter(log => {
      if (!log.checkOut) return false;
      const logDate = new Date(log.checkIn);
      const dayOfWeek = logDate.getDay();
      return dayOfWeek !== 0 && dayOfWeek !== 6; // Exclude Sunday (0) and Saturday (6)
    });

    // Calculate total worked milliseconds
    const totalWorkedMs = completedLogs.reduce((total, log) => {
      const start = new Date(log.checkIn).getTime();
      const end = new Date(log.checkOut!).getTime();
      const duration = Math.max(0, end - start); // Prevent negative durations
      return total + duration;
    }, 0);

    // Calculate expected hours (8h per working day)
    const dates = new Set(
      completedLogs.map(log => {
        const date = new Date(log.checkIn);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
      })
    );
    const workingDays = dates.size;
    const expectedMs = workingDays * 8 * 60 * 60 * 1000; // 8 hours in milliseconds

    // Calculate difference
    const diffMs = totalWorkedMs - expectedMs;
    const isPositive = diffMs >= 0;
    const absDiffMs = Math.abs(diffMs);

    const hours = Math.floor(absDiffMs / (1000 * 60 * 60));
    const minutes = Math.floor((absDiffMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${isPositive ? '+' : '-'}${hours}h ${minutes}m`;
  };

  const getLastCheckpoint = () => {
    if (timeLogs.length === 0) return null;
    const lastLog = timeLogs[0];
    return lastLog.checkOut || lastLog.checkIn;
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <CameraCapture
        visible={showCamera}
        onClose={() => setShowCamera(false)}
        onCapture={handlePhotoCapture}
        title={cameraAction === 'checkin' ? 'Check-in' : 'Check-out'}
      />

      <PhotoViewer
        visible={showPhotoViewer}
        photos={selectedPhotos}
        initialIndex={photoInitialIndex}
        onClose={() => setShowPhotoViewer(false)}
      />

      <LinearGradient
        colors={[colors.gradient.bluePale, colors.gradient.pinkPale, colors.gradient.purplePale]}
        locations={[0, 0.5, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Olá, {user?.name?.split(' ')[0]}!</Text>
            <Text style={styles.time}>{currentTime}</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Sair</Text>
          </TouchableOpacity>
        </View>

        {/* Check In/Out Card */}
        <Card style={styles.mainCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Controle de Tempo</Text>
            <Text style={styles.cardSubtitle}>Registre suas horas</Text>
          </View>

          {currentSession ? (
            <View>
              <View style={styles.activeSessionBadge}>
                <View style={styles.pulseIndicator} />
                <Text style={styles.activeSessionText}>Sessão Ativa</Text>
              </View>

              <View style={styles.sessionInfo}>
                <View style={styles.sessionInfoHeader}>
                  <Text style={styles.sessionLabel}>Iniciado em:</Text>
                  {currentSession.latitude && currentSession.longitude && (
                    <TouchableOpacity
                      onPress={() => handleOpenLocation(currentSession.latitude, currentSession.longitude, 'checkin')}
                      style={styles.iconButton}
                    >
                      <Ionicons name="location-outline" size={16} color="#16a34a" />
                    </TouchableOpacity>
                  )}
                </View>
                <Text style={styles.sessionValue}>{formatDate(currentSession.checkIn)}</Text>
              </View>

              <View style={styles.sessionInfo}>
                <Text style={styles.sessionLabel}>Duração:</Text>
                <Text style={styles.durationValue}>
                  {calculateDuration(currentSession.checkIn, null)}
                </Text>
              </View>

              <Button
                variant="secondary"
                onPress={handleCheckOut}
                loading={actionLoading}
                style={styles.actionButton}
              >
                Registrar Saída
              </Button>
            </View>
          ) : (
            <View>
              <View style={styles.noSessionContainer}>
                <Text style={styles.noSessionText}>Nenhuma sessão ativa</Text>
                <Text style={styles.noSessionSubtext}>
                  Clique no botão abaixo para começar
                </Text>
              </View>

              <Button
                variant="primary"
                onPress={handleCheckIn}
                loading={actionLoading}
                style={styles.actionButton}
              >
                Registrar Entrada
              </Button>
            </View>
          )}
        </Card>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <Card style={styles.statCard}>
              <Text style={styles.statLabel}>Último Ponto</Text>
              <Text style={styles.statValueSmall}>
                {getLastCheckpoint() ? formatDate(getLastCheckpoint()!) : '-'}
              </Text>
            </Card>

            <Card style={styles.statCard}>
              <Text style={styles.statLabel}>Tempo desde último</Text>
              <Text style={styles.statValue}>{getTimeSinceLastCheckpoint()}</Text>
            </Card>
          </View>

          <View style={styles.statsRow}>
            <Card style={styles.statCard}>
              <Text style={styles.statLabel}>Horas Hoje</Text>
              <Text style={styles.statValue}>{getTodayWorkedHours()}</Text>
            </Card>

            <Card style={styles.statCard}>
              <Text style={styles.statLabel}>Intervalo do Dia</Text>
              <Text style={styles.statValueSmall}>{getTodayBreakTime()}</Text>
            </Card>
          </View>

          <Card style={styles.statCardFull}>
            <Text style={styles.statLabel}>Banco de Horas Total</Text>
            <Text style={styles.statValueLarge}>{getTotalHoursBank()}</Text>
          </Card>
        </View>

        {/* Time Logs */}
        <View style={styles.logsSection}>
          <Text style={styles.logsTitle}>Histórico de Registros</Text>

          {timeLogs.length === 0 ? (
            <Card style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Ainda não há registros</Text>
              <Text style={styles.emptyStateSubtext}>
                Faça check-in para começar!
              </Text>
            </Card>
          ) : (
            timeLogs.map((log) => (
              <Card key={log.id} style={styles.logCard}>
                <View style={styles.logHeader}>
                  <View
                    style={[
                      styles.statusBadge,
                      log.checkOut ? styles.completedBadge : styles.activeBadge,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        log.checkOut ? styles.completedText : styles.activeText,
                      ]}
                    >
                      {log.checkOut ? 'Concluída' : 'Ativa'}
                    </Text>
                  </View>

                  <Text style={styles.logDuration}>
                    {calculateDuration(log.checkIn, log.checkOut)}
                  </Text>
                </View>

                <View style={styles.logDetails}>
                  <View style={styles.logDetailRow}>
                    <View style={styles.logDetailLeft}>
                      <Text style={styles.logDetailLabel}>Entrada:</Text>
                      {log.checkInPhoto && (
                        <TouchableOpacity
                          onPress={() => handleViewPhoto(log, 'checkin')}
                          style={styles.iconButton}
                        >
                          <Ionicons name="camera-outline" size={16} color={colors.primary[600]} />
                        </TouchableOpacity>
                      )}
                      {log.latitude && log.longitude && (
                        <TouchableOpacity
                          onPress={() => handleOpenLocation(log.latitude, log.longitude, 'checkin')}
                          style={styles.iconButton}
                        >
                          <Ionicons name="location-outline" size={16} color="#16a34a" />
                        </TouchableOpacity>
                      )}
                    </View>
                    <Text style={styles.logDetailValue}>{formatDate(log.checkIn)}</Text>
                  </View>

                  <View style={styles.logDetailRow}>
                    <View style={styles.logDetailLeft}>
                      <Text style={styles.logDetailLabel}>Saída:</Text>
                      {log.checkOutPhoto && (
                        <TouchableOpacity
                          onPress={() => handleViewPhoto(log, 'checkout')}
                          style={styles.iconButton}
                        >
                          <Ionicons name="camera-outline" size={16} color={colors.primary[600]} />
                        </TouchableOpacity>
                      )}
                      {log.outLatitude && log.outLongitude && (
                        <TouchableOpacity
                          onPress={() => handleOpenLocation(log.outLatitude!, log.outLongitude!, 'checkout')}
                          style={styles.iconButton}
                        >
                          <Ionicons name="location-outline" size={16} color="#dc2626" />
                        </TouchableOpacity>
                      )}
                    </View>
                    <Text style={styles.logDetailValue}>
                      {log.checkOut ? formatDate(log.checkOut) : 'Em andamento...'}
                    </Text>
                  </View>
                </View>
              </Card>
            ))
          )}
        </View>
      </ScrollView>
    </LinearGradient>
    </>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    paddingTop: spacing.xxl,
  },
  greeting: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.warmGrey[900],
  },
  time: {
    fontSize: fontSize.base,
    color: colors.warmGrey[600],
    marginTop: spacing.xs,
  },
  logoutButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.warmGrey[300],
  },
  logoutText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.error,
  },
  mainCard: {
    margin: spacing.lg,
  },
  cardHeader: {
    marginBottom: spacing.lg,
  },
  cardTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.warmGrey[900],
  },
  cardSubtitle: {
    fontSize: fontSize.sm,
    color: colors.warmGrey[600],
    marginTop: spacing.xs,
  },
  activeSessionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success + '20',
    borderWidth: 1,
    borderColor: colors.success + '30',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  pulseIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.success,
    marginRight: spacing.sm,
  },
  activeSessionText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.success,
  },
  sessionInfo: {
    marginBottom: spacing.md,
  },
  sessionInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  sessionLabel: {
    fontSize: fontSize.sm,
    color: colors.warmGrey[600],
  },
  sessionValue: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.warmGrey[900],
  },
  durationValue: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.primary[600],
  },
  noSessionContainer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  noSessionText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.warmGrey[700],
    marginBottom: spacing.xs,
  },
  noSessionSubtext: {
    fontSize: fontSize.sm,
    color: colors.warmGrey[600],
  },
  actionButton: {
    marginTop: spacing.md,
  },
  statsContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
  },
  statCardFull: {
    width: '100%',
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.warmGrey[600],
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.primary[600],
  },
  statValueSmall: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.warmGrey[900],
  },
  statValueLarge: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.primary[600],
  },
  logsSection: {
    padding: spacing.lg,
  },
  logsTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.warmGrey[900],
    marginBottom: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyStateText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.warmGrey[700],
    marginBottom: spacing.xs,
  },
  emptyStateSubtext: {
    fontSize: fontSize.sm,
    color: colors.warmGrey[600],
  },
  logCard: {
    marginBottom: spacing.md,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  completedBadge: {
    backgroundColor: colors.success + '20',
    borderColor: colors.success + '30',
  },
  activeBadge: {
    backgroundColor: colors.primary[100],
    borderColor: colors.primary[300],
  },
  statusText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  completedText: {
    color: colors.success,
  },
  activeText: {
    color: colors.primary[700],
  },
  logDuration: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.primary[600],
  },
  logDetails: {
    gap: spacing.sm,
  },
  logDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logDetailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  logDetailLabel: {
    fontSize: fontSize.sm,
    color: colors.warmGrey[600],
  },
  iconButton: {
    padding: spacing.xs,
    borderRadius: borderRadius.md,
    backgroundColor: colors.white + '40',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logDetailValue: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.warmGrey[900],
  },
});
