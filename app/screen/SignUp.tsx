import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Button, TextInput, Checkbox, Card, Title, Paragraph, ActivityIndicator, RadioButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { supabase } from '../api/supabaseConfig';
import { addUsers } from '../api/database';
import * as Crypto from 'expo-crypto';

export default function SignUpForm() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [agreeTerms, setAgreeTerms] = useState<boolean>(false);
  const [role, setRole] = useState<string>('dueno'); // Default to 'employee'
  const [emailError, setEmailError] = useState<string>('');
  const [nameError, setNameError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState<boolean>(false);
  const router = useRouter();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Por favor, introduzca un correo válido.');
    } else {
      setEmailError('');
    }
  };
  const validateName = (name: string) => {
    if (name.length < 2) {
      setNameError('Por favor, introduzca un nombre válido.');
    } else {
      setNameError('');
    }
  }
  const generateTenantId = async (email: string): Promise<number> => {
    const hash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, email);
    // Convertir los primeros 8 caracteres del hash en un número
    const tenantId = parseInt(hash.substring(0, 8), 16);
    return tenantId;
  };

  const validatePasswords = (password: string, confirmPassword: string) => {
    if (password !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden.');
    } else {
      setPasswordError('');
    }
  };

  async function onSubmit() {
    validatePasswords(password, confirmPassword);
    if (passwordError) {
      return;
    }

    setIsLoading(true);
    try {
      //const user_register = await supabase.auth.signUp({ email, password });
      //if (user_register.error) throw user_register.error;
      //const hashedPassword = await bcrypt.hash(password, 10);
      if (role === 'empleado') {
        await addUsers(email, password, role, 0);
        return;
      }
      generateTenantId(email).then(async (tenantId) => {
        console.log(`role ${role}`);
        await addUsers(email, password, role, tenantId);
      });
      // Navegar a la pantalla principal después del registro exitoso
      router.push('/(tabs)');
    } catch (error) {
      console.error(error);
      if ((error as { code: string }).code === 'auth/network-request-failed') {
        alert('Network error. Please check your internet connection and try again.');
      } else {
        alert('Sign up failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Crear Cuenta</Title>
          <Paragraph style={styles.paragrap}>Complete los datos para crear una nueva cuenta</Paragraph>
          <TextInput
            label="Nombre y Apellido"
            value={name}
            onChangeText={(text) => {
              setName(text);
              validateName(text);
            }}
            mode="outlined"
            style={styles.input}
            placeholder="Nombre"
            outlineColor="#183762"
            activeOutlineColor="#183762"
            error={!!nameError}
          />
          <TextInput
            label="Correo"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              validateEmail(text);
            }}
            mode="outlined"
            style={styles.input}
            placeholder="m@example.com"
            outlineColor="#183762"
            activeOutlineColor="#183762"
            error={!!emailError}
          />
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
          <TextInput
            label="Contraseña"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              validatePasswords(text, confirmPassword);
            }}
            mode="outlined"
            secureTextEntry={!passwordVisible}
            style={styles.input}
            outlineColor="#183762"
            activeOutlineColor="#183762"
            right={
              <TextInput.Icon
                icon={passwordVisible ? "eye-off" : "eye"}
                onPress={() => setPasswordVisible(!passwordVisible)}
              />
            }
          />
          <TextInput
            label="Confirmar Contraseña"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              validatePasswords(password, text);
            }}
            mode="outlined"
            secureTextEntry={!confirmPasswordVisible}
            style={styles.input}
            outlineColor="#183762"
            activeOutlineColor="#183762"
            error={!!passwordError}
            right={
              <TextInput.Icon
                icon={confirmPasswordVisible ? "eye-off" : "eye"}
                onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
              />
            }
          />
          {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
          <Text style={styles.roleLabel}>Usted es:</Text>
          <RadioButton.Group onValueChange={value => setRole(value)} value={role}>
            <View style={styles.radioButtonRow}>
              <View style={styles.radioButtonContainer}>
                <RadioButton value="dueno" color='#183762' />
                <Text style={styles.radioButtonLabel}>Dueño</Text>
              </View>
              <View style={styles.radioButtonContainer}>
                <RadioButton value="empleado" color='#183762' />
                <Text style={styles.radioButtonLabel}>Empleado</Text>
              </View>
            </View>
          </RadioButton.Group>
          <View style={styles.checkboxContainer}>
            <Checkbox
              status={agreeTerms ? 'checked' : 'unchecked'}
              onPress={() => setAgreeTerms(!agreeTerms)}
              color='#183762'
            />
            <Text style={styles.checkboxLabel}>Acepto los Términos y Condiciones</Text>
          </View>
        </Card.Content>
        <Card.Actions style={styles.actions}>
          <Button
            mode="contained"
            onPress={onSubmit}
            disabled={isLoading || !email || !password || !agreeTerms || !!emailError || !!passwordError}
            buttonColor="#183762"
            style={styles.button}
          >
            {isLoading && <ActivityIndicator animating={true} size="small" style={styles.spinner} />}
            Crear
          </Button>
          <Text style={styles.link} onPress={() => router.replace('/modal')}>
            ¿Ya tienes una cuenta? <Text style={styles.linkUnderline}>Iniciar sesión</Text>
          </Text>
        </Card.Actions>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  card: {
    width: 350,
    backgroundColor: 'white',
    borderColor: '#183762',
    borderWidth: 2,
  },
  title: {
    fontSize: 24,
    marginBottom: 8,
    color: '#183762',
    fontWeight: 'bold',
  },
  button: {
    marginTop: 16,
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'white',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    color: '#183762',
  },
  checkboxLabel: {
    marginLeft: 8,
    color: '#183762',
  },
  actions: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  spinner: {
    marginRight: 8,
  },
  link: {
    marginTop: 16,
    color: '#183762',
  },
  linkUnderline: {
    textDecorationLine: 'underline',
    color: '#183762',
  },
  paragrap: {
    color: '#183762',
    marginBottom: 16,
  },
  radioButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  radioButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioButtonLabel: {
    marginLeft: 8,
    color: '#183762',
  },
  roleLabel: {
    marginBottom: 8,
    color: '#183762',
  },
  errorText: {
    color: 'red',
    marginBottom: 16,
  },
});