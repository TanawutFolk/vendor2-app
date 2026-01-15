import PageWrapper from '@/components/react-router/PageWrapper'
import { useLocation, useNavigate } from 'react-router'

const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const handleLogin = () => {
    localStorage.setItem('token', 'mock-token')
    navigate(from, { replace: true })
  }

  return (
    <PageWrapper>
      <div className='space-y-4'>
        <p>Login Form Here</p>
        <button onClick={handleLogin} className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'>
          Login
        </button>
      </div>
    </PageWrapper>
  )
}

export default Login
