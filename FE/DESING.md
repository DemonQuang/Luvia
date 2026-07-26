---
name: Luvia Design System
colors:
  surface: '#f8f9ff'
  surface-dim: '#d0dbed'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e6eeff'
  surface-container-high: '#dee9fc'
  surface-container-highest: '#d9e3f6'
  on-surface: '#121c2a'
  on-surface-variant: '#584147'
  inverse-surface: '#27313f'
  inverse-on-surface: '#eaf1ff'
  outline: '#8b7077'
  outline-variant: '#debec6'
  surface-tint: '#b21e61'
  primary: '#b21e61'
  on-primary: '#ffffff'
  primary-container: '#ff5e9c'
  on-primary-container: '#660033'
  inverse-primary: '#ffb1c7'
  secondary: '#9b3f5a'
  on-secondary: '#ffffff'
  secondary-container: '#ff8fab'
  on-secondary-container: '#79243f'
  tertiary: '#755664'
  on-tertiary: '#ffffff'
  tertiary-container: '#b38f9f'
  on-tertiary-container: '#432936'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffd9e2'
  primary-fixed-dim: '#ffb1c7'
  on-primary-fixed: '#3e001d'
  on-primary-fixed-variant: '#8e0049'
  secondary-fixed: '#ffd9e0'
  secondary-fixed-dim: '#ffb1c2'
  on-secondary-fixed: '#3f0018'
  on-secondary-fixed-variant: '#7d2742'
  tertiary-fixed: '#ffd8e8'
  tertiary-fixed-dim: '#e3bccc'
  on-tertiary-fixed: '#2b1420'
  on-tertiary-fixed-variant: '#5b3e4c'
  background: '#f8f9ff'
  on-background: '#121c2a'
  surface-variant: '#d9e3f6'
typography:
  display:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  h1:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  h1-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.01em
  h2:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  h3:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  caption:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 12px
  base: 16px
  lg: 24px
  xl: 32px
  2xl: 40px
  3xl: 48px
  4xl: 64px
---

## Brand & Style
The design system embodies a **Minimal Luxury** aesthetic tailored for a SaaS platform dedicated to digital love stories. It balances the warmth of romance with the precision of a high-end digital tool. The visual narrative is built on high-quality whitespace, sophisticated transitions, and a refined editorial feel.

The emotional response should be one of **intimacy, safety, and celebration**. It avoids clichéd romantic tropes in favor of a modern, "gallery-like" experience where the user's content (their stories and photos) is the center of attention. The design style leverages **Glassmorphism** for depth and **Minimalism** for clarity, ensuring the platform feels premium and timeless.

## Colors
The palette is a sophisticated "Blush Monochrome" stack. 
- **Primary (#FF5E9C):** Used for key actions and brand moments. It is a vibrant, modern pink that signifies passion without being aggressive.
- **Secondary & Accent (#FF8FAB, #FFD6E7):** Used for subtle layering, background fills for small components, and soft highlights.
- **Background (#FFF8FB):** A warm, off-white tinted with pink to prevent the "coldness" of pure white and maintain the romantic atmosphere.
- **Text:** High-contrast charcoal (#1F2937) for maximum readability, with a softer slate (#6B7280) for metadata and helper text.

## Typography
This design system utilizes **Inter** for its systematic clarity and modern edge. To achieve the "Luxury" feel, we rely on tight letter-spacing for headlines and generous line-heights for body text. 

The type hierarchy is optimized for the Vietnamese language, ensuring diacritics do not clash with line-heights. **Display** and **H1** styles are used for storytelling headers, while **Body-md** is the standard for narrative text. **Label-caps** is reserved for small eyebrow text or category tags to provide a structured, editorial contrast.

## Layout & Spacing
The layout follows a **fluid grid** model with a focus on generous internal padding. We use a base-4 spacing scale to maintain a tight rhythmic relationship between elements. 

- **Desktop:** 12-column grid with 24px gutters. Use 4xl (64px) spacing between major sections to emphasize the minimal, airy feel.
- **Tablet:** 8-column grid with 20px gutters.
- **Mobile:** 4-column grid with 16px margins. 

Layouts should favor center-alignment for storytelling components (cards, profile headers) and left-alignment for functional SaaS views (settings, dashboards).

## Elevation & Depth
Depth is created through **Glassmorphism** and **Ambient Shadows** rather than solid borders. 
- **Surfaces:** Floating elements use a background blur (12px to 20px) with a semi-transparent white fill (opacity 70-80%).
- **Borders:** "Elegant borders" are defined as 1px solid lines using a very low-opacity version of the Primary color (e.g., #FF5E9C at 10% opacity) or pure white at 20% opacity on colored backgrounds.
- **Shadows:** Use a "Dreamy Shadow" style: `0px 10px 30px rgba(255, 94, 156, 0.08)`. The slight pink tint in the shadow adds a romantic glow to elevated cards.

## Shapes
The shape language is significantly rounded to feel approachable and "soft." While the general system follows a `rounded-lg` (16px) baseline, specific components have tailored radii:
- **Cards:** 20px for a substantial, container-like feel.
- **Buttons & Inputs:** 16px for a consistent, tactile interaction area.
- **Dialogs/Modals:** 24px to emphasize their "pop-up" importance and soft presence.
- **Images:** Should always follow the container's radius or use a full "pill" shape for profile avatars.

## Components

### Buttons
- **Primary:** Solid #FF5E9C with white text. High-shine hover effect.
- **Secondary:** #FFD6E7 background with #FF5E9C text. 
- **Ghost:** No background, #FF5E9C text, 1px transparent border that becomes visible on hover.
- **FAB (Floating Action Button):** Always circular, Primary color, with a "Dreamy Shadow." Used for "Tạo câu chuyện mới" (Create new story).

### Input Fields
- **Standard/OTP/PIN:** 16px radius, background #FFFFFF, 1px border #FFD6E7. Focus state changes border to #FF5E9C with a 2px outer glow.
- **PIN/OTP:** Individual boxes, center-aligned text, bold Inter weight.

### Cards
- **Love Card:** Large image-first layout with a glassmorphic overlay for the title.
- **Stats Card:** Minimalist, uses Caption-caps for labels and H2 for numbers.
- **Music Card:** Small horizontal layout with a play/pause toggle and a subtle waveform visualization.

### Feedback & Navigation
- **Toasts:** Positioned top-center. Glassmorphic background with a small icon and brief Vietnamese text (e.g., "Đã lưu kỷ niệm").
- **Sidebars:** Fixed, narrow, using ghost icons and #FF5E9C for active states.
- **Skeleton:** Soft pulsing animation using a gradient from #FFF8FB to #FFD6E7.

### Illustrations
Use line-art style with variable stroke widths. Focus on abstract romantic symbols (intertwined lines, soft gradients, hearts, stars) rather than literal people to maintain a universal SaaS feel.