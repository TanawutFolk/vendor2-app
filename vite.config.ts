import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

export default defineConfig(({ mode }) => {
  // `bun run` preloads .env.development into process.env, and Vite lets process.env win over .env.<mode>,
  // so sit/uat/production would keep the DEV values. Drop those preloaded keys so .env.<mode> is used instead.
  if (mode !== 'development') {
    const devEnvPath = path.resolve(process.cwd(), '.env.development')

    if (fs.existsSync(devEnvPath)) {
      for (const [, key] of fs.readFileSync(devEnvPath, 'utf8').matchAll(/^\s*(VITE_\w+)\s*=/gm)) {
        delete process.env[key]
      }
    }
  }

  const env = loadEnv(mode, process.cwd(), 'VITE_')

  console.log('------------------------------------')
  console.log('Vite running in mode:', mode)

  console.log('Loaded from .env file:')
  for (const [key, value] of Object.entries(env)) {
    console.log(`  ${key} = ${value}`)
  }
  console.log('------------------------------------')

  return {
    plugins: [react()],

    server: {
      port: 8035
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@core': path.resolve(__dirname, './src/@core'),
        '@layouts': path.resolve(__dirname, './src/@layouts'),
        '@menu': path.resolve(__dirname, './src/@menu'),
        '@assets': path.resolve(__dirname, './src/assets'),
        '@components': path.resolve(__dirname, './src/components'),
        '@configs': path.resolve(__dirname, './src/configs'),
        '@views': path.resolve(__dirname, './src/views'),
        '@_workspace': path.resolve(__dirname, './src/_workspace'),
        '@libs': path.resolve(__dirname, './src/libs'),
        '@utils': path.resolve(__dirname, './src/utils')
      }
    },
    define: Object.fromEntries(Object.entries(env).map(([k, v]) => [`import.meta.env.${k}`, JSON.stringify(v)]))
  }
})
