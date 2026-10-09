---
name: Obsidian Lumina
colors:
  surface: '#131318'
  surface-dim: '#131318'
  surface-bright: '#39383e'
  surface-container-lowest: '#0e0e13'
  surface-container-low: '#1b1b20'
  surface-container: '#1f1f24'
  surface-container-high: '#2a292f'
  surface-container-highest: '#35343a'
  on-surface: '#e4e1e9'
  on-surface-variant: '#d6c1c9'
  inverse-surface: '#e4e1e9'
  inverse-on-surface: '#303035'
  outline: '#9e8c93'
  outline-variant: '#524349'
  surface-tint: '#ffafd7'
  primary: '#ffafd7'
  on-primary: '#58153f'
  primary-container: '#d17ba9'
  on-primary-container: '#56143e'
  inverse-primary: '#90446f'
  secondary: '#cabeff'
  on-secondary: '#320099'
  secondary-container: '#4b1ec9'
  on-secondary-container: '#bcaeff'
  tertiary: '#42e18d'
  on-tertiary: '#00391e'
  tertiary-container: '#00ac65'
  on-tertiary-container: '#00371c'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffd8e9'
  primary-fixed-dim: '#ffafd7'
  on-primary-fixed: '#3c0029'
  on-primary-fixed-variant: '#742d57'
  secondary-fixed: '#e6deff'
  secondary-fixed-dim: '#cabeff'
  on-secondary-fixed: '#1d0061'
  on-secondary-fixed-variant: '#491ac6'
  tertiary-fixed: '#65fea7'
  tertiary-fixed-dim: '#42e18d'
  on-tertiary-fixed: '#00210f'
  on-tertiary-fixed-variant: '#00522d'
  background: '#131318'
  on-background: '#e4e1e9'
  surface-variant: '#35343a'
typography:
  headline-xl:
    fontFamily: Geist
    fontSize: 40px
    fontWeight: '600'
    lineHeight: 48px
    letterSpacing: -0.03em
  headline-xl-mobile:
    fontFamily: Geist
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.025em
  headline-lg:
    fontFamily: Geist
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Geist
    fontSize: 22px
    fontWeight: '500'
    lineHeight: 28px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Geist
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Geist
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.03em
  numeric-hero:
    fontFamily: Geist
    fontSize: 36px
    fontWeight: '600'
    lineHeight: 44px
    letterSpacing: -0.03em
  numeric-card:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.02em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.25rem
  margin: 1rem
  margin-tablet: 1.5rem
  margin-desktop: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1.25rem
  space-xl: 1.75rem
---

## Brand & Style

The design system embodies an executive, ultra-sleek wealth intelligence aesthetic. It merges high-stakes financial clarity with the quiet luxury of ambient dark mode design. Tailored for sophisticated retail investors, wealth advisors, and executive leaders, the interface conveys precision, institutional security, and progressive modernism.

The design movement combines **Minimalism** with **Dark Glassmorphism** and ambient atmospheric backdrops. High-contrast typography cuts through deep obsidian and onyx surfaces, while deliberate luminescence—in soft magenta-rose and atmospheric violet—creates visual hierarchy and focal depth. Controls embrace pill geometry, evoking tactile luxury and seamless fluidity.

## Colors

The palette revolves around deep, warm-tinted obsidian blacks and cold graphites, accented by luminescent rose and violet gradients.

- **Primary (`#D17BA9`):** Radiant Orchid/Rose. Used for high-emphasis interactive triggers, hero gradient meshes, active state highlights, and focal KPI markers.
- **Secondary (`#7A5AF8`):** Deep Electric Violet. Used in gradient pairings, subtle glow backdrops, and active contextual tabs.
- **Tertiary (`#32D583`):** Precision Emerald. Exclusively reserved for positive performance indicators, growth metrics, and status badges. A matching negative tone (`#F97066`) handles downward variance.
- **Neutral (`#0D0D12`):** Obsidian Core. Surfaces branch from deep canvas pitch (`#0A0A0F`) to translucent elevated glass panels (`rgba(22, 22, 30, 0.72)` and `#15151C`).
- **Foreground Contrast:** Crisp off-white (`#F8F9FC`) for primary text, paired with muted graphite (`#98A2B3` and `#667085`) for secondary data and metadata.

## Typography

The typography uses Geist across all tiers, emphasizing clean geometry, technical proportion, and high legibility. 

- **Numeric Hierarchy:** Financial statistics employ `font-variant-numeric: tabular-nums` to eliminate jitter across data updates, price charts, and metric comparison grids.
- **Weight Pairing:** Headlines use medium and semi-bold weights with slight negative letter tracking (`-0.01em` to `-0.03em`) to deliver modern editorial weight.
- **Secondary Content:** Subtitles and metadata default to `body-sm` and `label-sm` with neutral secondary tints to prevent visual competition against headline numbers.

## Layout & Spacing

The layout is built on a modular fluid-responsive architecture:
- **Desktop (≥1200px):** Fixed navigation sidebar (260px) paired with an 8-column or 12-column dynamic grid, utilizing `gutter-desktop` (1.25rem) and generous canvas breathing room.
- **Tablet (768px – 1199px):** Collapsed rail sidebar with fluid multi-column cards; nested cards stack 2-up.
- **Mobile (<768px):** Single-column layout with a bottom-anchored frosted command bar, horizontal scroll segments for pill filters, and compact edge margins (`1rem`).

Spacing follows an 8pt baseline scale, reinforced by micro-increments of 4px for tight badge pads, icon button bounding boxes, and tabular alignments.

## Elevation & Depth

Visual hierarchy uses frosted glassmorphism and ambient radial luminescences rather than harsh drop shadows:

1. **Base Canvas:** Pitch black matte backdrop (`#09090D`) with subtle radial gradients (`radial-gradient(ellipse at 50% -20%, rgba(209, 123, 169, 0.12), transparent 70%)`).
2. **Glass Surfaces:** Cards and panels utilize `rgba(21, 21, 28, 0.65)` layered with backdrop filter blur (`blur(20px)` to `blur(32px)`) and a delicate 1px boundary stroke (`rgba(255, 255, 255, 0.08)` on top edges fading to `rgba(255, 255, 255, 0.03)` on bottoms).
3. **Floating & Active Elements:** Floating tooltips and primary pills incorporate an ambient aura: `box-shadow: 0 8px 32px -4px rgba(209, 123, 169, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2)`.
4. **Interactive Insets:** Toggled or sunken input surfaces use deep recessed fills (`rgba(10, 10, 15, 0.6)`) with faint internal borders.

## Shapes

The interface embraces a **pill-dominant** geometric identity for controls combined with generous corner radii for content structures:
- **Pills (`rounded-full`):** All interactive tabs, segmented controls, quick-filter chips, action badges, and primary callouts use full pill curvature.
- **Structural Cards (`rounded-2xl` / 1.5rem):** Dashboards, metric containers, and nested module panels feature smooth 24px corner radii, establishing an organic contrast with strict numerical data.
- **Icon Enclosures:** Circular (50%) or soft-square pill adaptations (`12px` to `16px`).

## Components

### Buttons & Interactive Controls
- **Primary Pill Action:** Gradient fill from `#D17BA9` to `#B05B88`, inset top-stroke of pure white (`opacity: 0.3`), white text, and a focused ambient drop glow.
- **Secondary Pill Action:** Translucent charcoal fill (`rgba(255, 255, 255, 0.06)`), 1px border (`rgba(255, 255, 255, 0.1)`), transitions to `rgba(255, 255, 255, 0.12)` on hover.
- **Active Navigation Pill:** Horizontal gradient wash (`linear-gradient(90deg, rgba(209,123,169,0.3) 0%, rgba(21,21,28,0) 100%)`) with a light accent bar or full rounded inner capsule.

### Segmented Filter Chips
- Contained within an outer frosted track (`rgba(13, 13, 18, 0.8)`).
- Active chips take a solid white or subtle lilac-frosted pill fill (`#FFFFFF` with `#0D0D12` text or `#D17BA9` with white text).
- Inactive chips remain ghost-transparent with muted gray typography.

### Input Fields & Search Bars
- Elongated pill shape with left-aligned monoline icons.
- Surface: `rgba(18, 18, 25, 0.85)` with a subtle stroke (`rgba(255, 255, 255, 0.07)`).
- Focus state: Ring stroke shifts to `#D17BA9` with a 4px soft bloom (`rgba(209, 123, 169, 0.15)`).

### Metric Cards & Data Modules
- Frosted dark container (`rgba(21, 21, 28, 0.72)`) with a faint micro-border.
- Top-right control group containing period selectors (`1D`, `1W`, `1M`, `1Y`) or action badges.
- Sparkline/area charts integrate smooth glowing gradient paths: `#D17BA9` stroke with an underlying vertical drop-off to `rgba(209, 123, 169, 0)`.

### Lists & Watchlist Rows
- Borderless rows separated by `space-sm` vertical spacing.
- Subdued hover feedback: `background: rgba(255, 255, 255, 0.03)` with a smooth 150ms ease.
- Left-aligned brand avatar/ticker circle, center company label, right-aligned tabular price and performance delta chip.

### Checkboxes & Switches
- Switches use a slim pill track with a luminous circular thumb that glows slightly when active.
- Checkboxes use rounded squares (`6px`) with emerald or rose active fills and micro checkmarks.