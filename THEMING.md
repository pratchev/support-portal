# Theming Guide

Support Portal includes a comprehensive theming system built with CSS custom properties and Tailwind CSS, supporting both light and dark modes with smooth transitions.

## 🎨 Theme Architecture

### Technology Stack

- **CSS Custom Properties** - Dynamic color values
- **Tailwind CSS** - Utility-first styling
- **next-themes** - Theme switching logic
- **Class-based Dark Mode** - `dark:` modifier for dark styles

### File Structure

```
apps/web/
├── styles/
│   ├── globals.css          # Global styles, imports themes
│   ├── themes/
│   │   ├── light.css        # Light theme variables
│   │   └── dark.css         # Dark theme variables
│   └── components.css       # Component-specific styles
├── components/
│   └── layout/
│       └── theme-toggle.tsx # Theme switcher component
└── providers/
    └── theme-provider.tsx   # Theme context provider
```

## 🌓 Default Themes

### Light Theme

**Color Palette:**
- **Primary**: Blue (#3B82F6)
- **Background**: White (#FFFFFF)
- **Surface**: Light Gray (#F8FAFC)
- **Text**: Dark Gray (#1E293B)
- **Border**: Light Gray (#E2E8F0)

**Location**: `apps/web/styles/themes/light.css`

### Dark Theme

**Color Palette:**
- **Primary**: Light Blue (#60A5FA)
- **Background**: Dark Navy (#0F172A)
- **Surface**: Dark Gray (#1E293B)
- **Text**: Light Gray (#F1F5F9)
- **Border**: Dark Gray (#334155)

**Location**: `apps/web/styles/themes/dark.css`

## 🔧 How It Works

### 1. CSS Custom Properties

Each theme defines CSS variables in the `:root` selector:

```css
/* light.css */
:root {
  /* Primary colors */
  --color-primary: 59 130 246;        /* Blue */
  --color-primary-foreground: 255 255 255;

  /* Background colors */
  --color-background: 255 255 255;    /* White */
  --color-foreground: 30 41 59;       /* Dark gray text */

  /* Component colors */
  --color-card: 248 250 252;
  --color-card-foreground: 30 41 59;
  
  /* ... more variables */
}
```

```css
/* dark.css */
.dark {
  /* Primary colors */
  --color-primary: 96 165 250;        /* Light blue */
  --color-primary-foreground: 15 23 42;

  /* Background colors */
  --color-background: 15 23 42;       /* Dark navy */
  --color-foreground: 241 245 249;    /* Light gray text */

  /* Component colors */
  --color-card: 30 41 59;
  --color-card-foreground: 241 245 249;
  
  /* ... more variables */
}
```

### 2. Tailwind Integration

Tailwind uses these variables in `tailwind.config.ts`:

```typescript
export default {
  darkMode: ['class'],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--color-background))',
        foreground: 'hsl(var(--color-foreground))',
        primary: {
          DEFAULT: 'hsl(var(--color-primary))',
          foreground: 'hsl(var(--color-primary-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--color-card))',
          foreground: 'hsl(var(--color-card-foreground))',
        },
        // ... more colors
      },
    },
  },
}
```

### 3. Theme Provider

The app is wrapped with `ThemeProvider` from `next-themes`:

```tsx
// apps/web/app/layout.tsx
import { ThemeProvider } from '@/providers/theme-provider';

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationMismatch>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### 4. Using Themes in Components

Components automatically adapt to the current theme:

```tsx
// Using Tailwind classes
<div className="bg-background text-foreground">
  <Card className="bg-card text-card-foreground">
    <Button variant="primary">Submit</Button>
  </Card>
</div>

// Dark mode specific styles
<div className="bg-white dark:bg-slate-900">
  <p className="text-gray-900 dark:text-gray-100">
    This text changes color in dark mode
  </p>
</div>
```

## 🎨 Customizing Existing Themes

### Changing Colors

1. **Edit the theme files**:

```css
/* apps/web/styles/themes/light.css */
:root {
  /* Change primary color to green */
  --color-primary: 34 197 94;  /* Green instead of blue */
  --color-primary-foreground: 255 255 255;
}
```

```css
/* apps/web/styles/themes/dark.css */
.dark {
  /* Change primary color to green */
  --color-primary: 74 222 128;  /* Light green */
  --color-primary-foreground: 22 163 74;
}
```

2. **Restart dev server** to see changes:
```bash
npm run dev:web
```

### Available Color Variables

Complete list of customizable variables:

```css
/* Semantic colors */
--color-background
--color-foreground
--color-card
--color-card-foreground
--color-popover
--color-popover-foreground
--color-primary
--color-primary-foreground
--color-secondary
--color-secondary-foreground
--color-muted
--color-muted-foreground
--color-accent
--color-accent-foreground

/* Status colors */
--color-destructive
--color-destructive-foreground

/* UI elements */
--color-border
--color-input
--color-ring

/* Border radius */
--radius
```

### Color Format

Colors are defined as **space-separated RGB values** without commas:

```css
/* ✅ Correct */
--color-primary: 59 130 246;

/* ❌ Incorrect */
--color-primary: rgb(59, 130, 246);
--color-primary: #3b82f6;
```

This format works with Tailwind's opacity modifiers:

```tsx
<div className="bg-primary/50"> {/* 50% opacity */}
```

## ➕ Adding a New Theme

### Option 1: Create a Third Theme (e.g., "Midnight")

1. **Create theme file**:

```css
/* apps/web/styles/themes/midnight.css */
.midnight {
  --color-primary: 168 85 247;        /* Purple */
  --color-primary-foreground: 255 255 255;
  --color-background: 17 24 39;       /* Very dark */
  --color-foreground: 229 231 235;
  --color-card: 31 41 55;
  --color-card-foreground: 229 231 235;
  --color-border: 55 65 81;
  /* ... rest of variables */
}
```

2. **Import in globals.css**:

```css
/* apps/web/styles/globals.css */
@import './themes/light.css';
@import './themes/dark.css';
@import './themes/midnight.css';  /* Add this */
```

3. **Update theme toggle** to include new theme:

```tsx
// apps/web/components/layout/theme-toggle.tsx
const themes = ['light', 'dark', 'midnight'];

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  
  return (
    <DropdownMenu>
      <DropdownMenuItem onClick={() => setTheme('light')}>
        Light
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => setTheme('dark')}>
        Dark
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => setTheme('midnight')}>
        Midnight
      </DropdownMenuItem>
    </DropdownMenu>
  );
}
```

### Option 2: Replace Existing Theme

Simply edit `light.css` or `dark.css` with your colors.

## 🧩 Component Theming

### shadcn/ui Components

Components use semantic color variables:

```tsx
// Button variants automatically support theming
<Button variant="default">Primary Button</Button>
<Button variant="secondary">Secondary Button</Button>
<Button variant="destructive">Delete Button</Button>
```

### Custom Components

Use Tailwind's semantic classes:

```tsx
function CustomCard() {
  return (
    <div className="bg-card text-card-foreground border-border rounded-lg border p-6">
      <h2 className="text-foreground font-bold">Title</h2>
      <p className="text-muted-foreground">Description</p>
      <Button variant="default">Action</Button>
    </div>
  );
}
```

### Dark Mode Specific Styles

For fine-grained control:

```tsx
<div className="
  bg-white text-gray-900
  dark:bg-slate-900 dark:text-gray-100
">
  Content
</div>
```

## 🎯 Best Practices

### 1. Use Semantic Colors

✅ **Good**:
```tsx
<div className="bg-background text-foreground">
```

❌ **Avoid**:
```tsx
<div className="bg-white text-black dark:bg-black dark:text-white">
```

### 2. Test Both Themes

Always test your UI in both light and dark modes:

```tsx
// Use the theme toggle to switch between themes
<ThemeToggle />
```

### 3. Consistent Contrast

Ensure sufficient contrast in both themes:
- Text on background: 4.5:1 minimum
- Large text: 3:1 minimum
- Use tools like [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

### 4. Avoid Hardcoded Colors

Instead of:
```tsx
<div className="bg-blue-500 text-white">
```

Use:
```tsx
<div className="bg-primary text-primary-foreground">
```

## 🔍 Debugging Themes

### View Current Theme

```tsx
import { useTheme } from 'next-themes';

function DebugTheme() {
  const { theme, systemTheme, resolvedTheme } = useTheme();
  
  return (
    <div>
      <p>Current: {theme}</p>
      <p>System: {systemTheme}</p>
      <p>Resolved: {resolvedTheme}</p>
    </div>
  );
}
```

### Inspect CSS Variables

Open browser DevTools:
1. Inspect any element
2. Go to "Computed" tab
3. Search for `--color-` to see all values

### Preview All Colors

Create a debug page:

```tsx
// apps/web/app/debug/colors/page.tsx
export default function ColorsDebugPage() {
  const colors = [
    'background', 'foreground', 'card', 'primary',
    'secondary', 'muted', 'accent', 'destructive'
  ];
  
  return (
    <div className="grid grid-cols-2 gap-4 p-8">
      {colors.map(color => (
        <div key={color} className={`bg-${color} text-${color}-foreground p-4 rounded`}>
          {color}
        </div>
      ))}
    </div>
  );
}
```

## 📦 Exporting Themes

### As CSS File

Themes are already in CSS files and can be used in other projects.

### As Tailwind Config

Extract colors from `tailwind.config.ts` for use in other projects.

### As JSON

Create a script to export theme colors:

```typescript
// scripts/export-theme.ts
import fs from 'fs';

const lightTheme = {
  primary: 'rgb(59, 130, 246)',
  background: 'rgb(255, 255, 255)',
  // ... more colors
};

fs.writeFileSync('light-theme.json', JSON.stringify(lightTheme, null, 2));
```

## 🆘 Troubleshooting

### Theme Flashing on Load

Add `suppressHydrationMismatch` to html tag:

```tsx
<html suppressHydrationMismatch>
```

### Transitions Too Slow

Disable transitions:

```tsx
<ThemeProvider disableTransitionOnChange>
```

### Colors Not Updating

1. Check CSS variable names match
2. Verify Tailwind config references correct variables
3. Restart dev server
4. Clear browser cache

## 📚 Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [next-themes Documentation](https://github.com/pacocoursey/next-themes)
- [CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)
- [Color Contrast Checker](https://webaim.org/resources/contrastchecker/)

---

**Happy Theming! 🎨**
