'use client'

import { useState, useEffect } from 'react'
import { CategoryFeature } from '@/app/data/features'
import FeatureCard from './FeatureCard'
import * as FiIcons from 'react-icons/fi'
import { FiChevronUp, FiChevronDown, FiPlus } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'

interface CategorySectionProps {
  category: CategoryFeature
}

const CategorySection = ({ category }: CategorySectionProps) => {
  const [isExpanded, setIsExpanded] = useState(true)
  const [isDarkMode, setIsDarkMode] = useState(false)
  
  // Use useEffect to safely check document on client side
  useEffect(() => {
    setIsDarkMode(document.documentElement.getAttribute('data-theme') === 'dark')
    
    // Add a listener to update when theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-theme') {
          setIsDarkMode(document.documentElement.getAttribute('data-theme') === 'dark')
        }
      })
    })
    
    observer.observe(document.documentElement, { attributes: true })
    
    return () => observer.disconnect()
  }, [])
  
  // Get the gradient class for the category
  const getCategoryGradient = () => {
    return `bg-gradient-to-r ${isDarkMode ? category.colorDark : category.color}`
  }
  
  // Dynamically render icon based on icon name
  const renderIcon = (iconName: string) => {
    // @ts-ignore - FiIcons will have the icon as a property
    const IconComponent = FiIcons[iconName]
    return IconComponent ? <IconComponent size={24} /> : null
  }
  
  return (
    <motion.div 
      className="rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Category Header */}
      <div 
        className={`flex items-center justify-between p-6 cursor-pointer relative overflow-hidden ${isExpanded ? 'border-b border-gray-200 dark:border-gray-700' : ''}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Background blur gradient */}
        <div className={`absolute inset-0 opacity-10 ${getCategoryGradient()}`}></div>
        
        <div className="flex items-center relative z-10">
          <div className={`w-14 h-14 rounded-xl ${getCategoryGradient()} flex items-center justify-center text-white text-xl mr-5 shadow-lg`}>
            {renderIcon(category.icon)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{category.title}</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">{category.description}</p>
          </div>
        </div>

        <motion.button 
          className="w-10 h-10 rounded-full flex items-center justify-center bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors shadow-sm relative z-10"
          aria-label={isExpanded ? 'Collapse section' : 'Expand section'}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            animate={{ rotate: isExpanded ? 0 : 180 }}
            transition={{ duration: 0.3 }}
          >
            <FiChevronUp size={20} />
          </motion.div>
        </motion.button>
      </div>
      
      {/* Tools Grid with Animation */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            className="px-6 pb-6"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {category.tools.map((tool, index) => (
                <motion.div
                  key={tool.id} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <FeatureCard 
                    feature={tool}
                    viewMode="categories" 
                  />
                </motion.div>
              ))}
              
              {/* Add more tools button with animation */}
              <motion.div 
                className="bg-gray-50 dark:bg-gray-750 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 flex items-center justify-center transition-colors cursor-pointer h-full shadow-sm"
                whileHover={{ scale: 1.03, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)' }}
                whileTap={{ scale: 0.97 }}
              >
                <div className="flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-14 h-14 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 shadow-inner">
                    <FiPlus size={24} />
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 font-medium">Request a Tool</p>
                  <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">Suggest new functionality</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default CategorySection 