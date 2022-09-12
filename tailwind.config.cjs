/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
        animation: {
            gajian: "gajian 1.5s ease-in-out infinite",
            "reverse-gajian": "reverse-gajian 2s ease-in-out infinite",
        },
        keyframes: {
            gajian: {
                "0%": {
                    transform: "scale(1)"
                },
                "50%": {
                    transform: "scale(1.8)"
                },
            },
            "reverse-gajian": {
                "0%, 100%": {
                    transform: "scale(1)"
                },
                "50%": {
                    transform: "scale(.75)"
                },
            }
        }
    },
  },
  plugins: [],
};
