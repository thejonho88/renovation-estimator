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