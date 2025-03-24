'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FiMail, FiCheckCircle, FiGithub, FiTwitter, FiInstagram, FiLinkedin } from 'react-icons/fi'

const Footer = () => {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const currentYear = new Date().getFullYear()

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (email && email.includes('@')) {
      // In a real app, you would send this to your API
      console.log('Subscribing email:', email)
      setSubscribed(true)
      setEmail('')
      // Reset subscription state after 5 seconds
      setTimeout(() => setSubscribed(false), 5000)
    }
  }

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 pt-12 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 mr-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">P</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                PDF Toolkit
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Your all-in-one solution for managing, editing, and converting PDF files.
            </p>
            <div className="flex space-x-4">
              <SocialLink href="https://twitter.com" icon={<FiTwitter size={18} />} label="Twitter" />
              <SocialLink href="https://github.com" icon={<FiGithub size={18} />} label="GitHub" />
              <SocialLink href="https://linkedin.com" icon={<FiLinkedin size={18} />} label="LinkedIn" />
              <SocialLink href="https://instagram.com" icon={<FiInstagram size={18} />} label="Instagram" />
            </div>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Resources</h3>
            <ul className="space-y-3">
              <FooterLink href="/blog" label="Blog" />
              <FooterLink href="/guides" label="User Guides" />
              <FooterLink href="/api" label="API Docs" />
              <FooterLink href="/help" label="Help Center" />
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Company</h3>
            <ul className="space-y-3">
              <FooterLink href="/about" label="About Us" />
              <FooterLink href="/careers" label="Careers" />
              <FooterLink href="/contact" label="Contact" />
              <FooterLink href="/privacy" label="Privacy Policy" />
              <FooterLink href="/terms" label="Terms of Service" />
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Stay Updated</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Subscribe to our newsletter for tips, new features, and updates.
            </p>
            {!subscribed ? (
              <form onSubmit={handleSubscribe} className="flex">
                <div className="relative flex-grow">
                  <FiMail className="absolute left-3 top-3.5 text-gray-400" size={18} />
                  <input
                    type="email"
                    placeholder="Your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full py-3 pl-10 pr-3 rounded-l-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-r-lg transition-colors"
                >
                  Subscribe
                </button>
              </form>
            ) : (
              <div className="flex items-center space-x-2 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 p-3 rounded-lg animate-fadeIn">
                <FiCheckCircle size={20} />
                <span>Thanks for subscribing!</span>
              </div>
            )}
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-200 dark:border-gray-800 pt-8 mt-8 text-center">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            © {currentYear} PDF Toolkit. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

// Footer Link Component
const FooterLink = ({ href, label }: { href: string; label: string }) => {
  return (
    <li>
      <Link 
        href={href} 
        className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
      >
        {label}
      </Link>
    </li>
  )
}

// Social Media Link
const SocialLink = ({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) => {
  return (
    <a 
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
    >
      {icon}
    </a>
  )
}

export default Footer 