'use client'

import Link from 'next/link'
import { useState } from 'react'
import { FiGithub, FiTwitter, FiLinkedin, FiInstagram, FiFacebook, FiArrowRight } from 'react-icons/fi'

export default function Footer() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      // Here you would typically handle the newsletter signup
      console.log('Subscribing email:', email)
      setSubscribed(true)
      setEmail('')
      
      // Reset the subscribed state after 3 seconds
      setTimeout(() => {
        setSubscribed(false)
      }, 3000)
    }
  }
  
  return (
    <footer className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-950 dark:to-gray-900 text-white pt-12 pb-6 mt-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                TransformFactory
              </span>
            </Link>
            <p className="text-gray-400 mb-4">
              Fast, reliable tools to transform and manage your files online. No software installation needed.
            </p>
            <div className="flex space-x-4 mt-4">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition-colors" aria-label="Twitter">
                <FiTwitter size={20} />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600 transition-colors" aria-label="Facebook">
                <FiFacebook size={20} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-500 transition-colors" aria-label="Instagram">
                <FiInstagram size={20} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-500 transition-colors" aria-label="LinkedIn">
                <FiLinkedin size={20} />
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" aria-label="GitHub">
                <FiGithub size={20} />
              </a>
            </div>
          </div>
          
          {/* Links Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:col-span-2">
            {/* Products */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Products</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/pdf" className="text-gray-400 hover:text-blue-400 transition-colors">PDF Tools</Link>
                </li>
                <li>
                  <Link href="/convert/image" className="text-gray-400 hover:text-blue-400 transition-colors">Image Tools</Link>
                </li>
                <li>
                  <Link href="/convert/document" className="text-gray-400 hover:text-blue-400 transition-colors">Document Tools</Link>
                </li>
                <li>
                  <Link href="/convert/video" className="text-gray-400 hover:text-blue-400 transition-colors">Video Tools</Link>
                </li>
              </ul>
            </div>
            
            {/* Company */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/about" className="text-gray-400 hover:text-blue-400 transition-colors">About Us</Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-400 hover:text-blue-400 transition-colors">Contact</Link>
                </li>
                <li>
                  <Link href="/blog" className="text-gray-400 hover:text-blue-400 transition-colors">Blog</Link>
                </li>
                <li>
                  <Link href="/careers" className="text-gray-400 hover:text-blue-400 transition-colors">Careers</Link>
                </li>
              </ul>
            </div>
            
            {/* Legal */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/privacy" className="text-gray-400 hover:text-blue-400 transition-colors">Privacy Policy</Link>
                </li>
                <li>
                  <Link href="/terms" className="text-gray-400 hover:text-blue-400 transition-colors">Terms of Service</Link>
                </li>
                <li>
                  <Link href="/cookies" className="text-gray-400 hover:text-blue-400 transition-colors">Cookie Policy</Link>
                </li>
                <li>
                  <Link href="/security" className="text-gray-400 hover:text-blue-400 transition-colors">Security</Link>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Newsletter */}
          <div className="md:col-span-1">
            <h3 className="text-lg font-semibold mb-4 text-white">Stay Updated</h3>
            <p className="text-gray-400 mb-4">
              Subscribe to our newsletter for the latest updates, tips, and special offers.
            </p>
            <form onSubmit={handleSubscribe}>
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full py-3 pl-4 pr-10 rounded-lg bg-gray-800 dark:bg-gray-950 text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
                <button
                  type="submit"
                  className="absolute right-0 top-0 h-full px-4 text-blue-400 hover:text-blue-300 flex items-center justify-center transition-colors"
                  aria-label="Subscribe"
                >
                  <FiArrowRight size={20} />
                </button>
              </div>
              {subscribed && (
                <p className="text-green-400 mt-2 animate-fadeIn">
                  Thank you for subscribing!
                </p>
              )}
            </form>
          </div>
        </div>
        
        <div className="border-t border-gray-800 dark:border-gray-700 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} TransformFactory. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-gray-500 text-sm">
            <Link href="/accessibility" className="hover:text-gray-300 transition-colors">Accessibility</Link>
            <span>|</span>
            <Link href="/sitemap" className="hover:text-gray-300 transition-colors">Sitemap</Link>
            <span>|</span>
            <Link href="/help" className="hover:text-gray-300 transition-colors">Help Center</Link>
          </div>
        </div>
      </div>
    </footer>
  )
} 