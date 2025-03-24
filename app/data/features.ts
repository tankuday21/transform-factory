// Define types for PDF features
export type ToolId = string

export interface Tool {
  id: ToolId
  name: string
  description: string
  icon: string // Icon name from react-icons library
  path: string
  category: string
  isNew?: boolean
  popularity?: number
  badgeText?: string
  badgeColor?: string
}

export interface CategoryFeature {
  id: string
  title: string
  description: string
  icon: string // Icon name from react-icons library
  color: string
  colorDark?: string
  tools: Tool[]
}

// Define all PDF features by category
export const pdfFeatures: CategoryFeature[] = [
  {
    id: 'convert',
    title: 'Convert PDF',
    description: 'Convert PDFs to and from other file formats',
    icon: 'FiRefreshCw',
    color: 'from-blue-500 to-blue-600',
    colorDark: 'from-blue-600 to-blue-800',
    tools: [
      {
        id: 'pdf-to-word',
        name: 'PDF to Word',
        description: 'Convert PDFs into editable Word documents',
        icon: 'FiFileText',
        path: '/convert/pdf-to-word',
        category: 'convert',
        popularity: 95
      },
      {
        id: 'pdf-to-excel',
        name: 'PDF to Excel',
        description: 'Convert PDF data into Excel spreadsheets',
        icon: 'FiFileText',
        path: '/convert/pdf-to-excel',
        category: 'convert',
        popularity: 85
      },
      {
        id: 'pdf-to-powerpoint',
        name: 'PDF to PowerPoint',
        description: 'Convert PDFs into PowerPoint slides',
        icon: 'FiFileText',
        path: '/convert/pdf-to-powerpoint',
        category: 'convert',
        popularity: 75
      },
      {
        id: 'pdf-to-jpg',
        name: 'PDF to JPG',
        description: 'Convert PDF pages into JPG images',
        icon: 'FiFileText',
        path: '/convert/pdf-to-jpg',
        category: 'convert',
        popularity: 90
      },
      {
        id: 'word-to-pdf',
        name: 'Word to PDF',
        description: 'Convert Microsoft Word files into PDFs',
        icon: 'FiFileText',
        path: '/convert/word-to-pdf',
        category: 'convert',
        popularity: 92
      },
      {
        id: 'excel-to-pdf',
        name: 'Excel to PDF',
        description: 'Convert Excel spreadsheets into PDFs',
        icon: 'FiFileText',
        path: '/convert/excel-to-pdf',
        category: 'convert',
        popularity: 80
      },
      {
        id: 'powerpoint-to-pdf',
        name: 'PowerPoint to PDF',
        description: 'Convert PowerPoint slides into PDFs',
        icon: 'FiFileText',
        path: '/convert/powerpoint-to-pdf',
        category: 'convert',
        popularity: 78
      },
      {
        id: 'jpg-to-pdf',
        name: 'JPG to PDF',
        description: 'Convert JPG images into PDFs',
        icon: 'FiFileText',
        path: '/convert/jpg-to-pdf',
        category: 'convert',
        popularity: 88
      },
      {
        id: 'html-to-pdf',
        name: 'HTML to PDF',
        description: 'Convert webpages into PDFs',
        icon: 'FiFileText',
        path: '/convert/html-to-pdf',
        category: 'convert',
        popularity: 70
      },
      {
        id: 'pdf-to-pdfa',
        name: 'PDF to PDF/A',
        description: 'Convert PDFs into PDF/A format for long-term archiving',
        icon: 'FiFileText',
        path: '/convert/pdf-to-pdfa',
        category: 'convert',
        popularity: 65
      },
      {
        id: 'pdf-to-audio',
        name: 'PDF to Audio',
        description: 'Convert PDFs into audio files (MP3)',
        icon: 'FiFileText',
        path: '/convert/pdf-to-audio',
        category: 'convert',
        isNew: true,
        badgeText: 'New',
        badgeColor: 'bg-green-500',
        popularity: 60
      }
    ]
  },
  {
    id: 'edit',
    title: 'Edit PDF',
    description: 'Edit and modify your PDF documents',
    icon: 'FiEdit',
    color: 'from-purple-500 to-purple-600',
    colorDark: 'from-purple-600 to-purple-800',
    tools: [
      {
        id: 'edit-pdf',
        name: 'Edit PDF',
        description: 'Edit text, images, or annotations in a PDF',
        icon: 'FiEdit',
        path: '/edit/edit-pdf',
        category: 'edit',
        popularity: 94
      },
      {
        id: 'add-page-numbers',
        name: 'Add Page Numbers',
        description: 'Add page numbers to PDFs',
        icon: 'FiFileText',
        path: '/edit/add-page-numbers',
        category: 'edit',
        popularity: 75
      },
      {
        id: 'add-watermark',
        name: 'Add Watermark',
        description: 'Add a watermark (text or image) to PDFs',
        icon: 'FiFileText',
        path: '/edit/add-watermark',
        category: 'edit',
        popularity: 80
      },
      {
        id: 'rotate-pdf',
        name: 'Rotate PDF',
        description: 'Rotate PDF pages',
        icon: 'FiFileText',
        path: '/edit/rotate-pdf',
        category: 'edit',
        popularity: 82
      },
      {
        id: 'redact-pdf',
        name: 'Redact PDF',
        description: 'Permanently remove sensitive information from PDFs',
        icon: 'FiFileText',
        path: '/edit/redact-pdf',
        category: 'edit',
        popularity: 72
      },
      {
        id: 'pdf-form-creator',
        name: 'PDF Form Creator',
        description: 'Create PDF forms with text fields, checkboxes, and dropdowns',
        icon: 'FiFileText',
        path: '/edit/pdf-form-creator',
        category: 'edit',
        isNew: true,
        badgeText: 'New',
        badgeColor: 'bg-green-500',
        popularity: 68
      }
    ]
  },
  {
    id: 'organize',
    title: 'Organize PDF',
    description: 'Combine, split, or rearrange PDF pages',
    icon: 'FiFileText',
    color: 'from-red-500 to-red-600',
    colorDark: 'from-red-600 to-red-800',
    tools: [
      {
        id: 'merge-pdf',
        name: 'Merge PDF',
        description: 'Combine multiple PDFs into a single file',
        icon: 'FiFileText',
        path: '/organize/merge-pdf',
        category: 'organize',
        popularity: 98
      },
      {
        id: 'split-pdf',
        name: 'Split PDF',
        description: 'Separate a PDF into individual pages or sections',
        icon: 'FiFileText',
        path: '/organize/split-pdf',
        category: 'organize',
        popularity: 92
      },
      {
        id: 'remove-pages',
        name: 'Remove Pages',
        description: 'Delete unwanted pages from a PDF',
        icon: 'FiFileText',
        path: '/organize/remove-pages',
        category: 'organize',
        popularity: 85
      },
      {
        id: 'extract-pages',
        name: 'Extract Pages',
        description: 'Extract specific pages from a PDF',
        icon: 'FiFileText',
        path: '/organize/extract-pages',
        category: 'organize',
        popularity: 83
      },
      {
        id: 'organize-pdf',
        name: 'Organize PDF',
        description: 'Sort or rearrange PDF pages',
        icon: 'FiFileText',
        path: '/organize/organize-pdf',
        category: 'organize',
        popularity: 78
      },
      {
        id: 'batch-processing',
        name: 'Batch Processing',
        description: 'Convert or edit multiple files at once',
        icon: 'FiFileText',
        path: '/organize/batch-processing',
        category: 'organize',
        isNew: true,
        badgeText: 'New',
        badgeColor: 'bg-green-500',
        popularity: 70
      }
    ]
  },
  {
    id: 'optimize',
    title: 'Optimize PDF',
    description: 'Enhance, optimize, or compress PDFs',
    icon: 'FiFileText',
    color: 'from-green-500 to-green-600',
    colorDark: 'from-green-600 to-green-800',
    tools: [
      {
        id: 'compress-pdf',
        name: 'Compress PDF',
        description: 'Reduce the file size of a PDF',
        icon: 'FiFileText',
        path: '/optimize/compress-pdf',
        category: 'optimize',
        popularity: 95
      },
      {
        id: 'repair-pdf',
        name: 'Repair PDF',
        description: 'Fix damaged PDF files',
        icon: 'FiFileText',
        path: '/optimize/repair-pdf',
        category: 'optimize',
        popularity: 80
      },
      {
        id: 'ocr-pdf',
        name: 'OCR PDF',
        description: 'Convert scanned PDFs into searchable text',
        icon: 'FiFileText',
        path: '/optimize/ocr-pdf',
        category: 'optimize',
        popularity: 90
      },
      {
        id: 'scan-to-pdf',
        name: 'Scan to PDF',
        description: 'Convert scanned documents into PDFs',
        icon: 'FiFileText',
        path: '/optimize/scan-to-pdf',
        category: 'optimize',
        popularity: 78
      },
      {
        id: 'pdf-analytics',
        name: 'PDF Analytics',
        description: 'View page count, file size, word count, and image analytics',
        icon: 'FiFileText',
        path: '/optimize/pdf-analytics',
        category: 'optimize',
        isNew: true,
        badgeText: 'New',
        badgeColor: 'bg-green-500',
        popularity: 65
      }
    ]
  },
  {
    id: 'secure',
    title: 'Secure PDF',
    description: 'Protect, secure, or sign PDFs',
    icon: 'FiLock',
    color: 'from-orange-500 to-orange-600',
    colorDark: 'from-orange-600 to-orange-800',
    tools: [
      {
        id: 'protect-pdf',
        name: 'Protect PDF',
        description: 'Secure PDFs with a password',
        icon: 'FiLock',
        path: '/secure/protect-pdf',
        category: 'secure',
        popularity: 90
      },
      {
        id: 'unlock-pdf',
        name: 'Unlock PDF',
        description: 'Remove passwords from password-protected PDFs',
        icon: 'FiUnlock',
        path: '/secure/unlock-pdf',
        category: 'secure',
        popularity: 88
      },
      {
        id: 'sign-pdf',
        name: 'Sign PDF',
        description: 'Add a digital signature to PDFs',
        icon: 'FiFileText',
        path: '/secure/sign-pdf',
        category: 'secure',
        popularity: 85
      }
    ]
  },
  {
    id: 'advanced',
    title: 'Advanced Tools',
    description: 'Advanced PDF tools for power users',
    icon: 'FiFileText',
    color: 'from-teal-500 to-teal-600',
    colorDark: 'from-teal-600 to-teal-800',
    tools: [
      {
        id: 'compare-pdf',
        name: 'Compare PDF',
        description: 'Compare differences between two PDF files',
        icon: 'FiFileText',
        path: '/advanced/compare-pdf',
        category: 'advanced',
        popularity: 75
      },
      {
        id: 'pdf-translator',
        name: 'PDF Translator',
        description: 'Translate PDF content from one language to another',
        icon: 'FiFileText',
        path: '/advanced/pdf-translator',
        category: 'advanced',
        isNew: true,
        badgeText: 'New',
        badgeColor: 'bg-green-500',
        popularity: 70
      },
      {
        id: 'cloud-integration',
        name: 'Cloud Integration',
        description: 'Upload and save files directly from Google Drive or Dropbox',
        icon: 'FiFileText',
        path: '/advanced/cloud-integration',
        category: 'advanced',
        isNew: true,
        badgeText: 'New',
        badgeColor: 'bg-green-500',
        popularity: 65
      }
    ]
  }
]

// Helper function to get a specific tool by ID
export const getToolById = (id: ToolId): Tool | undefined => {
  for (const category of pdfFeatures) {
    const tool = category.tools.find(tool => tool.id === id)
    if (tool) return tool
  }
  return undefined
}

// Helper function to get a specific category by ID
export const getCategoryById = (id: string): CategoryFeature | undefined => {
  return pdfFeatures.find(category => category.id === id)
}

// Helper function to get all tools as a flat array
export const getAllTools = (): Tool[] => {
  return pdfFeatures.flatMap(category => category.tools)
}

// Helper function to get popular tools (top N tools by popularity)
export const getPopularTools = (count: number = 8): Tool[] => {
  return getAllTools()
    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
    .slice(0, count)
} 