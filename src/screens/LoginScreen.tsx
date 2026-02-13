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

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  ManagerRegister: undefined;
  EmployeeRegister: undefined;
  Dashboard: undefined;
};

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'E-mail inválido';
    }

    if (!password) {
      newErrors.password = 'Senha é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await login(email, password);
      // Navigation happens automatically via RootNavigator when isAuthenticated becomes true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ocorreu um erro. Tente novamente.';
      Alert.alert('Erro no Login', errorMessage);
    } finally {
      setLoading(false);
    }
  };

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
            <Text style={styles.title}>Bem-vindo de volta</Text>
            <Text style={styles.subtitle}>Entre na sua conta para continuar</Text>

            <Card style={styles.card}>
              <Input
                label="E-mail"
                placeholder="voce@exemplo.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                error={errors.email}
                editable={!loading}
              />

              <Input
                label="Senha"
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                error={errors.password}
                editable={!loading}
              />

              <Button
                variant="primary"
                onPress={handleLogin}
                loading={loading}
                style={styles.loginButton}
              >
                Entrar
              </Button>
            </Card>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Não tem uma conta? </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Register')}
                disabled={loading}
              >
                <Text style={styles.footerLink}>Cadastre-se</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.registerOptions}>
              <Text style={styles.registerOptionsTitle}>Ou escolha seu tipo de cadastro:</Text>
              
              <Button
                variant="secondary"
                onPress={() => navigation.navigate('ManagerRegister')}
                disabled={loading}
                style={styles.registerOptionButton}
              >
                Sou Gestor
              </Button>
              
              <Button
                variant="secondary"
                onPress={() => navigation.navigate('EmployeeRegister')}
                disabled={loading}
                style={styles.registerOptionButton}
              >
                Sou Funcionário
              </Button>
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
    justifyContent: 'center',
    padding: spacing.lg,
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
  card: {
    marginBottom: spacing.lg,
  },
  loginButton: {
    marginTop: spacing.md,
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
  registerOptions: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.warmGrey[200],
  },
  registerOptionsTitle: {
    fontSize: fontSize.sm,
    color: colors.warmGrey[700],
    textAlign: 'center',
    marginBottom: spacing.md,
    fontWeight: fontWeight.medium,
  },
  registerOptionButton: {
    marginBottom: spacing.sm,
  },
});
