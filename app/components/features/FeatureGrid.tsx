'use client'

import { useState, useEffect } from 'react'
import { Tool } from '@/app/data/features'
import FeatureCard from './FeatureCard'
import { FiSearch, FiFilter, FiArrowUp, FiArrowDown } from 'react-icons/fi'

interface FeatureGridProps {
  viewMode: 'grid' | 'list' | 'categories'
  initialTools: Tool[]
}

const FeatureGrid = ({ viewMode, initialTools }: FeatureGridProps) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOption, setSortOption] = useState<'alphabetical' | 'popular' | 'newest'>('popular')
  const [tools, setTools] = useState<Tool[]>(initialTools)
  
  // Filter tools based on search query
  const filteredTools = tools.filter(tool => {
    const searchLower = searchQuery.toLowerCase()
    return (
      tool.name.toLowerCase().includes(searchLower) ||
      tool.description.toLowerCase().includes(searchLower) ||
      tool.category.toLowerCase().includes(searchLower)
    )
  })
  
  // Sort tools based on sort option
  const sortedTools = [...filteredTools].sort((a, b) => {
    if (sortOption === 'alphabetical') {
      return a.name.localeCompare(b.name)
    } else if (sortOption === 'popular') {
      return (b.popularity || 0) - (a.popularity || 0)
    } else if (sortOption === 'newest') {
      return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)
    }
    return 0
  })
  
  useEffect(() => {
    setTools(initialTools)
  }, [initialTools])
  
  return (
    <div className="animate-fadeIn">
      {/* Search and filter bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-grow relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          />
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setSortOption('alphabetical')}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              sortOption === 'alphabetical'
                ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300'
                : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            <span className="hidden md:inline">A-Z</span>
            <span className="inline md:hidden">
              <FiArrowDown className={sortOption === 'alphabetical' ? 'text-blue-600' : 'text-gray-500'} />
            </span>
          </button>
          
          <button
            onClick={() => setSortOption('popular')}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              sortOption === 'popular'
                ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300'
                : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            <span className="hidden md:inline">Popular</span>
            <span className="inline md:hidden">
              <FiArrowUp className={sortOption === 'popular' ? 'text-blue-600' : 'text-gray-500'} />
            </span>
          </button>
          
          <button
            onClick={() => setSortOption('newest')}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              sortOption === 'newest'
                ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300'
                : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            <span className="hidden md:inline">Newest</span>
            <span className="inline md:hidden">
              <FiFilter className={sortOption === 'newest' ? 'text-blue-600' : 'text-gray-500'} />
            </span>
          </button>
        </div>
      </div>
      
      {/* Results summary */}
      <div className="mb-4 text-gray-600 dark:text-gray-400">
        {sortedTools.length === 0 ? (
          <p>No tools found matching "{searchQuery}"</p>
        ) : (
          <p>Showing {sortedTools.length} of {tools.length} tools</p>
        )}
      </div>
      
      {/* Tools grid */}
      <div className={`grid gap-4 ${
        viewMode === 'grid' 
          ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4' 
          : 'grid-cols-1'
      }`}>
        {sortedTools.map((tool) => (
          <FeatureCard 
            key={tool.id} 
            feature={tool} 
            viewMode={viewMode} 
          />
        ))}
      </div>
      
      {/* No results */}
      {sortedTools.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 mb-4 text-gray-300 dark:text-gray-600">
            <FiSearch size={64} />
          </div>
          <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">No tools found</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md">
            We couldn't find any tools matching "{searchQuery}". Try a different search term or browse by category.
          </p>
        </div>
      )}
    </div>
  )
}

export default FeatureGrid 