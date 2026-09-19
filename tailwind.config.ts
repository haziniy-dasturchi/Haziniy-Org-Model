import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "brand-dark": "#003933",         // Asl Haziniy to'q yashil rangi (logotip foni)
        "brand-dark-hover": "#002B26",   // Faol va hover holatlar uchun yanada boyroq to'q yashil
        "brand-dark-card": "#002824",    // Yuqori kartalar va navbar/sidebar foni
        "brand-accent": "#00BC55",       // Asl Haziniy yorqin mint-zumrad urg'u rangi (logotip olmosi)
        "brand-accent-hover": "#00A84C", // Hover urg'u
        "brand-accent-light": "#E6F8F0", // Yengil mint foni (badge va belgilar)
        "brand-bg": "#F4F8F7",           // Tizimning yorug' asosiy foni
        "brand-text": "#002D28",         // Asosiy matn rangi (to'q yashil-antratsit)
        "brand-muted": "#3D605B",        // O'rtacha nozik matn rangi
        "brand-surface": "#FFFFFF",      // Oq kartalar foni
        "brand-border": "#E2EBE8",       // Chegaralar rangi
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Playfair Display", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
