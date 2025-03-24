'use client'

import { useParams } from 'next/navigation'
import ToolPage from '@/app/components/ToolPage'

export default function EditToolPage() {
  const params = useParams()
  const toolId = Array.isArray(params.tool) ? params.tool.join('-') : params.tool

  return <ToolPage toolId={toolId} category="edit" />
} 