# Design System — Food Store

> Sistema de diseño visual para Food Store. **Única fuente de verdad** para todos los tokens visuales.
> Versión: 1.0 — Última actualización: 2026-05-14

---

## 1. Filosofía Visual

**"Flat-Plus"**: Una aesthetic cálida, orgánica y premium que evita:
- Sombras pesadas
- Neumorphism
- Glassmorphism exagerado
- Azules genéricos de SaaS

La aplicación debe transmitir **claridad operacional**, **estética gourmet moderna**, **jerarquía visual limpia** y **sensación SaaS premium cálida**.

---

## 2. Paleta de Color

### 2.1 Harvest Ochre — Primary (Acción Principal)
| Token | Hex | Uso |
|-------|-----|-----|
| `primary-50` | `#FDF8F3` | Fondos muy claros |
| `primary-100` | `#FBEFE3` | Fondos de badge/chip |
| `primary-200` | `#F5DCC4` | Bordes suaves |
| `primary-300` | `#EFC9A5` | Hover de bordes |
| `primary-400` | `#E3A368` | Focus rings, hover states |
| `primary-500` | `#C47A3B` | **Primary:** botones, links, active |
| `primary-600` | `#A8652E` | Hover primary, active dark |
| `primary-700` | `#8C5021` | Active pressed |
| `primary-800` | `#703B14` | Sidebar deep |
| `primary-900` | `#542607` | Sidebar deepest |

### 2.2 Garden Green — Secondary (Éxito / Stock)
| Token | Hex | Uso |
|-------|-----|-----|
| `secondary-50` | `#EDF5F0` | Fondo success |
| `secondary-100` | `#DAEBE1` | Badge success |
| `secondary-200` | `#B5D7C3` | Border success |
| `secondary-500` | `#2D6A4F` | **Text/icon success** |
| `secondary-600` | `#245540` | Hover success |
| `secondary-700` | `#1B4031` | Dark success |

### 2.3 Saffron Gold — Accent (Alertas / Highlight)
| Token | Hex | Uso |
|-------|-----|-----|
| `accent-50` | `#FEF9F0` | Fondo warning |
| `accent-100` | `#FDF3E0` | Badge warning |
| `accent-500` | `#E8A838` | **Highlight** |
| `accent-600` | `#D4942E` | Hover highlight |

### 2.4 Seared Crimson — Danger (Errores / Cancelación)
| Token | Hex | Uso |
|-------|-----|-----|
| `danger-50` | `#FDF2F2` | Fondo error |
| `danger-100` | `#FBE5E5` | Badge error |
| `danger-200` | `#F7CBCB` | Border error |
| `danger-400` | `#EB7D7D` | Focus ring danger |
| `danger-500` | `#6B2D2D` | **Text danger, icon** |
| `danger-600` | `#5A2222` | Hover danger |
| `danger-700` | `#491717` | Dark danger |

### 2.5 Surface (Superficies)
| Token | Hex | Uso |
|-------|-----|-----|
| `surface` | `#FDFBF9` | Fondo principal (off-white cálido) |
| `surface-secondary` | `#F8F5F1` | Fondo secundario (cards, secciones) |
| `surface-tertiary` | `#F2EEE9` | Fondo terciario (tablas, sidebar) |

### 2.6 Neutral (Textos)
| Token | Hex | Uso |
|-------|-----|-----|
| `text-primary` | `#1C1917` | **Headings, body bold** (contraste AA) |
| `text-secondary` | `#57534E` | Body text |
| `text-tertiary` | `#A8A29E` | Labels, captions |
| `text-disabled` | `#D6D3D1` | Disabled |
| `border-default` | `#E7E5E4` | Bordes default |
| `border-subtle` | `#F0EFED` | Bordes muy suaves |

---

## 3. Tipografía

### 3.1 Font Family
- **Primaria:** `Inter` (variable)
- **Fallback:** `ui-sans-serif, system-ui, sans-serif`

### 3.2 Escala Tipográfica

| Token | Size | Weight | Line Height | Letter Spacing | Uso |
|-------|------|--------|-------------|----------------|-----|
| `headline-lg` | `2rem` / 32px | `700` (bold) | `1.2` | `-0.02em` | Page titles (h1) |
| `headline-md` | `1.5rem` / 24px | `600` (semibold) | `1.3` | `-0.01em` | Section titles (h2) |
| `body-lg` | `1rem` / 16px | `400` (regular) | `1.5` | `normal` | Body text |
| `body-md` | `0.875rem` / 14px | `400` (regular) | `1.5` | `normal` | Secondary text |
| `label-sm` | `0.75rem` / 12px | `500` (medium) | `1.4` | `0.01em` | Labels, badges |

---

## 4. Componentes

### 4.1 Botones
| Variant | Estilo |
|---------|--------|
| **Primary** | `bg-primary-500 text-white hover:bg-primary-600 active:scale-[0.98]` |
| **Secondary** | `bg-surface-secondary text-text-secondary hover:bg-surface-tertiary` |
| **Ghost** | `bg-transparent text-text-secondary hover:bg-surface-tertiary` |
| **Danger** | `bg-danger-500 text-white hover:bg-danger-600 active:scale-[0.98]` |
| **Disabled** | `opacity-50 cursor-not-allowed` |

Transiciones: `transition-all duration-150`

### 4.2 Cards
- `bg-white` (o `bg-surface`)
- Borde sutil: `border border-border-default`
- Sin sombra en reposo
- Sombra ambiental solo en hover/focus: `shadow-ambient`

### 4.3 Inputs
- `bg-surface text-text-primary`
- `border border-border-default`  
- Focus: `ring-2 ring-primary-400 ring-offset-2`
- Error: `border-danger-200 ring-danger-400`

### 4.4 Chips / Badges
- **Inactive:** `bg-primary-50 text-primary-700 font-medium`
- **Active:** `bg-primary-500 text-white font-medium`
- **Allergen inactive:** `bg-danger-50 text-danger-600 border border-danger-200`
- **Allergen active:** `bg-danger-500 text-white`
- **Status badges:** Translúcidos con texto bold de alto contraste

### 4.5 Sidebar (Admin)
- Fondo: `bg-primary-800` (Harvest Ochre profundo)
- Texto inactivo: `text-primary-200`
- Texto hover: `text-white` con `hover:bg-primary-700/50`
- Active: `bg-primary-600/80 text-white` (cambio tonal sutil)
- Divider: `border-primary-700`

### 4.6 Tablas
- Header: `bg-surface-tertiary text-text-secondary text-label-sm uppercase tracking-wider`
- Row hover: `hover:bg-surface-secondary`
- Border: `border-border-default`

---

## 5. Elevación (Shadows)

| Token | Value | Uso |
|-------|-------|-----|
| `shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Cards en reposo |
| `shadow-ambient` | `0 8px 24px rgba(196, 122, 59, 0.12)` | **Única sombra permitida en hover/focus** |
| `shadow-xl` | `0 20px 40px rgba(0,0,0,0.1)` | Modales |

---

## 6. Bordes y Radios

| Token | Value | Uso |
|-------|-------|-----|
| `rounded-card` | `0.75rem` (12px) | Cards |
| `rounded-button` | `0.5rem` (8px) | Botones |
| `rounded-input` | `0.5rem` (8px) | Inputs |
| `rounded-chip` | `9999px` (full) | Chips, badges |

---

## 7. Brief de Marca

Food Store es una plataforma de e-commerce gastronómico. El diseño debe:
1. **Sentirse premium pero accesible** — calidad sin pretensión
2. **Ser cálido y orgánico** — colores tierra, no fríos
3. **Comunicar frescura** — los acentos verdes (Garden) refuerzan alimentos frescos
4. **Ser altamente funcional** — jerarquía clara, máxima legibilidad
5. **Evitar el "AI Slop"** — nada de gradients genéricos, sombras pesadas ni azules corporativos

> "Un SaaS cálido que se siente como una cocina de autor, no como un banco."
