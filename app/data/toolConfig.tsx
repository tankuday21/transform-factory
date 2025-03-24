import React from 'react';
import { FiFileText, FiImage, FiLock, FiCheckSquare, FiTrello, FiGlobe, FiSearch, FiVolume2 } from 'react-icons/fi';
import { 
  PiFilePdf, 
  PiFileDoc, 
  PiFileXls, 
  PiFilePpt, 
  PiImageSquare, 
  PiFileHtml, 
  PiArchive,
  PiTextT, 
  PiLockKey,
  PiLockKeyOpen,
  PiSignature,
  PiTextColumns,
  PiSquareSplitVertical,
  PiTrash,
  PiArrowsClockwise,
  PiPencilLine,
  PiTextbox,
  PiSealCheck
} from 'react-icons/pi';

// Define the type for tool configuration
export interface ToolConfig {
  title: string;
  description: string;
  icon: React.ReactNode;
  acceptedFiles: string[];
  outputFormat: string;
  steps: string[];
  features: string[];
  additionalInfo?: string;
  relatedTools?: string[];
}

// Create a map of tool configurations
const toolConfigs: Record<string, ToolConfig> = {
  // Convert category
  'pdf-to-word': {
    title: 'Convert PDF to Word',
    description: 'Transform your PDF files into fully editable Word documents with our accurate PDF to Word converter.',
    icon: <PiFileDoc size={32} />,
    acceptedFiles: ['.pdf'],
    outputFormat: '.docx',
    steps: [
      'Upload your PDF file',
      'Our system will convert the document while preserving formatting',
      'Download your editable Word document'
    ],
    features: [
      'Preserves text formatting, images, and layout',
      'Converts tables and other complex elements',
      'Supports multiple pages and large documents',
      'Fast conversion with high accuracy'
    ],
    relatedTools: ['word-to-pdf', 'pdf-to-excel', 'pdf-to-powerpoint']
  },
  'pdf-to-excel': {
    title: 'Convert PDF to Excel',
    description: 'Extract tables and data from PDF files and convert them into editable Excel spreadsheets.',
    icon: <PiFileXls size={32} />,
    acceptedFiles: ['.pdf'],
    outputFormat: '.xlsx',
    steps: [
      'Upload your PDF file with tables or data',
      'Our system will extract and convert the data',
      'Download your Excel spreadsheet'
    ],
    features: [
      'Accurately extracts tables from PDFs',
      'Preserves cell structure and formatting',
      'Supports multiple sheets extraction',
      'Converts formulas where possible'
    ],
    relatedTools: ['excel-to-pdf', 'pdf-to-word', 'pdf-to-csv']
  },
  'pdf-to-powerpoint': {
    title: 'Convert PDF to PowerPoint',
    description: 'Transform PDF presentations into editable PowerPoint slides that you can customize.',
    icon: <PiFilePpt size={32} />,
    acceptedFiles: ['.pdf'],
    outputFormat: '.pptx',
    steps: [
      'Upload your PDF presentation',
      'Our system will convert each page to a slide',
      'Download your PowerPoint presentation'
    ],
    features: [
      'Converts each PDF page to a PowerPoint slide',
      'Preserves images, text, and layout',
      'Maintains colors and design elements',
      'Allows for easy editing after conversion'
    ],
    relatedTools: ['powerpoint-to-pdf', 'pdf-to-word', 'pdf-to-images']
  },
  'pdf-to-jpg': {
    title: 'Convert PDF to JPG',
    description: 'Extract images from your PDF files or convert entire pages to high-quality JPG images.',
    icon: <PiImageSquare size={32} />,
    acceptedFiles: ['.pdf'],
    outputFormat: '.jpg',
    steps: [
      'Upload your PDF document',
      'Select conversion options (quality, page range)',
      'Download your JPG images'
    ],
    features: [
      'Converts PDF pages to high-quality JPG images',
      'Allows custom resolution settings',
      'Supports batch conversion of multi-page PDFs',
      'Maintains image quality and colors'
    ],
    relatedTools: ['jpg-to-pdf', 'pdf-to-png', 'image-compression']
  },
  'word-to-pdf': {
    title: 'Convert Word to PDF',
    description: 'Transform your Word documents into professional PDF files that look exactly as intended.',
    icon: <PiFilePdf size={32} />,
    acceptedFiles: ['.doc', '.docx'],
    outputFormat: '.pdf',
    steps: [
      'Upload your Word document',
      'Our system will convert while preserving layout',
      'Download your PDF file'
    ],
    features: [
      'Preserves all formatting and fonts',
      'Maintains images, headers, and footers',
      'Creates searchable PDF text',
      'Supports Word documents of all sizes'
    ],
    relatedTools: ['pdf-to-word', 'excel-to-pdf', 'powerpoint-to-pdf']
  },
  
  // Edit category
  'edit-pdf': {
    title: 'Edit PDF',
    description: 'Make changes to your PDF files directly with our powerful online PDF editor.',
    icon: <PiPencilLine size={32} />,
    acceptedFiles: ['.pdf'],
    outputFormat: '.pdf',
    steps: [
      'Upload your PDF file',
      'Edit text, images, and other elements using our editor',
      'Download the edited PDF'
    ],
    features: [
      'Edit text directly in your PDF',
      'Add, replace, or remove images',
      'Add annotations and comments',
      'Add, delete, or reorder pages',
      'Fill out forms and sign documents'
    ],
    relatedTools: ['add-text-to-pdf', 'add-images-to-pdf', 'redact-pdf']
  },
  'add-page-numbers': {
    title: 'Add Page Numbers to PDF',
    description: 'Automatically add customizable page numbers to your PDF documents.',
    icon: <PiTextT size={32} />,
    acceptedFiles: ['.pdf'],
    outputFormat: '.pdf',
    steps: [
      'Upload your PDF document',
      'Customize page number format and position',
      'Download your numbered PDF'
    ],
    features: [
      'Choose from various page number styles',
      'Set custom starting page number',
      'Customize position (top/bottom, left/center/right)',
      'Add prefix or suffix text (e.g., "Page X of Y")',
      'Skip numbering on selected pages'
    ],
    relatedTools: ['edit-pdf', 'add-watermark', 'add-headers-footers']
  },
  
  // Organize category
  'merge-pdf': {
    title: 'Merge PDF',
    description: 'Combine multiple PDF files into a single document quickly and easily.',
    icon: <PiTextColumns size={32} />,
    acceptedFiles: ['.pdf'],
    outputFormat: '.pdf',
    steps: [
      'Upload two or more PDF files',
      'Arrange them in the desired order',
      'Download your merged PDF document'
    ],
    features: [
      'Combine unlimited PDF files',
      'Drag and drop to reorder pages',
      'Add, remove, or rotate pages before merging',
      'Adjust page size and orientation if needed',
      'Works with large files and many documents'
    ],
    relatedTools: ['split-pdf', 'remove-pages', 'organize-pdf']
  },
  'split-pdf': {
    title: 'Split PDF',
    description: 'Divide your PDF into multiple smaller documents by pages or page ranges.',
    icon: <PiSquareSplitVertical size={32} />,
    acceptedFiles: ['.pdf'],
    outputFormat: '.pdf',
    steps: [
      'Upload your PDF document',
      'Choose how to split (by page, range, or size)',
      'Download individual PDF files or a ZIP archive'
    ],
    features: [
      'Split by specific page numbers',
      'Extract certain pages only',
      'Split by page ranges (e.g., 1-5, 6-10)',
      'Split by bookmark/chapter',
      'Extract all pages as separate files'
    ],
    relatedTools: ['merge-pdf', 'extract-pages', 'remove-pages']
  },
  
  // Secure category
  'protect-pdf': {
    title: 'Protect PDF',
    description: 'Secure your PDF files with password protection and permission controls.',
    icon: <PiLockKey size={32} />,
    acceptedFiles: ['.pdf'],
    outputFormat: '.pdf',
    steps: [
      'Upload your PDF document',
      'Set password and permission options',
      'Download your protected PDF'
    ],
    features: [
      'Add password protection to prevent unauthorized access',
      'Set separate owner and user passwords',
      'Restrict printing, editing, copying, and form filling',
      'Apply 128-bit encryption',
      'Control whether the document can be accessed by screen readers'
    ],
    relatedTools: ['unlock-pdf', 'redact-pdf', 'sign-pdf']
  },
  'unlock-pdf': {
    title: 'Unlock PDF',
    description: 'Remove password protection and restrictions from PDF files you own.',
    icon: <PiLockKeyOpen size={32} />,
    acceptedFiles: ['.pdf'],
    outputFormat: '.pdf',
    steps: [
      'Upload your password-protected PDF',
      'Enter the document open password',
      'Download the unlocked PDF'
    ],
    features: [
      'Remove PDF password protection',
      'Unlock copy, print, and edit restrictions',
      'Enable form filling for protected PDFs',
      'Works with all standard PDF security methods',
      'Your password is never stored or saved'
    ],
    additionalInfo: 'You must know the password to unlock a password-protected PDF. This tool cannot bypass security without the correct password.',
    relatedTools: ['protect-pdf', 'edit-pdf', 'sign-pdf']
  },
  'sign-pdf': {
    title: 'Sign PDF',
    description: 'Add digital signatures to your PDF documents for authentication and verification.',
    icon: <PiSignature size={32} />,
    acceptedFiles: ['.pdf'],
    outputFormat: '.pdf',
    steps: [
      'Upload your PDF document',
      'Create, draw, or upload your signature',
      'Position it on the document',
      'Download your signed PDF'
    ],
    features: [
      'Draw your signature using mouse or touchscreen',
      'Upload an image of your signature',
      'Type your name and convert to signature',
      'Place signature anywhere in the document',
      'Add multiple signatures and initials'
    ],
    relatedTools: ['protect-pdf', 'edit-pdf', 'add-watermark']
  }
};

export default toolConfigs; 