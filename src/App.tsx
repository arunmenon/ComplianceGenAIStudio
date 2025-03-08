import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Dashboard from './pages/Dashboard';
import GuidelinesGovernance from './pages/GuidelinesGovernance';
import SimulationArena from './pages/SimulationArena';
import AppLayout from './components/layout/AppLayout';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
});

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#e91e63',
    },
  },
});

function App() {
  const [darkMode, setDarkMode] = useState(true);

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <BrowserRouter>
        <AppLayout darkMode={darkMode} toggleDarkMode={() => setDarkMode(!darkMode)}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/guidelines" element={<GuidelinesGovernance />} />
            <Route path="/simulation" element={<SimulationArena />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;