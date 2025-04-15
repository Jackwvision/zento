import React from 'react'
import { cn } from '../../../../lib/utils'
import ProductCard from '../../components/ProductCard'


export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary'
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const baseStyle =
      'inline-flex items-center justify-center px-4 py-2 rounded-xl font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2'

    const variants = {
      default: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
      secondary: 'bg-gray-700 text-white hover:bg-gray-600 focus:ring-gray-400',
    }

    return (
      <button
        ref={ref}
        className={cn(baseStyle, variants[variant], className)}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'
