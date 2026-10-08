import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'

import './Button.css'

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
}

export function Button({ children, className = '', variant = 'secondary', ...props }: PropsWithChildren<ButtonProps>) {
  return <button className={`button button--${variant} ${className}`} {...props}>{children}</button>
}
