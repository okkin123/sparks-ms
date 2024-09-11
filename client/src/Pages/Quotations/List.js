import React, {useState, useEffect} from 'react';
import {Toolbar, Typography, Grid, Chip, Link, Icon, Box, Paper} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  MaterialReactTable,
} from 'material-react-table';
import AxiosInstance from '../../AxiosInstance';
import { theme } from '../../Theme';
import LockIcon from '@mui/icons-material/Lock';



const parentHeight = window.innerHeight;
const parentWidth = window.innerWidth;

// Calculate the center position
const top = (window.innerHeight - parentHeight) / 2;
const left = (window.innerWidth - parentWidth) / 2;

let openedWindows = {};

function openWindow(url, name, specs) {
    if (openedWindows[url] && !openedWindows[url].closed) {
        // Window is already open, bring it to focus
        openedWindows[url].focus();
    } else {
        // Open a new window and store the reference
        openedWindows[url] = window.open(url, name, specs);
    }
}
function createMessageHandler(navigate, quotation_number, setRefresh, refresh) {

  return function HandleMessage(event) {
    
      if (event.data.childClosed || event.data.childSubmit) {
        
          AxiosInstance.post("/quotation/unlock", { quotation_number: quotation_number })
              .then(function(response) {
                setRefresh(!refresh)
              })
              .catch(function(error) {
                  console.error("Axios error:", error.response ? error.response.data : error.message);
              });
         
      }
      else if(event.data.childEdit) {
        navigate('/', { 
          state: {
            quotation_edit: true,
            quotation_number: quotation_number
          }
         });
      }

      window.removeEventListener('message', HandleMessage);
      
  };
}



const columns = [
    {
      accessorKey: 'locked',
      header: 'LOCKED',
      Cell: ({renderedCellValue, row}) => renderedCellValue ? <Icon color="primary" fontSize="small"><LockIcon /></Icon> : ""
    },
    {
      accessorKey: 'quotation_number', //normal accessorKey
      header: 'QUOTATION NO.',
      Cell: ({ renderedCellValue, row }) =>(
        <Link href="#" color="secondary" variant="outlined" onClick={()=>{
       
          const locked = row.original.locked;

          if(!locked)
          {
          // Usage
          const url = window.location.pathname + `quotation/details?quotation_number=${renderedCellValue}`;
          const specs = `location=yes,height=${parentHeight},width=${parentWidth},scrollbars=yes,status=yes,left=${left},top=${top}`;


           // Open a new window with the quotation details
           openWindow(
                url,
                "_blank",
                specs
            );

            // Create the handler with the specific quotation number
            const messageHandler = createMessageHandler(row.original.refresh.navigate, renderedCellValue, row.original.refresh.setRefresh, row.original.refresh.refresh);

            // Add the event listener
            window.addEventListener('message', messageHandler);
          }
          else
          {
            alert(`Quotation Number: ${renderedCellValue} is already opened by another user!`);
          }

        }}>{renderedCellValue}</Link>
      )
    },
    {
      accessorKey: 'status',
      header: 'STATUS',
      Cell: ({ renderedCellValue }) => (
        <Chip 
          label={renderedCellValue} 
          color={
            renderedCellValue === "APPROVED" ? "success" :
            renderedCellValue === "VERIFIED" ? "secondary" :
            renderedCellValue === "RETURNED" ? "warning" :
            renderedCellValue === "WAITING FOR VERIFICATION" ? "info" :
            "error"
          } 
        />
      )
    },
    {
      accessorKey: 'created_by',
      header: 'CREATED BY',
      Cell: ({renderedCellValue, row}) =>  <Chip color="info" label={renderedCellValue} />
    },
    {
      accessorKey: 'client_name',
      header: 'CLIENT NAME'
    },
    {
      accessorKey: 'attention_to',
      header: 'ATTENTION TO'
    },
    {
      accessorKey: 'project_name',
      header: 'PROJECT NAME'
    },
    {
      accessorKey: 'project_description',
      header: 'PROJECT DESCRIPTION'
    },
    {
      accessorKey: 'cost_without_vat',
      header: 'COST w/o VAT'
    },
    {
      accessorKey: 'is_vat',
      header: 'VAT APPLICABLE'
    },
    {
      accessorKey: 'vat_percentage',
      header: 'VAT %',
      Cell: ({renderedCellValue, row})=><Typography variant="p" color="error">{renderedCellValue}</Typography>
    },
    {
      accessorKey: 'vat_amount',
      header: 'VAT AMOUNT'
    },
    {
      accessorKey: 'cost_with_vat',
      header: 'COST w/ VAT'
    },
    {
      accessorKey: 'currency',
      header: 'CURRENCY'
    },
    {
      accessorKey: 'assigned_to',
      header: 'ASSIGNED TO',
      Cell: ({renderedCellValue, row})=>{
            const emails = JSON.parse(renderedCellValue).email_address;
            return (
              <div>
                {emails.map((email, index) => (
                  <Chip key={index} label={email} color={index % 2 === 0  ? 'secondary' : 'info'} />
                ))}
              </div>
            );
      }
    },
  ];

export default function List(props){
  const [quotations, setQuotations] = useState([]);
  const [refresh, setRefresh] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const navigate = useNavigate();
  
  useEffect(() => {

    setLoading(true)
    AxiosInstance.get("/quotation/list")
      .then((result) => {
        if (result.data.status === "SUCCESS") {
          const fetchedQuotations = result.data.quotations.map((element) => ({
            locked: element.created_by_email !== result.data.user_email ? !!element.locked : false,
            quotation_number: element.quotation_number,
            status: element.STATUS,
            created_by: element.created_by_email,
            client_name: element.client_name,
            attention_to: element.attention_to,
            project_name: element.project_name,
            project_description: element.project_description,
            cost_without_vat: element.amount_without_vat,
            is_vat: !!element.is_vat ? 'Yes' : 'No',
            vat_percentage: element.vat_percentage === null ? '' : element.vat_percentage+'%',
            vat_amount: element.vat_amount,
            cost_with_vat: element.amount_with_vat,
            currency: element.currency,
            assigned_to: element.assigned_to_email,
            refresh: {navigate: navigate, setRefresh: setRefresh, refresh: refresh}
          })); 
          setQuotations(fetchedQuotations);

          setLoading(false)

         
        } else {
          console.log(result.data.message);
        }
      })
      .catch((error) => {
        console.log(error);
      });


       // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh]);



    return(
        <React.Fragment>
            <Toolbar />
            <Grid container direction="column" spacing={2}>
              
              <Grid item>
                <Typography variant="h6">LIST OF QUOTATIONS</Typography>
              </Grid> 
              {props.message}
              <Grid item>
              <Paper>
                <Box 
                sx={{
                  width: window.innerWidth - 290,
                  overflowX: 'auto'
                }}>
               
                 <MaterialReactTable
                 enableColumnFilters={false}
                 enableColumnActions={false}
                 enableDensityToggle={false}
                 enableHiding={false}
                 enableGlobalFilter={true}
                 enableRowSelection={false}
                 positionGlobalFilter='left'
                 initialState={{
                  density: 'compact',
                  isLoading: loading,
                  columnPinning: { left: ['locked','quotation_number', 'status'] },
                  showGlobalFilter: true,
                 }}
                 state={{
                  isLoading: loading
                 }}
                 muiTableHeadCellProps={{
                  sx:{
                    backgroundColor: theme.palette.primary.main,
                    color: 'white'
                  }
                 }}
                 muiSearchTextFieldProps={{
                  placeholder: 'Search Keyword...',
                  sx: { minWidth: '18rem'},
                  variant: 'outlined',
                }}
                 muiPaginationProps={{
                  rowsPerPageOptions: [10, 20],
                  variant: 'outlined',
                 }}
                paginationDisplayMode='pages'
                 columns={columns} data={quotations} />
                
                 </Box>
                 </Paper>
              </Grid>
            </Grid>
        </React.Fragment>
    )
}