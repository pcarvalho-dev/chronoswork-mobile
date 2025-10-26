import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { Button, Input, Card, Loading } from '../components';
import { colors, spacing, fontSize, fontWeight } from '../theme';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { Invitation, CreateInvitationData } from '../types';

type RootStackParamList = {
  ManagerDashboard: undefined;
  CompanyManagement: undefined;
  InvitationsManagement: undefined;
  EmployeesApproval: undefined;
  Dashboard: undefined;
};

type InvitationsManagementScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'InvitationsManagement'>;

interface InvitationsManagementScreenProps {
  navigation: InvitationsManagementScreenNavigationProp;
}

export const InvitationsManagementScreen: React.FC<InvitationsManagementScreenProps> = ({ navigation }) => {
  const { api } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newInvitation, setNewInvitation] = useState<CreateInvitationData>({
    email: '',
    expiresAt: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const loadInvitations = async (page = 1, status = statusFilter) => {
    try {
      const response = await api.getInvitations(page, pagination.limit, status === 'all' ? undefined : status);
      setInvitations(response.invitations);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error loading invitations:', error);
      Alert.alert('Erro', 'Não foi possível carregar os convites');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadInvitations(1, statusFilter);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setLoading(true);
    loadInvitations(1, status);
  };

  const handleCreateInvitation = async () => {
    const newErrors: Record<string, string> = {};

    if (!newInvitation.email) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(newInvitation.email)) {
      newErrors.email = 'E-mail inválido';
    }

    if (!newInvitation.expiresAt) {
      newErrors.expiresAt = 'Data de expiração é obrigatória';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setCreating(true);
    try {
      await api.createInvitation(newInvitation);
      Alert.alert('Sucesso', 'Convite criado com sucesso!');
      setShowCreateModal(false);
      setNewInvitation({ email: '', expiresAt: '' });
      setErrors({});
      loadInvitations(1, statusFilter);
    } catch (error) {
      console.error('Error creating invitation:', error);
      Alert.alert('Erro', 'Não foi possível criar o convite');
    } finally {
      setCreating(false);
    }
  };

  const handleCancelInvitation = async (invitationId: number) => {
    Alert.alert(
      'Cancelar Convite',
      'Tem certeza que deseja cancelar este convite?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              await api.cancelInvitation(invitationId);
              Alert.alert('Sucesso', 'Convite cancelado com sucesso!');
              loadInvitations(pagination.page, statusFilter);
            } catch (error) {
              console.error('Error canceling invitation:', error);
              Alert.alert('Erro', 'Não foi possível cancelar o convite');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return colors.warning[600];
      case 'accepted':
        return colors.success[600];
      case 'cancelled':
        return colors.error[600];
      default:
        return colors.warmGrey[600];
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'accepted':
        return 'Aceito';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  useEffect(() => {
    loadInvitations();
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
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
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Gestão de Convites</Text>
            <Text style={styles.subtitle}>
              {pagination.total} convite{pagination.total !== 1 ? 's' : ''} encontrado{pagination.total !== 1 ? 's' : ''}
            </Text>
          </View>

          {/* Create Invitation Button */}
          <Button
            variant="primary"
            onPress={() => setShowCreateModal(true)}
            style={styles.createButton}
          >
            Criar Novo Convite
          </Button>

          {/* Status Filters */}
          <View style={styles.filtersContainer}>
            <Text style={styles.filtersTitle}>Filtrar por status:</Text>
            <View style={styles.filtersRow}>
              {['all', 'pending', 'accepted', 'cancelled'].map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.filterButton,
                    statusFilter === status && styles.filterButtonActive,
                  ]}
                  onPress={() => handleStatusFilter(status)}
                >
                  <Text
                    style={[
                      styles.filterButtonText,
                      statusFilter === status && styles.filterButtonTextActive,
                    ]}
                  >
                    {status === 'all' ? 'Todos' : getStatusText(status)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Invitations List */}
          {invitations.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>Nenhum convite encontrado</Text>
              <Text style={styles.emptySubtext}>
                {statusFilter === 'all' 
                  ? 'Crie seu primeiro convite para começar'
                  : 'Nenhum convite com este status'
                }
              </Text>
            </Card>
          ) : (
            invitations.map((invitation) => (
              <Card key={invitation.id} style={styles.invitationCard}>
                <View style={styles.invitationHeader}>
                  <View style={styles.invitationInfo}>
                    <Text style={styles.invitationEmail}>{invitation.email}</Text>
                    <Text style={styles.invitationDate}>
                      Criado em: {formatDate(invitation.createdAt)}
                    </Text>
                    <Text style={styles.invitationExpiry}>
                      Expira em: {formatDate(invitation.expiresAt)}
                    </Text>
                  </View>
                  <View style={styles.invitationStatus}>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(invitation.status) + '20' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          { color: getStatusColor(invitation.status) },
                        ]}
                      >
                        {getStatusText(invitation.status)}
                      </Text>
                    </View>
                  </View>
                </View>

                {invitation.status === 'pending' && (
                  <View style={styles.invitationActions}>
                    <Button
                      variant="secondary"
                      onPress={() => handleCancelInvitation(invitation.id)}
                      style={styles.cancelButton}
                    >
                      Cancelar
                    </Button>
                  </View>
                )}

                {invitation.code && (
                  <View style={styles.invitationCode}>
                    <Text style={styles.codeLabel}>Código do convite:</Text>
                    <Text style={styles.codeText}>{invitation.code}</Text>
                  </View>
                )}
              </Card>
            ))
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <View style={styles.pagination}>
              <TouchableOpacity
                style={[
                  styles.paginationButton,
                  pagination.page === 1 && styles.paginationButtonDisabled,
                ]}
                onPress={() => loadInvitations(pagination.page - 1, statusFilter)}
                disabled={pagination.page === 1}
              >
                <Text
                  style={[
                    styles.paginationButtonText,
                    pagination.page === 1 && styles.paginationButtonTextDisabled,
                  ]}
                >
                  Anterior
                </Text>
              </TouchableOpacity>

              <Text style={styles.paginationInfo}>
                {pagination.page} de {pagination.totalPages}
              </Text>

              <TouchableOpacity
                style={[
                  styles.paginationButton,
                  pagination.page === pagination.totalPages && styles.paginationButtonDisabled,
                ]}
                onPress={() => loadInvitations(pagination.page + 1, statusFilter)}
                disabled={pagination.page === pagination.totalPages}
              >
                <Text
                  style={[
                    styles.paginationButtonText,
                    pagination.page === pagination.totalPages && styles.paginationButtonTextDisabled,
                  ]}
                >
                  Próxima
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Back Button */}
          <Button
            variant="secondary"
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            Voltar ao Dashboard
          </Button>
        </View>
      </ScrollView>

      {/* Create Invitation Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <LinearGradient
          colors={[colors.gradient.bluePale, colors.gradient.pinkPale, colors.gradient.purplePale]}
          locations={[0, 0.5, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.modalGradient}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Criar Novo Convite</Text>
              <TouchableOpacity
                onPress={() => setShowCreateModal(false)}
                style={styles.modalCloseButton}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <Card style={styles.modalCard}>
                <Input
                  label="E-mail do Funcionário *"
                  placeholder="funcionario@empresa.com"
                  value={newInvitation.email}
                  onChangeText={(value) => setNewInvitation(prev => ({ ...prev, email: value }))}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={errors.email}
                />

                <Input
                  label="Data de Expiração *"
                  placeholder="DD/MM/AAAA"
                  value={newInvitation.expiresAt}
                  onChangeText={(value) => setNewInvitation(prev => ({ ...prev, expiresAt: value }))}
                  keyboardType="numeric"
                  error={errors.expiresAt}
                  maxLength={10}
                />

                <View style={styles.modalActions}>
                  <Button
                    variant="secondary"
                    onPress={() => setShowCreateModal(false)}
                    style={styles.modalCancelButton}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="primary"
                    onPress={handleCreateInvitation}
                    loading={creating}
                    style={styles.modalCreateButton}
                  >
                    Criar Convite
                  </Button>
                </View>
              </Card>
            </ScrollView>
          </View>
        </LinearGradient>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  title: {
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.bold,
    color: colors.primary[700],
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.base,
    color: colors.warmGrey[700],
    textAlign: 'center',
  },
  createButton: {
    marginBottom: spacing.xl,
  },
  filtersContainer: {
    marginBottom: spacing.xl,
  },
  filtersTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.warmGrey[800],
    marginBottom: spacing.sm,
  },
  filtersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  filterButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.warmGrey[200],
  },
  filterButtonActive: {
    backgroundColor: colors.primary[600],
  },
  filterButtonText: {
    fontSize: fontSize.sm,
    color: colors.warmGrey[700],
    fontWeight: fontWeight.medium,
  },
  filterButtonTextActive: {
    color: colors.white,
  },
  emptyCard: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.warmGrey[600],
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    fontSize: fontSize.base,
    color: colors.warmGrey[500],
    textAlign: 'center',
  },
  invitationCard: {
    marginBottom: spacing.md,
  },
  invitationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  invitationInfo: {
    flex: 1,
  },
  invitationEmail: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.warmGrey[800],
    marginBottom: spacing.xs,
  },
  invitationDate: {
    fontSize: fontSize.sm,
    color: colors.warmGrey[600],
    marginBottom: spacing.xs,
  },
  invitationExpiry: {
    fontSize: fontSize.sm,
    color: colors.warmGrey[600],
  },
  invitationStatus: {
    marginLeft: spacing.md,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  statusText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  invitationActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing.sm,
  },
  cancelButton: {
    paddingHorizontal: spacing.md,
  },
  invitationCode: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.warmGrey[100],
    borderRadius: 8,
  },
  codeLabel: {
    fontSize: fontSize.sm,
    color: colors.warmGrey[600],
    marginBottom: spacing.xs,
  },
  codeText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.primary[600],
    fontFamily: 'monospace',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  paginationButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary[600],
    borderRadius: 8,
  },
  paginationButtonDisabled: {
    backgroundColor: colors.warmGrey[300],
  },
  paginationButtonText: {
    color: colors.white,
    fontWeight: fontWeight.semibold,
  },
  paginationButtonTextDisabled: {
    color: colors.warmGrey[500],
  },
  paginationInfo: {
    fontSize: fontSize.sm,
    color: colors.warmGrey[600],
  },
  backButton: {
    marginTop: spacing.lg,
  },
  modalGradient: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    paddingTop: spacing.xxl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.primary[700],
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.warmGrey[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    fontSize: fontSize.lg,
    color: colors.warmGrey[600],
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  modalCard: {
    marginBottom: spacing.xl,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  modalCancelButton: {
    flex: 1,
  },
  modalCreateButton: {
    flex: 1,
  },
});