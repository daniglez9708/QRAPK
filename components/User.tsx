import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, TextInput, Checkbox, Card, Title, Paragraph, ActivityIndicator, Text } from 'react-native-paper';
import { supabase } from '../app/api/supabaseConfig';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { useRouter } from 'expo-router';

export default function User() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [remember, setRemember] = useState<boolean>(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const router = useRouter();

  useEffect(() => {
    const getSession = async () => {
      console.log("Obteniendo sesión actual...");
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      console.log("Sesión obtenida:", session);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Cambio en el estado de autenticación:", _event, session);
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
      console.log("Suscripción de autenticación cancelada");
    };
  }, []);

  async function onSubmit() {
    setIsLoading(true);
    console.log("Iniciando sesión con:", email, password);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      // Verifica si hay un error
      if (error) throw error;

      // Guarda el usuario en el estado
      const user = data.user;
      setUser(user);
      console.log("Usuario autenticado:", user);

      // Navegar a la pantalla principal después del inicio de sesión exitoso
      console.log("Navegando a /tabs/two");
      router.push('/(tabs)/two');
    } catch (error) {
      console.error("Error de inicio de sesión:", error); // Log del error
      alert('Login failed. Please check your credentials.'); // Mensaje de error para el usuario
    } finally {
      setIsLoading(false);
      console.log("Finalmente"); // Este log debería ejecutarse siempre
      // Asegúrate de que se ejecute para eliminar el estado de carga
    }
  }

  async function handleLogout() {
    try {
      await supabase.auth.signOut();
      setUser(null);
      console.log("Usuario desconectado");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      alert('Logout failed. Please try again.');
    }
  }

  return (
    <View style={styles.container}>
      {user ? (
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.text}>Bienvenido, {user.email}</Title>
            <Paragraph style={styles.text}>You are logged in.</Paragraph>
            <Button mode="contained" onPress={handleLogout} style={styles.button}>
              <Text style={styles.buttonText}>Logout</Text>
            </Button>
          </Card.Content>
        </Card>
      ) : (
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>Iniciar sesión</Title>
            <Paragraph style={styles.text}>Introduzca su correo y su contraseña</Paragraph>
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
            <Button mode="contained" onPress={onSubmit} disabled={isLoading} buttonColor="#183762" style={styles.button}>
              <Text style={styles.buttonText}>{isLoading ? 'Cargando...' : 'Iniciar sesión'}</Text>
            </Button>
            <Text style={styles.link} onPress={() => {}}>Olvide mi contraseña?</Text>
            <Text style={styles.link} onPress={() => router.push('/screen/SignUp')}>
              No tienes cuenta? <Text style={styles.linkUnderline}>Crear Cuenta</Text>
            </Text>
          </Card.Actions>
        </Card>
      )}
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
});