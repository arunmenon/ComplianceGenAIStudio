# GenAI Studio Compliance Platform

A comprehensive UI for AI compliance management based on the GenAI Studio PRD. This application provides tools for guidelines governance, simulation of compliance scenarios, and model decision analytics.

## Features

### 1. Guidelines Governance
- Guidelines Manager for creating and managing AI compliance policies
- Knowledge Graph visualization of policy relationships
- Guidelines Guru chatbot for natural language policy exploration

### 2. Simulation Arena
- What-If scenario testing of models against policies
- Model comparison to evaluate compliance performance
- Timeline projections to predict future compliance
- Detailed violation analysis

### 3. Live Model Decision Analytics Dashboard
- Real-time metrics on model compliance
- High-recall vs high-precision mode toggle
- Violation trend visualization with anomaly detection
- Heatmap of violation patterns

## Technologies Used

- React 18 with TypeScript
- Material UI for component library
- ApexCharts for data visualization
- React Flow for knowledge graph visualization
- React Router for navigation

## Getting Started

### Prerequisites
- Node.js 16+ and npm

### Installation

1. Clone the repository
```
git clone https://github.com/your-organization/genai-studio-compliance.git
cd genai-studio-compliance
```

2. Install dependencies
```
npm install
```

3. Start the development server
```
npm run dev
```

4. Open your browser to `http://localhost:3000`

## Building for Production

To create a production build:

```
npm run build
```

The built files will be in the `dist` directory.

## Usage

### Guidelines Governance
Navigate to the Guidelines Governance tab to manage AI compliance policies. You can:
- Add, edit, and delete guidelines
- Explore policy relationships in the knowledge graph
- Ask questions about guidelines using natural language

### Simulation Arena
Use the Simulation Arena to test AI models against compliance policies:
- Select models to test
- Choose policies to test against
- Configure datasets and parameters
- Run simulations and analyze results
- Compare model performance

### Analytics Dashboard
Monitor real-time compliance metrics on the Dashboard:
- Toggle between high-recall and high-precision modes
- View violation trends and anomalies
- Analyze violation patterns by policy type
- Drill down into specific violations

## License

This project is licensed under the MIT License - see the LICENSE file for details.