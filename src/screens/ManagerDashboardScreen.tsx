import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { Button, Card, Loading } from '../components';
import { colors, spacing, fontSize, fontWeight } from '../theme';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { Company, Invitation, User } from '../types';

type RootStackParamList = {
  ManagerDashboard: undefined;
  CompanyManagement: undefined;
  InvitationsManagement: undefined;
  EmployeesApproval: undefined;
  Dashboard: undefined;
};

type ManagerDashboardScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ManagerDashboard'>;

interface ManagerDashboardScreenProps {
  navigation: ManagerDashboardScreenNavigationProp;
}

export const ManagerDashboardScreen: React.FC<ManagerDashboardScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [company, setCompany] = useState<Company | null>(null);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [pendingEmployees, setPendingEmployees] = useState<User[]>([]);
  const [stats, setStats] = useState({
    totalInvitations: 0,
    pendingInvitations: 0,
    approvedEmployees: 0,
    pendingApprovals: 0,
  });

  const loadData = async () => {
    try {
      // Load company data
      const companyResponse = await api.getCompany();
      setCompany(companyResponse.company);

      // Load invitations
      const invitationsResponse = await api.getInvitations(1, 10);
      setInvitations(invitationsResponse.invitations);

      // Load pending employees
      const employeesResponse = await api.getPendingEmployees(1, 10);
      setPendingEmployees(employeesResponse.users);

      // Calculate stats
      setStats({
        totalInvitations: invitationsResponse.pagination.total,
        pendingInvitations: invitationsResponse.invitations.filter((inv: Invitation) => !inv.isUsed && inv.isActive).length,
        approvedEmployees: 0, // This would need to be calculated from another endpoint
        pendingApprovals: employeesResponse.users.length,
      });
    } catch (error) {
      console.error('Error loading manager dashboard data:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados do dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair da sua conta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', onPress: () => {
          // Logout logic would be handled by AuthContext
          navigation.navigate('Dashboard');
        }},
      ]
    );
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <LinearGradient
      colors={[colors.gradient.bluePale, colors.gradient.cyanPale, colors.gradient.skyPale]}
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
            <Text style={styles.title}>Dashboard do Gestor</Text>
            <Text style={styles.subtitle}>
              Bem-vindo, {user?.name || 'Gestor'}
            </Text>
            {company && (
              <Text style={styles.companyName}>{company.name}</Text>
            )}
          </View>

          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <Card style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.totalInvitations}</Text>
              <Text style={styles.statLabel}>Total de Convites</Text>
            </Card>
            <Card style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.pendingInvitations}</Text>
              <Text style={styles.statLabel}>Convites Pendentes</Text>
            </Card>
            <Card style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.pendingApprovals}</Text>
              <Text style={styles.statLabel}>Aprovações Pendentes</Text>
            </Card>
          </View>

          {/* Quick Actions */}
          <Card style={styles.quickActionsCard}>
            <Text style={styles.sectionTitle}>Ações Rápidas</Text>
            
            <Button
              variant="primary"
              onPress={() => navigation.navigate('CompanyManagement')}
              style={styles.actionButton}
            >
              Gerenciar Empresa
            </Button>
            
            <Button
              variant="secondary"
              onPress={() => navigation.navigate('InvitationsManagement')}
              style={styles.actionButton}
            >
              Gerenciar Convites
            </Button>
            
            <Button
              variant="secondary"
              onPress={() => navigation.navigate('EmployeesApproval')}
              style={styles.actionButton}
            >
              Aprovar Funcionários
            </Button>
          </Card>

          {/* Recent Invitations */}
          {invitations.length > 0 && (
            <Card style={styles.recentCard}>
              <Text style={styles.sectionTitle}>Convites Recentes</Text>
              {invitations.slice(0, 3).map((invitation) => (
                <View key={invitation.id} style={styles.invitationItem}>
                  <View style={styles.invitationInfo}>
                    <Text style={styles.invitationEmail}>{invitation.email}</Text>
                    <Text style={styles.invitationStatus}>
                      Status: {invitation.isUsed ? 'Aceito' :
                              !invitation.isActive ? 'Cancelado' : 'Pendente'}
                    </Text>
                  </View>
                  <View style={[
                    styles.statusBadge,
                    !invitation.isUsed && invitation.isActive && styles.statusPending,
                    invitation.isUsed && styles.statusAccepted,
                    !invitation.isActive && styles.statusCancelled,
                  ]}>
                    <Text style={styles.statusText}>
                      {invitation.isUsed ? 'A' :
                       !invitation.isActive ? 'C' : 'P'}
                    </Text>
                  </View>
                </View>
              ))}
              <TouchableOpacity
                onPress={() => navigation.navigate('InvitationsManagement')}
                style={styles.viewAllButton}
              >
                <Text style={styles.viewAllText}>Ver todos os convites</Text>
              </TouchableOpacity>
            </Card>
          )}

          {/* Pending Approvals */}
          {pendingEmployees.length > 0 && (
            <Card style={styles.recentCard}>
              <Text style={styles.sectionTitle}>Funcionários Aguardando Aprovação</Text>
              {pendingEmployees.slice(0, 3).map((employee) => (
                <View key={employee.id} style={styles.employeeItem}>
                  <View style={styles.employeeInfo}>
                    <Text style={styles.employeeName}>{employee.name}</Text>
                    <Text style={styles.employeeEmail}>{employee.email}</Text>
                    <Text style={styles.employeePosition}>
                      {employee.position || 'Cargo não informado'}
                    </Text>
                  </View>
                  <View style={styles.pendingBadge}>
                    <Text style={styles.pendingText}>Pendente</Text>
                  </View>
                </View>
              ))}
              <TouchableOpacity
                onPress={() => navigation.navigate('EmployeesApproval')}
                style={styles.viewAllButton}
              >
                <Text style={styles.viewAllText}>Ver todas as aprovações</Text>
              </TouchableOpacity>
            </Card>
          )}

          {/* Logout Button */}
          <Button
            variant="secondary"
            onPress={handleLogout}
            style={styles.logoutButton}
          >
            Sair
          </Button>
        </View>
      </ScrollView>
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
    fontSize: fontSize.lg,
    color: colors.warmGrey[700],
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  companyName: {
    fontSize: fontSize.base,
    color: colors.primary[600],
    fontWeight: fontWeight.semibold,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
  },
  statNumber: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.primary[600],
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: fontSize.sm,
    color: colors.warmGrey[600],
    textAlign: 'center',
  },
  quickActionsCard: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.warmGrey[800],
    marginBottom: spacing.md,
  },
  actionButton: {
    marginBottom: spacing.sm,
  },
  recentCard: {
    marginBottom: spacing.xl,
  },
  invitationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.warmGrey[200],
  },
  invitationInfo: {
    flex: 1,
  },
  invitationEmail: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.warmGrey[800],
    marginBottom: spacing.xs,
  },
  invitationStatus: {
    fontSize: fontSize.sm,
    color: colors.warmGrey[600],
  },
  statusBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusPending: {
    backgroundColor: colors.warning[100],
  },
  statusAccepted: {
    backgroundColor: colors.success[100],
  },
  statusCancelled: {
    backgroundColor: colors.error[100],
  },
  statusText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  employeeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.warmGrey[200],
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.warmGrey[800],
    marginBottom: spacing.xs,
  },
  employeeEmail: {
    fontSize: fontSize.sm,
    color: colors.warmGrey[600],
    marginBottom: spacing.xs,
  },
  employeePosition: {
    fontSize: fontSize.sm,
    color: colors.primary[600],
  },
  pendingBadge: {
    backgroundColor: colors.warning[100],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  pendingText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.warning[700],
  },
  viewAllButton: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: fontSize.sm,
    color: colors.primary[600],
    fontWeight: fontWeight.semibold,
  },
  logoutButton: {
    marginTop: spacing.lg,
  },
});