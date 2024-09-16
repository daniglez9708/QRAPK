import * as React from 'react';
import { DataTable } from 'react-native-paper';
import { TouchableOpacity, StyleSheet } from 'react-native';

interface Column {
  title: string;
  numeric?: boolean;
  key: string;
}

interface ReusableTableProps {
  columns: Column[];
  data: any[];
  itemsPerPageOptions?: number[];
  onRowPress?: (item: any) => void;
  rowStyle?: (item: any) => any; // Añadir esta línea
}

const ReusableTable: React.FC<ReusableTableProps> = ({
  columns,
  data,
  rowStyle,
  itemsPerPageOptions = [10],
  onRowPress,
}) => {
  const [page, setPage] = React.useState<number>(0);
  const [itemsPerPage, setItemsPerPage] = React.useState(itemsPerPageOptions[0]);

  const from = page * itemsPerPage;
  const to = Math.min((page + 1) * itemsPerPage, data.length);

  React.useEffect(() => {
    setPage(0);
  }, [itemsPerPage]);

  return (
    <DataTable>
      <DataTable.Header>
        {columns.map((column) => (
          <DataTable.Title key={column.key} numeric={column.numeric}>
            {column.title}
          </DataTable.Title>
        ))}
      </DataTable.Header>

      {data.slice(from, to).map((item, index) => (
        <TouchableOpacity key={index} onPress={() => onRowPress && onRowPress(item)}>
          <DataTable.Row style={rowStyle ? rowStyle(item) : null}>
            {columns.map((column) => (
              <DataTable.Cell key={column.key} numeric={column.numeric}>
                {item[column.key]}
              </DataTable.Cell>
            ))}
          </DataTable.Row>
        </TouchableOpacity>
      ))}

      <DataTable.Pagination
        page={page}
        numberOfPages={Math.ceil(data.length / itemsPerPage)}
        onPageChange={(page) => setPage(page)}
        label={`${from + 1}-${to} de ${data.length}`}
        numberOfItemsPerPageList={itemsPerPageOptions}
        numberOfItemsPerPage={itemsPerPage}
        showFastPaginationControls
        selectPageDropdownLabel={'Filas por página'}
      />
    </DataTable>
  );
};

const styles = StyleSheet.create({
  lowStockRow: {
    backgroundColor: '#ffcccc', // Color rojo claro
  },
});

export default ReusableTable;