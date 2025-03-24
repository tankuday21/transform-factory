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
    color: 'from-red-500 to-pink-500',
    tools: ['PDF to Word', 'Word to PDF', 'Merge PDF', 'Split PDF', 'Compress PDF']
  },
  {
    title: 'Image Converters',
    description: 'Convert between JPG, PNG, BMP, GIF, WEBP, and other image formats',
    icon: '🖼️',
    href: '/convert/image',
    color: 'from-purple-500 to-indigo-500',
    tools: ['JPG to PNG', 'PNG to JPEG', 'BMP to JPG', 'WEBP to JPG', 'GIF to PNG']
  },
  {
    title: 'Document Converters',
    description: 'Convert between PDF, Word, Excel, CSV and other document formats',
    icon: '📄',
    href: '/convert/document',
    color: 'from-blue-500 to-cyan-500',
    tools: ['PDF to Word', 'Word to PDF', 'Excel to CSV', 'CSV to Excel']
  },
  {
    title: 'Video Converters',
    description: 'Convert between MP4, AVI, MOV, WMV and other video formats',
    icon: '🎬',
    href: '/convert/video',
    color: 'from-green-500 to-teal-500',
    tools: ['MP4 to AVI', 'MOV to MP4', 'WMV to MP4', 'AVI to MP4']
  }
]

const features = [
  {
    title: 'Fast & Efficient',
    description: 'Convert your files in seconds with our optimized conversion engine.',
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>,
    color: 'from-blue-500 to-indigo-500'
  },
  {
    title: 'Secure & Private',
    description: 'Your files are deleted immediately after conversion. We don\'t store your data.',
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>,
    color: 'from-red-500 to-pink-500'
  },
  {
    title: '100% Free',
    description: 'All our conversion tools are completely free to use, no hidden fees.',
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
    </svg>,
    color: 'from-green-500 to-teal-500'
  }
]

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section with Animated Background */}
      <div className="relative w-full bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -inset-[10px] opacity-50 blur-3xl z-0">
            {/* Animated gradient background */}
            <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 dark:bg-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
            <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 dark:bg-yellow-600 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 dark:bg-pink-600 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
          </div>
        </div>
        
        <header className="relative text-center max-w-3xl mx-auto py-24 px-4 z-10">
          <div className="animate-fade-in-up">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
              Transform Factory
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-8 animate-fade-in-up animation-delay-300">
              Your one-stop platform for all your conversion needs
            </p>
            <p className="text-gray-600 dark:text-gray-400 animate-fade-in-up animation-delay-600">
              Easily convert between various file formats. Fast, secure, and free!
            </p>
          </div>
        </header>
      </div>

      {/* Categories Section */}
      <section className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-4 -mt-12">
        {converterCategories.map((category, index) => (
          <Link href={category.href} key={category.title} className="no-underline group animate-fade-in-up" style={{ animationDelay: `${index * 150}ms` }}>
            <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl dark:shadow-gray-900/30 h-full overflow-hidden group">
              {/* Gradient overlay on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
              
              {/* Icon with animated background */}
              <div className="relative mb-4">
                <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-20 rounded-full blur-sm transform group-hover:scale-110 transition-transform duration-300`}></div>
                <div className="text-4xl relative z-10">{category.icon}</div>
              </div>
              
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">{category.title}</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{category.description}</p>
              
              <div className="mt-auto">
                <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                  {category.tools.map((tool) => (
                    <li key={tool} className="flex items-center">
                      <svg className={`w-4 h-4 mr-1 text-gradient-to-r ${category.color.replace('from-', 'text-').split(' ')[0]}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {tool}
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Arrow indicator that appears on hover */}
              <div className="absolute bottom-4 right-4 opacity-0 transform translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                <svg className="w-5 h-5 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </section>

      {/* Features Section */}
      <section className="mt-24 w-full max-w-4xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-semibold text-center text-gray-900 dark:text-white mb-6 animate-fade-in-up">
          Why Choose Transform Factory?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div key={feature.title} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md dark:shadow-gray-900/30 hover:shadow-lg transition-shadow duration-300 animate-fade-in-up" style={{ animationDelay: `${index * 150}ms` }}>
              <div className={`flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br ${feature.color} text-white mb-4 transform transition-transform duration-300 hover:rotate-12 hover:scale-110`}>
                {feature.icon}
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="mt-24 mb-16 w-full">
        <div className="relative max-w-5xl mx-auto px-4">
          <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 left-0 right-0 h-px bg-white animate-shimmer"></div>
              <div className="absolute bottom-0 left-0 w-px h-full bg-white animate-shimmer-vertical"></div>
              {/* Animated sparkles */}
              <div className="absolute h-4 w-4 rounded-full bg-white top-1/4 left-1/4 animate-ping" style={{ animationDuration: '4s' }}></div>
              <div className="absolute h-2 w-2 rounded-full bg-white top-3/4 left-1/3 animate-ping" style={{ animationDuration: '2.5s' }}></div>
              <div className="absolute h-3 w-3 rounded-full bg-white top-1/3 right-1/4 animate-ping" style={{ animationDuration: '3.5s' }}></div>
            </div>
            <div className="relative p-8 md:p-12 text-center text-white z-10">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">Start Converting Files Today</h3>
              <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
                Experience the fastest, most secure way to convert your files online. No registration required.
              </p>
              <Link href="/pdf" className="inline-block bg-white text-blue-600 font-medium py-3 px-8 rounded-lg hover:bg-opacity-90 transition-colors duration-300 transform hover:scale-105">
                Explore PDF Tools
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
} 