'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTheme } from '@/app/context/ThemeContext'
import ThemeToggle from '../ui/ThemeToggle'
import { FiMenu, FiX, FiSearch } from 'react-icons/fi'

const Header = () => {
  const { theme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Handle scroll events for sticky header effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Handle search query
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Searching for:', searchQuery)
    // Implement search functionality
    setSearchOpen(false)
    setSearchQuery('')
  }

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-md' : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="relative w-10 h-10 mr-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center animate-gradient overflow-hidden">
              <span className="text-white font-bold text-xl">P</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              PDF Toolkit
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <NavLink href="/features" label="Features" />
            <NavLink href="/pricing" label="Pricing" />
            <NavLink href="/support" label="Support" />
            <NavLink href="/dashboard" label="Dashboard" />
            
            <button 
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ml-2"
              aria-label="Search"
            >
              <FiSearch className="text-gray-600 dark:text-gray-300" size={20} />
            </button>
            
            <ThemeToggle />
            
            <Link 
              href="/login" 
              className="ml-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium transition-all hover-elevate">
              Sign In
            </Link>
          </nav>

          {/* Mobile Navigation Toggle */}
          <div className="flex items-center md:hidden">
            <button 
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Search"
            >
              <FiSearch className="text-gray-600 dark:text-gray-300" size={20} />
            </button>
            
            <ThemeToggle />
            
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 ml-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              aria-label={isOpen ? 'Close Menu' : 'Open Menu'}
            >
              {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div className="mt-4 animate-fadeInDown">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search PDF tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-3 pl-10 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <FiSearch className="absolute left-3 top-3.5 text-gray-400" size={20} />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <FiX size={20} />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 animate-fadeInDown">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col space-y-4">
              <MobileNavLink href="/features" label="Features" onClick={() => setIsOpen(false)} />
              <MobileNavLink href="/pricing" label="Pricing" onClick={() => setIsOpen(false)} />
              <MobileNavLink href="/support" label="Support" onClick={() => setIsOpen(false)} />
              <MobileNavLink href="/dashboard" label="Dashboard" onClick={() => setIsOpen(false)} />
              <Link 
                href="/login" 
                onClick={() => setIsOpen(false)}
                className="w-full text-center px-4 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium transition-all">
                Sign In
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}

// Desktop Navigation Link
const NavLink = ({ href, label }: { href: string; label: string }) => {
  return (
    <Link 
      href={href} 
      className="px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium transition-colors"
    >
      {label}
    </Link>
  )
}

// Mobile Navigation Link
const MobileNavLink = ({ href, label, onClick }: { href: string; label: string; onClick: () => void }) => {
  return (
    <Link 
      href={href} 
      onClick={onClick}
      className="px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium transition-colors block"
    >
      {label}
    </Link>
  )
}

export default Header 