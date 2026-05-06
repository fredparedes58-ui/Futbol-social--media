import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { useRipple, RippleLayer } from './useRipple'

interface RippleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  rippleColor?: string
}

const RippleButton = forwardRef<HTMLButtonElement, RippleButtonProps>(
  ({ children, onClick, rippleColor, style, ...rest }, ref) => {
    const { ripples, spawn } = useRipple()
    return (
      <button
        ref={ref}
        onClick={(e) => { spawn(e); onClick?.(e) }}
        style={{ position: 'relative', overflow: 'hidden', ...style }}
        {...rest}
      >
        {children}
        <RippleLayer ripples={ripples} color={rippleColor} />
      </button>
    )
  },
)
RippleButton.displayName = 'RippleButton'
export default RippleButton
