/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'primary': {
          DEFAULT: '#1967D2',
          '50': '#E8F0FE',
          '100': '#D2E3FD',
          '200': '#A6C7FA',
          '300': '#7BABF7',
          '400': '#4F8EF4',
          '500': '#1967D2',
          '600': '#1555AC',
          '700': '#114285',
          '800': '#0C2F5F',
          '900': '#071C39',
        },
        'error': {
          DEFAULT: '#D93025',
          '50': '#FCE8E6',
          '100': '#F8D0CC',
          '200': '#F1A199',
          '300': '#E97266',
          '400': '#E24434',
          '500': '#D93025',
          '600': '#B3271E',
          '700': '#8C1E18',
          '800': '#661612',
          '900': '#3F0D0B',
        },
        'success': {
          DEFAULT: '#137333',
          '50': '#E6F4EA',
          '100': '#CEEAD6',
          '200': '#9DD5AC',
          '300': '#6CC083',
          '400': '#3BAB59',
          '500': '#137333',
          '600': '#106029',
          '700': '#0C4D20',
          '800': '#093917',
          '900': '#05260E',
        },
      },
      backgroundColor: {
        'light': '#FFFFFF',
        'dark': '#1F1F1F',
        'light-hover': '#F8F9FA',
        'dark-hover': '#2D2D2D',
        'light-active': '#F1F3F4', 
        'dark-active': '#3C4043',
      },
      textColor: {
        'light-primary': '#202124',
        'light-secondary': '#5F6368',
        'dark-primary': '#E8EAED',
        'dark-secondary': '#9AA0A6',
      },
      borderColor: {
        'light': '#DADCE0',
        'dark': '#3C4043',
      },
      boxShadow: {
        'light-sm': '0 1px 2px 0 rgba(60, 64, 67, 0.1), 0 1px 3px 1px rgba(60, 64, 67, 0.08)',
        'light': '0 2px 4px 0 rgba(60, 64, 67, 0.1), 0 3px 6px 2px rgba(60, 64, 67, 0.08)',
        'dark-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.2), 0 1px 3px 1px rgba(0, 0, 0, 0.15)',
        'dark': '0 2px 4px 0 rgba(0, 0, 0, 0.2), 0 3px 6px 2px rgba(0, 0, 0, 0.15)',
      }
    },
  },
  plugins: [],
} 