# Daywell project instructions

## Established UI theme — user requirement

Before UI changes, read COLOR_THEME.md and the relevant DESIGN.md behavior contract.

- The approved themes are Sage & Chalk Light and the explicitly user-approved Sage & Chalk Dark preview. Do not change the theme, palette, typography, or color-role hierarchy unless the user explicitly asks for a theme change. General requests for contrast, polish, accessibility, or new UX are not authorization to change the theme.
- In Light, keep white surfaces, light-sage headers/selection, and forest-green actions/focus. In Dark, use the approved green-charcoal surfaces, soft-white text and mint actions from COLOR_THEME.md. Do not turn light-mode text tokens into dark background bands or introduce additional palettes/modes implicitly. Light and Dark switching through the top-right person-icon User settings menu is explicitly authorized.
- Use semantic tokens from web/app/theme.css and shared category references from web/lib/theme.ts. Preserve the five life-area identity colors.
- Improve contrast within this system: readable dark labels, clear neutral borders, approved light surfaces, visible green focus. Do not require decorative surface fills to meet the text-contrast threshold; check text and necessary control boundaries separately.
- Keep stats compact and visible, keep agenda/week dragging, and preserve scroll/focus through mutations. Existing user-approved behavior and brand constraints take precedence over generic design-skill recipes.
