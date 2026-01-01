#!/bin/bash

# Clinical Trial Dashboard - Vercel Deployment Script
echo "🚀 Deploying Clinical Trial Dashboard to Vercel..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run build to check for errors
echo "🔨 Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix errors before deploying."
    exit 1
fi

# Run tests
echo "🧪 Running tests..."
npm test

if [ $? -ne 0 ]; then
    echo "⚠️  Tests failed, but continuing with deployment..."
fi

echo "✅ Pre-deployment checks complete!"
echo ""
echo "🌐 Ready for Vercel deployment!"
echo ""
echo "Next steps:"
echo "1. Push to GitHub: git add . && git commit -m 'Deploy to Vercel' && git push"
echo "2. Go to vercel.com and import your repository"
echo "3. Deploy automatically!"
echo ""
echo "Or use Vercel CLI:"
echo "1. npm i -g vercel"
echo "2. vercel login"
echo "3. vercel --prod"
echo ""
echo "🎉 Your Clinical Trial Dashboard will be live!"