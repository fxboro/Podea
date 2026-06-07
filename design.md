# Podea Design System

This document outlines the current design tokens, architectural choices, and component usage for the Podea platform based on the existing `packages/ui` implementation. Adhering to this guide ensures visual consistency across all React applications (`apps/web`, etc.).

## 1. Design Philosophy
Podea utilizes a clean, modern, and accessible design system. It avoids heavy CSS frameworks (like Tailwind or Bootstrap) in favor of a semantic, pure CSS approach using CSS Variables (Tokens) and standard React component wrappers.

## 2. Design Tokens (`tokens.css`)

### Typography
Podea uses a dual-font system to create a professional and slightly premium aesthetic.
*   **Sans-Serif (Base UI):** `Inter` (Weights: 400, 500, 600)
    *   Used for all UI elements, buttons, inputs, and general body text.
*   **Serif (Headings):** `Playfair Display` (Weights: 500, 600)
    *   Used for `h1`, `h2`, `h3` and areas requiring a premium touch.

### Color Palette
The color scheme leans toward a calm, clinical, yet premium spa-like feel.

*   **Backgrounds:**
    *   `--color-bg-base`: `#F4EFEA` (Warm, off-white background)
    *   `--color-bg-surface`: `#FCFAF8` (Lighter surface for Cards)
*   **Text & Accents:**
    *   `--color-primary-text`: `#1F2A37` (Dark gray, nearly black for primary text)
    *   `--color-primary-muted`: `#374151` (Lighter text for secondary info)
    *   `--color-accent`: `#C7A75D` (Gold/Brass accent for primary actions and upsells)
    *   `--color-accent-hover`: `#b5954a` (Hover state for accent)
*   **Status/Alerts:**
    *   `--color-status-success`: `#4A6C5C` (Muted Green)
    *   `--color-status-warning`: `#BE5A5A` (Muted Red, used for PHI/Medical Alerts)
    *   `--color-status-warning-bg`: `#FDF5F5` (Very light red background for alerts)

### Spacing & Grid
A standard 8px/4px underlying grid system is used.
*   `--spacing-xs`: 4px
*   `--spacing-sm`: 8px
*   `--spacing-md`: 16px
*   `--spacing-lg`: 24px
*   `--spacing-xl`: 32px

### Border Radius
*   `--radius-sm`: 8px (Inputs, Alerts)
*   `--radius-md`: 16px (Standard Cards)
*   `--radius-lg`: 24px (Large Layout Cards)
*   `--radius-pill`: 9999px (Buttons)

---

## 3. Component Architecture (`components.css`)

All components in the `packages/ui` library follow a simple class-naming convention (`podea-*`) and are exported as strongly-typed React components.

### Buttons (`<Button>`)
Buttons are fully rounded (pill shape) with smooth hover transitions.
*   `variant="primary"`: Dark background (`--color-primary-text`), white text. Used for standard actions.
*   `variant="secondary"`: Transparent background, dark border. Used for secondary actions (e.g., Cancel).
*   `variant="accent"`: Gold background (`--color-accent`). Used for high-conversion actions or upsells.

### Cards (`<Card>`)
Cards use the `--color-bg-surface` color and a soft shadow (`--shadow-soft`).
*   `size="normal"`: Default padding (16px) and border-radius (16px).
*   `size="large"`: Extended padding (32px) and larger radius (24px) for main dashboard views.
*   `isUpsell={true}`: Adds a 4px top border using the Accent (Gold) color to visually highlight premium features.

### Inputs & Forms
Forms use an explicit layout without relying on browser defaults.
*   Inputs have a minimum font size of `16px` to prevent iOS auto-zooming.
*   Focus states utilize a solid border and shadow ring matching `--color-primary-text` rather than a standard blue outline.

### Medical Alerts (`<MedicalAlert>`)
A specialized component for displaying PHI warnings, utilizing the `warning` token colors. It applies a subtle red background (`--color-status-warning-bg`) and red text (`--color-status-warning`) to draw practitioner attention without being overly aggressive.

---

## 4. Implementation Rules
1.  **Do not use inline styles or ad-hoc colors.** If a color is needed, verify if it maps to a token in `tokens.css`.
2.  **Avoid Tailwind.** The application explicitly uses standard CSS mapped to the `podea-*` class structure.
3.  **Importing UI:** Always import components from the shared UI package (e.g., `import { Button, Card } from '@podea/ui';`) rather than rebuilding them in `apps/web`.
