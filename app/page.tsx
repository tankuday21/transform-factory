import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Transform Factory - Convert Images, Files, and Videos Online',
  description: 'Fast and free online converter for all your files. Convert images, documents, and videos between various formats with ease.',
}

const converterCategories = [
  {
    title: 'PDF Tools',
    description: 'Convert, edit, organize, optimize, and secure your PDF documents',
    icon: '📑',
    href: '/pdf',
    tools: ['PDF to Word', 'Word to PDF', 'Merge PDF', 'Split PDF', 'Compress PDF']
  },
  {
    title: 'Image Converters',
    description: 'Convert between JPG, PNG, BMP, GIF, WEBP, and other image formats',
    icon: '🖼️',
    href: '/convert/image',
    tools: ['JPG to PNG', 'PNG to JPEG', 'BMP to JPG', 'WEBP to JPG', 'GIF to PNG']
  },
  {
    title: 'Document Converters',
    description: 'Convert between PDF, Word, Excel, CSV and other document formats',
    icon: '📄',
    href: '/convert/document',
    tools: ['PDF to Word', 'Word to PDF', 'Excel to CSV', 'CSV to Excel']
  },
  {
    title: 'Video Converters',
    description: 'Convert between MP4, AVI, MOV, WMV and other video formats',
    icon: '🎬',
    href: '/convert/video',
    tools: ['MP4 to AVI', 'MOV to MP4', 'WMV to MP4', 'AVI to MP4']
  }
]

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      <header className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          Transform Factory
        </h1>
        <p className="text-xl text-gray-700 mb-8">
          Your one-stop platform for all your conversion needs
        </p>
        <p className="text-gray-600">
          Easily convert between various file formats. Fast, secure, and free!
        </p>
      </header>

      <section className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {converterCategories.map((category) => (
          <Link href={category.href} key={category.title} className="no-underline">
            <div className="bg-white rounded-lg shadow-md p-6 transition-transform hover:scale-105 h-full">
              <div className="text-4xl mb-4">{category.icon}</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{category.title}</h2>
              <p className="text-gray-600 mb-4">{category.description}</p>
              <div className="mt-auto">
                <ul className="text-sm text-gray-500 space-y-1">
                  {category.tools.map((tool) => (
                    <li key={tool} className="flex items-center">
                      <svg className="w-4 h-4 mr-1 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {tool}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Link>
        ))}
      </section>

      <section className="mt-16 w-full max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold text-center text-gray-900 mb-6">
          Why Choose Transform Factory?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 text-primary-600 mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Fast & Efficient</h3>
            <p className="text-gray-600">Convert your files in seconds with our optimized conversion engine.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 text-primary-600 mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Secure & Private</h3>
            <p className="text-gray-600">Your files are deleted immediately after conversion. We don't store your data.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 text-primary-600 mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">100% Free</h3>
            <p className="text-gray-600">All our conversion tools are completely free to use, no hidden fees.</p>
          </div>
        </div>
      </section>
    </div>
  )
} 