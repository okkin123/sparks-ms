import React, {useEffect, useState, useRef} from 'react' 
import {Box, Chip} from '@mui/material'
import AxiosInstance from '../../../../AxiosInstance';
import {
    MaterialReactTable,
  } from 'material-react-table';
import { theme } from '../../../../Theme';
import dayjs from 'dayjs';
import SupplierExpenseColumnFilter from './SupplierExpenseColumnFilter';
import { NumericFormat } from 'react-number-format';

const columns=[
    {
        accessorKey: 'supplier_name',
        header: 'SUPPLIER_NAME'
    },  
    {
        accessorKey: 'status',
        header: 'STATUS'
    },  
    {
        accessorKey: 'mode_of_payment',
        header: 'MODE OF PAYMENT',
        Cell: ({ renderedCellValue }) => (
        <Chip 
            label={renderedCellValue} 
            size="small"
            color={renderedCellValue === 'Cash' ? 'success' : renderedCellValue === 'Online Transfer' ? 'warning' : 'info' }
        />
        )
    },  
    {
        accessorKey: 'date',
        header: 'DATE'
    },  
    {
        accessorKey: 'cheque_no',
        header: 'CHEQUE NO.',
        Cell: ({ renderedCellValue }) => (
            renderedCellValue === 0 ? '' : renderedCellValue
        )
    },  
    {
        accessorKey: 'reference_no',
        header: 'REFERENCE NO.'
    },  
    {
        accessorKey: 'amount',
        header: 'AMOUNT',
        Cell: ({ renderedCellValue }) => (
            <NumericFormat
            value={renderedCellValue}
            displayType={'text'}
            thousandSeparator={true}
            decimalScale={2}
            fixedDecimalScale={true}
          />
        )
    },
    {
        accessorKey: 'currency',
        header: 'CURRENCY'
    }, 
    {
        accessorKey: 'processed_by',
        header: 'PROCESSED BY'
    },  
    {
        accessorKey: 'voided_by',
        header: 'VOIDED BY'
    }
];



export default function ListSupplierExpensePayments(){
   const [supplierPayments, setSupplierPayments] = useState([]);
   const [filteredData, setFilteredData] = useState([]);
   const [loading, setLoading] = useState({
    make_payment: false,
    table: false
   })

   const [refresh, setRefresh] = useState(false)


    useEffect(()=>{
        setLoading((loading)=>({...loading, table: true}))
        AxiosInstance.get("/project_expense/get_supplier_payments")
        .then(function(result){
            if(result.data.status === 'SUCCESS'){
                const fetchedSupplierPayments = result.data.supplier_payments.map((element) => ({
                    supplier_name: element.supplier_name,
                    status: element.status,
                    mode_of_payment: element.mode_of_payment,
                    date: dayjs(new Date(element.date)).format('DD-MMM-YYYY'),
                    cheque_no: element.cheque_no,
                    reference_no: element.reference_no,
                    amount: element.amount,
                    currency: element.currency,
                    processed_by: element.processed_by,
                    voided_by: element.voided_by,
                    subRows: element.details
                  })); 
                
                  setSupplierPayments(fetchedSupplierPayments)
                  setFilteredData(fetchedSupplierPayments);
                  setLoading((loading)=>({...loading, table: false}))
            }else{
                console.log(result.data.message)
            }
        })
        .catch(function(error){
            console.log(error)
        })
    },[refresh])


    const handleFilter = (filters) => {
        const newFilteredData = supplierPayments.filter(row => {
          const columnMatch = filters.column
            ? row[filters.column].toString().toLowerCase().includes(filters.value.toLowerCase())
            : true;
          const dateMatch = filters.fromDate && filters.toDate
            ? dayjs(new Date(row.date)).isBetween(filters.fromDate, filters.toDate, null, '[]')
            : true;
          return columnMatch && dateMatch;
        });
        setFilteredData(newFilteredData);
      };




    const stackRef = useRef(null);
    const tableBodyRef = useRef(null);
    const [box, setBox] = useState({
        width: 0,
        height: 0
    });


    useEffect(() => {
    const updateBox = () => {
        if (stackRef.current) {
        setBox({
            width: stackRef.current.offsetWidth,
            height: 500
        });
        }
    };

    updateBox();
    window.addEventListener('resize', updateBox);

    return () => {
        window.removeEventListener('resize', updateBox);
    };
    }, []);

    return(
        <Box
        ref={stackRef}
        sx={{ width: '100%'}}
            >
            <MaterialReactTable
                enableColumnFilters={false}
                enableColumnActions={false}
                enableDensityToggle={false}
                enableHiding={false}
                enableGlobalFilter={false}
                enableFullScreenToggle={false}
                enableExpandAll={false} // hide expand all double arrow in column header
                enableExpanding
                filterFromLeafRows={true} // apply filtering to all rows instead of just parent rows
                getSubRows={(row) => row.subRows} // default
                paginateExpandedRows={false} // When rows are expanded, do not count sub-rows as number of rows on the page towards pagination
                initialState={{
                    density: 'compact',
                    expanded: false,
                    isLoading: loading.table,
                    columnPinning: { left: ['mrt-row-expand', 'supplier_name', 'status'] }
                }}
                state={{
                    isLoading: loading.table
                }}
                muiTableHeadCellProps={{
                    sx: {
                    backgroundColor: theme.palette.primary.main,
                    color: 'white',
                    '& .MuiTableSortLabel-root': {
                        color: 'white',
                        '&.Mui-active': {
                        color: 'white',
                        },
                        '& .MuiTableSortLabel-icon': {
                        color: 'white !important',
                        },
                    },
                    }
                }}
                muiSelectAllCheckboxProps={{
                    sx: {
                    color: 'white',
                    '&.Mui-checked': {
                        color: 'white',
                    },
                    },
                }}
                muiPaginationProps={{
                    rowsPerPageOptions: [10, 20, { label: 'All', value: filteredData.length }],
                    variant: 'filled',
                }}
                paginationDisplayMode='pages'
                muiTableContainerProps={{
                    sx: {
                    maxHeight: box.height,
                    maxWidth: box.width,
                    overflowX: 'auto',
                    overflowY: 'auto',
                    '&::-webkit-scrollbar': {
                        width: '6px',
                        height: '6px',
                    },
                    '&::-webkit-scrollbar-track': {
                        backgroundColor: '#f1f1f1',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        backgroundColor: theme.palette.primary.light,
                        borderRadius: '6px',
                    },
                    '&::-webkit-scrollbar-thumb:hover': {
                        backgroundColor: '#555',
                    }
                    },
                }}
                muiTableBodyProps={{
                    ref: tableBodyRef,
                }}
                muiTableHeadProps={{
                    sx: {
                    position: 'sticky',
                    top: 0,
                    zIndex: 1,
                    },
                }}
                renderTopToolbarCustomActions={() => (
                    <SupplierExpenseColumnFilter
                    columns={
                        columns.filter((column) =>
                        column.accessorKey === 'supplier_name' 
                        )
                    }
                    onFilter={handleFilter}
                    />
                )}
                columns={columns}
                data={filteredData}
                />
        </Box>
    )
}