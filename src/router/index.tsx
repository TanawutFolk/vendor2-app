import router from '@/_workspace/router/index'
import Spinner from '@/components/react-router/Spinner'

import MainLayout from '@/layouts/MainLayout'
import BlankLayout from '@/layouts/BlankLayout'
import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router'
import ProtectedRoute from './ProtectedRoute'
import AuthLayout from '@/layouts/AuthLayout'
import NotFound from '@/views/NotFound'

// Lazy imports
const Home = lazy(() => import('@/pages/home/page'))
const Login = lazy(() => import('@/pages/Login'))

// Your pages

const Router = () => {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route
            element={
              <MainLayout
                params={{
                  lang: 'en'
                }}
              />
            }
          >
            <Route path='/en/home' element={<Home />} />
            {/* Your routes */}
            {router}
          </Route>
        </Route>
        <Route element={<AuthLayout />}>
          <Route path='/login' element={<Login />} />
        </Route>
        <Route
          element={
            <BlankLayout
              params={{
                lang: 'en'
              }}
            />
          }
        >
          <Route path='*' element={<Navigate to='/en/home' replace />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

export default Router
