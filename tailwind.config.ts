import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        'border-subtle': "hsl(var(--border-subtle))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        'bg-body': "hsl(var(--bg-body))",
        'bg-surface': "hsl(var(--bg-surface))",
        foreground: "hsl(var(--foreground))",
        'text-main': "hsl(var(--text-main))",
        'text-muted': "hsl(var(--text-muted))",
        'text-on-primary': "hsl(var(--text-on-primary))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          light: "hsl(var(--primary-light))",
          soft: "hsl(var(--primary-soft))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          light: "hsl(var(--accent-light))",
          soft: "hsl(var(--accent-soft))",
          blue: "hsl(var(--accent-blue))",
          green: "hsl(var(--accent-green))",
          orange: "hsl(var(--accent-orange))",
        },
        badge: {
          sport: "hsl(var(--badge-sport))",
          loisir: "hsl(var(--badge-loisir))",
          distance: "hsl(var(--badge-distance))",
          age: "hsl(var(--badge-age))",
        },
        orange: {
          DEFAULT: "hsl(var(--primary-orange))",
          dark: "hsl(var(--primary-orange-dark))",
        },
        green: {
          success: "hsl(var(--success-green))",
          'success-dark': "hsl(var(--success-green-dark))",
        },
        pink: {
          accent: "hsl(var(--accent-pink))",
          'accent-light': "hsl(var(--accent-pink-light))",
        },
        yellow: {
          flooow: "hsl(var(--accent-yellow))",
        },
        lavender: "hsl(var(--lavender))",
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      boxShadow: {
        'card': 'var(--shadow-md)',
        'card-hover': 'var(--shadow-lg)',
      },
      backgroundImage: {
        'gradient-hero': 'var(--gradient-hero)',
        'gradient-accent': 'var(--gradient-accent)',
        'gradient-orange': 'var(--gradient-orange)',
        'gradient-green': 'var(--gradient-green)',
        'gradient-pink': 'var(--gradient-pink)',
        'card-gradient-1': 'var(--card-gradient-1)',
        'card-gradient-2': 'var(--card-gradient-2)',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      fontFamily: {
        display: ['Poppins', 'system-ui', '-apple-system'],
        sans: ['Poppins', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        body: ['Poppins', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
