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

  // Dynamically render icon based on icon name
  const renderIcon = (iconName: string) => {
    // @ts-ignore - FiIcons will have the icon as a property
    const IconComponent = FiIcons[iconName]
    return IconComponent ? <IconComponent size={isGrid ? 24 : 20} /> : null
  }

  const iconColorClass = categoryColorMap[feature.category] || 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'

  if (isGrid) {
    return (
      <Link href={feature.path} className="group">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 hover-elevate h-full">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 flex items-center justify-center rounded-lg ${iconColorClass} transition-colors duration-300 text-xl`}>
                {renderIcon(feature.icon)}
              </div>
              
              {/* New badge */}
              {feature.isNew && (
                <span className="px-2 py-1 text-xs font-medium rounded-full animate-newBadge text-white bg-blue-600 dark:bg-blue-500 flex items-center">
                  New
                </span>
              )}
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {feature.name}
            </h3>
            
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              {feature.description}
            </p>
            
            <div className="flex items-center mt-auto text-blue-600 dark:text-blue-400 text-sm font-medium">
              <span>Use Tool</span>
              <FiArrowRight className="ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </Link>
    )
  } else {
    // List view
    return (
      <Link href={feature.path} className="group">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-750">
          <div className="p-4 flex items-center">
            <div className={`w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-lg ${iconColorClass} transition-colors duration-300 mr-4 text-lg`}>
              {renderIcon(feature.icon)}
            </div>
            
            <div className="flex-grow min-w-0">
              <div className="flex items-center">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                  {feature.name}
                </h3>
                
                {/* New badge */}
                {feature.isNew && (
                  <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full animate-newBadge text-white bg-blue-600 dark:bg-blue-500">
                    New
                  </span>
                )}
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 text-sm truncate">
                {feature.description}
              </p>
            </div>
            
            <FiArrowRight className="ml-2 flex-shrink-0 text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </Link>
    )
  }
}

export default FeatureCard 