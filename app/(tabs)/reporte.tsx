import { router } from 'expo-router';
import * as React from 'react';
import { deleteTable, createTables, getTableInfo } from '../api/database';
import  { useState, useEffect } from 'react';
import { List, Provider as PaperProvider } from 'react-native-paper';
import AdminUsuarios from '../screen/admin_user';
// import User from '@/components/User';

const MyComponent = () => {
  const [expanded, setExpanded] = React.useState(true);

  const handlePress = () => setExpanded(!expanded);



  return (
    <AdminUsuarios />
    
  );
};



export default MyComponent;