// Next Imports

// Config Imports
import { i18n } from '@configs/i18n'
import { redirect, useLocation } from 'react-router'

const LangRedirect = () => {
  const pathname = useLocation()

  const redirectUrl = `/${i18n.defaultLocale}${pathname.pathname}`

  redirect(redirectUrl)
}

export default LangRedirect
