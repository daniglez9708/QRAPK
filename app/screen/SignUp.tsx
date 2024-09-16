import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Button, TextInput, Checkbox, Card, Title, Paragraph, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';

export default function SignUpForm() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [agreeTerms, setAgreeTerms] = useState<boolean>(false);
  const router = useRouter();
  
  async function onSubmit() {
    setIsLoading(true);

    // Simulate a network request
    setTimeout(() => {
      setIsLoading(false);
    }, 3000);
  }

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Create Account</Title>
          <Paragraph>Fill in the details to create a new account</Paragraph>
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
          <TextInput
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            mode="outlined"
            secureTextEntry
            style={styles.input}
          />
          <View style={styles.checkboxContainer}>
            <Checkbox
              status={agreeTerms ? 'checked' : 'unchecked'}
              onPress={() => setAgreeTerms(!agreeTerms)}
            />
            <Text style={styles.checkboxLabel}>I agree to the Terms and Conditions</Text>
          </View>
        </Card.Content>
        <Card.Actions style={styles.actions}>
          <Button mode="contained" onPress={onSubmit} disabled={isLoading || !agreeTerms} style={styles.button}>
            {isLoading && <ActivityIndicator animating={true} size="small" style={styles.spinner} />}
            Sign Up
          </Button>
          <Text style={styles.link} onPress={() => router.push('/screen/login')}>
            Already have an account? <Text style={styles.linkUnderline}>Sign in</Text>
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