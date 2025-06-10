# 🏎️ Delta Dash 
![Static Badge](https://img.shields.io/badge/beta-yellow) ![GitHub package.json version](https://img.shields.io/github/package-json/v/yashsoni27/f1-dash)

An unofficial Formula 1 dashboard that offers fans an interactive and data-rich experience. Track driver and constructor standings, analyze race stats, and compare head-to-head performances—all in one sleek interface.

> ⚠️ This project is not affiliated with Formula 1 or Formula One Licensing BV. All trademarks are property of their respective owners.


## 🌐 Live Demo

[https://deltadash-pink.vercel.app/](https://deltadash-pink.vercel.app/)


## ✨ Features

### Current Features
- **Drivers & Constructors Standings**: View current championship standings.
- **Live Telemetry**: View live telemetry data along with Race Control messages and Team Radios.
- **Driver Stats**: Dive into individual driver performance metrics.
- **Race Insights**: Explore race-specific data, including pit stops and head-to-head comparisons.
- **Circuit Information**: Access detailed information about each circuit.
- **Interactive Visualizations**: Analyze data through intuitive charts and graphs.

### Planned Features
- Advanced tire strategy insights
- Best lap comparisons
- Advanced caching strategies for better UI loading times

## 📱 Screenshots

![Delta Dash](https://github.com/user-attachments/assets/0bfa2f79-fa8e-4232-9c3b-7a451b818aa0)
![Live Telemetry](https://github.com/user-attachments/assets/2c61065e-0ede-444c-b49c-b36cf910578b)
![Stats](https://github.com/user-attachments/assets/6969d0c5-59bb-40d4-bf1a-3b9c137b74a2)


## 🚀 Getting Started

### Prerequisites

- Node.js v16 or higher
- npm or yarn package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/yashsoni27/f1-dash.git

# Install dependencies
cd f1-dash
npm install --legacy-peer-deps

# Start the development server
npm run dev
```

## 🛠️ Tech Stack

- **Frontend Framework**
  - Next.js - React framework for production
  - TypeScript - Type-safe development
  - TailwindCSS - Utility-first CSS framework

- **Data Visualization**
  - Custom chart components for various data representations
  - Interactive data visualization tools
  - Real-time data updates

- **APIs Integration**
  - Jolpica API - Race data integration
  - DHL API - Pitstop data integration
  - F1SignalR - Live race data integration
 
## 🏗️ Currently Working On
  - Implementing Tanstack query


## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
