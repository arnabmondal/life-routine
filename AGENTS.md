# Daywell project instructions

## Established UI theme — user requirement

Before UI changes, read COLOR_THEME.md and the relevant DESIGN.md behavior contract.

- Sage & Chalk is the established theme. Do not change the theme, palette, typography, or color-role hierarchy unless the user explicitly asks for a theme change. General requests for contrast, polish, accessibility, or new UX are not authorization to change the theme.
- Keep working surfaces white, supporting headers/controls light sage, selected states sage, and actions/focus forest green. Dark text tokens are for text; do not turn them into dark header/background bands. Do not add dark mode or new accent palettes implicitly.
- Use semantic tokens from web/app/theme.css and shared category references from web/lib/theme.ts. Preserve the five life-area identity colors.
- Improve contrast within this system: readable dark labels, clear neutral borders, approved light surfaces, visible green focus. Do not require decorative surface fills to meet the text-contrast threshold; check text and necessary control boundaries separately.
- Keep stats compact and visible, keep agenda/week dragging, and preserve scroll/focus through mutations. Existing user-approved behavior and brand constraints take precedence over generic design-skill recipes.
