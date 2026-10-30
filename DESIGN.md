---
name: Daywell
description: A quiet personal routine planner.
colors:
  bg: "#f3f5f1"
  surface: "#fff"
  tonal: "#e9ede6"
  ink: "#263b32"
  muted: "#58675e"
  line: "#dce2d9"
  green: "#23765e"
  control: "#abb9af"
  negative: "#9b3e38"
  green-hover: "#195c49"
  completed-surface: "#f0f7f2"
  weekend: "#f9faf7"
  health: "#21a985"
  family: "#d99356"
  career: "#6789e8"
  learning: "#9b7bdf"
  personal: "#e47c9e"
typography:
  headline:
    fontFamily: "Arial, Helvetica, sans-serif"
    fontSize: "30px"
    fontWeight: 400
    lineHeight: "1.2"
    letterSpacing: "-0.6px"
  title:
    fontFamily: "Arial, Helvetica, sans-serif"
    fontSize: "18px"
    fontWeight: 600
    lineHeight: "1.5"
    letterSpacing: "0"
  body:
    fontFamily: "Arial, Helvetica, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "1.5"
    letterSpacing: "0"
  label:
    fontFamily: "Arial, Helvetica, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: "1.5"
    letterSpacing: "0"
  metric:
    fontFamily: "Arial, Helvetica, sans-serif"
    fontSize: "28px"
    fontWeight: 400
    lineHeight: "1.2"
    letterSpacing: "0"
rounded:
  status: "4px"
  control: "6px"
  item: "8px"
  surface: "12px"
  dialog: "16px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  gap: "16px"
  lg: "24px"
  xl: "28px"
  frame: "36px"
components:
  button-primary:
    backgroundColor: "{colors.green}"
    textColor: "{colors.surface}"
    rounded: "{rounded.control}"
    padding: "8px 12px"
    height: "40px"
  button-primary-hover:
    backgroundColor: "{colors.green-hover}"
  button-outline:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "8px 12px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "10px"
  navigation-active:
    backgroundColor: "{colors.tonal}"
    textColor: "{colors.ink}"
    rounded: "{rounded.item}"
    padding: "12px"
  summary:
    backgroundColor: "{colors.tonal}"
    rounded: "{rounded.surface}"
    padding: "16px"
  event:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.item}"
---

# Design System: Daywell

## Overview

**Creative North Star: "A Quiet Weekly Rhythm"**

A quiet weekly rhythm: pale sage ground, a white working sheet, and clear green actions keep personal commitments easy to scan. The interface is supportive and practical, with compact summaries and space for an unplanned day.

Arial and Helvetica provide familiar, direct typography. Regular-weight headings and figures soften the dashboard without obscuring activity names, times, or outcomes. Colorful life-area dots preserve identity without taking over the calendar.

**Key Characteristics:**
- Pale sage ground and white working surfaces.
- Compact information with readable metadata.
- Green actions and small life-area color dots.
- Flat surfaces with restrained borders.

## Colors

A low-chroma sage and white foundation supports a deeper green action color.

### Primary
- **Routine Green** (`green`): primary actions, current-day emphasis, completion text, focus outlines, and caret.
- **Deep Routine Green** (`green-hover`): primary-button hover.

### Secondary
- **Life-area colors** (`health`, `family`, `career`, `learning`, `personal`): small category dots beside names in navigation and activities. Names remain visible so hue is never the sole identifier.

### Neutral
- **Sage Ground** (`bg`), **White Sheet** (`surface`), and **Tonal Sage** (`tonal`): page, schedule, and summary/selected-navigation surfaces.
- **Forest Ink** (`ink`) and **Quiet Green-Gray** (`muted`): primary content and supporting text.
- **Soft Divider** (`line`) and **Control Edge** (`control`): structural separators and actionable field borders.
- **Weekend Wash** (`weekend`) and **Completed Wash** (`completed-surface`): subdued contextual surfaces.
- **Outcome Red** (`negative`): skipped outcomes, deletion, and errors.

**The Small Dots Rule.** Life-area colors identify categories through small dots; the working sheet remains neutral.

## Typography

**Body and heading font:** Arial, Helvetica, sans-serif. Tabular numerals align schedule data.

Headlines and metric figures use regular weight; section titles and activity names use semibold. The frontmatter records desktop roles. At narrow widths, the page heading becomes 25px, summary figures become 22px, and activity names become 15px. Schedule metadata remains at least 12px; mobile outcome labels use 13px. No separate display or mono font is present.

## Layout

The desktop shell pairs a 230px sidebar with a centered main area capped at 1240px, including 40px vertical and 36px horizontal padding. Four equal summary cells and seven equal day columns share the content edges; summary gaps use the 16px rhythm. Calendar headings use 24px padding.

At 1100px and below, navigation becomes a horizontal top band and main padding becomes 28px by 24px. At 850px and below, a seven-date picker selects one visible day column, with larger activity controls. At 600px and below, main padding becomes 24px by 16px, summaries form a compact two-by-two tonal block, calendar actions use a grid, and paired fields stack. At 1600px and above, main top padding becomes 56px.

## Elevation & Depth

The working interface is flat: tonal separation and thin borders create hierarchy. Today's date receives a green inset top rule, not a floating shadow. Only the native modal is lifted, with a broad translucent forest shadow and a dimmed backdrop. Buttons transition background color over 150ms with ease-out; reduced motion removes transitions. No entrance motion is used.

## Shapes

Controls use restrained corners, events and navigation use slightly softer corners, and major panels use the surface radius. The modal has the largest radius. Identity dots and the initials avatar are circular. Event borders are solid; the inline Add action uses a dashed border.

## Components

### Buttons
Primary actions are green with white text, a matching border, and deep-green hover. Outline actions are white with a control-edge border and tonal hover. Both use 13px text, 8px by 12px padding, and a 40px minimum height, increased to 44px at 850px and below. Keyboard focus uses a 3px green outline offset by 3px. Disabled buttons retain their shape with 65% opacity and a wait cursor.

### Inputs / Fields
White fields have a control-edge border, control-radius corners, 10px padding, 16px text, and a 44px minimum height. Labels are 13px semibold. Focus follows the shared green outline. Errors appear as explicit red text; there is no field-level error-border variant.

### Navigation
Muted icon-and-label buttons become tonal with ink text when active. Tabs follow the same color relationship. On narrow screens the date picker uses a green fill and white text for the selected date. Category labels are static legend entries, not filter chips.

### Cards / Containers
Summary cells use a tonal fill without shadows. The calendar is a white surface with clipped corners and thin separators. Activity cards use white fill, item-radius corners, a fine divider border, and compact internal spacing. Completed cards gain a faint green wash; skipped titles gain a strike-through and regular weight. Outcomes remain written out.

### Outcome controls
Small check and skip buttons use transparent backgrounds. Selected controls receive a current-color inset outline; completion uses dark green and skipping uses outcome red. At 850px and below, each outcome target is at least 44px square. Selected state is also exposed with aria-pressed.

### Dialog
A native dialog caps width at 540px and viewport height minus 32px, scrolls internally, and uses 28px padding (20px on phones). The two time fields stack at 600px. Visible labels, native focus management, and explicit save/cancel actions remain part of the pattern.

## Do's and Don'ts

### Do:
- Do keep activity times, titles, categories, and outcomes distinct.
- Do use the five life-area colors as small identity dots.
- Do retain visible keyboard focus and reduced-motion support.
- Do switch to a readable selected-day schedule on narrow screens.

### Don't:
- Don't introduce decorative imagery or entrance animation into this routine planner.
- Don't use life-area hues as large card fills.
- Don't shrink schedule metadata below the established 12px treatment.
