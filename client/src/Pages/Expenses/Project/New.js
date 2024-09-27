import { Divider, Grid, Paper, Stack, Toolbar, Typography} from '@mui/material';
import React, {useState} from 'react';
import PdfViewer from '../../../Components/PdfViewer';
import FileUpload from '../../../Components/FileUpload';
export default function New(){
    const [file, setFile] = useState(null);


    const handleFileUpload = (file) => {
        const fileUrl = URL.createObjectURL(file);
        setFile(fileUrl);
    };

    return(
        <React.Fragment>
            <Toolbar />
            <Paper>
            <Grid container direction="column" spacing={2} sx={{padding: 2  }}>
              <Grid item>
                <Typography variant="h6">NEW PROJECT EXPENSE</Typography>
              </Grid>
              <Grid item>
                 <Divider />
              </Grid>
              
              <Grid item container direction="row" spacing={2}>
                <Grid item xl={4}>

                </Grid>
                <Grid item xl={8}>
                    {file && <PdfViewer file={file} />}
                </Grid>
              </Grid>
              <Grid item>
                <FileUpload onFileUpload={handleFileUpload} />
              </Grid>
            </Grid>
            </Paper>
        </React.Fragment>
    )
}

// npm install @react-pdf-viewer/core @react-pdf-viewer/default-layout react-dropzone


// // App.js
// import React, { useState } from 'react';
// import FileUpload from './FileUpload';
// import PdfViewer from './PdfViewer';

// const App = () => {
//   const [file, setFile] = useState(null);

//   const handleFileUpload = (file) => {
//     const fileUrl = URL.createObjectURL(file);
//     setFile(fileUrl);
//   };

//   return (
//     <div>
//       <h1>PDF Viewer</h1>
//       <FileUpload onFileUpload={handleFileUpload} />
//       {file && <PdfViewer file={file} />}
//     </div>
//   );
// };

// export default App;
