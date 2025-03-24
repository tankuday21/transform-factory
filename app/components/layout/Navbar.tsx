'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { FiSun, FiMoon, FiMenu, FiX, FiSearch, FiUser, FiHelpCircle, FiDollarSign } from 'react-icons/fi'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/pdf', label: 'PDF Tools' },
  { href: '/pricing', label: 'Pricing', icon: <FiDollarSign /> },
  { href: '/support', label: 'Support', icon: <FiHelpCircle /> },
]

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const pathname = usePathname()
  
  useEffect(() => {
    // Initialize theme from localStorage or system preference
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      
      const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light')
      setTheme(initialTheme)
      
      // Apply the theme
      if (initialTheme === 'dark') {
        document.documentElement.classList.add('dark')
        document.documentElement.setAttribute('data-theme', 'dark')
      } else {
        document.documentElement.classList.remove('dark')
        document.documentElement.setAttribute('data-theme', 'light')
      }
    }
  }, [])
  
  const toggleTheme = () => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light'
      
      // Save theme to localStorage
      localStorage.setItem('theme', newTheme)
      
      // Apply theme change
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark')
        document.documentElement.setAttribute('data-theme', 'dark')
      } else {
        document.documentElement.classList.remove('dark')
        document.documentElement.setAttribute('data-theme', 'light')
      }
      
      return newTheme
    })
  }
  
  const isActive = (path: string) => pathname === path

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Implement search functionality
    console.log('Searching for:', searchQuery)
    // Here you would typically redirect to search results page
  }

  return (
    <nav className="bg-gradient-to-r from-blue-600/95 to-purple-600/95 dark:from-blue-900/95 dark:to-purple-900/95 shadow-lg backdrop-blur-sm sticky top-0 z-50 text-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-white">
              TransformFactory
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center ${
                  isActive(link.href)
                    ? 'bg-white/20 text-white'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                {link.icon && <span className="mr-1.5">{link.icon}</span>}
                {link.label}
              </Link>
            ))}
          </div>

          {/* Search Bar (Desktop) */}
          <div className="hidden md:block flex-grow max-w-md mx-4">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-2 pl-10 pr-4 rounded-full bg-white/20 text-white placeholder-white/70 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
              />
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70" />
            </form>
          </div>

          {/* Right Side - Theme Toggle, Login and Mobile Menu Button */}
          <div className="flex items-center space-x-2">
            {/* Search Button (Mobile) */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="md:hidden p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              aria-label="Search"
            >
              <FiSearch size={20} />
            </button>
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {theme === 'light' ? <FiMoon size={20} /> : <FiSun size={20} />}
            </button>

            {/* Login Button */}
            <Link href="/login" className="hidden sm:flex items-center p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors">
              <FiUser size={20} />
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {isSearchOpen && (
        <div className="md:hidden px-4 pb-3 animate-slideDown">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-2 pl-10 pr-4 rounded-full bg-white/20 text-white placeholder-white/70 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
              autoFocus
            />
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70" />
          </form>
        </div>
      )}

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-900 dark:to-purple-900 shadow-lg py-3 px-4 animate-slideDown">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-md text-base font-medium flex items-center ${
                  isActive(link.href)
                    ? 'bg-white/20 text-white'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.icon && <span className="mr-2">{link.icon}</span>}
                {link.label}
              </Link>
            ))}
            <Link
              href="/login"
              className="px-3 py-2 rounded-md text-base font-medium flex items-center text-white/80 hover:bg-white/10 hover:text-white"
              onClick={() => setIsMenuOpen(false)}
            >
              <FiUser className="mr-2" />
              Login
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
} 