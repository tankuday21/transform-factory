import Link from 'next/link'
import { Metadata } from 'next'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Transform Factory - Convert Anything, Anywhere',
  description: 'Your ultimate hub for transforming PDFs, videos, images and more. Fast, secure and powerful file conversion platform.',
}

const features = [
  {
    title: 'Convert Files',
    description: 'Transform PDFs, videos, and images into any format with ease',
    icon: (
      <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3v3m6.5-3v3M12 18v3m6.5-3v3M5.5 3a2 2 0 1 0 0 4 2 2 0 1 0 0-4zm13 0a2 2 0 1 0 0 4 2 2 0 1 0 0-4zm0 13a2 2 0 1 0 0 4 2 2 0 1 0 0-4zm-13 0a2 2 0 1 0 0 4 2 2 0 1 0 0-4z" />
        <path d="M5.5 5.5L18.5 18.5m0-13L5.5 18.5" />
      </svg>
    ),
  },
  {
    title: 'Edit Files',
    description: 'Modify, crop, rotate, and enhance your documents with precision',
    icon: (
      <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),
  },
  {
    title: 'Merge Files',
    description: 'Combine multiple files into a single document seamlessly',
    icon: (
      <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 8v8m0-12V4m0 16v1m-8-9v4m0-8V4m0 16v1m0-5H4m12 0h4" />
        <rect x="2" y="2" width="8" height="8" rx="1" />
        <rect x="14" y="2" width="8" height="8" rx="1" />
        <rect x="2" y="14" width="8" height="8" rx="1" />
        <rect x="14" y="14" width="8" height="8" rx="1" />
      </svg>
    ),
  },
  {
    title: 'Secure Files',
    description: 'Protect your documents with encryption, watermarks and more',
    icon: (
      <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
]

const benefits = [
  {
    title: 'Fast Transformations',
    description: 'Convert and edit files in seconds with our powerful engine.',
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
  },
  {
    title: 'Secure Processing',
    description: 'Your files are safe with us—deleted after transformation.',
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
  {
    title: 'All-in-One Solution',
    description: 'Handle PDFs, videos, images, and more in one place.',
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
  },
]

const testimonials = [
  {
    quote: "Transform Factory made file conversion so easy! I converted 50 PDFs to Word in minutes.",
    name: "Sarah K.",
    title: "Designer",
    avatar: "/avatars/avatar-1.jpg",
    rating: 5
  },
  {
    quote: "The batch processing feature saved me hours of work. Best conversion tool I've used.",
    name: "James M.",
    title: "Marketing Director",
    avatar: "/avatars/avatar-2.jpg",
    rating: 5
  },
  {
    quote: "Clean interface, fast processing, and the quality of converted files is excellent.",
    name: "Alex P.",
    title: "Content Creator",
    avatar: "/avatars/avatar-3.jpg",
    rating: 5
  },
  {
    quote: "I needed to secure sensitive documents quickly, and Transform Factory delivered perfectly.",
    name: "Melissa R.",
    title: "Legal Advisor",
    avatar: "/avatars/avatar-4.jpg",
    rating: 5
  }
]

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section with Industrial Theme */}
      <div className="relative w-full bg-gradient-to-r from-slate-900 via-blue-900 to-slate-800 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            {/* Animated gears */}
            <div className="absolute top-20 left-10 w-40 h-40 border-8 border-blue-400/20 rounded-full animate-spin-slow"></div>
            <div className="absolute bottom-20 right-10 w-60 h-60 border-8 border-teal-400/20 rounded-full animate-spin-reverse"></div>
            <div className="absolute top-40 right-1/4 w-20 h-20 border-4 border-cyan-400/20 rounded-full animate-spin-slow"></div>
            
            {/* Animated file transformation icons */}
            <div className="absolute top-1/3 left-1/4 animate-float">
              <svg className="w-8 h-8 text-blue-500/20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                <path d="M14 2v6h6"/>
              </svg>
            </div>
            <div className="absolute bottom-1/3 right-1/3 animate-float-delay">
              <svg className="w-10 h-10 text-teal-500/20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-24 flex flex-col lg:flex-row items-center">
          <div className="w-full lg:w-1/2 text-center lg:text-left mb-12 lg:mb-0">
            <div className="animate-fade-in">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white drop-shadow-md">
                Transform Factory:
                <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-cyan-300">
                  Convert Anything, Anywhere
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-xl mx-auto lg:mx-0">
                Your Ultimate Hub for PDFs, Videos, Images & More
              </p>
              <a 
                href="#features" 
                className="inline-block px-8 py-4 text-lg font-semibold rounded-lg bg-gradient-to-r from-teal-500 to-blue-500 text-white hover:from-teal-600 hover:to-blue-600 transform hover:scale-105 transition-all duration-300 shadow-lg"
              >
                Start Transforming Now
              </a>
            </div>
          </div>
          
          <div className="w-full lg:w-1/2 relative">
            <div className="relative w-full h-80 lg:h-96 animate-fade-in-up">
              {/* 3D illustration of file transformation */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-teal-600/20 rounded-xl overflow-hidden flex items-center justify-center">
                <div className="relative transform-gpu">
                  {/* Factory conveyor belt metaphor */}
                  <div className="w-full h-16 bg-gray-800/50 rounded-lg absolute -bottom-5 left-0 right-0"></div>
                  
                  {/* Original file */}
                  <div className="absolute left-0 -top-5 transform-gpu -rotate-12 animate-file-move">
                    <div className="w-24 h-32 bg-blue-700 rounded-lg shadow-xl flex flex-col items-center justify-center">
                      <div className="w-16 h-3 bg-blue-500 mb-2 rounded"></div>
                      <div className="w-14 h-3 bg-blue-500 mb-2 rounded"></div>
                      <div className="w-12 h-3 bg-blue-500 rounded"></div>
                      <div className="absolute top-0 right-0 -mt-2 -mr-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                        PDF
                      </div>
                    </div>
                  </div>
                  
                  {/* Processing gears */}
                  <div className="absolute left-1/2 top-1/4 transform -translate-x-1/2 flex">
                    <div className="w-16 h-16 border-4 border-teal-500 rounded-full animate-spin-slow flex items-center justify-center">
                      <div className="w-10 h-10 border-4 border-teal-300 rounded-full"></div>
                    </div>
                    <div className="w-12 h-12 border-4 border-blue-500 rounded-full animate-spin-reverse -ml-4 mt-4 flex items-center justify-center">
                      <div className="w-6 h-6 border-4 border-blue-300 rounded-full"></div>
                    </div>
                  </div>
                  
                  {/* Converted file */}
                  <div className="absolute right-0 -top-5 transform-gpu rotate-12 animate-file-appear">
                    <div className="w-24 h-32 bg-teal-700 rounded-lg shadow-xl flex flex-col items-center justify-center">
                      <div className="w-16 h-3 bg-teal-500 mb-2 rounded"></div>
                      <div className="w-14 h-3 bg-teal-500 mb-2 rounded"></div>
                      <div className="w-12 h-3 bg-teal-500 rounded"></div>
                      <div className="absolute top-0 right-0 -mt-2 -mr-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                        DOCX
                      </div>
                    </div>
                  </div>
                  
                  {/* Animated arrows */}
                  <div className="absolute left-1/4 top-1/3 transform rotate-12 animate-pulse">
                    <svg className="w-8 h-8 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                  <div className="absolute right-1/4 top-1/3 transform -rotate-12 animate-pulse animation-delay-700">
                    <svg className="w-8 h-8 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Overview Section */}
      <section id="features" className="relative w-full py-24 bg-gradient-to-b from-gray-100 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-transparent bg-clip-text bg-gradient-to-r from-gray-700 to-gray-500 dark:from-gray-300 dark:to-gray-100">
            Discover the Power of Transformation
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={feature.title}
                className="bg-gray-900 dark:bg-gray-800 rounded-xl shadow-xl border border-gray-700/30 hover:border-teal-500/50 transform hover:-translate-y-2 transition-all duration-300 overflow-hidden"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="p-6">
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-teal-600 to-blue-600 flex items-center justify-center text-white mb-6 transform hover:rotate-3 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
                <div className="h-2 bg-gradient-to-r from-teal-500 to-blue-500"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Transform Factory Section */}
      <section className="w-full py-20 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-900 dark:text-white">
            Why Transform Factory?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div 
                key={benefit.title}
                className="bg-gray-100 dark:bg-gray-700 rounded-xl p-8 transform hover:scale-105 transition-all duration-300 border border-gray-200 dark:border-gray-600"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-600 to-blue-600 flex items-center justify-center text-white mb-6">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{benefit.title}</h3>
                <p className="text-gray-700 dark:text-gray-300">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="w-full py-20 bg-gray-100 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-900 dark:text-white">
            What Our Users Say About Transform Factory
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="bg-gray-800 dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700/30 transform hover:scale-105 transition-all duration-300"
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-300 italic mb-6">"{testimonial.quote}"</p>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div className="ml-3">
                    <p className="text-white font-medium">{testimonial.name}</p>
                    <p className="text-gray-400 text-sm">{testimonial.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-16 bg-gradient-to-r from-blue-900 to-blue-700">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Transform Your Files?</h2>
          <p className="text-xl text-blue-200 mb-8 max-w-3xl mx-auto">
            Join thousands of satisfied users who transform their files every day with our powerful conversion platform.
          </p>
          <a 
            href="/pdf" 
            className="inline-block px-8 py-4 text-lg font-semibold rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600 transform hover:scale-105 transition-all duration-300 shadow-lg"
          >
            Start Converting Now
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-blue-500 rounded-lg flex items-center justify-center text-white mr-3">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-white">Transform Factory</span>
              </div>
              <p className="mb-4">Transforming Files, Empowering You</p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-teal-400 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-2.719 0-4.924 2.205-4.924 4.924 0 .386.044.761.127 1.121-4.092-.205-7.72-2.166-10.149-5.145-.422.724-.665 1.566-.665 2.466 0 1.708.869 3.214 2.188 4.099-.807-.026-1.566-.248-2.228-.616v.061c0 2.385 1.693 4.374 3.946 4.827-.413.111-.849.171-1.296.171-.317 0-.625-.03-.927-.086.627 1.957 2.447 3.38 4.607 3.417-1.69 1.321-3.81 2.108-6.114 2.108-.398 0-.79-.023-1.175-.068 2.19 1.403 4.768 2.218 7.548 2.218 9.057 0 14.009-7.503 14.009-14.01 0-.213-.005-.426-.015-.637.961-.69 1.797-1.558 2.458-2.542l-.047-.02z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-teal-400 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.35C0 23.407.593 24 1.325 24h21.35c.732 0 1.325-.593 1.325-1.325V1.325C24 .593 23.407 0 22.675 0zm-7.03 5.414c2.392 0 4.044 1.74 4.044 3.913 0 2.346-1.782 4.118-4.312 4.118-2.362 0-4.031-1.77-4.031-4.12 0-2.172 1.65-3.911 4.033-3.911zM7.151 18.265h3.334v-8.294H7.151v8.294zm3.525-9.955c0-.867-.627-1.548-1.634-1.548-.867 0-1.49.68-1.49 1.548 0 .861.63 1.547 1.49 1.547h.005c1 0 1.629-.686 1.629-1.547zm5.361 9.955h3.35v-4.748c0-3.094-1.65-4.526-3.853-4.526-1.783 0-2.575.98-3.021 1.667h.024V8.002H9.19c.04.899 0 10.264 0 10.264h3.334v-5.73c0-.298.023-.596.12-.812.263-.65.86-1.319 1.868-1.319 1.319 0 1.849 1.01 1.849 2.491v5.37h.001z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-teal-400 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.49.5.09.682-.218.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.699 1.028 1.592 1.028 2.683 0 3.841-2.337 4.687-4.565 4.935.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12c0-5.523-4.477-10-10-10z" />
                  </svg>
                </a>
              </div>
            </div>
            
            <div className="col-span-1">
              <h3 className="text-lg font-bold text-white mb-4">About</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-teal-400 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors">Terms of Service</a></li>
              </ul>
            </div>
            
            <div className="col-span-1">
              <h3 className="text-lg font-bold text-white mb-4">Features</h3>
              <ul className="space-y-2">
                <li><a href="/pdf" className="hover:text-teal-400 transition-colors">Convert Files</a></li>
                <li><a href="/edit" className="hover:text-teal-400 transition-colors">Edit Files</a></li>
                <li><a href="/organize" className="hover:text-teal-400 transition-colors">Merge Files</a></li>
                <li><a href="/optimize" className="hover:text-teal-400 transition-colors">Secure Files</a></li>
              </ul>
            </div>
            
            <div className="col-span-1">
              <h3 className="text-lg font-bold text-white mb-4">Subscribe</h3>
              <p className="mb-4">Get the latest updates and offers</p>
              <form className="flex">
                <input 
                  type="email" 
                  placeholder="Your email" 
                  className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-teal-500 w-full"
                />
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-500 text-white font-medium rounded-r-lg hover:from-teal-600 hover:to-blue-600"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p>&copy; {new Date().getFullYear()} Transform Factory. All rights reserved.</p>
          </div>
        </div>
      </footer>
      
      {/* Custom animations */}
      <style jsx global>{`
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes spin-reverse {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(-360deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes float-delay {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes file-move {
          0% { transform: translateX(-50px) rotate(-12deg); opacity: 0; }
          20% { transform: translateX(0) rotate(-12deg); opacity: 1; }
          80% { transform: translateX(0) rotate(-12deg); opacity: 1; }
          100% { transform: translateX(50px) rotate(-12deg); opacity: 0; }
        }
        @keyframes file-appear {
          0%, 40% { transform: translateX(50px) rotate(12deg); opacity: 0; }
          60% { transform: translateX(0) rotate(12deg); opacity: 1; }
          100% { transform: translateX(0) rotate(12deg); opacity: 1; }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        .animate-spin-reverse {
          animation: spin-reverse 6s linear infinite;
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delay {
          animation: float-delay 5s ease-in-out infinite;
          animation-delay: 1s;
        }
        .animate-file-move {
          animation: file-move 6s ease-in-out infinite;
        }
        .animate-file-appear {
          animation: file-appear 6s ease-in-out infinite;
        }
        .animation-delay-700 {
          animation-delay: 700ms;
        }
      `}</style>
    </div>
  )
} 