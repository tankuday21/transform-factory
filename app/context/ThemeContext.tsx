'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { lightTheme, darkTheme, ThemeType, Theme } from '../styles/theme'

type ThemeContextType = {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: ThemeType) => void
}

// Create context with default value
const ThemeContext = createContext<ThemeContextType>({
  theme: lightTheme,
  toggleTheme: () => {},
  setTheme: () => {},
})

// Custom hook to use the theme context
export const useTheme = () => useContext(ThemeContext)

// Theme provider component
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize with light theme, but will check localStorage on mount
  const [currentTheme, setCurrentTheme] = useState<Theme>(lightTheme)

  // Effect to load theme preference from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as ThemeType | null
    if (savedTheme) {
      setCurrentTheme(savedTheme === 'dark' ? darkTheme : lightTheme)
      // Also apply theme to document for global CSS variables
      document.documentElement.setAttribute('data-theme', savedTheme)
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      // Use system preference as fallback
      setCurrentTheme(darkTheme)
      document.documentElement.setAttribute('data-theme', 'dark')
    }

    // Add CSS variables to :root
    applyThemeToRoot(savedTheme === 'dark' ? darkTheme : lightTheme)
  }, [])

  // Apply CSS variables to :root based on current theme
  const applyThemeToRoot = (theme: Theme) => {
    const root = document.documentElement
    
    // Background colors
    root.style.setProperty('--bg-primary', theme.colors.background.primary)
    root.style.setProperty('--bg-secondary', theme.colors.background.secondary)
    root.style.setProperty('--bg-gradient', theme.colors.background.gradient)
    root.style.setProperty('--bg-card', theme.colors.background.card)
    root.style.setProperty('--bg-hover', theme.colors.background.hover)
    
    // Text colors
    root.style.setProperty('--text-primary', theme.colors.text.primary)
    root.style.setProperty('--text-secondary', theme.colors.text.secondary)
    root.style.setProperty('--text-accent', theme.colors.text.accent)
    root.style.setProperty('--text-muted', theme.colors.text.muted)
    
    // Category colors
    root.style.setProperty('--category-convert', theme.colors.category.convert)
    root.style.setProperty('--category-edit', theme.colors.category.edit)
    root.style.setProperty('--category-organize', theme.colors.category.organize)
    root.style.setProperty('--category-optimize', theme.colors.category.optimize)
    root.style.setProperty('--category-secure', theme.colors.category.secure)
    root.style.setProperty('--category-advanced', theme.colors.category.advanced)
    
    // Button colors
    root.style.setProperty('--btn-primary', theme.colors.button.primary)
    root.style.setProperty('--btn-primary-hover', theme.colors.button.primaryHover)
    root.style.setProperty('--btn-secondary', theme.colors.button.secondary)
    root.style.setProperty('--btn-secondary-hover', theme.colors.button.secondaryHover)
    root.style.setProperty('--btn-success', theme.colors.button.success)
    root.style.setProperty('--btn-danger', theme.colors.button.danger)
    
    // Border colors
    root.style.setProperty('--border-light', theme.colors.border.light)
    root.style.setProperty('--border-medium', theme.colors.border.medium)
    root.style.setProperty('--border-dark', theme.colors.border.dark)
    
    // Shadow
    root.style.setProperty('--shadow-sm', theme.colors.shadow.sm)
    root.style.setProperty('--shadow-md', theme.colors.shadow.md)
    root.style.setProperty('--shadow-lg', theme.colors.shadow.lg)
    
    // Status colors
    root.style.setProperty('--status-new', theme.colors.status.new)
    root.style.setProperty('--status-success', theme.colors.status.success)
    root.style.setProperty('--status-warning', theme.colors.status.warning)
    root.style.setProperty('--status-error', theme.colors.status.error)
    root.style.setProperty('--status-info', theme.colors.status.info)
    
    // Animation
    root.style.setProperty('--timing-fast', theme.animation.timing.fast)
    root.style.setProperty('--timing-normal', theme.animation.timing.normal)
    root.style.setProperty('--timing-slow', theme.animation.timing.slow)
    root.style.setProperty('--easing-default', theme.animation.easing.default)
    root.style.setProperty('--easing-bounce', theme.animation.easing.bounce)
    
    // Border radius
    root.style.setProperty('--radius-sm', theme.border.radius.sm)
    root.style.setProperty('--radius-md', theme.border.radius.md)
    root.style.setProperty('--radius-lg', theme.border.radius.lg)
    root.style.setProperty('--radius-xl', theme.border.radius.xl)
    root.style.setProperty('--radius-pill', theme.border.radius.pill)
  }

  // Toggle between light and dark themes
  const toggleTheme = () => {
    const newTheme = currentTheme.name === 'light' ? darkTheme : lightTheme
    setCurrentTheme(newTheme)
    localStorage.setItem('theme', newTheme.name)
    document.documentElement.setAttribute('data-theme', newTheme.name)
    applyThemeToRoot(newTheme)
  }

  // Set a specific theme
  const setThemeByName = (themeName: ThemeType) => {
    const newTheme = themeName === 'dark' ? darkTheme : lightTheme
    setCurrentTheme(newTheme)
    localStorage.setItem('theme', themeName)
    document.documentElement.setAttribute('data-theme', themeName)
    applyThemeToRoot(newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme: currentTheme, toggleTheme, setTheme: setThemeByName }}>
      {children}
    </ThemeContext.Provider>
  )
} 