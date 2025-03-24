import './globals.css'
import { Inter } from 'next/font/google'
import Navbar from './components/layout/Navbar'

// Define fonts
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

export const metadata = {
  title: 'Transform Factory - Convert, Edit, Organize Files',
  description: 'Transform and manage your files with our powerful tools. Convert, edit, organize, optimize, and secure your documents.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.className}>
      <body className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen transition-colors duration-300">
        <Navbar />
        <main className="container mx-auto px-4 py-6">
          {children}
        </main>
        <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-6 mt-12">
          <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-400">
            <p>© {new Date().getFullYear()} Transform Factory. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  )
} 