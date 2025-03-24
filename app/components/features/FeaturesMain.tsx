'use client'

import { useState } from 'react'
import { pdfFeatures, getAllTools } from '@/app/data/features'
import FeatureGrid from './FeatureGrid'
import CategorySection from './CategorySection'
import { FiGrid, FiList, FiCompass } from 'react-icons/fi'

const FeaturesMain = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'categories'>('categories')
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">PDF Tools</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Transform and manage your PDFs with our powerful tools
          </p>
        </div>
        
        <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center px-4 py-2 rounded-md transition-colors ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
            }`}
          >
            <FiGrid className="mr-2" />
            Grid
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center px-4 py-2 rounded-md transition-colors ${
              viewMode === 'list'
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
            }`}
          >
            <FiList className="mr-2" />
            List
          </button>
          <button
            onClick={() => setViewMode('categories')}
            className={`flex items-center px-4 py-2 rounded-md transition-colors ${
              viewMode === 'categories'
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
            }`}
          >
            <FiCompass className="mr-2" />
            Categories
          </button>
        </div>
      </div>

      {/* Show Feature Grid for Grid and List views */}
      {(viewMode === 'grid' || viewMode === 'list') && (
        <FeatureGrid viewMode={viewMode} initialTools={getAllTools()} />
      )}

      {/* Show Categories view */}
      {viewMode === 'categories' && (
        <div className="space-y-8 animate-fadeIn">
          {pdfFeatures.map((category) => (
            <CategorySection key={category.id} category={category} />
          ))}
        </div>
      )}
    </div>
  )
}

export default FeaturesMain 