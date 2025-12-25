# 🌐 Frontend Dashboard Guide

## 🚀 How to See the Frontend

### Option 1: Web Dashboard (Recommended)
```bash
npm run web
```
Then open your browser to: **http://localhost:3000**

### Option 2: Backend Only
```bash
npm run dev
```
This runs the backend service without web interface.

## 🎯 What You'll See

### Dashboard Features
- **📊 Trial Overview**: Study metrics and data quality index
- **🏥 Site Performance**: Site ratings and completion percentages  
- **🧪 Lab Metrics**: Lab reconciliation and quality tracking
- **✅ Readiness Check**: Interim analysis and submission readiness
- **👥 Patient Metrics**: Individual patient data quality scores
- **📈 KPIs**: System status and compliance metrics

### Real-time Updates
- Dashboard auto-refreshes every 30 seconds
- Click "🔄 Refresh Data" for manual updates
- Live data from all 13 system components

## 🎨 Theme & Design

### Black & Orange Theme
- **Background**: Black gradient (#000000 to #1a1a1a)
- **Primary Color**: Orange (#FF8C00)
- **Font**: Roboto Black 900 Italic for headings
- **Cards**: Gradient backgrounds with hover effects
- **Responsive**: Works on desktop, tablet, and mobile

### Visual Indicators
- 🟢 Green: Excellent/Ready status
- 🟡 Yellow: Good status  
- 🟠 Orange: Fair status
- 🔴 Red: Poor/Not Ready status

## 📊 Sample Data

The dashboard shows sample clinical trial data:
- **2 patients** with different completion levels
- **1 site** (SITE001) with performance metrics
- **1 study** (STUDY001) with trial-level metrics
- **Lab results** with quality tracking
- **Readiness assessment** for interim analysis

## 🔧 API Endpoints

### Available APIs
- `GET /api/dashboard` - Complete dashboard data
- `GET /api/patients` - All patient data
- `GET /api/metrics/:patientId` - Individual patient metrics

### Example API Response
```json
{
  "patients": [...],
  "site": { "siteId": "SITE001", "performanceRating": "excellent" },
  "trial": { "studyId": "STUDY001", "overallDataQualityIndex": 85.5 },
  "lab": { "reconciliationPercentage": 100 },
  "readiness": { "isReady": true, "overallScore": 80 }
}
```

## 🚨 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run web
```

### Dependencies Missing
```bash
npm install
```

### TypeScript Errors
```bash
npm run type-check
npm run build
```

## 🔄 Development Workflow

### 1. Start Backend + Frontend
```bash
npm run web
```

### 2. View Dashboard
Open: http://localhost:3000

### 3. Make Changes
- Edit `src/server.ts` for API changes
- Edit `public/index.html` for UI changes
- Restart server to see changes

### 4. Test Everything
```bash
npm test
```

## 📱 Mobile Responsive

The dashboard is fully responsive:
- **Desktop**: Multi-column grid layout
- **Tablet**: 2-column layout
- **Mobile**: Single column layout
- **Touch-friendly**: Large buttons and touch targets

## 🎉 Success!

When you see:
```
Clinical Trial Dashboard running at http://localhost:3000
Dashboard endpoints:
  - Main Dashboard: http://localhost:3000
  - API Dashboard: http://localhost:3000/api/dashboard
  - API Patients: http://localhost:3000/api/patients
```

Your frontend is ready! 🚀

## 🔮 Next Steps

### Enhance the Frontend
1. **Add Charts**: Integrate Chart.js or D3.js for visualizations
2. **Real-time Updates**: Add WebSocket for live data streaming
3. **User Authentication**: Add login/logout functionality
4. **Data Export**: Add CSV/PDF export capabilities
5. **Advanced Filters**: Add date ranges and filtering options

### Production Deployment
1. **Build for Production**: `npm run build`
2. **Environment Variables**: Configure production settings
3. **Database Integration**: Connect to real database
4. **Load Balancing**: Scale for multiple users
5. **SSL/HTTPS**: Secure connections

---

**Built with ❤️ for Clinical Trial Excellence**