import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, TextInput, StyleSheet } from 'react-native';
import { supabase } from '../api/supabaseConfig';
import { User } from '@supabase/supabase-js';
import { getUser, deleteNonAdminUsers, deleteTable, createTables } from '../api/database';

interface UserLocal {
  id: string;
  email: string;
  password: string;
  user_role: string;
  tenant_id: number;
}

const AdminUsuarios = () => {
  const [usuarios, setUsuarios] = useState<UserLocal[]>([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    //createTables();
    //deleteTable();
    //deleteNonAdminUsers();
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    setRefreshing(true);
    const user = await getUser();
    console.log("entrooooo");
    
    console.log(user);
    
    if (!user) {
      console.log(error);
      setError('Error al obtener los usuarios');
    } else {
      setUsuarios(user as UserLocal[]);
    }
    setRefreshing(false);
  };

  const addUser = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      setError('Error al agregar el usuario');
    } else {
      fetchUsuarios();
    }
  };

  const deleteUser = async (id: string) => {
    const { error } = await supabase.auth.admin.deleteUser(id);
    if (error) {
      setError('Error al eliminar el usuario');
    } else {
      fetchUsuarios();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Administración de Usuarios</Text>
      {error && <Text style={styles.error}>{error}</Text>}
      <FlatList
        data={usuarios}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.userContainer}>
            <Text style={styles.userText}>ID: {item.id}</Text>
            <Text style={styles.userText}>Email: {item.email}</Text>
            <Text style={styles.userText}>Role: {item.user_role}</Text>
            <Text style={styles.userText}>Tenant ID: {item.tenant_id}</Text>
            <Button title="Eliminar" onPress={() => deleteUser(item.id)} />
          </View>
        )}
        refreshing={refreshing}
        onRefresh={fetchUsuarios}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Agregar Usuario" onPress={addUser} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  error: {
    color: 'red',
    marginBottom: 16,
  },
  userContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  userText: {
    fontSize: 16,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginBottom: 8,
    borderRadius: 4,
  },
});

export default AdminUsuarios;