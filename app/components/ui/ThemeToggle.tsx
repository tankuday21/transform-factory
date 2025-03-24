'use client'

import { useTheme } from '@/app/context/ThemeContext'
import { FiSun, FiMoon } from 'react-icons/fi'

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme.name === 'dark'

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative overflow-hidden"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div className="relative z-10">
        {isDark ? (
          <FiSun className="text-yellow-400" size={20} />
        ) : (
          <FiMoon className="text-blue-600" size={20} />
        )}
      </div>
      
      {/* Animated background */}
      <span 
        className={`absolute inset-0 transform transition-transform duration-500 ${
          isDark 
            ? 'bg-gray-800 rotate-0' 
            : 'bg-yellow-100 rotate-90'
        }`} 
      />
    </button>
  )
}

export default ThemeToggle 