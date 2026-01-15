import { Outlet } from 'react-router'

const AuthLayout = () => {
  return (
    <div style={{ padding: '2rem', maxWidth: '400px', margin: 'auto' }}>
      <h2>Login Page</h2>
      <Outlet />
    </div>
  )
}

export default AuthLayout
