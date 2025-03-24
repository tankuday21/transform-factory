import { Metadata } from 'next'
import FeaturesMain from '../components/features/FeaturesMain'

export const metadata: Metadata = {
  title: 'PDF Tools - Transform Factory',
  description: 'Transform and manage your PDFs with our powerful tools. Convert, edit, organize, optimize, and secure your PDF documents.',
}

export default function PDFToolsPage() {
  return (
    <div className="min-h-screen">
      <FeaturesMain />
    </div>
  )
} 