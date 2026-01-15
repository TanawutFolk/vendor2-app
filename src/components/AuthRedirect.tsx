// Next Imports
import { redirect, useLocation } from 'react-router'

// Type Imports
import type { Locale } from '@configs/i18n'

// Config Imports

// Util Imports

const AuthRedirect = ({ lang = 'en' }: { lang: Locale }) => {
  const pathname = useLocation()
  redirect(
    import.meta.env.VITE_BASE_WEB_APP_LOGIN_URL +
      '?continue=' +
      import.meta.env.VITE_BASE_WEB_APP_URL +
      pathname.pathname
  )
}

export default AuthRedirect
