import { Divider, Grid, Paper, Toolbar, Typography} from '@mui/material';
import React from 'react';

export default function New(){
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

            </Grid>
            </Paper>
        </React.Fragment>
    )
}

// npm install @react-pdf-viewer/core @react-pdf-viewer/default-layout react-dropzone
// // PdfViewer.js
// import React from 'react';
// import { Worker, Viewer } from '@react-pdf-viewer/core';
// import '@react-pdf-viewer/core/lib/styles/index.css';
// import '@react-pdf-viewer/default-layout/lib/styles/index.css';

// const PdfViewer = ({ file }) => {
//   return (
//     <div style={{ height: '750px' }}>
//       <Worker workerUrl={`https://unpkg.com/pdfjs-dist@2.6.347/build/pdf.worker.min.js`}>
//         <Viewer fileUrl={file} />
//       </Worker>
//     </div>
//   );
// };

// export default PdfViewer;

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
