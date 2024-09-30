import React from 'react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
//import { pdfjs } from 'react-pdf';
//import { GlobalWorkerOptions } from 'pdfjs-dist';
import worker from 'pdfjs-dist/build/pdf.worker.entry';
//GlobalWorkerOptions.workerSrc = 'https://unpkg.com/browse/pdfjs-dist@4.6.82/build/pdf.worker.mjs';

const PdfViewer = ({ file }) => {
  //const fileUrl = `https://reimagined-invention-4rw965xj75ghq599-4000.app.github.dev/supplier_invoices/1727509179703-5059_page-0001.pdf`;
  return (
    <div style={{ height: '750px' }}>
      <Worker workerUrl={worker}>
        <Viewer
          fileUrl={file}
        />
      </Worker>
    </div>
  );
};

export default PdfViewer;


