import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { DataTable, Provider as PaperProvider, DefaultTheme } from 'react-native-paper';

const MyComponent = () => {
  const [page, setPage] = React.useState<number>(0);
  const [numberOfItemsPerPageList] = React.useState([2, 3, 4]);
  const [itemsPerPage, onItemsPerPageChange] = React.useState(
    numberOfItemsPerPageList[0]
  );

  const [items] = React.useState([
    {
      key: 1,
      name: 'Cupcake',
      calories: 356,
      fat: 16,
    },
    {
      key: 2,
      name: 'Eclair',
      calories: 262,
      fat: 16,
    },
    {
      key: 3,
      name: 'Frozen yogurt',
      calories: 159,
      fat: 6,
    },
    {
      key: 4,
      name: 'Gingerbread',
      calories: 305,
      fat: 3.7,
    },
  ]);

  return (
    <PaperProvider >
      <View style={styles.container}>
        <DataTable style={styles.table}>
          <DataTable.Header style={styles.header}>
            <DataTable.Title textStyle={styles.text}>Dessert</DataTable.Title>
            <DataTable.Title numeric textStyle={styles.text}>Calories</DataTable.Title>
            <DataTable.Title numeric textStyle={styles.text}>Fat</DataTable.Title>
          </DataTable.Header>

          {items.map(item => (
            <DataTable.Row key={item.key} style={styles.row}>
              <DataTable.Cell textStyle={styles.text}>{item.name}</DataTable.Cell>
              <DataTable.Cell numeric textStyle={styles.text}>{item.calories}</DataTable.Cell>
              <DataTable.Cell numeric textStyle={styles.text}>{item.fat}</DataTable.Cell>
            </DataTable.Row>
          ))}

          <DataTable.Pagination
            page={page}
            numberOfPages={Math.ceil(items.length / itemsPerPage)}
            onPageChange={page => setPage(page)}
            label={`${page + 1} of ${Math.ceil(items.length / itemsPerPage)}`}
            numberOfItemsPerPageList={numberOfItemsPerPageList}
            numberOfItemsPerPage={itemsPerPage}
            onItemsPerPageChange={onItemsPerPageChange}
            showFastPaginationControls
            selectPageDropdownLabel={'Rows per page'}
            paginationControlRippleColor= '#102341'
          />
        </DataTable>
      </View>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 16,
  },
  table: {
    width: '100%',
  },
  header: {
   
  },
  row: {
    
  },
  text: {
    color: 'black',
  },
});

export default MyComponent;