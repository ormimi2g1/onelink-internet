/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'onelink-orange': '#FF6B35',
        'onelink-blue': '#1E40AF',
        'onelink-cyan': '#0891B2',
      },
    },
  },
  plugins: [],
}
