'use client'

import { useState, useRef, useEffect } from 'react'
import { FiUpload, FiFile, FiDownload, FiPlus, FiCheck, FiTrash2, FiMenu, FiX, FiMove, FiEdit, FiSettings } from 'react-icons/fi'
import { TbForms, TbCheckbox, TbSelect, TbTextRecognition, TbCursorText } from 'react-icons/tb'

// Define form field types
interface FormField {
  id: string
  type: 'text' | 'checkbox' | 'dropdown'
  x: number
  y: number
  width: number
  height: number
  label: string
  required: boolean
  options?: string[] // For dropdown fields
}

export default function PdfFormCreatorPage() {
  const [baseFile, setBaseFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Form fields and editing state
  const [formFields, setFormFields] = useState<FormField[]>([])
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null)
  const [editingField, setEditingField] = useState<FormField | null>(null)
  const [draggedFieldType, setDraggedFieldType] = useState<string | null>(null)
  
  // Form settings
  const [title, setTitle] = useState<string>('PDF Form')
  const [pageSize, setPageSize] = useState<string>('a4')
  const [orientation, setOrientation] = useState<string>('portrait')
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const downloadLinkRef = useRef<HTMLAnchorElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  
  // Initialize canvas dimensions based on page size and orientation
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 595, height: 842 }) // A4 portrait by default
  
  // Update canvas dimensions when page size or orientation changes
  useEffect(() => {
    let width, height
    
    // Set dimensions based on page size
    switch (pageSize) {
      case 'a4':
        width = 595
        height = 842
        break
      case 'letter':
        width = 612
        height = 792
        break
      case 'legal':
        width = 612
        height = 1008
        break
      default:
        width = 595
        height = 842 // Default to A4
    }
    
    // Swap dimensions for landscape orientation
    if (orientation === 'landscape') {
      [width, height] = [height, width]
    }
    
    setCanvasDimensions({ width, height })
  }, [pageSize, orientation])
  
  // Handle file input change for base file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0]
      
      // Check if file is a PDF
      if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
        setError('Please select a PDF file')
        return
      }
      
      // Check file size (max 30MB)
      if (selectedFile.size > 30 * 1024 * 1024) {
        setError('File size exceeds the maximum limit of 30MB')
        return
      }
      
      setBaseFile(selectedFile)
      setError(null)
      setIsComplete(false)
    }
  }

  // Handle drag and drop events for base file
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
      if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
        setError('Please select a PDF file')
        return
      }
      
      // Check file size (max 30MB)
      if (selectedFile.size > 30 * 1024 * 1024) {
        setError('File size exceeds the maximum limit of 30MB')
        return
      }
      
      setBaseFile(selectedFile)
      setError(null)
      setIsComplete(false)
    }
  }
  
  // Generate a unique ID
  const generateId = () => {
    return Math.random().toString(36).substring(2, 9)
  }
  
  // Handle dragging a field type onto the canvas
  const handleFieldTypeDragStart = (type: string) => {
    setDraggedFieldType(type)
  }
  
  const handleCanvasDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (draggedFieldType) {
      e.dataTransfer.dropEffect = 'copy'
    }
  }
  
  const handleCanvasDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    
    if (draggedFieldType && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      
      // Default field properties
      const defaultField: FormField = {
        id: generateId(),
        type: draggedFieldType as 'text' | 'checkbox' | 'dropdown',
        x,
        y,
        width: draggedFieldType === 'checkbox' ? 20 : 200,
        height: draggedFieldType === 'checkbox' ? 20 : 30,
        label: `${draggedFieldType.charAt(0).toUpperCase() + draggedFieldType.slice(1)} Field`,
        required: false,
      }
      
      // Add default options for dropdown fields
      if (draggedFieldType === 'dropdown') {
        defaultField.options = ['Option 1', 'Option 2', 'Option 3']
      }
      
      setFormFields([...formFields, defaultField])
      setSelectedFieldId(defaultField.id)
      setEditingField(defaultField)
      setDraggedFieldType(null)
    }
  }
  
  // Handle selecting a field
  const handleSelectField = (field: FormField, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedFieldId(field.id)
    setEditingField(field)
  }
  
  // Handle field movement
  const handleFieldMouseDown = (field: FormField, e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (!canvasRef.current) return
    
    const canvasRect = canvasRef.current.getBoundingClientRect()
    const startX = e.clientX
    const startY = e.clientY
    const startFieldX = field.x
    const startFieldY = field.y
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX
      const deltaY = moveEvent.clientY - startY
      
      // Update the field position
      const updatedFields = formFields.map(f => {
        if (f.id === field.id) {
          // Calculate new position, ensuring the field stays within the canvas
          const newX = Math.max(0, Math.min(canvasDimensions.width - f.width, startFieldX + deltaX))
          const newY = Math.max(0, Math.min(canvasDimensions.height - f.height, startFieldY + deltaY))
          
          return { ...f, x: newX, y: newY }
        }
        return f
      })
      
      setFormFields(updatedFields)
      
      // Update editing field if it's the one being moved
      if (editingField && editingField.id === field.id) {
        setEditingField({
          ...editingField,
          x: Math.max(0, Math.min(canvasDimensions.width - field.width, startFieldX + deltaX)),
          y: Math.max(0, Math.min(canvasDimensions.height - field.height, startFieldY + deltaY)),
        })
      }
    }
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }
  
  // Update field properties
  const updateFieldProperty = (property: string, value: any) => {
    if (!editingField) return
    
    // Update the field in the form fields array
    const updatedFields = formFields.map(field => {
      if (field.id === editingField.id) {
        return { ...field, [property]: value }
      }
      return field
    })
    
    setFormFields(updatedFields)
    
    // Update the editing field
    setEditingField({
      ...editingField,
      [property]: value,
    })
  }
  
  // Update dropdown options
  const updateDropdownOptions = (optionsText: string) => {
    if (!editingField || editingField.type !== 'dropdown') return
    
    // Split options by new line and filter out empty ones
    const options = optionsText.split('\n').filter(opt => opt.trim() !== '')
    
    // Update the field in the form fields array
    const updatedFields = formFields.map(field => {
      if (field.id === editingField.id) {
        return { ...field, options }
      }
      return field
    })
    
    setFormFields(updatedFields)
    
    // Update the editing field
    setEditingField({
      ...editingField,
      options,
    })
  }
  
  // Delete the selected field
  const deleteSelectedField = () => {
    if (!selectedFieldId) return
    
    const updatedFields = formFields.filter(field => field.id !== selectedFieldId)
    setFormFields(updatedFields)
    setSelectedFieldId(null)
    setEditingField(null)
  }
  
  // Clear canvas selection when clicking the canvas itself
  const handleCanvasClick = () => {
    setSelectedFieldId(null)
    setEditingField(null)
  }
  
  // Create the PDF form
  const createPdfForm = async () => {
    try {
      setIsProcessing(true)
      setError(null)
      
      // Create form data
      const formData = new FormData()
      
      // Add base file if provided
      if (baseFile) {
        formData.append('baseFile', baseFile)
      }
      
      // Add form fields, settings
      formData.append('formFields', JSON.stringify(formFields))
      formData.append('pageSize', pageSize)
      formData.append('orientation', orientation)
      formData.append('title', title)
      
      // Send request to API
      const response = await fetch('/api/pdf/form-creator', {
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
        downloadLinkRef.current.download = 'form.pdf'
        
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
    setBaseFile(null)
    setFormFields([])
    setSelectedFieldId(null)
    setEditingField(null)
    setTitle('PDF Form')
    setPageSize('a4')
    setOrientation('portrait')
    setIsComplete(false)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }
  
  // Render form field on canvas
  const renderFormField = (field: FormField) => {
    const isSelected = selectedFieldId === field.id
    
    // Determine the appearance based on field type
    let fieldContent
    
    switch (field.type) {
      case 'text':
        fieldContent = (
          <div className="flex items-center h-full">
            <TbTextRecognition className="ml-1 text-gray-400" size={16} />
            <span className="ml-2 text-gray-400 text-sm truncate">Text Input</span>
          </div>
        )
        break
      case 'checkbox':
        fieldContent = (
          <div className="flex items-center justify-center h-full">
            <div className="w-3/4 h-3/4 border border-gray-400 rounded-sm"></div>
          </div>
        )
        break
      case 'dropdown':
        fieldContent = (
          <div className="flex items-center justify-between h-full px-2">
            <span className="text-gray-400 text-sm truncate">
              {field.options && field.options.length > 0 ? field.options[0] : 'Select...'}
            </span>
            <span className="text-gray-400 text-xs">▼</span>
          </div>
        )
        break
      default:
        fieldContent = <div className="text-gray-400 text-sm">Field</div>
    }
    
    return (
      <div
        key={field.id}
        className={`absolute border ${isSelected ? 'border-blue-500 bg-blue-50/30' : 'border-gray-300 bg-white'} rounded-sm overflow-hidden`}
        style={{
          left: `${field.x}px`,
          top: `${field.y}px`,
          width: `${field.width}px`,
          height: `${field.height}px`,
          zIndex: isSelected ? 10 : 1,
        }}
        onClick={(e) => handleSelectField(field, e)}
      >
        {fieldContent}
        
        {/* Field label */}
        <div
          className="absolute text-xs text-gray-600"
          style={{
            bottom: '100%',
            left: '0',
            marginBottom: '2px',
          }}
        >
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </div>
        
        {/* Move handle for selected field */}
        {isSelected && (
          <div
            className="absolute top-0 right-0 p-1 bg-blue-500 text-white rounded-bl-sm cursor-move"
            onMouseDown={(e) => handleFieldMouseDown(field, e)}
          >
            <FiMove size={12} />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">PDF Form Creator</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Create fillable PDF forms with text fields, checkboxes, and dropdown menus
      </p>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - Form Fields */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <TbForms className="mr-2 text-purple-500" size={24} />
            Form Fields
          </h2>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Drag and drop fields onto the canvas to create your form
          </p>
          
          <div className="space-y-3">
            <div
              className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-grab"
              draggable
              onDragStart={() => handleFieldTypeDragStart('text')}
            >
              <TbCursorText className="text-purple-500 mr-3" size={20} />
              <div>
                <p className="font-medium">Text Field</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">For single or multi-line text input</p>
              </div>
            </div>
            
            <div
              className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-grab"
              draggable
              onDragStart={() => handleFieldTypeDragStart('checkbox')}
            >
              <TbCheckbox className="text-green-500 mr-3" size={20} />
              <div>
                <p className="font-medium">Checkbox</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">For yes/no or multiple choice selections</p>
              </div>
            </div>
            
            <div
              className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-grab"
              draggable
              onDragStart={() => handleFieldTypeDragStart('dropdown')}
            >
              <TbSelect className="text-blue-500 mr-3" size={20} />
              <div>
                <p className="font-medium">Dropdown</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">For selecting from a list of options</p>
              </div>
            </div>
          </div>
          
          {/* Base PDF upload */}
          <div className="mt-8">
            <h3 className="font-medium mb-2">Base PDF (Optional)</h3>
            
            {!baseFile ? (
              <div
                className={`border-2 border-dashed rounded-lg p-4 text-center ${
                  isDragging
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
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
                  <FiUpload className="w-10 h-10 text-gray-400 dark:text-gray-500 mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Drag and drop a PDF, or{' '}
                    <button
                      type="button"
                      className="text-purple-600 dark:text-purple-400 font-medium hover:underline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      browse
                    </button>
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-600">
                    Optional: Add form fields to an existing PDF
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-700 p-2 rounded-lg">
                <div className="flex items-center justify-center w-8 h-8 bg-purple-100 dark:bg-purple-800/30 text-purple-600 dark:text-purple-400 rounded-full">
                  <FiFile size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{baseFile.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {(baseFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  type="button"
                  className="p-1 rounded-full text-gray-500 hover:text-red-500"
                  onClick={() => setBaseFile(null)}
                >
                  <FiX size={16} />
                </button>
              </div>
            )}
          </div>
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
              <p>{error}</p>
            </div>
          )}
        </div>
        
        {/* Middle column - Canvas */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center">
              <FiEdit className="mr-2 text-gray-500" size={24} />
              Form Layout
            </h2>
            
            <div className="flex space-x-2">
              <select
                value={pageSize}
                onChange={(e) => setPageSize(e.target.value)}
                className="text-sm border border-gray-300 rounded p-1"
              >
                <option value="a4">A4</option>
                <option value="letter">Letter</option>
                <option value="legal">Legal</option>
              </select>
              
              <select
                value={orientation}
                onChange={(e) => setOrientation(e.target.value)}
                className="text-sm border border-gray-300 rounded p-1"
              >
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </select>
            </div>
          </div>
          
          <div className="mb-3">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Form Title"
              className="w-full border border-gray-300 rounded px-3 py-2 text-lg font-medium"
            />
          </div>
          
          {/* Canvas area */}
          <div
            ref={canvasRef}
            className="border border-gray-300 bg-white rounded overflow-auto relative"
            style={{
              width: '100%',
              height: '500px',
              maxHeight: '500px',
            }}
            onClick={handleCanvasClick}
            onDragOver={handleCanvasDragOver}
            onDrop={handleCanvasDrop}
          >
            {/* Form fields rendered on canvas */}
            {formFields.map(field => renderFormField(field))}
            
            {/* Empty state */}
            {formFields.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400 pointer-events-none">
                <div className="text-center">
                  <FiPlus size={32} className="mx-auto mb-2" />
                  <p>Drag form fields here</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              className="text-sm text-red-500 flex items-center disabled:opacity-50"
              onClick={deleteSelectedField}
              disabled={!selectedFieldId}
            >
              <FiTrash2 className="mr-1" size={16} />
              Delete Selected Field
            </button>
          </div>
        </div>
        
        {/* Right column - Field Properties */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex items-center mb-4">
            <FiSettings className="mr-2 text-gray-500" />
            <h2 className="text-xl font-semibold">Field Properties</h2>
          </div>
          
          {editingField ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Field Type
                </label>
                <div className="bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-md text-sm">
                  {editingField.type.charAt(0).toUpperCase() + editingField.type.slice(1)}
                </div>
              </div>
              
              <div>
                <label htmlFor="fieldLabel" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Label
                </label>
                <input
                  type="text"
                  id="fieldLabel"
                  value={editingField.label}
                  onChange={(e) => updateFieldProperty('label', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  id="requiredField"
                  type="checkbox"
                  checked={editingField.required}
                  onChange={(e) => updateFieldProperty('required', e.target.checked)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="requiredField" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Required field
                </label>
              </div>
              
              <div className="flex space-x-4">
                <div className="flex-1">
                  <label htmlFor="fieldWidth" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Width (px)
                  </label>
                  <input
                    type="number"
                    id="fieldWidth"
                    value={editingField.width}
                    onChange={(e) => updateFieldProperty('width', Math.max(20, parseInt(e.target.value)))}
                    min="20"
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md"
                  />
                </div>
                
                <div className="flex-1">
                  <label htmlFor="fieldHeight" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Height (px)
                  </label>
                  <input
                    type="number"
                    id="fieldHeight"
                    value={editingField.height}
                    onChange={(e) => updateFieldProperty('height', Math.max(20, parseInt(e.target.value)))}
                    min="20"
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md"
                  />
                </div>
              </div>
              
              <div className="flex space-x-4">
                <div className="flex-1">
                  <label htmlFor="fieldX" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    X Position
                  </label>
                  <input
                    type="number"
                    id="fieldX"
                    value={Math.round(editingField.x)}
                    onChange={(e) => updateFieldProperty('x', Math.max(0, parseInt(e.target.value)))}
                    min="0"
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md"
                  />
                </div>
                
                <div className="flex-1">
                  <label htmlFor="fieldY" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Y Position
                  </label>
                  <input
                    type="number"
                    id="fieldY"
                    value={Math.round(editingField.y)}
                    onChange={(e) => updateFieldProperty('y', Math.max(0, parseInt(e.target.value)))}
                    min="0"
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md"
                  />
                </div>
              </div>
              
              {/* Dropdown options */}
              {editingField.type === 'dropdown' && (
                <div>
                  <label htmlFor="dropdownOptions" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Options (one per line)
                  </label>
                  <textarea
                    id="dropdownOptions"
                    value={(editingField.options || []).join('\n')}
                    onChange={(e) => updateDropdownOptions(e.target.value)}
                    rows={4}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md"
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FiEdit size={32} className="mx-auto mb-2" />
              <p>Select a field to edit its properties</p>
            </div>
          )}
          
          <div className="mt-8">
            <button
              type="button"
              className={`w-full py-2 px-4 rounded-lg font-medium flex items-center justify-center ${
                isProcessing
                  ? 'bg-purple-400 dark:bg-purple-600 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600'
              } text-white`}
              onClick={createPdfForm}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating PDF Form...
                </>
              ) : (
                <>
                  <FiFile className="mr-2" size={18} />
                  Create PDF Form
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Results section */}
      {isComplete && (
        <div className="mt-8 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 animate-fadeIn">
          <div className="flex items-center mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-400 mr-3">
              <FiCheck size={24} />
            </div>
            <h2 className="text-xl font-semibold text-green-800 dark:text-green-400">Form Created Successfully</h2>
          </div>
          
          <p className="text-green-700 dark:text-green-300 mb-4">
            Your PDF form has been created with {formFields.length} form {formFields.length === 1 ? 'field' : 'fields'}.
            You can now download the PDF form.
          </p>
          
          <div className="flex items-center justify-end">
            <a
              ref={downloadLinkRef}
              className="py-2 px-6 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white rounded-lg font-medium flex items-center"
            >
              <FiDownload className="mr-2" />
              Download PDF Form
            </a>
          </div>
        </div>
      )}
    </div>
  )
} 