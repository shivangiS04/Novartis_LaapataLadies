# 🚀 Vercel Deployment Guide - Clinical Trial Dashboard

## 📋 **Prerequisites**

1. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository** - Push your code to GitHub
3. **Vercel CLI** (optional) - `npm i -g vercel`

## 🔧 **Deployment Steps**

### **Method 1: GitHub Integration (Recommended)**

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Clinical Trial Dashboard"
   git branch -M main
   git remote add origin https://github.com/yourusername/clinical-trial-dashboard.git
   git push -u origin main
   ```

2. **Connect to Vercel:**
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect the configuration

3. **Deploy:**
   - Click "Deploy"
   - Vercel will build and deploy automatically
   - You'll get a live URL like `https://clinical-trial-dashboard.vercel.app`

### **Method 2: Vercel CLI**

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel --prod
   ```

## ⚙️ **Configuration Files**

### **vercel.json** ✅
```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/server.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/src/server.ts"
    },
    {
      "src": "/(.*)",
      "dest": "/src/server.ts"
    }
  ]
}
```

### **package.json Updates** ✅
- Added `"engines": { "node": "18.x" }`
- Added `"vercel-build": "npm run build"`
- Updated dependencies for Vercel compatibility

## 🎯 **What Gets Deployed**

### **Frontend Features:**
- ✅ **Orange & Bold Italic Dashboard** - Complete UI
- ✅ **Site Leaderboard** - 6 sites with rankings
- ✅ **Issues by Category** - Visual breakdown
- ✅ **Lab Metrics** - 300 lab results with quality tracking
- ✅ **Interactive Explanations** - DQI and Readiness dialogs
- ✅ **Auto-refresh** - Live data updates
- ✅ **Responsive Design** - All devices supported

### **Backend API:**
- ✅ **REST Endpoints** - `/api/dashboard`, `/api/patients`, `/api/metrics/:id`
- ✅ **Explanation APIs** - `/api/explain/dqi`, `/api/explain/readiness`
- ✅ **Synthetic Data** - 50 patients, 6 sites, 38 issues
- ✅ **Real-time Metrics** - DQI, readiness, site performance

### **Data Generation:**
- ✅ **Realistic Scenarios** - Missing visits, lab issues, site performance
- ✅ **Clinical Trial Standards** - Industry-standard calculations
- ✅ **Quality Metrics** - Comprehensive data quality monitoring

## 🌐 **Live Dashboard Features**

Once deployed, your dashboard will have:

### **Core Widgets:**
1. **Trial Overview** - Study metrics with DQI explanation
2. **Site Leaderboard** - Performance rankings
3. **Issues by Category** - Data Quality, Verification, Safety, Lab
4. **Lab Metrics** - 300 results with quality tracking
5. **Readiness Check** - Interim analysis readiness
6. **Patient Metrics** - Individual DQI scores
7. **KPIs** - System health indicators

### **Interactive Features:**
- **Click Explanations** - Detailed metric breakdowns
- **Auto-refresh** - Updates every 30 seconds
- **Hover Effects** - Smooth animations
- **Progress Bars** - Visual completion indicators
- **Modal Dialogs** - Professional overlays

## 📊 **Sample Data (Production)**

### **Generated Data:**
- **50 Patients** across 6 clinical sites
- **300 Lab Results** with realistic missing data
- **38 Issues** categorized by type
- **6 Sites** ranked by Data Quality Score
- **Realistic Missing Visits** - 0-60% range

### **Quality Metrics:**
- **Data Quality Index** - 60-100% range
- **Lab Reconciliation** - 82% average
- **Site Performance** - Excellent/Good/Fair/Poor ratings
- **Missing Visit Tracking** - Realistic clinical scenarios

## 🔍 **Environment Variables (Optional)**

If you need custom configuration:

```bash
# In Vercel Dashboard > Settings > Environment Variables
NODE_ENV=production
PORT=3000
```

## 🚨 **Troubleshooting**

### **Common Issues:**

1. **Build Errors:**
   ```bash
   npm run build  # Test locally first
   ```

2. **TypeScript Issues:**
   ```bash
   npm run type-check
   ```

3. **Missing Dependencies:**
   - Ensure all dependencies are in `dependencies` (not `devDependencies`)

4. **API Routes Not Working:**
   - Check `vercel.json` routing configuration
   - Ensure server exports the Express app

## 🎉 **Expected Result**

After deployment, you'll have:

- 🌐 **Live URL** - `https://your-project.vercel.app`
- 📊 **Full Dashboard** - All widgets functional
- ⚡ **Fast Performance** - Optimized for production
- 📱 **Mobile Responsive** - Works on all devices
- 🔄 **Auto-deployment** - Updates on git push

## 📈 **Performance Optimizations**

### **Vercel Optimizations:**
- ✅ **Serverless Functions** - Automatic scaling
- ✅ **Edge Network** - Global CDN
- ✅ **Build Optimization** - TypeScript compilation
- ✅ **Static Assets** - Optimized delivery

### **Dashboard Optimizations:**
- ✅ **Efficient Data Generation** - Synthetic data for speed
- ✅ **Minimal API Calls** - Consolidated endpoints
- ✅ **Client-side Caching** - Reduced server load
- ✅ **Responsive Images** - Optimized loading

## 🎯 **Final Checklist**

Before deploying:
- ✅ Code pushed to GitHub
- ✅ `vercel.json` configured
- ✅ `package.json` updated
- ✅ Build passes locally (`npm run build`)
- ✅ Tests pass (`npm test`)

**Your Clinical Trial Dashboard will be live and ready for demo!** 🚀

---

**Deploy with confidence - Your dashboard is production-ready!**
**Novartis LaapataLadies Team**