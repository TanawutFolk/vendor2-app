import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    // edit by Template
    './src/**/*.{js,ts,jsx,tsx,css}'
  ],
  theme: {
    extend: {
      // edit by Template
    }
  },
  important: true, // add new by Template
  plugins: [
    // add new by Template
    require('tailwindcss-logical'),
    require('./src/@core/tailwind/plugin')
  ]
}
export default config
