import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { Button, Input, Card, Loading } from '../components';
import { colors, spacing, fontSize, fontWeight } from '../theme';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { Company, UpdateCompanyData } from '../types';

type RootStackParamList = {
  ManagerDashboard: undefined;
  CompanyManagement: undefined;
  InvitationsManagement: undefined;
  EmployeesApproval: undefined;
  Dashboard: undefined;
};

type CompanyManagementScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CompanyManagement'>;

interface CompanyManagementScreenProps {
  navigation: CompanyManagementScreenNavigationProp;
}

export const CompanyManagementScreen: React.FC<CompanyManagementScreenProps> = ({ navigation }) => {
  const { api } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [company, setCompany] = useState<Company | null>(null);
  const [formData, setFormData] = useState<UpdateCompanyData>({
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
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 5) return numbers;
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
  };

  const handleInputChange = (field: keyof UpdateCompanyData, value: string) => {
    let formattedValue = value;

    // Apply formatting based on field type
    if (field === 'cnpj') {
      formattedValue = formatCNPJ(value);
    } else if (field === 'phone') {
      formattedValue = formatPhone(value);
    } else if (field === 'zipCode') {
      formattedValue = formatCEP(value);
    }

    setFormData(prev => ({ ...prev, [field]: formattedValue }));
  };

  const loadCompany = async () => {
    try {
      const response = await api.getCompany();
      setCompany(response.company);
      
      // Populate form with company data
      setFormData({
        name: response.company.name || '',
        cnpj: response.company.cnpj || '',
        corporateName: response.company.corporateName || '',
        email: response.company.email || '',
        phone: response.company.phone || '',
        website: response.company.website || '',
        address: response.company.address || '',
        addressNumber: response.company.addressNumber || '',
        addressComplement: response.company.addressComplement || '',
        neighborhood: response.company.neighborhood || '',
        city: response.company.city || '',
        state: response.company.state || '',
        zipCode: response.company.zipCode || '',
        country: response.company.country || 'Brasil',
        description: response.company.description || '',
      });
    } catch (error) {
      console.error('Error loading company:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados da empresa');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name || formData.name.length < 3) {
      newErrors.name = 'Nome da empresa é obrigatório';
    }

    if (!formData.cnpj || formData.cnpj.replace(/\D/g, '').length !== 14) {
      newErrors.cnpj = 'CNPJ deve ter 14 dígitos';
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'E-mail inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const updateData: UpdateCompanyData = {
        name: formData.name,
        cnpj: formData.cnpj.replace(/\D/g, ''),
        // Only include fields that have values
        ...(formData.corporateName && { corporateName: formData.corporateName }),
        ...(formData.email && { email: formData.email }),
        ...(formData.phone && { phone: formData.phone }),
        ...(formData.website && { website: formData.website }),
        ...(formData.address && { address: formData.address }),
        ...(formData.addressNumber && { addressNumber: formData.addressNumber }),
        ...(formData.addressComplement && { addressComplement: formData.addressComplement }),
        ...(formData.neighborhood && { neighborhood: formData.neighborhood }),
        ...(formData.city && { city: formData.city }),
        ...(formData.state && { state: formData.state }),
        ...(formData.zipCode && { zipCode: formData.zipCode.replace(/\D/g, '') }),
        ...(formData.country && { country: formData.country }),
        ...(formData.description && { description: formData.description }),
      };

      const response = await api.updateCompany(updateData);
      setCompany(response.company);
      setEditing(false);
      Alert.alert('Sucesso', 'Dados da empresa atualizados com sucesso!');
    } catch (error) {
      console.error('Error updating company:', error);
      Alert.alert('Erro', 'Não foi possível atualizar os dados da empresa');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (company) {
      // Reset form to original company data
      setFormData({
        name: company.name || '',
        cnpj: company.cnpj || '',
        corporateName: company.corporateName || '',
        email: company.email || '',
        phone: company.phone || '',
        website: company.website || '',
        address: company.address || '',
        addressNumber: company.addressNumber || '',
        addressComplement: company.addressComplement || '',
        neighborhood: company.neighborhood || '',
        city: company.city || '',
        state: company.state || '',
        zipCode: company.zipCode || '',
        country: company.country || 'Brasil',
        description: company.description || '',
      });
    }
    setEditing(false);
    setErrors({});
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadCompany();
  };

  useEffect(() => {
    loadCompany();
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
            <Text style={styles.title}>Gestão da Empresa</Text>
            <Text style={styles.subtitle}>
              {editing ? 'Editando dados da empresa' : 'Visualizando dados da empresa'}
            </Text>
          </View>

          <Card style={styles.card}>
            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              {!editing ? (
                <Button
                  variant="primary"
                  onPress={() => setEditing(true)}
                  style={styles.editButton}
                >
                  Editar Empresa
                </Button>
              ) : (
                <View style={styles.editActions}>
                  <Button
                    variant="secondary"
                    onPress={handleCancel}
                    style={styles.cancelButton}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="primary"
                    onPress={handleSave}
                    loading={saving}
                    style={styles.saveButton}
                  >
                    Salvar
                  </Button>
                </View>
              )}
            </View>

            {/* Company Information */}
            <Text style={styles.sectionTitle}>Informações Básicas</Text>

            <Input
              label="Nome da Empresa *"
              placeholder="Minha Empresa Ltda"
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              autoCapitalize="words"
              error={errors.name}
              editable={editing}
            />

            <Input
              label="CNPJ *"
              placeholder="00.000.000/0000-00"
              value={formData.cnpj}
              onChangeText={(value) => handleInputChange('cnpj', value)}
              keyboardType="numeric"
              error={errors.cnpj}
              editable={editing}
              maxLength={18}
            />

            <Input
              label="Razão Social"
              placeholder="Razão social da empresa"
              value={formData.corporateName}
              onChangeText={(value) => handleInputChange('corporateName', value)}
              autoCapitalize="words"
              editable={editing}
            />

            <Input
              label="E-mail"
              placeholder="contato@empresa.com"
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
              editable={editing}
            />

            <Input
              label="Telefone"
              placeholder="(00) 0000-0000"
              value={formData.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
              keyboardType="phone-pad"
              editable={editing}
              maxLength={14}
            />

            <Input
              label="Website"
              placeholder="https://www.empresa.com"
              value={formData.website}
              onChangeText={(value) => handleInputChange('website', value)}
              keyboardType="url"
              autoCapitalize="none"
              editable={editing}
            />

            <Text style={styles.sectionTitle}>Endereço</Text>

            <Input
              label="Endereço"
              placeholder="Rua das Flores, 123"
              value={formData.address}
              onChangeText={(value) => handleInputChange('address', value)}
              autoCapitalize="words"
              editable={editing}
            />

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Input
                  label="Número"
                  placeholder="123"
                  value={formData.addressNumber}
                  onChangeText={(value) => handleInputChange('addressNumber', value)}
                  keyboardType="numeric"
                  editable={editing}
                />
              </View>
              <View style={styles.halfWidth}>
                <Input
                  label="CEP"
                  placeholder="00000-000"
                  value={formData.zipCode}
                  onChangeText={(value) => handleInputChange('zipCode', value)}
                  keyboardType="numeric"
                  editable={editing}
                  maxLength={9}
                />
              </View>
            </View>

            <Input
              label="Complemento"
              placeholder="Apto 101, Bloco A"
              value={formData.addressComplement}
              onChangeText={(value) => handleInputChange('addressComplement', value)}
              autoCapitalize="words"
              editable={editing}
            />

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Input
                  label="Bairro"
                  placeholder="Centro"
                  value={formData.neighborhood}
                  onChangeText={(value) => handleInputChange('neighborhood', value)}
                  autoCapitalize="words"
                  editable={editing}
                />
              </View>
              <View style={styles.halfWidth}>
                <Input
                  label="Cidade"
                  placeholder="São Paulo"
                  value={formData.city}
                  onChangeText={(value) => handleInputChange('city', value)}
                  autoCapitalize="words"
                  editable={editing}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Input
                  label="Estado"
                  placeholder="SP"
                  value={formData.state}
                  onChangeText={(value) => handleInputChange('state', value)}
                  autoCapitalize="characters"
                  editable={editing}
                  maxLength={2}
                />
              </View>
              <View style={styles.halfWidth}>
                <Input
                  label="País"
                  placeholder="Brasil"
                  value={formData.country}
                  onChangeText={(value) => handleInputChange('country', value)}
                  autoCapitalize="words"
                  editable={editing}
                />
              </View>
            </View>

            <Text style={styles.sectionTitle}>Descrição</Text>

            <Input
              label="Descrição da Empresa"
              placeholder="Descreva sua empresa..."
              value={formData.description}
              onChangeText={(value) => handleInputChange('description', value)}
              multiline
              numberOfLines={4}
              editable={editing}
            />
          </Card>

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
  card: {
    marginBottom: spacing.xl,
  },
  actionButtons: {
    marginBottom: spacing.lg,
  },
  editButton: {
    marginBottom: spacing.md,
  },
  editActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.warmGrey[800],
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfWidth: {
    flex: 1,
  },
  backButton: {
    marginTop: spacing.lg,
  },
});