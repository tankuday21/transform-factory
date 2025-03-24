import './globals.css'
import { Inter } from 'next/font/google'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import { Metadata } from 'next'

// Define fonts
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Transform Factory - Convert, Edit, Organize Files',
  description: 'Transform and manage your files with our powerful tools. Convert, edit, organize, optimize, and secure your documents.',
  keywords: 'file converter, PDF tools, document editor, file transformer',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} scroll-smooth`}>
      <body className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        <Navbar />
        <main className="container mx-auto px-4 py-6">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
} 