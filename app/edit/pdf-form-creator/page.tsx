'use client'

import { useState, useRef } from 'react'
import { FiUpload, FiFile, FiDownload, FiPlus, FiCheck, FiTrash2, FiMenu } from 'react-icons/fi'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'

// Form field types
type FieldType = 'text' | 'checkbox' | 'radio' | 'dropdown'

// Form field interface
interface FormField {
  id: string
  type: FieldType
  label: string
  required: boolean
  x: number
  y: number
  width: number
  height: number
  options?: string[] // For radio and dropdown fields
  page: number
}

export default function PdfFormCreatorPage() {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fields, setFields] = useState<FormField[]>([])
  const [currentField, setCurrentField] = useState<FormField | null>(null)
  const [numPages, setNumPages] = useState<number>(1)
  const [currentPage, setCurrentPage] = useState<number>(1)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const downloadLinkRef = useRef<HTMLAnchorElement>(null)

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0]
      
      // Check if file is a PDF
      if (selectedFile.type !== 'application/pdf') {
        setError('Please select a PDF file.')
        return
      }
      
      setFile(selectedFile)
      setError(null)
      
      // Simulate getting page count from the PDF
      // In a real implementation, you would use a PDF library to get the actual page count
      // For this example, we'll set a random number between 1 and 10
      const mockPageCount = Math.floor(Math.random() * 10) + 1
      setNumPages(mockPageCount)
      setCurrentPage(1)
    }
  }

  // Handle drag and drop events
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const selectedFile = e.dataTransfer.files[0]
      
      // Check if file is a PDF
      if (selectedFile.type !== 'application/pdf') {
        setError('Please select a PDF file.')
        return
      }
      
      setFile(selectedFile)
      setError(null)
      
      // Simulate getting page count from the PDF
      const mockPageCount = Math.floor(Math.random() * 10) + 1
      setNumPages(mockPageCount)
      setCurrentPage(1)
    }
  }

  // Add a new form field
  const addFormField = (type: FieldType) => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      type,
      label: `${type.charAt(0).toUpperCase() + type.slice(1)} Field`,
      required: false,
      x: 50,
      y: 50,
      width: type === 'checkbox' ? 20 : 150,
      height: type === 'checkbox' ? 20 : 30,
      page: currentPage,
      options: (type === 'radio' || type === 'dropdown') ? ['Option 1', 'Option 2', 'Option 3'] : undefined,
    }
    
    setFields([...fields, newField])
    setCurrentField(newField)
  }

  // Update a form field
  const updateField = (id: string, updates: Partial<FormField>) => {
    const updatedFields = fields.map(field => 
      field.id === id ? { ...field, ...updates } : field
    )
    
    setFields(updatedFields)
    
    if (currentField && currentField.id === id) {
      setCurrentField({ ...currentField, ...updates })
    }
  }

  // Delete a form field
  const deleteField = (id: string) => {
    const updatedFields = fields.filter(field => field.id !== id)
    setFields(updatedFields)
    
    if (currentField && currentField.id === id) {
      setCurrentField(null)
    }
  }

  // Handle field reordering
  const handleDragEnd = (result: any) => {
    if (!result.destination) return
    
    const items = Array.from(fields)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)
    
    setFields(items)
  }

  // Process the PDF form
  const processPDF = async () => {
    if (!file) {
      setError('Please select a PDF file.')
      return
    }
    
    if (fields.length === 0) {
      setError('Please add at least one form field.')
      return
    }
    
    setIsProcessing(true)
    setError(null)
    
    try {
      // Create form data
      const formData = new FormData()
      formData.append('pdf', file)
      formData.append('fields', JSON.stringify(fields))
      
      // Send request to API
      const response = await fetch('/api/pdf/create-form', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create PDF form')
      }
      
      // Get the blob from the response
      const blob = await response.blob()
      
      // Create object URL for download
      const url = URL.createObjectURL(blob)
      
      // Set download link
      if (downloadLinkRef.current) {
        downloadLinkRef.current.href = url
        downloadLinkRef.current.download = file.name.replace('.pdf', '_form.pdf')
        setIsComplete(true)
      }
    } catch (err: any) {
      console.error('Error creating PDF form:', err)
      setError(err.message || 'An error occurred while creating the PDF form. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  // Reset the form
  const resetForm = () => {
    setFile(null)
    setIsComplete(false)
    setError(null)
    setFields([])
    setCurrentField(null)
    setNumPages(1)
    setCurrentPage(1)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Create Fillable PDF Form</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Add form fields to your PDF document to make it fillable
      </p>
      
      {!file ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Select PDF File</h2>
          
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center ${
              isDragging
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50'
            }`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".pdf"
              onChange={handleFileChange}
            />
            
            <div className="flex flex-col items-center justify-center">
              <FiUpload className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-3" />
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Drag and drop your PDF file here, or{' '}
                <button
                  type="button"
                  className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  browse files
                </button>
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-600">
                Maximum file size: 15MB
              </p>
            </div>
          </div>
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
              <p>{error}</p>
            </div>
          )}
        </div>
      ) : !isComplete ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column - PDF preview */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h2 className="font-semibold">PDF Preview - Page {currentPage} of {numPages}</h2>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    className="px-2 py-1 rounded text-sm bg-gray-200 dark:bg-gray-700 disabled:opacity-50"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    className="px-2 py-1 rounded text-sm bg-gray-200 dark:bg-gray-700 disabled:opacity-50"
                    disabled={currentPage === numPages}
                    onClick={() => setCurrentPage(prev => Math.min(numPages, prev + 1))}
                  >
                    Next
                  </button>
                </div>
              </div>
              
              <div className="relative h-[600px] bg-gray-100 dark:bg-gray-900 p-4 overflow-auto">
                {/* This would be a real PDF preview in a complete implementation */}
                <div className="bg-white dark:bg-gray-800 shadow-md mx-auto w-[595px] h-[842px] relative">
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-500">
                    <p>PDF Preview (Page {currentPage})</p>
                  </div>
                  <div className="absolute inset-0">
                    {fields
                      .filter(field => field.page === currentPage)
                      .map(field => (
                        <div
                          key={field.id}
                          className={`absolute border-2 ${
                            currentField?.id === field.id 
                              ? 'border-blue-500 bg-blue-100/50 dark:bg-blue-900/30' 
                              : 'border-gray-400 bg-gray-100/50 dark:bg-gray-800/50'
                          } rounded cursor-move`}
                          style={{
                            left: `${field.x}px`,
                            top: `${field.y}px`,
                            width: `${field.width}px`,
                            height: `${field.height}px`,
                          }}
                          onClick={() => setCurrentField(field)}
                        >
                          <div className="absolute -top-6 left-0 text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded">
                            {field.label}
                          </div>
                          <div className="h-full flex items-center justify-center">
                            {field.type === 'checkbox' && (
                              <div className="w-4 h-4 border border-gray-400 rounded"></div>
                            )}
                            {field.type === 'radio' && (
                              <div className="w-4 h-4 border border-gray-400 rounded-full"></div>
                            )}
                            {field.type === 'text' && (
                              <div className="w-full h-full border-b border-gray-400"></div>
                            )}
                            {field.type === 'dropdown' && (
                              <div className="w-full h-full flex items-center">
                                <span className="text-xs text-gray-500">▼ Dropdown</span>
                              </div>
                            )}
                          </div>
                        </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right column - Form fields */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="font-semibold">Form Fields</h2>
              </div>
              
              <div className="p-4">
                <div className="flex flex-wrap gap-2 mb-4">
                  <button
                    type="button"
                    className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md text-sm font-medium flex items-center"
                    onClick={() => addFormField('text')}
                  >
                    <FiPlus className="mr-1" /> Text Field
                  </button>
                  <button
                    type="button"
                    className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md text-sm font-medium flex items-center"
                    onClick={() => addFormField('checkbox')}
                  >
                    <FiPlus className="mr-1" /> Checkbox
                  </button>
                  <button
                    type="button"
                    className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md text-sm font-medium flex items-center"
                    onClick={() => addFormField('radio')}
                  >
                    <FiPlus className="mr-1" /> Radio Button
                  </button>
                  <button
                    type="button"
                    className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md text-sm font-medium flex items-center"
                    onClick={() => addFormField('dropdown')}
                  >
                    <FiPlus className="mr-1" /> Dropdown
                  </button>
                </div>
                
                <hr className="my-4 border-gray-200 dark:border-gray-700" />
                
                {fields.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <p>No form fields added yet.</p>
                    <p className="text-sm">Click one of the buttons above to add a field.</p>
                  </div>
                ) : (
                  <>
                    <h3 className="font-medium mb-2">All Fields:</h3>
                    <DragDropContext onDragEnd={handleDragEnd}>
                      <Droppable droppableId="fields">
                        {(provided) => (
                          <ul
                            className="space-y-2"
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                          >
                            {fields.map((field, index) => (
                              <Draggable key={field.id} draggableId={field.id} index={index}>
                                {(provided) => (
                                  <li
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    className={`p-2 rounded-md border ${
                                      currentField?.id === field.id 
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                                        : 'border-gray-200 dark:border-gray-700'
                                    }`}
                                    onClick={() => setCurrentField(field)}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center">
                                        <div {...provided.dragHandleProps} className="mr-2 cursor-move">
                                          <FiMenu size={14} />
                                        </div>
                                        <div>
                                          <div className="font-medium text-sm">{field.label}</div>
                                          <div className="text-xs text-gray-500 dark:text-gray-400">
                                            {field.type} • Page {field.page}
                                          </div>
                                        </div>
                                      </div>
                                      <button
                                        type="button"
                                        className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          deleteField(field.id)
                                        }}
                                      >
                                        <FiTrash2 size={16} />
                                      </button>
                                    </div>
                                  </li>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </ul>
                        )}
                      </Droppable>
                    </DragDropContext>
                  </>
                )}
                
                {currentField && (
                  <div className="mt-6">
                    <h3 className="font-medium mb-3">Edit Field Properties:</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Label</label>
                        <input
                          type="text"
                          value={currentField.label}
                          onChange={(e) => updateField(currentField.id, { label: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Page</label>
                        <select
                          value={currentField.page}
                          onChange={(e) => updateField(currentField.id, { page: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800"
                        >
                          {Array.from({ length: numPages }, (_, i) => i + 1).map(page => (
                            <option key={page} value={page}>
                              Page {page}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="flex gap-4">
                        <div className="w-1/2">
                          <label className="block text-sm font-medium mb-1">X Position</label>
                          <input
                            type="number"
                            value={currentField.x}
                            onChange={(e) => updateField(currentField.id, { x: parseInt(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800"
                          />
                        </div>
                        <div className="w-1/2">
                          <label className="block text-sm font-medium mb-1">Y Position</label>
                          <input
                            type="number"
                            value={currentField.y}
                            onChange={(e) => updateField(currentField.id, { y: parseInt(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800"
                          />
                        </div>
                      </div>
                      
                      <div className="flex gap-4">
                        <div className="w-1/2">
                          <label className="block text-sm font-medium mb-1">Width</label>
                          <input
                            type="number"
                            value={currentField.width}
                            onChange={(e) => updateField(currentField.id, { width: parseInt(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800"
                          />
                        </div>
                        <div className="w-1/2">
                          <label className="block text-sm font-medium mb-1">Height</label>
                          <input
                            type="number"
                            value={currentField.height}
                            onChange={(e) => updateField(currentField.id, { height: parseInt(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800"
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="required-checkbox"
                          checked={currentField.required}
                          onChange={(e) => updateField(currentField.id, { required: e.target.checked })}
                          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <label htmlFor="required-checkbox" className="ml-2 text-sm font-medium">
                          Required field
                        </label>
                      </div>
                      
                      {(currentField.type === 'radio' || currentField.type === 'dropdown') && (
                        <div>
                          <label className="block text-sm font-medium mb-1">Options</label>
                          <div className="space-y-2">
                            {currentField.options?.map((option, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={option}
                                  onChange={(e) => {
                                    const newOptions = [...(currentField.options || [])];
                                    newOptions[index] = e.target.value;
                                    updateField(currentField.id, { options: newOptions });
                                  }}
                                  className="flex-1 px-3 py-1 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800"
                                />
                                <button
                                  type="button"
                                  className="text-red-500 dark:text-red-400"
                                  onClick={() => {
                                    const newOptions = [...(currentField.options || [])];
                                    newOptions.splice(index, 1);
                                    updateField(currentField.id, { options: newOptions });
                                  }}
                                >
                                  <FiTrash2 size={14} />
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              className="text-sm text-blue-600 dark:text-blue-400 flex items-center"
                              onClick={() => {
                                const newOptions = [...(currentField.options || []), `Option ${(currentField.options?.length || 0) + 1}`];
                                updateField(currentField.id, { options: newOptions });
                              }}
                            >
                              <FiPlus className="mr-1" /> Add Option
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end">
            <button
              type="button"
              className={`py-2 px-6 rounded-lg font-medium flex items-center ${
                isProcessing || fields.length === 0
                  ? 'bg-blue-400 dark:bg-blue-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
              } text-white`}
              onClick={processPDF}
              disabled={isProcessing || fields.length === 0}
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                'Create Fillable PDF'
              )}
            </button>
          </div>
        </>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 animate-fadeIn">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full mx-auto flex items-center justify-center mb-4">
              <FiCheck className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">PDF Form Created Successfully!</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Your PDF now has fillable form fields
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <a
                ref={downloadLinkRef}
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <FiDownload className="mr-2" />
                Download Fillable PDF
              </a>
              
              <button
                onClick={resetForm}
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-700 text-base font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Create Another Form
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 