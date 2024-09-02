import { router } from 'expo-router';
import * as React from 'react';
import { List, Provider as PaperProvider } from 'react-native-paper';

const MyComponent = () => {
  const [expanded, setExpanded] = React.useState(true);

  const handlePress = () => setExpanded(!expanded);


  return (
    <PaperProvider >
      <List.Section >
        <List.Accordion
          title="Controlled Accordion"
          titleStyle={{ color: 'white' }}
          left={props => <List.Icon {...props} icon="folder" color="white" />}
          expanded={expanded}
          onPress={handlePress}>
          <List.Item title="Productos" titleStyle={{ color: 'black' }} onPress={() => router.push('/screen/admin_product')}/>
          <List.Item title="Ventas" titleStyle={{ color: 'black' }} onPress={() => router.push('/screen/admin_ventas')}/>
        </List.Accordion>
      </List.Section>
    </PaperProvider>
  );
};



export default MyComponent;