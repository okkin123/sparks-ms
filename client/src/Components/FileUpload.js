// FileUpload.js
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button, Typography, Alert, Stack } from '@mui/material';
const FileUpload = ({ onFileUpload, fileTypes, mainError}) => {
    const [fileName, setFileName] = useState('');
    const [error, setError] = useState('');
    const onDrop = useCallback((acceptedFiles, fileRejections) => {
        setError(''); // Clear previous errors
        setFileName('');
        if (fileRejections.length > 0) {
            const rejection = fileRejections;
            if (rejection[0].errors.length > 0) {
            setError(rejection[0].errors[0].message);
            }
            return;
        }

        if (acceptedFiles.length === 1) {
            const file = acceptedFiles;
            fileTypes.forEach(element => {
            //   if (file[0].type === 'image/jpeg' || file[0].type === 'image/png' || file[0].type === 'application/pdf') {
            //     setFileName(file[0].name);
            //     onFileUpload(file[0]);
            // } else {
            //     setError('Unsupported File Format!');
            // }
            if (file[0].type === element) {
                setFileName(file[0].name);
                onFileUpload(file[0]);
            } else {
                setError('Unsupported File Format!');
            }
            });
        }
  
        // eslint-disable-next-line
    }, [onFileUpload]); 


    const { getRootProps, getInputProps, open, isDragActive } = useDropzone({
      onDrop,
      noClick: true,
      noKeyboard: true,
      maxFiles: 1,
      accept: fileTypes,
      maxSize: 16 * 1024 * 1024
    });

  return (
    <div {...getRootProps()} style={{ border: '2px dashed #ccc', padding: '20px', textAlign: 'center', backgroundColor: isDragActive ? '#FAFAFA' : 'transparent',
        transition: 'background-color 0.3s ease' }}>
      <input {...getInputProps()} />
      <Stack direction="column" spacing={2}>
      <Typography variant='subtitle1'>Drag and drop a file here, or click the button below to select one</Typography>
      <Stack direction="row" justifyContent="center">
      <Button variant='contained' color='info' onClick={open}>
        Upload File
      </Button>
      </Stack>
      {fileName && <Alert severity='success'><strong>File is uploaded! </strong>{fileName}</Alert>}
      {error && <Alert severity='error'><strong>Error! </strong>{error}</Alert>}
      {mainError && <Alert severity='error'><strong>Error! </strong>{mainError}</Alert>}
      </Stack>
    </div>
  );
};

export default FileUpload;
