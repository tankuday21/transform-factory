import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getCategoryById } from '@/app/data/features'
import FeaturesMain from '@/app/components/features/FeaturesMain'

export async function generateMetadata({ params }: { params: { category: string } }): Promise<Metadata> {
  const category = getCategoryById(params.category)
  
  if (!category) {
    return {
      title: 'Category Not Found',
      description: 'The requested category could not be found.'
    }
  }
  
  return {
    title: `${category.title} - Transform Factory`,
    description: category.description
  }
}

export default function CategoryPage({ params }: { params: { category: string } }) {
  const category = getCategoryById(params.category)
  
  if (!category) {
    notFound()
  }
  
  return <FeaturesMain initialCategory={params.category} />
} 