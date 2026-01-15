'use client'

import { Moon, Sun } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
// Type Imports

// Hook Imports
import { cn } from '@/libs/utils'
import { useSettings } from '@core/hooks/useSettings'

interface AnimatedThemeTogglerProps extends React.ComponentPropsWithoutRef<'button'> {
  duration?: number
}

export const ModeDropdownToggler = ({ className, duration = 500, ...props }: AnimatedThemeTogglerProps) => {
  // Hooks
  const { settings, updateSettings } = useSettings()
  const [isDark, setIsDark] = useState(settings.mode === 'dark' ? true : false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const toggleTheme = useCallback(async () => {
    if (!buttonRef.current) return

    await document.startViewTransition(() => {
      flushSync(() => {
        const newTheme = !isDark
        setIsDark(newTheme)
        updateSettings({ mode: newTheme ? 'dark' : 'light' })
        document.documentElement.classList.toggle('dark')
        localStorage.setItem('theme', newTheme ? 'dark' : 'light')
      })
    }).ready

    const { top, left, width, height } = buttonRef.current.getBoundingClientRect()
    const x = left + width / 2
    const y = top + height / 2
    const maxRadius = Math.hypot(Math.max(left, window.innerWidth - left), Math.max(top, window.innerHeight - top))

    document.documentElement.animate(
      {
        clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${maxRadius}px at ${x}px ${y}px)`]
      },
      {
        duration,
        easing: 'ease-in-out',
        pseudoElement: '::view-transition-new(root)'
      }
    )
  }, [isDark, duration])

  return (
    <button ref={buttonRef} onClick={toggleTheme} className={cn(className)} {...props}>
      {isDark ? <Sun /> : <Moon />}
      <span className='sr-only'>Toggle theme</span>
    </button>
  )
}
