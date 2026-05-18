---
name: Gourmet Admin
colors:
  surface: '#fff8f4'
  surface-dim: '#ffd2a6'
  surface-bright: '#fff8f4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fff1e7'
  surface-container: '#ffead9'
  surface-container-high: '#ffe3cb'
  surface-container-highest: '#ffdcbd'
  on-surface: '#2c1600'
  on-surface-variant: '#5b403f'
  inverse-surface: '#492900'
  inverse-on-surface: '#ffeee0'
  outline: '#8f6f6e'
  outline-variant: '#e4bebc'
  surface-tint: '#bb152c'
  primary: '#b7102a'
  on-primary: '#ffffff'
  primary-container: '#db313f'
  on-primary-container: '#fffbff'
  inverse-primary: '#ffb3b1'
  secondary: '#006e29'
  on-secondary: '#ffffff'
  secondary-container: '#88f795'
  on-secondary-container: '#00732b'
  tertiary: '#735802'
  on-tertiary: '#ffffff'
  tertiary-container: '#8e711f'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad8'
  primary-fixed-dim: '#ffb3b1'
  on-primary-fixed: '#410007'
  on-primary-fixed-variant: '#92001c'
  secondary-fixed: '#8bfa98'
  secondary-fixed-dim: '#6fdd7e'
  on-secondary-fixed: '#002107'
  on-secondary-fixed-variant: '#00531d'
  tertiary-fixed: '#ffdf96'
  tertiary-fixed-dim: '#e7c268'
  on-tertiary-fixed: '#251a00'
  on-tertiary-fixed-variant: '#5a4400'
  background: '#fff8f4'
  on-background: '#2c1600'
  surface-variant: '#ffdcbd'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-sm:
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
  base: 8px
  container-padding: 24px
  gutter: 16px
  sidebar-width: 280px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style

This design system is built on the philosophy of **Gourmet Minimalism**. It merges the rigorous utility of a high-end SaaS platform with the vibrant, appetizing energy of a premium culinary brand. The aesthetic is defined by high-contrast legibility, expansive whitespace, and a sophisticated use of earthy, "kitchen-inspired" tones to drive information hierarchy.

The target audience consists of restaurant owners and kitchen managers who require immediate clarity and reduced cognitive load during high-pressure service hours. The UI evokes a sense of organized efficiency—clean like a professional kitchen—while remaining warm and approachable through rounded geometry and organic color accents.

## Colors

The palette is derived from the core components of a gourmet kitchen, utilizing the **Fidelity** variant for a vivid, high-clarity color experience:

*   **Primary (Seared Crimson):** A bright, energetic red (#CB2836) reserved for high-priority actions, primary buttons, and critical alerts. It represents the "heart" of the kitchen.
*   **Secondary (Garden Green):** A fresh, vibrant green (#5BC977) used for secondary actions, success states, and positive growth metrics, providing a natural, appetizing contrast to the primary red.
*   **Tertiary (Saffron Gold):** A warm, vibrant yellow-gold (#E9C46A) utilized for warning states, pending orders, or highlighting specific "Chef's Choice" analytics.
*   **Neutral (Harvest Ochre):** A warm, earthy tan (#E4A25B) used for supporting UI elements. This updated neutral provides a warmer, more organic "terracotta and wood" backdrop compared to the previous metallic tones.
*   **Surface & Background:** A crisp off-white is the primary canvas, while a light surface tint creates subtle separation for card containers and input backgrounds.

## Typography

This design system utilizes **Inter** exclusively to maintain a systematic and highly readable interface. The type scale is designed for rapid scanning of data tables and order lists.

Headlines use a tighter letter-spacing and heavier weights to establish a strong presence against the minimalist background. Body text maintains a generous line height to ensure legibility in high-glare kitchen environments. Labels are set in uppercase with increased letter-spacing to distinguish them from interactive data points.

## Layout & Spacing

The layout follows a **Fixed-Fluid hybrid model**. 

A 12-column grid system is used for dashboard widgets, with 16px gutters to maintain a "breathable" aesthetic. Spacing follows an 8px linear scale. Large 32px margins are used at the edges of the screen to reinforce the minimalist, premium feel, ensuring content never feels cramped.

## Elevation & Depth

Visual hierarchy is achieved through **low-contrast outlines** and **ambient shadows**. This design system avoids heavy drop shadows in favor of a "flat-plus" approach:

1.  **Level 0 (Background):** Surface tint.
2.  **Level 1 (Cards/Containers):** Pure white (#FFFFFF) with a 1px border.
3.  **Level 2 (Hover/Active):** A soft, diffused shadow: `0 8px 24px rgba(228, 162, 91, 0.12)`.

The Harvest Ochre elements act as earthy anchors, providing structural warmth that visually grounds the floating content cards.

## Shapes

The shape language is consistently **Rounded**, reflecting the soft, organic nature of the brand's culinary roots. 

*   **Standard Components:** Buttons and input fields use a 0.5rem (8px) radius.
*   **Large Containers:** Cards and dashboard widgets use a 1rem (16px) radius to create a soft, modern frame for complex data.
*   **Interactive Indicators:** Status chips and notification badges use a full pill-shape (999px) to distinguish them from structural elements.

## Components

### Buttons
Primary buttons use a solid Seared Crimson background with white text. Ghost buttons use a 1px Harvest Ochre border and text for secondary actions. All buttons have a subtle scale-down effect (98%) on press.

### Cards
Cards are the primary container for dashboard metrics. They feature a 1px light border and no shadow in their default state, gaining the ambient shadow only when they are interactive or focused.

### Chips & Tags
Status indicators use a semi-transparent background (15% opacity) of their respective functional color (Garden Green for "Complete", Saffron for "Pending") with high-contrast bold text.

### Input Fields
Inputs are styled with an off-white background and a 1px border. On focus, the border transitions to Seared Crimson with a soft 2px outer glow.

### Sidebar
The sidebar utilizes the Harvest Ochre palette. Active menu items are indicated by a subtle tonal shift for the active icon and text label.