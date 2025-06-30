import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import styled from 'styled-components';
import { FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

// Set up the worker for react-pdf using the public folder
pdfjs.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.min.js`;

const ViewerOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.97);
  display: flex;
  z-index: 1000;
`;

const Sidebar = styled.div`
  width: 120px;
  background: #181818;
  padding: 16px 0;
  overflow-y: auto;
  border-right: 1px solid #222;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Thumbnail = styled.div`
  width: 80px;
  height: 110px;
  margin-bottom: 12px;
  border-radius: 4px;
  overflow: hidden;
  border: 2px solid ${({ active }) => (active ? '#007AFF' : 'transparent')};
  box-shadow: ${({ active }) => (active ? '0 0 8px #007AFF55' : 'none')};
  cursor: pointer;
  background: #222;
  transition: border 0.2s, box-shadow 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MainArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const ViewerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem 1rem 2rem;
  background-color: #232323;
  border-bottom: 1px solid #222;
`;

const Title = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: #fff;
  flex: 1;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const PageInfo = styled.div`
  color: #aaa;
  font-size: 0.95rem;
  margin-left: 2rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  margin-left: 1rem;
  &:hover {
    color: #007AFF;
  }
`;

const ViewerContent = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: auto;
  background: #181818;
`;

const NavigationButtons = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const NavButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.5rem;
  &:hover {
    color: #007AFF;
  }
  &:disabled {
    color: #666;
    cursor: not-allowed;
  }
`;

const PDFViewer = ({ file, onClose }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  const goToPrevPage = () => {
    setPageNumber(page => Math.max(page - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber(page => Math.min(page + 1, numPages));
  };

  return (
    <ViewerOverlay>
      <Sidebar>
        <Document file={file} loading={null} noData={null} onLoadSuccess={onDocumentLoadSuccess}>
          {numPages && Array.from({ length: numPages }, (_, i) => (
            <Thumbnail
              key={i + 1}
              active={i + 1 === pageNumber}
              onClick={() => setPageNumber(i + 1)}
              title={`Page ${i + 1}`}
            >
              <Page
                pageNumber={i + 1}
                width={70}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                loading={null}
              />
            </Thumbnail>
          ))}
        </Document>
      </Sidebar>
      <MainArea>
        <ViewerHeader>
          <Title>{file?.name}</Title>
          <PageInfo>
            Page {pageNumber} of {numPages || '--'}
          </PageInfo>
          <NavigationButtons>
            <NavButton onClick={goToPrevPage} disabled={pageNumber <= 1} title="Previous Page">
              <FaChevronLeft />
            </NavButton>
            <NavButton onClick={goToNextPage} disabled={pageNumber >= numPages} title="Next Page">
              <FaChevronRight />
            </NavButton>
            <CloseButton onClick={onClose} title="Close">
              <FaTimes />
            </CloseButton>
          </NavigationButtons>
        </ViewerHeader>
        <ViewerContent>
          <Document
            file={file}
            loading={<div style={{ color: 'white' }}>Loading PDF...</div>}
            error={<div style={{ color: 'white' }}>Error loading PDF!</div>}
            onLoadSuccess={onDocumentLoadSuccess}
          >
            <Page
              pageNumber={pageNumber}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              width={Math.min(window.innerWidth - 300, 800)}
              scale={1.1}
            />
          </Document>
        </ViewerContent>
      </MainArea>
    </ViewerOverlay>
  );
};

export default PDFViewer; 