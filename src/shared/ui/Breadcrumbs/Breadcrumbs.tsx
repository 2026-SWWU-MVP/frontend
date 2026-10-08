import { Icon } from '@/shared/ui/Icon/Icon'

import './Breadcrumbs.css'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="breadcrumbs">
      {items.map((item, index) => (
        <span className="breadcrumbs__item" key={item.label}>
          {item.href ? <a href={item.href}>{item.label}</a> : <span>{item.label}</span>}
          {index < items.length - 1 && <Icon name="chevron-right" size={12} />}
        </span>
      ))}
    </nav>
  )
}
