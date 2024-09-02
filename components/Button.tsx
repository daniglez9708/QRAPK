import * as React from 'react';
import { Button } from 'react-native-paper';

const MyComponent: React.FC = () => (
  <Button icon="camera" mode="contained" onPress={()}>
    Press me
  </Button>
);

export default MyComponent;
