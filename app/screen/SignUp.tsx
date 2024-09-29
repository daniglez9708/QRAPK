import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Button, TextInput, Checkbox, Card, Title, Paragraph, ActivityIndicator, RadioButton } from 'react-native-paper';
import { useRouter } from 'expo-router';

export default function SignUpForm() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [agreeTerms, setAgreeTerms] = useState<boolean>(false);
  const [role, setRole] = useState<string>('employee'); // Default to 'employee'
  const router = useRouter();

  async function onSubmit() {
    if (password !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      // Aquí deberías agregar la lógica para registrar al usuario en tu base de datos
      // incluyendo el campo `role` para determinar si es dueño o empleado.
      // Ejemplo:
      // await supabase.auth.signUp({ email, password, data: { role } });

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
            label="Correo"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            style={styles.input}
            placeholder="m@example.com"
            outlineColor="#183762"
            activeOutlineColor="#183762"
          />
          <TextInput
            label="Contraseña"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry
            style={styles.input}
            outlineColor="#183762"
            activeOutlineColor="#183762"
          />
          <TextInput
            label="Confirmar Contraseña"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            mode="outlined"
            secureTextEntry
            style={styles.input}
            outlineColor="#183762"
            activeOutlineColor="#183762"
          />
          <Text style={styles.roleLabel}>Usted es:</Text>
          <RadioButton.Group onValueChange={value => setRole(value)} value={role}>
            <View style={styles.radioButtonRow}>
              <View style={styles.radioButtonContainer}>
                <RadioButton value="owner" color='#183762' />
                <Text style={styles.radioButtonLabel}>Dueño</Text>
              </View>
              <View style={styles.radioButtonContainer}>
                <RadioButton value="employee" color='#183762' />
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
            disabled={isLoading || !email || !password || !agreeTerms}
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
});