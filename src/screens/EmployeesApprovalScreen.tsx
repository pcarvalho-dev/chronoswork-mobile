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
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { Button, Input, Card, Loading } from '../components';
import { colors, spacing, fontSize, fontWeight } from '../theme';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { User } from '../types';

type RootStackParamList = {
  ManagerDashboard: undefined;
  CompanyManagement: undefined;
  InvitationsManagement: undefined;
  EmployeesApproval: undefined;
  Dashboard: undefined;
};

type EmployeesApprovalScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'EmployeesApproval'>;

interface EmployeesApprovalScreenProps {
  navigation: EmployeesApprovalScreenNavigationProp;
}

export const EmployeesApprovalScreen: React.FC<EmployeesApprovalScreenProps> = ({ navigation }) => {
  const { api } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [employees, setEmployees] = useState<User[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  const loadEmployees = async (page = 1, search = searchTerm) => {
    try {
      const response = await api.getPendingEmployees(page, pagination.limit, search || undefined);
      setEmployees(response.users);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error loading pending employees:', error);
      Alert.alert('Erro', 'Não foi possível carregar os funcionários');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadEmployees(1, searchTerm);
  };

  const handleSearch = (text: string) => {
    setSearchTerm(text);
    setLoading(true);
    loadEmployees(1, text);
  };

  const handleApproveEmployee = (employee: User) => {
    setSelectedEmployee(employee);
    setApprovalNotes('');
    setShowApprovalModal(true);
  };

  const handleRejectEmployee = (employee: User) => {
    Alert.alert(
      'Rejeitar Funcionário',
      `Tem certeza que deseja rejeitar o cadastro de ${employee.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Rejeitar',
          style: 'destructive',
          onPress: () => processApproval(employee.id, false),
        },
      ]
    );
  };

  const processApproval = async (employeeId: string, approved: boolean) => {
    setProcessing(true);
    try {
      await api.approveEmployee(employeeId, approved, approvalNotes || undefined);
      Alert.alert(
        'Sucesso',
        `Funcionário ${approved ? 'aprovado' : 'rejeitado'} com sucesso!`
      );
      setShowApprovalModal(false);
      setSelectedEmployee(null);
      setApprovalNotes('');
      loadEmployees(pagination.page, searchTerm);
    } catch (error) {
      console.error('Error processing approval:', error);
      Alert.alert('Erro', 'Não foi possível processar a aprovação');
    } finally {
      setProcessing(false);
    }
  };

  const handleConfirmApproval = () => {
    if (!selectedEmployee) return;
    processApproval(selectedEmployee.id, true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getEmployeeStatus = (employee: User) => {
    if (employee.isApproved) return 'Aprovado';
    if (employee.isActive === false) return 'Rejeitado';
    return 'Pendente';
  };

  const getStatusColor = (employee: User) => {
    if (employee.isApproved) return colors.success[600];
    if (employee.isActive === false) return colors.error[600];
    return colors.warning[600];
  };

  useEffect(() => {
    loadEmployees();
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
            <Text style={styles.title}>Aprovação de Funcionários</Text>
            <Text style={styles.subtitle}>
              {pagination.total} funcionário{pagination.total !== 1 ? 's' : ''} aguardando aprovação
            </Text>
          </View>

          {/* Search */}
          <Input
            label="Buscar funcionários"
            placeholder="Digite o nome ou e-mail..."
            value={searchTerm}
            onChangeText={handleSearch}
            style={styles.searchInput}
          />

          {/* Employees List */}
          {employees.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>Nenhum funcionário encontrado</Text>
              <Text style={styles.emptySubtext}>
                {searchTerm 
                  ? 'Nenhum funcionário corresponde à sua busca'
                  : 'Todos os funcionários já foram processados'
                }
              </Text>
            </Card>
          ) : (
            employees.map((employee) => (
              <Card key={employee.id} style={styles.employeeCard}>
                <View style={styles.employeeHeader}>
                  <View style={styles.employeeInfo}>
                    <Text style={styles.employeeName}>{employee.name}</Text>
                    <Text style={styles.employeeEmail}>{employee.email}</Text>
                    <Text style={styles.employeePosition}>
                      {employee.position || 'Cargo não informado'}
                    </Text>
                    <Text style={styles.employeeDepartment}>
                      {employee.department || 'Departamento não informado'}
                    </Text>
                    <Text style={styles.employeeDate}>
                      Cadastrado em: {formatDate(employee.createdAt)}
                    </Text>
                  </View>
                  <View style={styles.employeeStatus}>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(employee) + '20' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          { color: getStatusColor(employee) },
                        ]}
                      >
                        {getEmployeeStatus(employee)}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Employee Details */}
                <View style={styles.employeeDetails}>
                  {employee.phone && (
                    <Text style={styles.detailText}>📞 {employee.phone}</Text>
                  )}
                  {employee.cpf && (
                    <Text style={styles.detailText}>🆔 CPF: {employee.cpf}</Text>
                  )}
                  {employee.address && (
                    <Text style={styles.detailText}>📍 {employee.address}</Text>
                  )}
                </View>

                {/* Actions */}
                {!employee.isApproved && employee.isActive !== false && (
                  <View style={styles.employeeActions}>
                    <Button
                      variant="secondary"
                      onPress={() => handleRejectEmployee(employee)}
                      style={styles.rejectButton}
                    >
                      Rejeitar
                    </Button>
                    <Button
                      variant="primary"
                      onPress={() => handleApproveEmployee(employee)}
                      style={styles.approveButton}
                    >
                      Aprovar
                    </Button>
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
                onPress={() => loadEmployees(pagination.page - 1, searchTerm)}
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
                onPress={() => loadEmployees(pagination.page + 1, searchTerm)}
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

      {/* Approval Modal */}
      <Modal
        visible={showApprovalModal}
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
              <Text style={styles.modalTitle}>Aprovar Funcionário</Text>
              <TouchableOpacity
                onPress={() => setShowApprovalModal(false)}
                style={styles.modalCloseButton}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <Card style={styles.modalCard}>
                {selectedEmployee && (
                  <>
                    <Text style={styles.employeeModalName}>{selectedEmployee.name}</Text>
                    <Text style={styles.employeeModalEmail}>{selectedEmployee.email}</Text>
                    <Text style={styles.employeeModalPosition}>
                      {selectedEmployee.position || 'Cargo não informado'}
                    </Text>

                    <Text style={styles.notesLabel}>Observações (opcional):</Text>
                    <TextInput
                      style={styles.notesInput}
                      placeholder="Adicione observações sobre a aprovação..."
                      value={approvalNotes}
                      onChangeText={setApprovalNotes}
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                    />

                    <View style={styles.modalActions}>
                      <Button
                        variant="secondary"
                        onPress={() => setShowApprovalModal(false)}
                        style={styles.modalCancelButton}
                      >
                        Cancelar
                      </Button>
                      <Button
                        variant="primary"
                        onPress={handleConfirmApproval}
                        loading={processing}
                        style={styles.modalApproveButton}
                      >
                        Aprovar
                      </Button>
                    </View>
                  </>
                )}
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
  searchInput: {
    marginBottom: spacing.xl,
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
  employeeCard: {
    marginBottom: spacing.md,
  },
  employeeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.warmGrey[800],
    marginBottom: spacing.xs,
  },
  employeeEmail: {
    fontSize: fontSize.base,
    color: colors.primary[600],
    marginBottom: spacing.xs,
  },
  employeePosition: {
    fontSize: fontSize.sm,
    color: colors.warmGrey[600],
    marginBottom: spacing.xs,
  },
  employeeDepartment: {
    fontSize: fontSize.sm,
    color: colors.warmGrey[600],
    marginBottom: spacing.xs,
  },
  employeeDate: {
    fontSize: fontSize.sm,
    color: colors.warmGrey[500],
  },
  employeeStatus: {
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
  employeeDetails: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.warmGrey[200],
  },
  detailText: {
    fontSize: fontSize.sm,
    color: colors.warmGrey[600],
    marginBottom: spacing.xs,
  },
  employeeActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  rejectButton: {
    flex: 1,
  },
  approveButton: {
    flex: 1,
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
  employeeModalName: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.warmGrey[800],
    marginBottom: spacing.xs,
  },
  employeeModalEmail: {
    fontSize: fontSize.base,
    color: colors.primary[600],
    marginBottom: spacing.xs,
  },
  employeeModalPosition: {
    fontSize: fontSize.base,
    color: colors.warmGrey[600],
    marginBottom: spacing.lg,
  },
  notesLabel: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.warmGrey[800],
    marginBottom: spacing.sm,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: colors.warmGrey[300],
    borderRadius: 8,
    padding: spacing.sm,
    fontSize: fontSize.base,
    color: colors.warmGrey[800],
    backgroundColor: colors.white,
    marginBottom: spacing.lg,
    minHeight: 100,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  modalCancelButton: {
    flex: 1,
  },
  modalApproveButton: {
    flex: 1,
  },
});