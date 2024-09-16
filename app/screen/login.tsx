import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, TextInput, Checkbox, Card, Title, Paragraph, ActivityIndicator } from 'react-native-paper';

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [remember, setRemember] = useState<boolean>(false);
  const router = useRouter();
  async function onSubmit() {
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
    }, 3000);
  }

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Login</Title>
          <Paragraph>Choose your preferred login method</Paragraph>
          <Button mode="outlined" onPress={() => {}} style={styles.button}>
            <Text>Google</Text>
          </Button>
          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.orText}>Or continue with</Text>
            <View style={styles.line} />
          </View>
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            style={styles.input}
            placeholder="m@example.com"
          />
          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry
            style={styles.input}
          />
          <View style={styles.checkboxContainer}>
            <Checkbox
              status={remember ? 'checked' : 'unchecked'}
              onPress={() => setRemember(!remember)}
            />
            <Text style={styles.checkboxLabel}>Remember me</Text>
          </View>
        </Card.Content>
        <Card.Actions style={styles.actions}>
          <Button mode="contained" onPress={onSubmit} disabled={isLoading} style={styles.button}>
            {isLoading && <ActivityIndicator animating={true} size="small" style={styles.spinner} />}
            Sign In
          </Button>
          <Text style={styles.link} onPress={() => {}}>Forgot password?</Text>
          <Text style={styles.link} onPress={() => router.push('/screen/SignUp')}>
            Don't have an account? <Text style={styles.linkUnderline}>Sign up</Text>
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
  },
  title: {
    fontSize: 24,
    marginBottom: 8,
  },
  button: {
    marginTop: 16,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#ccc',
  },
  orText: {
    marginHorizontal: 8,
    fontSize: 12,
    color: '#888',
  },
  input: {
    marginBottom: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkboxLabel: {
    marginLeft: 8,
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
    color: '#1e90ff',
  },
  linkUnderline: {
    textDecorationLine: 'underline',
  },
});