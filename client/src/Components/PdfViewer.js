import React, { useState } from 'react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import { pdfjs } from 'react-pdf';
import worker from 'pdfjs-dist/build/pdf.worker.entry';

pdfjs.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/browse/pdfjs-dist@4.6.82/build/pdf.worker.mjs'

const PdfViewer = ({ file }) => {
  console.log(worker)
  return (
    <div style={{ height: '750px' }}>
      <Worker workerUrl={pdfjs.GlobalWorkerOptions.workerSrc}>
        <Viewer
          fileUrl={file}
        />
      </Worker>
    </div>
  );
};

export default PdfViewer;
