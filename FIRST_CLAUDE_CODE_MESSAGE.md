# Claude Code — First Session Prompt
# Paste this as your first message when you open Claude Code in the project

---

Please read CLAUDE.md thoroughly before doing anything else.

Then build the complete VisitReady application following the Build Order
in CLAUDE.md exactly (steps 1–32).

Key things to keep in mind as you build:

1. All Claude API calls must go through /api/prep and /api/decode — never
   call Anthropic from the client side.

2. The BodyMap SVG is the most important visual component — it must be
   interactive (clickable organs), color-coded by system status, and look
   polished. Spend extra care here.

3. The design must look nothing like a default Next.js/Tailwind app. Use the
   teal brand color system, generous spacing, rounded-2xl cards, and smooth
   hover transitions throughout.

4. After building each page, verify it renders correctly with `npm run dev`
   before moving to the next component.

5. Run `npm run build` at the end — zero TypeScript errors required.

Start with step 1 (create-next-app is already done — start from step 3,
installing dependencies).

The project must be fully functional and visually polished when complete.
