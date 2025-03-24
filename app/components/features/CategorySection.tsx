'use client'

import { useState, useEffect } from 'react'
import { CategoryFeature } from '@/app/data/features'
import FeatureCard from './FeatureCard'
import * as FiIcons from 'react-icons/fi'
import { FiChevronUp, FiChevronDown, FiPlus } from 'react-icons/fi'

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
    <div className="rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden transition-all duration-300">
      {/* Category Header */}
      <div 
        className="flex items-center justify-between p-6 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          <div className={`w-12 h-12 rounded-lg ${getCategoryGradient()} flex items-center justify-center text-white text-xl mr-4`}>
            {renderIcon(category.icon)}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{category.title}</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-0.5">{category.description}</p>
          </div>
        </div>

        <button 
          className="w-9 h-9 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          aria-label={isExpanded ? 'Collapse section' : 'Expand section'}
        >
          {isExpanded ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
        </button>
      </div>
      
      {/* Tools Grid */}
      {isExpanded && (
        <div className="px-6 pb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 stagger-grid">
            {category.tools.map((tool) => (
              <FeatureCard 
                key={tool.id} 
                feature={tool}
                viewMode="categories" 
              />
            ))}
            
            {/* Add more tools button - can be implemented later */}
            <div className="bg-gray-50 dark:bg-gray-750 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 flex items-center justify-center transition-colors cursor-pointer h-full">
              <div className="flex flex-col items-center justify-center p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2">
                  <FiPlus size={24} />
                </div>
                <p className="text-gray-600 dark:text-gray-400 font-medium">Request a Tool</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CategorySection 