import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, TextInput, Checkbox, Card, Title, Paragraph, Dialog, Text } from 'react-native-paper';
import { supabase } from '../app/api/supabaseConfig';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { useRouter } from 'expo-router';
import { createTables, deleteTable, getUserTenantId } from '@/app/api/database';
import { LinearGradient } from 'expo-linear-gradient'; // Importar LinearGradient

export default function User() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [remember, setRemember] = useState<boolean>(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [tenantId, setTenantId] = useState<number | null>(null); // Estado para el tenant_id
  const [errorDialogVisible, setErrorDialogVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
  const [emailError, setEmailError] = useState<string>('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Por favor, introduzca un correo válido.');
    } else {
      setEmailError('');
    }
  };

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      setUser(session?.user ?? null);
    };
    //createTables();
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function onSubmit() {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      // Verifica si hay un error
      if (error) throw error;

      // Guarda el usuario en el estado
      const user = data.user;
      setUser(user);
      /*if (user.email) {
        const tenant_id = await getUserTenantId(user.email);
        setTenantId(tenant_id);
      }*/
      router.push('/(tabs)');
    } catch (error) {
      console.error("Error de inicio de sesión:", error); // Log del error
      setErrorMessage('Contrasena incorrecta, intente de nuevo.'); // Mensaje de error para el usuario
      setErrorDialogVisible(true); // Mostrar el diálogo de error
    } finally {
      setIsLoading(false);
      // Asegúrate de que se ejecute para eliminar el estado de carga
    }
  }

  async function handleLogout() {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      alert('Logout failed. Please try again.');
    }
  }

  return (
    <LinearGradient colors={['#164076', '#1a5a9a', '#4a90e2']} style={styles.gradient}>
      <View style={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>Iniciar sesión</Title>
            <Paragraph style={styles.text}>Introduzca su correo y su contraseña</Paragraph>
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
              onChangeText={setPassword}
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
            <View style={styles.checkboxContainer}>
              <Checkbox
                status={remember ? 'checked' : 'unchecked'}
                onPress={() => setRemember(!remember)}
                color="#183762"
              />
              <Text style={styles.checkboxLabel}>Recordarme</Text>
            </View>
          </Card.Content>
          <Card.Actions style={styles.actions}>
            <Button
              mode="contained"
              onPress={onSubmit}
              disabled={isLoading || !email || !password || !!emailError}
              buttonColor="#183762"
              style={styles.button}
            >
              <Text style={styles.buttonText}>{isLoading ? 'Cargando...' : 'Iniciar sesión'}</Text>
            </Button>
            <Text style={styles.link} onPress={() => {}}>Olvide mi contraseña?</Text>
            <Text style={styles.link} onPress={() => router.push('/screen/SignUp')}>
              No tienes cuenta? <Text style={styles.linkUnderline}>Crear Cuenta</Text>
            </Text>
          </Card.Actions>
        </Card>
        <Dialog visible={errorDialogVisible} onDismiss={() => setErrorDialogVisible(false)} style={styles.dialog}>
          <Dialog.Title style={styles.dialogTitle}>Error</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogText}>{errorMessage}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setErrorDialogVisible(false)} style={styles.dialogButton} labelStyle={styles.dialogButtonText} icon="close">
              OK
            </Button>
          </Dialog.Actions>
        </Dialog>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: 350,
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // Fondo semi-transparente para que el gradiente sea visible
  },
  title: {
    fontSize: 24,
    marginBottom: 8,
    color: '#183762',
  },
  button: {
    marginTop: 16,
    color: '#183762',
  },
  buttonText: {
    color: '#fff',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#183762',
  },
  orText: {
    marginHorizontal: 8,
    fontSize: 12,
    color: '#183762',
  },
  input: {
    marginBottom: 16,
    color: '#183762',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
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
  text: {
    color: '#183762',
  },
  dialog: {
    backgroundColor: 'white',
  },
  dialogTitle: {
    color: '#183762',
  },
  dialogText: {
    color: '#183762',
  },
  dialogButton: {
    backgroundColor: '#183762',
    marginHorizontal: 8,
  },
  dialogButtonText: {
    color: 'white',
  },
  errorText: {
    color: 'red',
    marginBottom: 16,
  },
});