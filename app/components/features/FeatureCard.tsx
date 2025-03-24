'use client'

import Link from 'next/link'
import { Tool } from '@/app/data/features'
import * as FiIcons from 'react-icons/fi'
import { FiArrowRight } from 'react-icons/fi'

interface FeatureCardProps {
  feature: Tool
  viewMode: 'grid' | 'list' | 'categories'
}

const FeatureCard = ({ feature, viewMode }: FeatureCardProps) => {
  const isGrid = viewMode === 'grid' || viewMode === 'categories'
  const categoryColorMap: Record<string, string> = {
    convert: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white dark:group-hover:bg-blue-600',
    edit: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 group-hover:bg-purple-600 group-hover:text-white dark:group-hover:bg-purple-600',
    organize: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 group-hover:bg-red-600 group-hover:text-white dark:group-hover:bg-red-600',
    optimize: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 group-hover:bg-green-600 group-hover:text-white dark:group-hover:bg-green-600',
    secure: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 group-hover:bg-orange-600 group-hover:text-white dark:group-hover:bg-orange-600',
    advanced: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400 group-hover:bg-teal-600 group-hover:text-white dark:group-hover:bg-teal-600',
  }

  // Gradient backgrounds by category
  const categoryGradientMap: Record<string, string> = {
    convert: 'from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-800',
    edit: 'from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-800',
    organize: 'from-red-500 to-red-600 dark:from-red-600 dark:to-red-800',
    optimize: 'from-green-500 to-green-600 dark:from-green-600 dark:to-green-800',
    secure: 'from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-800',
    advanced: 'from-teal-500 to-teal-600 dark:from-teal-600 dark:to-teal-800',
  }

  // Dynamically render icon based on icon name
  const renderIcon = (iconName: string) => {
    // @ts-ignore - FiIcons will have the icon as a property
    const IconComponent = FiIcons[iconName]
    return IconComponent ? <IconComponent size={isGrid ? 24 : 20} /> : null
  }

  const iconColorClass = categoryColorMap[feature.category] || 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
  const gradientClass = categoryGradientMap[feature.category] || 'from-gray-500 to-gray-600'

  if (isGrid) {
    return (
      <Link href={`/${feature.category}/${encodeURIComponent(feature.id)}`} className="group">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 transform hover:-translate-y-1 h-full">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-14 h-14 flex items-center justify-center rounded-xl ${iconColorClass} transition-all duration-300 text-xl`}>
                {renderIcon(feature.icon)}
              </div>
              
              {/* Enhanced New badge with animation */}
              {feature.isNew && (
                <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md animate-pulse flex items-center">
                  New!
                </span>
              )}
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {feature.name}
            </h3>
            
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              {feature.description}
            </p>
            
            <div className="mt-auto">
              <div className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white rounded-full bg-gradient-to-r group-hover:shadow-md transition-all duration-300 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 ${gradientClass}">
                <span>Use Tool</span>
                <FiArrowRight className="ml-1.5 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </div>
          </div>
          
          {/* Bottom accent bar */}
          <div className={`h-1 w-full bg-gradient-to-r ${gradientClass} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`}></div>
        </div>
      </Link>
    )
  } else {
    // List view
    return (
      <Link href={`/${feature.category}/${encodeURIComponent(feature.id)}`} className="group">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-750">
          <div className="p-4 flex items-center">
            <div className={`w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-lg ${iconColorClass} transition-colors duration-300 mr-4 text-lg`}>
              {renderIcon(feature.icon)}
            </div>
            
            <div className="flex-grow min-w-0">
              <div className="flex items-center">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                  {feature.name}
                </h3>
                
                {/* Enhanced New badge */}
                {feature.isNew && (
                  <span className="ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-sm animate-pulse">
                    New!
                  </span>
                )}
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 text-sm truncate">
                {feature.description}
              </p>
            </div>
            
            <div className="ml-2 w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
              <FiArrowRight className="group-hover:translate-x-0.5 transition-transform duration-300" />
            </div>
          </div>
          
          {/* Left accent bar */}
          <div className={`absolute left-0 top-0 w-1 h-full bg-gradient-to-b ${gradientClass} transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-bottom`}></div>
        </div>
      </Link>
    )
  }
}

export default FeatureCard 