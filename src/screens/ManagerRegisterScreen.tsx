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
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { Button, Input, Card } from '../components';
import { colors, spacing, fontSize, fontWeight } from '../theme';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ManagerRegisterData } from '../types';

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  ManagerRegister: undefined;
  EmployeeRegister: undefined;
  Dashboard: undefined;
};

type ManagerRegisterScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ManagerRegister'>;

interface ManagerRegisterScreenProps {
  navigation: ManagerRegisterScreenNavigationProp;
}

export const ManagerRegisterScreen: React.FC<ManagerRegisterScreenProps> = ({ navigation }) => {
  const { registerManager } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Manager data
  const [managerData, setManagerData] = useState({
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

  // Company data
  const [companyData, setCompanyData] = useState({
    name: '',
    cnpj: '',
    corporateName: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    addressNumber: '',
    addressComplement: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Brasil',
    description: '',
  });

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
    if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
  };

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 5) return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
    if (numbers.length <= 8) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`;
    if (numbers.length <= 12) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8)}`;
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12, 14)}`;
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

  const handleManagerInputChange = (field: string, value: string) => {
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

    setManagerData(prev => ({ ...prev, [field]: formattedValue }));
  };

  const handleCompanyInputChange = (field: string, value: string) => {
    let formattedValue = value;

    // Apply formatting based on field type
    if (field === 'cnpj') {
      formattedValue = formatCNPJ(value);
    } else if (field === 'phone') {
      formattedValue = formatPhone(value);
    } else if (field === 'zipCode') {
      formattedValue = formatCEP(value);
    }

    setCompanyData(prev => ({ ...prev, [field]: formattedValue }));
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};

    if (!managerData.name || managerData.name.length < 3) {
      newErrors.name = 'Nome deve ter pelo menos 3 caracteres';
    }

    if (!managerData.email) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(managerData.email)) {
      newErrors.email = 'E-mail inválido';
    }

    if (!managerData.password || managerData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    if (managerData.password !== managerData.confirmPassword) {
      newErrors.confirmPassword = 'As senhas não correspondem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};

    if (!companyData.name || companyData.name.length < 3) {
      newErrors.companyName = 'Nome da empresa é obrigatório';
    }

    if (!companyData.cnpj || companyData.cnpj.replace(/\D/g, '').length !== 14) {
      newErrors.cnpj = 'CNPJ deve ter 14 dígitos';
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
    if (!validateStep2()) return;

    setLoading(true);
    try {
      // Prepare data for API
      const requestData: ManagerRegisterData = {
        name: managerData.name,
        email: managerData.email,
        password: managerData.password,
        company: {
          name: companyData.name,
          cnpj: companyData.cnpj.replace(/\D/g, ''),
          // Add optional fields only if filled
          ...(companyData.corporateName && { corporateName: companyData.corporateName }),
          ...(companyData.email && { email: companyData.email }),
          ...(companyData.phone && { phone: companyData.phone }),
          ...(companyData.website && { website: companyData.website }),
          ...(companyData.address && { address: companyData.address }),
          ...(companyData.addressNumber && { addressNumber: companyData.addressNumber }),
          ...(companyData.addressComplement && { addressComplement: companyData.addressComplement }),
          ...(companyData.neighborhood && { neighborhood: companyData.neighborhood }),
          ...(companyData.city && { city: companyData.city }),
          ...(companyData.state && { state: companyData.state }),
          ...(companyData.zipCode && { zipCode: companyData.zipCode.replace(/\D/g, '') }),
          ...(companyData.country && { country: companyData.country }),
          ...(companyData.description && { description: companyData.description }),
        },
        // Add optional manager fields only if filled
        ...(managerData.cpf && { cpf: managerData.cpf.replace(/\D/g, '') }),
        ...(managerData.rg && { rg: managerData.rg }),
        ...(managerData.birthDate && { birthDate: managerData.birthDate }),
        ...(managerData.gender && { gender: managerData.gender }),
        ...(managerData.maritalStatus && { maritalStatus: managerData.maritalStatus }),
        ...(managerData.phone && { phone: managerData.phone }),
        ...(managerData.mobilePhone && { mobilePhone: managerData.mobilePhone }),
        ...(managerData.address && { address: managerData.address }),
        ...(managerData.addressNumber && { addressNumber: managerData.addressNumber }),
        ...(managerData.addressComplement && { addressComplement: managerData.addressComplement }),
        ...(managerData.neighborhood && { neighborhood: managerData.neighborhood }),
        ...(managerData.city && { city: managerData.city }),
        ...(managerData.state && { state: managerData.state }),
        ...(managerData.zipCode && { zipCode: managerData.zipCode.replace(/\D/g, '') }),
        ...(managerData.country && { country: managerData.country }),
        ...(managerData.bankName && { bankName: managerData.bankName }),
        ...(managerData.bankAccount && { bankAccount: managerData.bankAccount }),
        ...(managerData.bankAgency && { bankAgency: managerData.bankAgency }),
        ...(managerData.bankAccountType && { bankAccountType: managerData.bankAccountType }),
        ...(managerData.pix && { pix: managerData.pix }),
        ...(managerData.emergencyContactName && { emergencyContactName: managerData.emergencyContactName }),
        ...(managerData.emergencyContactPhone && { emergencyContactPhone: managerData.emergencyContactPhone }),
        ...(managerData.emergencyContactRelationship && { emergencyContactRelationship: managerData.emergencyContactRelationship }),
        ...(managerData.education && { education: managerData.education }),
        ...(managerData.notes && { notes: managerData.notes }),
      };

      await registerManager(requestData);
      Alert.alert('Sucesso', 'Conta de gestor criada com sucesso!');
      // Navigation happens automatically via RootNavigator when isAuthenticated becomes true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ocorreu um erro. Tente novamente.';
      Alert.alert('Erro no Cadastro', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <Card style={styles.card}>
      <Text style={styles.sectionTitle}>Dados Pessoais do Gestor</Text>

      <Input
        label="Nome Completo *"
        placeholder="João Silva"
        value={managerData.name}
        onChangeText={(value) => handleManagerInputChange('name', value)}
        autoCapitalize="words"
        error={errors.name}
        editable={!loading}
      />

      <Input
        label="E-mail *"
        placeholder="voce@exemplo.com"
        value={managerData.email}
        onChangeText={(value) => handleManagerInputChange('email', value)}
        keyboardType="email-address"
        autoCapitalize="none"
        error={errors.email}
        editable={!loading}
      />

      <Input
        label="Senha *"
        placeholder="••••••••"
        value={managerData.password}
        onChangeText={(value) => handleManagerInputChange('password', value)}
        secureTextEntry
        autoCapitalize="none"
        error={errors.password}
        editable={!loading}
      />

      <Input
        label="Confirmar Senha *"
        placeholder="••••••••"
        value={managerData.confirmPassword}
        onChangeText={(value) => handleManagerInputChange('confirmPassword', value)}
        secureTextEntry
        autoCapitalize="none"
        error={errors.confirmPassword}
        editable={!loading}
      />

      <Input
        label="CPF"
        placeholder="000.000.000-00"
        value={managerData.cpf}
        onChangeText={(value) => handleManagerInputChange('cpf', value)}
        keyboardType="numeric"
        editable={!loading}
        maxLength={14}
      />

      <Input
        label="Telefone"
        placeholder="(00) 0000-0000"
        value={managerData.phone}
        onChangeText={(value) => handleManagerInputChange('phone', value)}
        keyboardType="phone-pad"
        editable={!loading}
        maxLength={14}
      />

      <Input
        label="Celular"
        placeholder="(00) 90000-0000"
        value={managerData.mobilePhone}
        onChangeText={(value) => handleManagerInputChange('mobilePhone', value)}
        keyboardType="phone-pad"
        editable={!loading}
        maxLength={15}
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
      <Text style={styles.sectionTitle}>Dados da Empresa</Text>

      <Input
        label="Nome da Empresa *"
        placeholder="Minha Empresa Ltda"
        value={companyData.name}
        onChangeText={(value) => handleCompanyInputChange('name', value)}
        autoCapitalize="words"
        error={errors.companyName}
        editable={!loading}
      />

      <Input
        label="CNPJ *"
        placeholder="00.000.000/0000-00"
        value={companyData.cnpj}
        onChangeText={(value) => handleCompanyInputChange('cnpj', value)}
        keyboardType="numeric"
        error={errors.cnpj}
        editable={!loading}
        maxLength={18}
      />

      <Input
        label="Razão Social"
        placeholder="Razão social da empresa"
        value={companyData.corporateName}
        onChangeText={(value) => handleCompanyInputChange('corporateName', value)}
        autoCapitalize="words"
        editable={!loading}
      />

      <Input
        label="E-mail da Empresa"
        placeholder="contato@empresa.com"
        value={companyData.email}
        onChangeText={(value) => handleCompanyInputChange('email', value)}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!loading}
      />

      <Input
        label="Telefone"
        placeholder="(00) 0000-0000"
        value={companyData.phone}
        onChangeText={(value) => handleCompanyInputChange('phone', value)}
        keyboardType="phone-pad"
        editable={!loading}
        maxLength={14}
      />

      <Input
        label="Website"
        placeholder="https://www.empresa.com"
        value={companyData.website}
        onChangeText={(value) => handleCompanyInputChange('website', value)}
        keyboardType="url"
        autoCapitalize="none"
        editable={!loading}
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
          Criar Conta
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
            <Text style={styles.title}>Cadastro de Gestor</Text>
            <Text style={styles.subtitle}>Crie sua conta e registre sua empresa</Text>

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