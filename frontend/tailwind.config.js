/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 12px 40px rgba(15, 23, 42, 0.45)',
      },
      backgroundImage: {
        mesh: 'radial-gradient(at 20% 20%, rgba(37,99,235,0.18), transparent 45%), radial-gradient(at 80% 10%, rgba(147,51,234,0.17), transparent 50%), radial-gradient(at 40% 80%, rgba(14,165,233,0.12), transparent 48%)',
      },
    },
  },
  plugins: [],
};
