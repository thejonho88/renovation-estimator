# Renovation Cost Estimator

A modern React-based tool for estimating renovation costs based on various factors including type of renovation, property type, area size, and scope of work.

## 🚀 Live Demo

Visit the live application: [https://thejonho88.github.io/renovation-estimator](https://thejonho88.github.io/renovation-estimator)

## ✨ Features

- **Multiple Renovation Types**: Kitchen, Bathroom, Whole Interior, Flooring, Painting, and Other
- **Detailed Cost Calculations**: Base cost, labor, materials, and scope adjustments
- **IKEA Cabinetry Integration**: Specialized calculations for kitchen renovations
- **Comprehensive Scope Options**: Demolition, Plumbing, Electrical, Millwork, Appliance Install, Permits/Design
- **Finish Level Options**: Budget, Mid-range, and High-end/Luxury
- **Estimate Type Selection**: Low, Average, and High cost estimates
- **Responsive Design**: Modern UI that works on all devices
- **Real-time Validation**: Form validation with helpful error messages

## 🛠️ Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**:
```bash
git clone https://github.com/thejonho88/renovation-estimator.git
cd renovation-estimator
```

2. **Install dependencies**:
```bash
npm install
```

3. **Start development server**:
```bash
npm start
```

4. **Open your browser** and visit `http://localhost:3000`

## 📦 Build & Deploy

### Build for Production
```bash
npm run build
```

### Deploy to GitHub Pages
```bash
npm run deploy
```

## 🎯 Usage

1. **Select Renovation Type**: Choose from Kitchen, Bathroom, Whole Interior, Flooring, Painting, or Other
2. **Enter Property Details**: Specify property type and zip code
3. **Set Specifications**: Enter area size, wall height, and finish level
4. **Choose Estimate Type**: Select Low, Average, or High cost estimate
5. **Select Scope of Work**: Check relevant items like Demolition, Plumbing, Electrical, etc.
6. **Calculate**: Click "Calculate Estimate" to view detailed cost breakdown

## 🏗️ Project Structure

```
src/
├── components/
│   └── RenovationEstimator.tsx    # Main component
├── index.tsx                       # App entry point
└── index.css                       # Global styles
public/
└── index.html                      # HTML template
```

## 🎨 Technologies Used

- **React 18** - Frontend framework
- **TypeScript** - Type safety and better development experience
- **Tailwind CSS** - Utility-first CSS framework
- **Node.js** - Runtime environment

## 📊 Cost Calculation Features

- **Base Cost Calculation**: Uses area-based calculations with type-specific multipliers
- **Labor vs Materials**: Separate tracking of labor and material costs
- **Scope Adjustments**: Additional costs for specific work items
- **Location Factors**: Geographic cost adjustments
- **IKEA Integration**: Specialized calculations for kitchen cabinetry

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This calculator is for educational purposes only. Please verify costs with local contractors before beginning any renovation project. 

## **🌐 Complete Setup Instructions for Custom Domain**

### **Step 1: Configure GitHub Pages Settings**

1. **Go to your repository:**
   - Visit: https://github.com/thejonho88/renovation-estimator

2. **Click "Settings" tab** (near the top, next to "Code", "Issues", etc.)

3. **Click "Pages" in the left sidebar** (under "Code and automation")

4. **Add your custom domain:**
   - In the **"Custom domain"** section
   - Enter your domain (e.g., `yourdomain.com`)
   - Click **"Save"**

5. **Enable HTTPS:**
   - Make sure **"Enforce HTTPS"** is checked

### **Step 2: Configure DNS in Squarespace**

1. **Go to your Squarespace DNS settings**

2. **Add 4 new A records** (click "ADD PRESET"):
   ```
   Record 1:
   - HOST: @
   - TYPE: A
   - PRIORITY: 0
   - TTL: 4 hrs
   - DATA: 185.199.108.153

   Record 2:
   - HOST: @
   - TYPE: A
   - PRIORITY: 0
   - TTL: 4 hrs
   - DATA: 185.199.109.153

   Record 3:
   - HOST: @
   - TYPE: A
   - PRIORITY: 0
   - TTL: 4 hrs
   - DATA: 185.199.110.153

   Record 4:
   - HOST: @
   - TYPE: A
   - PRIORITY: 0
   - TTL: 4 hrs
   - DATA: 185.199.111.153
   ```

3. **Remove old Squarespace A records** (optional):
   - Delete the 4 A records with IPs: `198.49.23.144`, `198.49.23.145`, `198.185.159.145`, `198.185.159.144`

### **Step 3: Update Your React App**

1. **Update package.json homepage** (replace `yourdomain.com` with your actual domain):
   ```json
   "homepage": "https://yourdomain.com"
   ```

2. **Rebuild and deploy:**
   ```bash
   npm run build
   cp -r build/* docs/
   git add docs/ package.json
   git commit -m "Update for custom domain deployment"
   git push origin main
   ```

### **Step 4: Wait and Test**

1. **Wait for DNS propagation** (15 minutes to 48 hours, usually much faster)
2. **Test your domain** by visiting it in a browser
3. **Your renovation estimator should now be live** at your custom domain!

## **🎯 What This Will Do:**

- ✅ **Your domain** will point to the renovation estimator
- ✅ **Old Squarespace site** will no longer be accessible at root domain
- ✅ **Renovation estimator** will be your main site

## **⚠️ Important Notes:**

- **Backup your Squarespace content** if you want to keep it
- **You can always revert** by changing the DNS back
- **Consider keeping the www subdomain** for Squarespace if needed

**Need help with any specific step?** 🚀 