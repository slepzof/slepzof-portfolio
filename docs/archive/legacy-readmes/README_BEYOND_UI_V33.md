# SLEPZOF Beyond UI v33

Based on v32. Original content, cases, radar SVG, values and other page sections preserved.

- Added 16 px beyond previous right padding (now 24 px) for achievement pills both in featured and Beyond UI.
- Desktop project rails extend with a safe edge mask and a trailing spacer, so the last card can snap to the left with no clipped predecessor.
- Desktop stage gets an opaque black backplate to prevent white compositor flashes during skill transitions.
- +80px bottom space for content and longer desktop scroll distance per chapter.
- Mobile displays one active skill at a time; nothing is sticky. A fresh downward swipe/wheel gesture at the end initiates a 760ms smooth return to the diagram of the next skill with a fade, and reverse gesture at top returns to previous skill. Click on a radar skill navigates directly.
- Mobile intro heading has normal measured width and balanced wrapping; copy is readable without a desktop text-width constraint.

Added CSS/JS v33, index loads those. Other existing files remain unchanged.
