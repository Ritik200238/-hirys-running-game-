@echo off
echo 🚀 HIRYS RUNNING - Vercel Deployment Script
echo ==============================================

REM Check if Vercel CLI is installed
vercel --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Vercel CLI not found. Installing...
    npm install -g vercel
) else (
    echo ✅ Vercel CLI found
)

REM Check if user is logged in
vercel whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo 🔐 Please login to Vercel...
    vercel login
) else (
    echo ✅ Already logged in to Vercel
)

REM Build the project
echo 🔨 Building project...
npm run build

REM Deploy to Vercel
echo 🚀 Deploying to Vercel...
vercel --prod

echo ✅ Deployment complete!
echo 🌐 Your game should be live at: https://hirys-running.vercel.app
echo 📱 Test on mobile for optimal experience!

pause
