'use client'

import { useParams } from 'next/navigation'
import ToolPage from '@/app/components/ToolPage'

export default function ConvertToolPage() {
  const params = useParams()
  // Access the tool parameter directly if it's a string,
  // or join it with hyphens if it's an array (catch-all route)
  const toolId = Array.isArray(params.tool) ? params.tool.join('-') : params.tool as string

  return <ToolPage toolId={toolId} category="convert" />
} 