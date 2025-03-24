'use client';

import { useState, useRef } from 'react';
import { FiCloud, FiDownload, FiUpload, FiFile, FiCheck, FiX, FiExternalLink, FiArrowRight } from 'react-icons/fi';
import { FaDropbox, FaGoogleDrive } from 'react-icons/fa';

interface CloudFile {
  id: string;
  name: string;
  size: number;
  type: string;
  lastModified: string;
  source: 'google' | 'dropbox';
  iconUrl?: string;
  downloadUrl?: string;
}

interface CloudAuthToken {
  accessToken: string;
  expiresAt: number;
  refreshToken?: string;
}

export default function CloudIntegrationPage() {
  const [isGoogleConnected, setIsGoogleConnected] = useState<boolean>(false);
  const [isDropboxConnected, setIsDropboxConnected] = useState<boolean>(false);
  const [googleAuth, setGoogleAuth] = useState<CloudAuthToken | null>(null);
  const [dropboxAuth, setDropboxAuth] = useState<CloudAuthToken | null>(null);
  
  const [files, setFiles] = useState<CloudFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<CloudFile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [processingResult, setProcessingResult] = useState<Blob | null>(null);
  
  const googleLoginWindowRef = useRef<Window | null>(null);
  const dropboxLoginWindowRef = useRef<Window | null>(null);
  const downloadLinkRef = useRef<HTMLAnchorElement>(null);
  
  // Connect to Google Drive
  const connectToGoogleDrive = () => {
    // In a real implementation, this would redirect to Google OAuth
    // For this demo, we'll simulate the auth flow
    setIsLoading(true);
    setError(null);
    
    setTimeout(() => {
      setIsGoogleConnected(true);
      setGoogleAuth({
        accessToken: 'simulated-google-token',
        expiresAt: Date.now() + 3600000, // 1 hour
      });
      
      // Simulate fetching files from Google Drive
      const mockFiles: CloudFile[] = [
        {
          id: 'gdrive-1',
          name: 'Annual Report.pdf',
          size: 1425365,
          type: 'application/pdf',
          lastModified: '2023-03-15T14:30:00Z',
          source: 'google',
          iconUrl: 'https://drive-thirdparty.googleusercontent.com/16/type/application/pdf'
        },
        {
          id: 'gdrive-2',
          name: 'Presentation.pdf',
          size: 2835712,
          type: 'application/pdf',
          lastModified: '2023-03-01T09:15:00Z',
          source: 'google',
          iconUrl: 'https://drive-thirdparty.googleusercontent.com/16/type/application/pdf'
        },
        {
          id: 'gdrive-3',
          name: 'Contract.pdf',
          size: 983254,
          type: 'application/pdf',
          lastModified: '2023-02-18T16:45:00Z',
          source: 'google',
          iconUrl: 'https://drive-thirdparty.googleusercontent.com/16/type/application/pdf'
        }
      ];
      
      setFiles(mockFiles);
      setIsLoading(false);
    }, 1500);
  };
  
  // Connect to Dropbox
  const connectToDropbox = () => {
    // In a real implementation, this would redirect to Dropbox OAuth
    // For this demo, we'll simulate the auth flow
    setIsLoading(true);
    setError(null);
    
    setTimeout(() => {
      setIsDropboxConnected(true);
      setDropboxAuth({
        accessToken: 'simulated-dropbox-token',
        expiresAt: Date.now() + 3600000, // 1 hour
      });
      
      // Simulate fetching files from Dropbox
      const mockFiles: CloudFile[] = [
        {
          id: 'dropbox-1',
          name: 'Business Plan.pdf',
          size: 1825365,
          type: 'application/pdf',
          lastModified: '2023-03-10T10:30:00Z',
          source: 'dropbox'
        },
        {
          id: 'dropbox-2',
          name: 'Product Specs.pdf',
          size: 3835712,
          type: 'application/pdf',
          lastModified: '2023-02-25T14:15:00Z',
          source: 'dropbox'
        },
        {
          id: 'dropbox-3',
          name: 'Budget.pdf',
          size: 783254,
          type: 'application/pdf',
          lastModified: '2023-02-12T11:45:00Z',
          source: 'dropbox'
        }
      ];
      
      setFiles(prev => [...prev, ...mockFiles]);
      setIsLoading(false);
    }, 1500);
  };
  
  // Disconnect from Google Drive
  const disconnectFromGoogleDrive = () => {
    // In a real implementation, this would revoke the access token
    setIsGoogleConnected(false);
    setGoogleAuth(null);
    setFiles(prev => prev.filter(file => file.source !== 'google'));
    setSelectedFile(null);
  };
  
  // Disconnect from Dropbox
  const disconnectFromDropbox = () => {
    // In a real implementation, this would revoke the access token
    setIsDropboxConnected(false);
    setDropboxAuth(null);
    setFiles(prev => prev.filter(file => file.source !== 'dropbox'));
    setSelectedFile(null);
  };
  
  // Select a file for processing
  const selectFile = (file: CloudFile) => {
    setSelectedFile(file);
    setProcessingResult(null);
  };
  
  // Process the selected file (e.g., convert PDF to Word)
  const processFile = async () => {
    if (!selectedFile) {
      setError('Please select a file to process');
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);
    
    try {
      // In a real implementation, this would download the file from the cloud service,
      // then upload it to your API for processing
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + Math.floor(Math.random() * 10) + 5;
          return newProgress > 100 ? 100 : newProgress;
        });
      }, 300);
      
      // Simulate API processing delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Simulate a processed result (e.g., a converted file)
      const mockContent = `This is a simulated processed file for "${selectedFile.name}"`;
      const blob = new Blob([mockContent], { type: 'application/pdf' });
      setProcessingResult(blob);
    } catch (err: any) {
      console.error('Error processing file:', err);
      setError(err.message || 'An error occurred while processing the file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };
  
  // Save the processed file back to the cloud service
  const saveToCloud = async (service: 'google' | 'dropbox') => {
    if (!processingResult) {
      setError('No processed file to save');
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);
    
    try {
      // In a real implementation, this would upload the processed file to the selected cloud service
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + Math.floor(Math.random() * 10) + 5;
          return newProgress > 100 ? 100 : newProgress;
        });
      }, 300);
      
      // Simulate cloud upload delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Show success message
      alert(`File successfully saved to ${service === 'google' ? 'Google Drive' : 'Dropbox'}`);
    } catch (err: any) {
      console.error('Error saving to cloud:', err);
      setError(err.message || `An error occurred while saving to ${service === 'google' ? 'Google Drive' : 'Dropbox'}. Please try again.`);
    } finally {
      setIsUploading(false);
    }
  };
  
  // Download the processed file
  const downloadFile = () => {
    if (!processingResult || !selectedFile) return;
    
    const url = URL.createObjectURL(processingResult);
    
    if (downloadLinkRef.current) {
      downloadLinkRef.current.href = url;
      downloadLinkRef.current.download = `converted_${selectedFile.name}`;
      downloadLinkRef.current.click();
    }
  };
  
  // Format file size to human-readable format
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    else if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };
  
  // Format date to human-readable format
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Cloud Integration</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Upload and save files directly from Google Drive or Dropbox
      </p>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - Cloud Services */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <FiCloud className="mr-2 text-blue-500" size={24} />
            Cloud Accounts
          </h2>
          
          <div className="space-y-6">
            {/* Google Drive Connection */}
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <FaGoogleDrive className="text-blue-500 mr-3" size={24} />
                  <div>
                    <h3 className="font-medium">Google Drive</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {isGoogleConnected ? 'Connected' : 'Not connected'}
                    </p>
                  </div>
                </div>
                
                {isGoogleConnected ? (
                  <button
                    type="button"
                    className="px-3 py-1 text-sm bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 rounded"
                    onClick={disconnectFromGoogleDrive}
                  >
                    Disconnect
                  </button>
                ) : (
                  <button
                    type="button"
                    className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-400 rounded flex items-center"
                    onClick={connectToGoogleDrive}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Connecting...' : 'Connect'}
                  </button>
                )}
              </div>
              
              {isGoogleConnected && (
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <p>Access token expires in: {googleAuth ? Math.floor((googleAuth.expiresAt - Date.now()) / 60000) : 0} minutes</p>
                </div>
              )}
            </div>
            
            {/* Dropbox Connection */}
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <FaDropbox className="text-blue-600 mr-3" size={24} />
                  <div>
                    <h3 className="font-medium">Dropbox</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {isDropboxConnected ? 'Connected' : 'Not connected'}
                    </p>
                  </div>
                </div>
                
                {isDropboxConnected ? (
                  <button
                    type="button"
                    className="px-3 py-1 text-sm bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 rounded"
                    onClick={disconnectFromDropbox}
                  >
                    Disconnect
                  </button>
                ) : (
                  <button
                    type="button"
                    className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-400 rounded flex items-center"
                    onClick={connectToDropbox}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Connecting...' : 'Connect'}
                  </button>
                )}
              </div>
              
              {isDropboxConnected && (
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <p>Access token expires in: {dropboxAuth ? Math.floor((dropboxAuth.expiresAt - Date.now()) / 60000) : 0} minutes</p>
                </div>
              )}
            </div>
            
            {/* Information about cloud integrations */}
            <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">About Cloud Integration</h3>
              <p className="text-xs text-blue-600 dark:text-blue-400 mb-2">
                Connect your cloud storage accounts to:
              </p>
              <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1 list-disc pl-5">
                <li>Upload files directly from your cloud storage</li>
                <li>Save processed files back to your cloud storage</li>
                <li>Access your files from anywhere</li>
                <li>Streamline your document workflow</li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Middle column - File Browser */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FiFile className="mr-2 text-purple-500" size={24} />
            Cloud Files
          </h2>
          
          {!isGoogleConnected && !isDropboxConnected ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <FiCloud size={48} className="mx-auto mb-4" />
              <p className="mb-2">Connect to a cloud service to view your files</p>
              <p className="text-sm">Use the options on the left to connect your accounts</p>
            </div>
          ) : isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-500 dark:text-gray-400">Loading your files...</p>
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <FiFile size={48} className="mx-auto mb-4" />
              <p>No PDF files found in your cloud storage</p>
            </div>
          ) : (
            <>
              <div className="max-h-[500px] overflow-y-auto">
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {files.map(file => (
                    <li 
                      key={file.id}
                      className={`p-3 hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer ${
                        selectedFile?.id === file.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                      onClick={() => selectFile(file)}
                    >
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          {file.source === 'google' ? (
                            <FaGoogleDrive className="text-blue-500" size={18} />
                          ) : (
                            <FaDropbox className="text-blue-600" size={18} />
                          )}
                        </div>
                        <div className="ml-4 flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{file.name}</p>
                          <div className="flex text-xs text-gray-500 dark:text-gray-400">
                            <span className="mr-3">{formatFileSize(file.size)}</span>
                            <span>{formatDate(file.lastModified)}</span>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                <p>{files.length} PDF files found in your cloud storage</p>
              </div>
            </>
          )}
        </div>
        
        {/* Right column - Processing */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FiUpload className="mr-2 text-green-500" size={24} />
            Process & Save
          </h2>
          
          {!selectedFile ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <FiFile size={48} className="mx-auto mb-4" />
              <p className="mb-2">Select a file to process</p>
              <p className="text-sm">Choose a PDF file from your cloud storage</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <h3 className="font-medium mb-2">Selected File</h3>
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    {selectedFile.source === 'google' ? (
                      <FaGoogleDrive className="text-blue-500" size={18} />
                    ) : (
                      <FaDropbox className="text-blue-600" size={18} />
                    )}
                  </div>
                  <div className="ml-3 min-w-0">
                    <p className="font-medium truncate">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <h3 className="font-medium mb-3">Processing Options</h3>
                <div>
                  <label htmlFor="conversionType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Conversion Type
                  </label>
                  <select
                    id="conversionType"
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isUploading}
                  >
                    <option value="pdf-to-word">Convert PDF to Word</option>
                    <option value="pdf-to-excel">Convert PDF to Excel</option>
                    <option value="pdf-to-powerpoint">Convert PDF to PowerPoint</option>
                    <option value="pdf-to-jpg">Convert PDF to JPG</option>
                  </select>
                </div>
              </div>
              
              {isUploading && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {uploadProgress < 100 ? 'Processing file...' : 'Processing complete!'}
                  </p>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
                  <p>{error}</p>
                </div>
              )}
              
              <div className="flex flex-col space-y-3">
                <button
                  type="button"
                  className={`py-2 px-4 rounded-lg font-medium flex items-center justify-center ${
                    isUploading
                      ? 'bg-blue-400 dark:bg-blue-600 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
                  } text-white`}
                  onClick={processFile}
                  disabled={isUploading}
                >
                  <FiUpload className="mr-2" size={18} />
                  Process Selected File
                </button>
                
                {processingResult && (
                  <>
                    <div className="flex items-center my-2">
                      <div className="flex-grow h-px bg-gray-300 dark:bg-gray-700"></div>
                      <span className="px-3 text-sm text-gray-500 dark:text-gray-400">Save Options</span>
                      <div className="flex-grow h-px bg-gray-300 dark:bg-gray-700"></div>
                    </div>
                    
                    <button
                      type="button"
                      className="py-2 px-4 rounded-lg font-medium flex items-center justify-center bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white"
                      onClick={downloadFile}
                      disabled={isUploading}
                    >
                      <FiDownload className="mr-2" size={18} />
                      Download Result
                    </button>
                    
                    {isGoogleConnected && (
                      <button
                        type="button"
                        className="py-2 px-4 rounded-lg font-medium flex items-center justify-center bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
                        onClick={() => saveToCloud('google')}
                        disabled={isUploading}
                      >
                        <FaGoogleDrive className="mr-2" size={18} />
                        Save to Google Drive
                      </button>
                    )}
                    
                    {isDropboxConnected && (
                      <button
                        type="button"
                        className="py-2 px-4 rounded-lg font-medium flex items-center justify-center bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
                        onClick={() => saveToCloud('dropbox')}
                        disabled={isUploading}
                      >
                        <FaDropbox className="mr-2" size={18} />
                        Save to Dropbox
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Hidden download link */}
      <a ref={downloadLinkRef} className="hidden"></a>
      
      {/* Information section about cloud integration */}
      <div className="mt-8 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
        <h3 className="font-medium mb-2">About Cloud Integration</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          The cloud integration feature allows you to access your files from Google Drive and Dropbox directly from this app.
          You can process these files using our tools and save the results back to your cloud storage.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
            <h4 className="font-medium mb-2 flex items-center">
              <FiExternalLink className="mr-2 text-blue-500" />
              Connect
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Link your Google Drive and Dropbox accounts to access your files without downloading them first.
            </p>
          </div>
          
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
            <h4 className="font-medium mb-2 flex items-center">
              <FiArrowRight className="mr-2 text-purple-500" />
              Process
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Convert your cloud-stored PDFs to other formats using our powerful conversion tools.
            </p>
          </div>
          
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
            <h4 className="font-medium mb-2 flex items-center">
              <FiCloud className="mr-2 text-green-500" />
              Save
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Save processed files back to your cloud storage for easy access anywhere.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 