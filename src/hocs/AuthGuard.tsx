// Third-party Imports

// Type Imports
import type { Locale } from '@configs/i18n'
import type { ChildrenType } from '@core/types'

// Component Imports
import AuthRedirect from '@components/AuthRedirect'
//import { cookies } from 'next/headers'
import Cookies from 'js-cookie'

export default function AuthGuard({ children, locale }: ChildrenType & { locale: Locale }) {
  //const cookieStore = cookies()
  const userData = Cookies.get('userData')
  //const menu = Cookies.get('menu')
  return <>{userData ? children : <AuthRedirect lang={locale} />}</>
}
