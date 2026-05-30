const nativewind = require('nativewind/preset')
const fullstack = require('@radionic-homeopathy/config/tailwind-preset')

/** @type {import('tailwindcss').Config} */
module.exports = {
  // NativeWind must be in `presets` so Metro can detect it (see nativewind `tailwindConfigV3`).
  presets: [nativewind, fullstack],
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
}
