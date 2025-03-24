'use client'

import { useState, useEffect } from 'react'
import { pdfFeatures, getAllTools, getCategoryById } from '@/app/data/features'
import FeatureGrid from './FeatureGrid'
import CategorySection from './CategorySection'
import { FiGrid, FiList, FiCompass, FiSearch, FiChevronDown } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'

interface FeaturesMainProps {
  initialCategory?: string;
}

const FeaturesMain = ({ initialCategory }: FeaturesMainProps = {}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'categories'>('categories')
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  
  // Filter features by category if initialCategory is provided
  const featuresData = initialCategory 
    ? [getCategoryById(initialCategory)].filter(Boolean) as typeof pdfFeatures
    : pdfFeatures;
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Switch to grid view for search results
    if (searchQuery.trim() && viewMode === 'categories') {
      setViewMode('grid')
    }
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <motion.div 
        className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-800 dark:to-purple-800 shadow-lg p-8 mb-12 text-white relative overflow-hidden"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Background pattern */}
        <div className="absolute top-0 left-0 right-0 bottom-0 opacity-10 bg-center bg-cover"
             style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')" }}></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div className="flex-shrink-0">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              {initialCategory 
                ? getCategoryById(initialCategory)?.title || 'PDF Tools'
                : 'Transform Your PDFs'
              }
            </h1>
            <p className="text-white/80 text-lg max-w-xl">
              {initialCategory
                ? getCategoryById(initialCategory)?.description || 'Transform and manage your PDFs with our powerful tools'
                : 'Powerful tools to convert, edit, organize and optimize your PDF documents with ease'
              }
            </p>
          </div>
          
          <div className="w-full md:w-auto flex-grow md:max-w-md">
            <form onSubmit={handleSearch} className="relative">
              <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-all ${isSearchFocused ? 'text-blue-500' : 'text-white/70'}`}>
                <FiSearch className="text-lg" />
              </div>
              <input
                type="text"
                placeholder="Search all tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className="w-full py-3 pl-11 pr-4 rounded-xl border border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all hover:bg-white/20"
              />
            </form>
          </div>
        </div>
      </motion.div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center p-1 bg-gray-100 dark:bg-gray-800 rounded-xl shadow-sm">
          <motion.button
            onClick={() => setViewMode('grid')}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
            }`}
            whileHover={{ scale: viewMode === 'grid' ? 1 : 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <FiGrid className="mr-2" />
            Grid
          </motion.button>
          <motion.button
            onClick={() => setViewMode('list')}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'list'
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
            }`}
            whileHover={{ scale: viewMode === 'list' ? 1 : 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <FiList className="mr-2" />
            List
          </motion.button>
          <motion.button
            onClick={() => setViewMode('categories')}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'categories'
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
            }`}
            whileHover={{ scale: viewMode === 'categories' ? 1 : 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <FiCompass className="mr-2" />
            Categories
          </motion.button>
        </div>
        
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <span className="hidden md:inline">Sort by:</span>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm font-medium">
            Popular <FiChevronDown size={16} />
          </button>
        </div>
      </div>

      {/* Show Feature Grid for Grid and List views */}
      <AnimatePresence mode="wait">
        {(viewMode === 'grid' || viewMode === 'list') && (
          <motion.div
            key="grid-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <FeatureGrid 
              viewMode={viewMode} 
              initialTools={initialCategory 
                ? getCategoryById(initialCategory)?.tools || [] 
                : getAllTools()
              } 
              searchQuery={searchQuery}
            />
          </motion.div>
        )}

        {/* Show Categories view */}
        {viewMode === 'categories' && (
          <motion.div 
            key="categories-view"
            className="space-y-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {featuresData.map((category, index) => (
              <motion.div 
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <CategorySection category={category} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default FeaturesMain 