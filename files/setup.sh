#!/bin/bash
# VisitReady — Project Quickstart
# Run this once to scaffold the project, then open in Claude Code

set -e

echo "🏥 VisitReady — Project Setup"
echo "=============================="

# Step 1: Create Next.js app
echo ""
echo "Step 1: Creating Next.js app..."
npx create-next-app@latest visitready \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --no-git

cd visitready

# Step 2: Install dependencies
echo ""
echo "Step 2: Installing dependencies..."
npm install @anthropic-ai/sdk lucide-react

# Step 3: Init shadcn/ui
echo ""
echo "Step 3: Setting up shadcn/ui..."
npx shadcn@latest init --defaults
npx shadcn@latest add button card badge input textarea select label slider

# Step 4: Copy CLAUDE.md into project root
echo ""
echo "Step 4: Copying CLAUDE.md..."
cp ../CLAUDE.md ./CLAUDE.md
cp ../.env.example ./.env.example

# Step 5: Create .env.local
echo ""
echo "Step 5: Creating .env.local..."
echo "ANTHROPIC_API_KEY=paste_your_key_here" > .env.local
echo ""
echo "⚠️  IMPORTANT: Open .env.local and paste your Anthropic API key"
echo "   Get your key at: https://platform.anthropic.com"

# Step 6: Add .env.local to .gitignore
echo ".env.local" >> .gitignore
echo "*.env.local" >> .gitignore

echo ""
echo "=============================="
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. cd visitready"
echo "  2. Add your ANTHROPIC_API_KEY to .env.local"
echo "  3. Open in Claude Code: claude"
echo "  4. Claude Code will read CLAUDE.md and build the app"
echo ""
echo "Deploy:"
echo "  - Push to GitHub"
echo "  - Connect repo to Vercel (vercel.com)"
echo "  - Add ANTHROPIC_API_KEY in Vercel environment variables"
echo "=============================="
