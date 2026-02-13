import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { Button, Input, Card } from '../components';
import { colors, spacing, fontSize, fontWeight } from '../theme';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { EmployeeRegisterData } from '../types';

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  ManagerRegister: undefined;
  EmployeeRegister: undefined;
  Dashboard: undefined;
};

type EmployeeRegisterScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'EmployeeRegister'>;

interface EmployeeRegisterScreenProps {
  navigation: EmployeeRegisterScreenNavigationProp;
}

export const EmployeeRegisterScreen: React.FC<EmployeeRegisterScreenProps> = ({ navigation }) => {
  const { registerEmployee } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Employee data
  const [employeeData, setEmployeeData] = useState({
    invitationCode: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    cpf: '',
    rg: '',
    birthDate: '',
    gender: '',
    maritalStatus: '',
    phone: '',
    mobilePhone: '',
    address: '',
    addressNumber: '',
    addressComplement: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Brasil',
    employeeId: '',
    department: '',
    position: '',
    hireDate: '',
    salary: '',
    workSchedule: '',
    employmentType: '',
    directSupervisor: '',
    bankName: '',
    bankAccount: '',
    bankAgency: '',
    bankAccountType: '',
    pix: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: '',
    education: '',
    notes: '',
  });

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
    if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6, 10)}`;
  };

  const formatMobilePhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 5) return numbers;
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
  };

  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value;

    // Apply formatting based on field type
    if (field === 'cpf') {
      formattedValue = formatCPF(value);
    } else if (field === 'phone') {
      formattedValue = formatPhone(value);
    } else if (field === 'mobilePhone') {
      formattedValue = formatMobilePhone(value);
    } else if (field === 'zipCode') {
      formattedValue = formatCEP(value);
    }

    setEmployeeData(prev => ({ ...prev, [field]: formattedValue }));
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};

    if (!employeeData.invitationCode) {
      newErrors.invitationCode = 'Código de convite é obrigatório';
    }

    if (!employeeData.name || employeeData.name.length < 3) {
      newErrors.name = 'Nome deve ter pelo menos 3 caracteres';
    }

    if (!employeeData.email) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(employeeData.email)) {
      newErrors.email = 'E-mail inválido';
    }

    if (!employeeData.password || employeeData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    if (employeeData.password !== employeeData.confirmPassword) {
      newErrors.confirmPassword = 'As senhas não correspondem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleRegister = async () => {
    if (!validateStep1()) return;

    setLoading(true);
    try {
      // Prepare data for API
      const requestData: EmployeeRegisterData = {
        invitationCode: employeeData.invitationCode,
        name: employeeData.name,
        email: employeeData.email,
        password: employeeData.password,
        // Add optional fields only if filled
        ...(employeeData.cpf && { cpf: employeeData.cpf.replace(/\D/g, '') }),
        ...(employeeData.rg && { rg: employeeData.rg }),
        ...(employeeData.birthDate && { birthDate: employeeData.birthDate }),
        ...(employeeData.gender && { gender: employeeData.gender }),
        ...(employeeData.maritalStatus && { maritalStatus: employeeData.maritalStatus }),
        ...(employeeData.phone && { phone: employeeData.phone }),
        ...(employeeData.mobilePhone && { mobilePhone: employeeData.mobilePhone }),
        ...(employeeData.address && { address: employeeData.address }),
        ...(employeeData.addressNumber && { addressNumber: employeeData.addressNumber }),
        ...(employeeData.addressComplement && { addressComplement: employeeData.addressComplement }),
        ...(employeeData.neighborhood && { neighborhood: employeeData.neighborhood }),
        ...(employeeData.city && { city: employeeData.city }),
        ...(employeeData.state && { state: employeeData.state }),
        ...(employeeData.zipCode && { zipCode: employeeData.zipCode.replace(/\D/g, '') }),
        ...(employeeData.country && { country: employeeData.country }),
        ...(employeeData.employeeId && { employeeId: employeeData.employeeId }),
        ...(employeeData.department && { department: employeeData.department }),
        ...(employeeData.position && { position: employeeData.position }),
        ...(employeeData.hireDate && { hireDate: employeeData.hireDate }),
        ...(employeeData.salary && { salary: parseFloat(employeeData.salary) }),
        ...(employeeData.workSchedule && { workSchedule: employeeData.workSchedule }),
        ...(employeeData.employmentType && { employmentType: employeeData.employmentType }),
        ...(employeeData.directSupervisor && { directSupervisor: employeeData.directSupervisor }),
        ...(employeeData.bankName && { bankName: employeeData.bankName }),
        ...(employeeData.bankAccount && { bankAccount: employeeData.bankAccount }),
        ...(employeeData.bankAgency && { bankAgency: employeeData.bankAgency }),
        ...(employeeData.bankAccountType && { bankAccountType: employeeData.bankAccountType }),
        ...(employeeData.pix && { pix: employeeData.pix }),
        ...(employeeData.emergencyContactName && { emergencyContactName: employeeData.emergencyContactName }),
        ...(employeeData.emergencyContactPhone && { emergencyContactPhone: employeeData.emergencyContactPhone }),
        ...(employeeData.emergencyContactRelationship && { emergencyContactRelationship: employeeData.emergencyContactRelationship }),
        ...(employeeData.education && { education: employeeData.education }),
        ...(employeeData.notes && { notes: employeeData.notes }),
      };

      const response = await registerEmployee(requestData);
      
      if (response.requiresApproval) {
        Alert.alert(
          'Cadastro Realizado',
          'Seu cadastro foi realizado com sucesso. Aguarde a aprovação do gestor para começar a usar o sistema.',
          [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
        );
      } else {
        Alert.alert('Sucesso', 'Cadastro realizado com sucesso!');
        // Navigation happens automatically via RootNavigator when isAuthenticated becomes true
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ocorreu um erro. Tente novamente.';
      Alert.alert('Erro no Cadastro', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <Card style={styles.card}>
      <Text style={styles.sectionTitle}>Dados Básicos</Text>

      <Input
        label="Código de Convite *"
        placeholder="Digite o código de convite"
        value={employeeData.invitationCode}
        onChangeText={(value) => handleInputChange('invitationCode', value)}
        autoCapitalize="characters"
        error={errors.invitationCode}
        editable={!loading}
      />

      <Input
        label="Nome Completo *"
        placeholder="João Silva"
        value={employeeData.name}
        onChangeText={(value) => handleInputChange('name', value)}
        autoCapitalize="words"
        error={errors.name}
        editable={!loading}
      />

      <Input
        label="E-mail *"
        placeholder="voce@exemplo.com"
        value={employeeData.email}
        onChangeText={(value) => handleInputChange('email', value)}
        keyboardType="email-address"
        autoCapitalize="none"
        error={errors.email}
        editable={!loading}
      />

      <Input
        label="Senha *"
        placeholder="••••••••"
        value={employeeData.password}
        onChangeText={(value) => handleInputChange('password', value)}
        secureTextEntry
        autoCapitalize="none"
        error={errors.password}
        editable={!loading}
      />

      <Input
        label="Confirmar Senha *"
        placeholder="••••••••"
        value={employeeData.confirmPassword}
        onChangeText={(value) => handleInputChange('confirmPassword', value)}
        secureTextEntry
        autoCapitalize="none"
        error={errors.confirmPassword}
        editable={!loading}
      />

      <Button
        variant="primary"
        onPress={handleNext}
        style={styles.nextButton}
      >
        Próximo
      </Button>
    </Card>
  );

  const renderStep2 = () => (
    <Card style={styles.card}>
      <Text style={styles.sectionTitle}>Dados Pessoais</Text>

      <Input
        label="CPF"
        placeholder="000.000.000-00"
        value={employeeData.cpf}
        onChangeText={(value) => handleInputChange('cpf', value)}
        keyboardType="numeric"
        editable={!loading}
        maxLength={14}
      />

      <Input
        label="RG"
        placeholder="00.000.000-0"
        value={employeeData.rg}
        onChangeText={(value) => handleInputChange('rg', value)}
        editable={!loading}
      />

      <Input
        label="Data de Nascimento"
        placeholder="DD/MM/AAAA"
        value={employeeData.birthDate}
        onChangeText={(value) => handleInputChange('birthDate', value)}
        keyboardType="numeric"
        editable={!loading}
        maxLength={10}
      />

      <Input
        label="Telefone"
        placeholder="(00) 0000-0000"
        value={employeeData.phone}
        onChangeText={(value) => handleInputChange('phone', value)}
        keyboardType="phone-pad"
        editable={!loading}
        maxLength={14}
      />

      <Input
        label="Celular"
        placeholder="(00) 90000-0000"
        value={employeeData.mobilePhone}
        onChangeText={(value) => handleInputChange('mobilePhone', value)}
        keyboardType="phone-pad"
        editable={!loading}
        maxLength={15}
      />

      <View style={styles.buttonRow}>
        <Button
          variant="secondary"
          onPress={handleBack}
          style={styles.backButton}
        >
          Voltar
        </Button>
        <Button
          variant="primary"
          onPress={handleRegister}
          loading={loading}
          style={styles.registerButton}
        >
          Cadastrar
        </Button>
      </View>
    </Card>
  );

  return (
    <LinearGradient
      colors={[colors.gradient.bluePale, colors.gradient.cyanPale, colors.gradient.skyPale]}
      locations={[0, 0.5, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <Text style={styles.title}>Cadastro de Funcionário</Text>
            <Text style={styles.subtitle}>Preencha seus dados para se juntar à empresa</Text>

            {/* Progress indicator */}
            <View style={styles.progressContainer}>
              <View style={[styles.progressStep, currentStep >= 1 && styles.progressStepActive]}>
                <Text style={[styles.progressStepText, currentStep >= 1 && styles.progressStepTextActive]}>1</Text>
              </View>
              <View style={[styles.progressLine, currentStep >= 2 && styles.progressLineActive]} />
              <View style={[styles.progressStep, currentStep >= 2 && styles.progressStepActive]}>
                <Text style={[styles.progressStepText, currentStep >= 2 && styles.progressStepTextActive]}>2</Text>
              </View>
            </View>

            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}

            <View style={styles.footer}>
              <Text style={styles.footerText}>Já tem uma conta? </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Login')}
                disabled={loading}
              >
                <Text style={styles.footerLink}>Entrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
    paddingTop: spacing.xxl,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  title: {
    fontSize: fontSize['4xl'],
    fontWeight: fontWeight.bold,
    color: colors.primary[700],
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.base,
    color: colors.warmGrey[700],
    fontWeight: fontWeight.medium,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  progressStep: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.warmGrey[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressStepActive: {
    backgroundColor: colors.primary[600],
  },
  progressStepText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.warmGrey[600],
  },
  progressStepTextActive: {
    color: colors.white,
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: colors.warmGrey[300],
    marginHorizontal: spacing.sm,
  },
  progressLineActive: {
    backgroundColor: colors.primary[600],
  },
  card: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.warmGrey[800],
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  nextButton: {
    marginTop: spacing.md,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  backButton: {
    flex: 1,
  },
  registerButton: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: fontSize.sm,
    color: colors.warmGrey[700],
  },
  footerLink: {
    fontSize: fontSize.sm,
    color: colors.primary[600],
    fontWeight: fontWeight.semibold,
  },
});