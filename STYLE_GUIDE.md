# Tailwind CSS Style Guide

## 🎨 Design System

The KOL Platform uses **Tailwind CSS** with custom utilities and components for a consistent, beautiful design.

## Custom Color Palette

### Primary Colors
- **Primary**: `#667eea` - Main brand color (purple-blue)
  - Usage: `bg-primary`, `text-primary`, `border-primary`
  - Dark variant: `bg-primary-dark`
  - Light variant: `bg-primary-light`

- **Secondary**: `#48bb78` - Success/positive actions (green)
  - Usage: `bg-secondary`, `text-secondary`

- **Danger**: `#f56565` - Destructive actions (red)
  - Usage: `bg-danger`, `text-danger`

### Gradients
```css
.gradient-primary - Purple to violet gradient
.gradient-success - Green gradient
.gradient-warning - Orange gradient
```

## Custom Components

### Buttons

```jsx
// Primary button
<button className="btn btn-primary">
  Click Me
</button>

// Secondary button
<button className="btn btn-secondary">
  Cancel
</button>

// Danger button
<button className="btn btn-danger">
  Delete
</button>

// Small button
<button className="btn btn-primary btn-sm">
  Small
</button>
```

**Features:**
- Hover effects (lift + shadow)
- Active states
- Disabled states
- Smooth transitions

### Cards

```jsx
// Basic card
<div className="card">
  Content here
</div>

// Card with hover effect
<div className="card card-hover">
  Content here
</div>
```

**Features:**
- Rounded corners
- Shadow effects
- Hover animations
- White background

### Form Elements

```jsx
// Input field
<input className="form-input" type="text" />

// Select dropdown
<select className="form-select">
  <option>Choose...</option>
</select>

// Textarea
<textarea className="form-textarea" />

// Label
<label className="form-label">
  Field Name
</label>
```

**Features:**
- Focus ring (primary color)
- Border transitions
- Disabled states
- Consistent spacing

### Badges

```jsx
<span className="badge badge-primary">Draft</span>
<span className="badge badge-success">Active</span>
<span className="badge badge-warning">Pending</span>
<span className="badge badge-danger">Cancelled</span>
```

## Animations

### Available Animations

```jsx
// Fade in
<div className="animate-fade-in">...</div>

// Slide up
<div className="animate-slide-up">...</div>

// Scale in
<div className="animate-scale-in">...</div>

// Spin (for loading)
<svg className="animate-spin">...</svg>
```

### Animation Delays
```jsx
<div className="animate-scale-in" style={{ animationDelay: '0.1s' }}>
  Card 1
</div>
<div className="animate-scale-in" style={{ animationDelay: '0.2s' }}>
  Card 2
</div>
```

## Layout Components

### Container
```jsx
<div className="container-app">
  // max-w-7xl, centered, responsive padding
</div>
```

### Responsive Grid
```jsx
// Auto-fill grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

## Common Patterns

### Stats Card
```jsx
<div className="bg-gradient-to-br from-primary to-primary-dark text-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
  <div className="text-sm opacity-90 mb-2 uppercase tracking-wide">
    Label
  </div>
  <div className="text-5xl font-bold">
    123
  </div>
  <div className="mt-2 text-sm opacity-75">
    Description
  </div>
</div>
```

### Info Box
```jsx
<div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100 hover:shadow-md transition-all">
  <h3 className="mb-2 font-semibold text-blue-900">
    📊 Title
  </h3>
  <p className="text-blue-700">
    Description text here
  </p>
</div>
```

### Loading Spinner
```jsx
<svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
</svg>
```

### Avatar Circle
```jsx
<div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-3xl font-bold">
  {initials}
</div>
```

## Spacing Scale

Tailwind uses a consistent spacing scale (0.25rem = 1 unit):
- `gap-2` = 0.5rem (8px)
- `gap-4` = 1rem (16px)
- `gap-6` = 1.5rem (24px)
- `gap-8` = 2rem (32px)

**Common usage:**
- Small gaps: `gap-2` or `gap-3`
- Medium gaps: `gap-4` or `gap-6`
- Large gaps: `gap-8` or `gap-12`

## Responsive Design

### Breakpoints
- `sm:` - 640px and up (mobile landscape)
- `md:` - 768px and up (tablets)
- `lg:` - 1024px and up (desktop)
- `xl:` - 1280px and up (large desktop)

### Example
```jsx
<div className="
  grid 
  grid-cols-1      // 1 column on mobile
  md:grid-cols-2   // 2 columns on tablet
  lg:grid-cols-3   // 3 columns on desktop
  gap-6
">
  // Content
</div>
```

## Typography

### Headings
```jsx
<h1 className="text-4xl font-bold">Main Title</h1>
<h2 className="text-3xl font-bold">Section Title</h2>
<h3 className="text-2xl font-semibold">Subsection</h3>
<h4 className="text-xl font-semibold">Card Title</h4>
```

### Body Text
```jsx
<p className="text-gray-600">Regular text</p>
<p className="text-gray-800">Darker text</p>
<p className="text-sm text-gray-500">Small text</p>
```

## Shadows

### Built-in Shadows
- `shadow-sm` - Subtle shadow
- `shadow` - Default shadow
- `shadow-md` - Medium shadow
- `shadow-lg` - Large shadow
- `shadow-xl` - Extra large shadow
- `shadow-2xl` - Huge shadow

### Custom Shadows
- `shadow-soft` - Custom soft shadow
- `shadow-card` - Card shadow
- `shadow-card-hover` - Card hover shadow

## Hover Effects

### Common Patterns
```jsx
// Lift on hover
<div className="hover:-translate-y-1 transition-all">

// Shadow on hover  
<div className="hover:shadow-2xl transition-shadow">

// Background change
<div className="hover:bg-gray-100 transition-colors">

// Combined effect
<div className="hover:-translate-y-1 hover:shadow-2xl transition-all duration-300">
```

## Focus States

All interactive elements have custom focus states:
```jsx
// Inputs automatically get focus ring
<input className="form-input" /> // focus:ring-4 focus:ring-primary/10

// Custom focus
<button className="focus-visible:outline-primary">
```

## Best Practices

### 1. Use Component Classes
```jsx
// ✅ Good - Reusable, consistent
<button className="btn btn-primary">

// ❌ Avoid - Repetitive
<button className="px-5 py-3 bg-primary text-white rounded-lg...">
```

### 2. Group Related Classes
```jsx
// Layout classes first
<div className="
  flex items-center justify-between
  px-8 py-4
  bg-white rounded-xl shadow-lg
  hover:shadow-2xl transition-shadow
">
```

### 3. Use Responsive Design
```jsx
// Mobile-first approach
<div className="
  w-full          // Full width on mobile
  md:w-1/2        // Half width on tablet
  lg:w-1/3        // Third width on desktop
">
```

### 4. Leverage Transitions
```jsx
// Always add transitions for smooth UX
<div className="transition-all duration-200">
<div className="transition-colors">
<div className="transition-shadow">
```

### 5. Use Semantic Colors
```jsx
// ✅ Good - Semantic
<div className="bg-green-100 text-green-800"> // Success
<div className="bg-red-100 text-red-800">     // Error

// ❌ Avoid - Non-semantic
<div className="bg-green-100 text-red-800">   // Confusing
```

## Accessibility

### Focus Indicators
All interactive elements have visible focus states:
```css
*:focus-visible {
  @apply outline-primary outline-2 outline-offset-2;
}
```

### Color Contrast
- Text on light backgrounds: `text-gray-800`
- Text on dark backgrounds: `text-white`
- Ensure sufficient contrast ratios

### Screen Readers
```jsx
// Use semantic HTML
<button type="button" aria-label="Close">×</button>

// Hide decorative elements
<div aria-hidden="true">🎯</div>
```

## Performance Tips

### 1. Purge Unused CSS
Tailwind automatically purges unused styles in production.

### 2. Use @apply Sparingly
Only use `@apply` for reusable components, not one-off styles.

### 3. Avoid Arbitrary Values
```jsx
// ❌ Avoid
<div className="p-[13px]">

// ✅ Use standard spacing
<div className="p-3">
```

## Quick Reference Card

### Essential Classes
```
Layout:    flex, grid, block, inline-block
Spacing:   p-4, m-4, gap-4, space-x-4
Sizing:    w-full, h-screen, max-w-7xl
Position:  relative, absolute, fixed, sticky
Display:   hidden, block, flex, grid

Colors:    bg-*, text-*, border-*
Typography: text-xl, font-bold, leading-tight
Borders:   border, rounded-lg, border-gray-300
Shadows:   shadow-lg, shadow-xl

Effects:   hover:*, focus:*, active:*
Transitions: transition-all, duration-200
```

---

**Happy Styling with Tailwind! 🎨**

