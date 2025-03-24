'use client'

import { useParams } from 'next/navigation'
import ToolPage from '@/app/components/ToolPage'

export default function CategoryToolPage() {
  const params = useParams()
  const category = params.category as string
  const toolId = params.tool as string
  
  return <ToolPage toolId={toolId} category={category} />
} 