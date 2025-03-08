import { useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  CardHeader,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  TextField,
  Tabs,
  Tab,
  Stack,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Switch,
  FormControlLabel,
  CircularProgress,
  Alert,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import DownloadIcon from '@mui/icons-material/Download';
import InfoIcon from '@mui/icons-material/Info';
import TimelineIcon from '@mui/icons-material/Timeline';
import DateRangeIcon from '@mui/icons-material/DateRange';
import CachedIcon from '@mui/icons-material/Cached';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

// Mock models for simulation
interface Model {
  id: string;
  name: string;
  version: string;
  type: string;
  description: string;
}

const mockModels: Model[] = [
  {
    id: 'model-1',
    name: 'Content Moderation',
    version: 'v3.2',
    type: 'Image & Text',
    description: 'Multi-modal content moderation model for detecting inappropriate content',
  },
  {
    id: 'model-2',
    name: 'PII Detector',
    version: 'v2.1',
    type: 'Text & Image',
    description: 'Detects and masks personally identifiable information in text and images',
  },
  {
    id: 'model-3',
    name: 'Bias Detector',
    version: 'v1.5',
    type: 'Text',
    description: 'Analyzes text for potential bias across protected characteristics',
  },
  {
    id: 'model-4',
    name: 'Image Recognizer',
    version: 'v2.8',
    type: 'Image',
    description: 'Identifies objects, scenes, and potential issues in images',
  },
  {
    id: 'model-5',
    name: 'Text Generator',
    version: 'v4.0',
    type: 'Text',
    description: 'Generates text based on prompts with safety guardrails',
  },
];

// Mock policies for simulation
interface Policy {
  id: string;
  name: string;
  description: string;
  category: string;
  severity: 'high' | 'medium' | 'low';
}

const mockPolicies: Policy[] = [
  {
    id: 'policy-1',
    name: 'No PII in Responses',
    description: 'Models must not return personally identifiable information in responses',
    category: 'Privacy',
    severity: 'high',
  },
  {
    id: 'policy-2',
    name: 'Bias Detection',
    description: 'Models must not show bias against protected groups',
    category: 'Ethics',
    severity: 'high',
  },
  {
    id: 'policy-3',
    name: 'Content Filtering',
    description: 'Models must filter inappropriate or harmful content',
    category: 'Content Safety',
    severity: 'high',
  },
  {
    id: 'policy-4',
    name: 'Transparency',
    description: 'Models must expose confidence scores for critical decisions',
    category: 'Transparency',
    severity: 'medium',
  },
  {
    id: 'policy-5',
    name: 'Efficiency',
    description: 'Models must meet performance and efficiency standards',
    category: 'Sustainability',
    severity: 'low',
  },
];

// Mock datasets for simulation
interface Dataset {
  id: string;
  name: string;
  type: string;
  items: number;
  description: string;
}

const mockDatasets: Dataset[] = [
  {
    id: 'dataset-1',
    name: 'User Profile Images',
    type: 'Image',
    items: 10000,
    description: 'Real-world profile images with diverse user content',
  },
  {
    id: 'dataset-2',
    name: 'Customer Service Chats',
    type: 'Text',
    items: 25000,
    description: 'Anonymized customer service chat logs',
  },
  {
    id: 'dataset-3',
    name: 'Product Listings',
    type: 'Text & Image',
    items: 15000,
    description: 'Product listings with descriptions and images',
  },
  {
    id: 'dataset-4',
    name: 'User Reviews',
    type: 'Text',
    items: 50000,
    description: 'Product reviews from users',
  },
  {
    id: 'dataset-5',
    name: 'Compliance Test Suite',
    type: 'Multi-modal',
    items: 5000,
    description: 'Specially crafted dataset to test compliance edge cases',
  },
];

// Mock simulation results
interface SimulationResult {
  modelId: string;
  policyId: string;
  passRate: number;
  violationCount: number;
  details: {
    severity: 'high' | 'medium' | 'low';
    count: number;
    examples: string[];
  }[];
}

const comparisonChartOptions: ApexOptions = {
  chart: {
    type: 'bar',
    height: 350,
    stacked: true,
    toolbar: {
      show: true
    },
    zoom: {
      enabled: true
    }
  },
  responsive: [{
    breakpoint: 480,
    options: {
      legend: {
        position: 'bottom',
        offsetX: -10,
        offsetY: 0
      }
    }
  }],
  plotOptions: {
    bar: {
      horizontal: false,
      borderRadius: 10,
      dataLabels: {
        total: {
          enabled: true,
          style: {
            fontSize: '13px',
            fontWeight: 900
          }
        }
      }
    },
  },
  xaxis: {
    categories: ['Model X', 'Model Y'],
  },
  legend: {
    position: 'right',
    offsetY: 40
  },
  fill: {
    opacity: 1
  },
  colors: ['#ff0000', '#ff9800', '#2196f3']
};

const comparisonChartSeries = [
  {
    name: 'Severe Violations',
    data: [12, 5]
  },
  {
    name: 'Potential Violations',
    data: [24, 18]
  },
  {
    name: 'Mild Violations',
    data: [35, 22]
  }
];

const timelineChartOptions: ApexOptions = {
  chart: {
    height: 350,
    type: 'line',
    zoom: {
      enabled: false
    }
  },
  dataLabels: {
    enabled: false
  },
  stroke: {
    curve: 'straight'
  },
  title: {
    text: 'Violation Projection Over Time',
    align: 'left'
  },
  grid: {
    row: {
      colors: ['#f3f3f3', 'transparent'],
      opacity: 0.5
    },
  },
  xaxis: {
    categories: ['Current', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
  },
  yaxis: {
    title: {
      text: 'Violations'
    }
  }
};

const timelineChartSeries = [
  {
    name: "Model X",
    data: [71, 75, 79, 82, 86, 90]
  },
  {
    name: "Model Y",
    data: [45, 47, 50, 53, 55, 58]
  }
];

export default function SimulationArena() {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedPolicies, setSelectedPolicies] = useState<string[]>([]);
  const [selectedDataset, setSelectedDataset] = useState('');
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [simulationCompleted, setSimulationCompleted] = useState(false);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [secondaryModel, setSecondaryModel] = useState('');
  const [timeHorizon, setTimeHorizon] = useState(3); // months
  const [policyStrength, setPolicyStrength] = useState(50); // default middle value
  const [tabValue, setTabValue] = useState(0);

  const steps = ['Select Models', 'Choose Policies', 'Configure Dataset', 'Run Simulation'];

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleRunSimulation = () => {
    setSimulationRunning(true);
    
    // Simulate a delay for the simulation to run
    setTimeout(() => {
      setSimulationRunning(false);
      setSimulationCompleted(true);
      // Move to the results step
      setActiveStep(4);
    }, 3000);
  };

  const handleReset = () => {
    setActiveStep(0);
    setSelectedModel('');
    setSelectedPolicies([]);
    setSelectedDataset('');
    setSimulationCompleted(false);
    setComparisonMode(false);
    setSecondaryModel('');
    setTimeHorizon(3);
    setPolicyStrength(50);
    setTabValue(0);
  };

  const handleModelSelect = (modelId: string) => {
    setSelectedModel(modelId);
  };

  const handleSecondaryModelSelect = (modelId: string) => {
    setSecondaryModel(modelId);
  };

  const handlePolicyToggle = (policyId: string) => {
    setSelectedPolicies((prev) => {
      if (prev.includes(policyId)) {
        return prev.filter((id) => id !== policyId);
      } else {
        return [...prev, policyId];
      }
    });
  };

  const handleDatasetSelect = (datasetId: string) => {
    setSelectedDataset(datasetId);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Simulation Arena
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Stepper activeStep={activeStep}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          {activeStep === 0 && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Select Model(s) to Test
              </Typography>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={comparisonMode}
                    onChange={(e) => setComparisonMode(e.target.checked)}
                  />
                }
                label="Compare two models"
              />
              
              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={12} md={comparisonMode ? 6 : 12}>
                  <Typography variant="subtitle1" gutterBottom color={comparisonMode ? 'primary' : 'textPrimary'}>
                    {comparisonMode ? 'Primary Model' : 'Model'}
                  </Typography>
                  
                  <Grid container spacing={2}>
                    {mockModels.map((model) => (
                      <Grid item xs={12} sm={6} md={4} key={model.id}>
                        <Card 
                          variant={selectedModel === model.id ? 'elevation' : 'outlined'}
                          sx={{ 
                            cursor: 'pointer', 
                            border: selectedModel === model.id ? 2 : 1,
                            borderColor: selectedModel === model.id ? 'primary.main' : 'divider'
                          }}
                          onClick={() => handleModelSelect(model.id)}
                        >
                          <CardHeader
                            title={model.name}
                            subheader={`${model.version} • ${model.type}`}
                          />
                          <CardContent>
                            <Typography variant="body2" color="text.secondary">
                              {model.description}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
                
                {comparisonMode && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom color="secondary">
                      Secondary Model
                    </Typography>
                    
                    <Grid container spacing={2}>
                      {mockModels
                        .filter((model) => model.id !== selectedModel)
                        .map((model) => (
                          <Grid item xs={12} sm={6} md={4} key={model.id}>
                            <Card 
                              variant={secondaryModel === model.id ? 'elevation' : 'outlined'}
                              sx={{ 
                                cursor: 'pointer',
                                border: secondaryModel === model.id ? 2 : 1,
                                borderColor: secondaryModel === model.id ? 'secondary.main' : 'divider'
                              }}
                              onClick={() => handleSecondaryModelSelect(model.id)}
                            >
                              <CardHeader
                                title={model.name}
                                subheader={`${model.version} • ${model.type}`}
                              />
                              <CardContent>
                                <Typography variant="body2" color="text.secondary">
                                  {model.description}
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                    </Grid>
                  </Grid>
                )}
              </Grid>
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={!selectedModel || (comparisonMode && !secondaryModel)}
                >
                  Next
                </Button>
              </Box>
            </Paper>
          )}

          {activeStep === 1 && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Select Policies to Test Against
              </Typography>
              
              <Grid container spacing={2}>
                {mockPolicies.map((policy) => (
                  <Grid item xs={12} sm={6} key={policy.id}>
                    <Card 
                      variant={selectedPolicies.includes(policy.id) ? 'elevation' : 'outlined'}
                      sx={{ 
                        cursor: 'pointer',
                        border: selectedPolicies.includes(policy.id) ? 2 : 1,
                        borderColor: selectedPolicies.includes(policy.id) ? 'primary.main' : 'divider'
                      }}
                      onClick={() => handlePolicyToggle(policy.id)}
                    >
                      <CardHeader
                        title={(
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {policy.name}
                            <Chip 
                              label={policy.category}
                              size="small"
                              color="primary"
                            />
                            <Chip 
                              label={policy.severity}
                              size="small"
                              color={
                                policy.severity === 'high' 
                                  ? 'error' 
                                  : policy.severity === 'medium' 
                                    ? 'warning' 
                                    : 'info'
                              }
                            />
                          </Box>
                        )}
                      />
                      <CardContent>
                        <Typography variant="body2" color="text.secondary">
                          {policy.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Button onClick={handleBack}>
                  Back
                </Button>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={selectedPolicies.length === 0}
                >
                  Next
                </Button>
              </Box>
            </Paper>
          )}

          {activeStep === 2 && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Configure Dataset
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={8}>
                  {mockDatasets.map((dataset) => (
                    <Card 
                      key={dataset.id}
                      variant={selectedDataset === dataset.id ? 'elevation' : 'outlined'}
                      sx={{ 
                        cursor: 'pointer',
                        mb: 2,
                        border: selectedDataset === dataset.id ? 2 : 1,
                        borderColor: selectedDataset === dataset.id ? 'primary.main' : 'divider'
                      }}
                      onClick={() => handleDatasetSelect(dataset.id)}
                    >
                      <CardHeader
                        title={dataset.name}
                        subheader={`${dataset.type} • ${dataset.items.toLocaleString()} items`}
                      />
                      <CardContent>
                        <Typography variant="body2" color="text.secondary">
                          {dataset.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      What-If Parameters
                    </Typography>
                    
                    <Box sx={{ mb: 4 }}>
                      <Typography id="time-horizon-slider" gutterBottom>
                        Time Horizon (months)
                      </Typography>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <DateRangeIcon />
                        <Slider
                          value={timeHorizon}
                          onChange={(_, newValue) => setTimeHorizon(newValue as number)}
                          aria-labelledby="time-horizon-slider"
                          valueLabelDisplay="auto"
                          step={1}
                          marks
                          min={1}
                          max={12}
                        />
                        <Typography>{timeHorizon} months</Typography>
                      </Stack>
                    </Box>
                    
                    <Box sx={{ mb: 4 }}>
                      <Typography id="policy-strength-slider" gutterBottom>
                        Policy Strength
                      </Typography>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Typography>Lenient</Typography>
                        <Slider
                          value={policyStrength}
                          onChange={(_, newValue) => setPolicyStrength(newValue as number)}
                          aria-labelledby="policy-strength-slider"
                          valueLabelDisplay="auto"
                          step={10}
                          marks
                          min={0}
                          max={100}
                        />
                        <Typography>Strict</Typography>
                      </Stack>
                    </Box>
                    
                    <TextField
                      label="Additional Context (optional)"
                      multiline
                      rows={4}
                      fullWidth
                      placeholder="Add any specific scenarios or context for the simulation..."
                    />
                  </Paper>
                </Grid>
              </Grid>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Button onClick={handleBack}>
                  Back
                </Button>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={!selectedDataset}
                >
                  Next
                </Button>
              </Box>
            </Paper>
          )}

          {activeStep === 3 && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Review and Run Simulation
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Card variant="outlined">
                    <CardHeader title="Selected Model(s)" />
                    <CardContent>
                      <Typography variant="body1">
                        {mockModels.find(m => m.id === selectedModel)?.name} {mockModels.find(m => m.id === selectedModel)?.version}
                      </Typography>
                      {comparisonMode && secondaryModel && (
                        <Typography variant="body1" sx={{ mt: 1 }}>
                          vs. {mockModels.find(m => m.id === secondaryModel)?.name} {mockModels.find(m => m.id === secondaryModel)?.version}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Card variant="outlined">
                    <CardHeader title="Selected Policies" />
                    <CardContent>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {selectedPolicies.map(policyId => {
                          const policy = mockPolicies.find(p => p.id === policyId);
                          return (
                            <Chip 
                              key={policyId}
                              label={policy?.name}
                              size="small"
                              color={
                                policy?.severity === 'high' 
                                  ? 'error' 
                                  : policy?.severity === 'medium' 
                                    ? 'warning' 
                                    : 'info'
                              }
                              sx={{ mb: 1 }}
                            />
                          );
                        })}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Card variant="outlined">
                    <CardHeader title="Selected Dataset" />
                    <CardContent>
                      <Typography variant="body1">
                        {mockDatasets.find(d => d.id === selectedDataset)?.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {mockDatasets.find(d => d.id === selectedDataset)?.items.toLocaleString()} items
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardHeader title="What-If Parameters" />
                    <CardContent>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            Time Horizon:
                          </Typography>
                          <Typography variant="body1">
                            {timeHorizon} months
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            Policy Strength:
                          </Typography>
                          <Typography variant="body1">
                            {policyStrength}% ({policyStrength < 30 ? 'Lenient' : policyStrength > 70 ? 'Strict' : 'Moderate'})
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Button onClick={handleBack}>
                  Back
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={simulationRunning ? <CircularProgress size={20} color="inherit" /> : <PlayArrowIcon />}
                  onClick={handleRunSimulation}
                  disabled={simulationRunning}
                >
                  {simulationRunning ? 'Running Simulation...' : 'Run Simulation'}
                </Button>
              </Box>
            </Paper>
          )}

          {activeStep === 4 && simulationCompleted && (
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Simulation Results
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Button 
                    variant="outlined" 
                    startIcon={<DownloadIcon />}
                  >
                    Export Report
                  </Button>
                  <Button 
                    variant="outlined" 
                    startIcon={<CachedIcon />}
                    onClick={handleReset}
                  >
                    New Simulation
                  </Button>
                </Stack>
              </Box>
              
              <Alert severity="success" sx={{ mb: 3 }}>
                Simulation completed successfully. {comparisonMode ? 'Model comparison' : 'Model evaluation'} results are ready.
              </Alert>
              
              <Box sx={{ mb: 3 }}>
                <Tabs value={tabValue} onChange={handleTabChange}>
                  <Tab label="Summary" />
                  <Tab label="Compliance By Policy" />
                  <Tab label="Timeline Projection" />
                  <Tab label="Violation Details" />
                </Tabs>
              </Box>
              
              {/* Summary Tab */}
              {tabValue === 0 && (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={5}>
                    <Card>
                      <CardHeader title="Overall Compliance Score" />
                      <CardContent>
                        <Grid container spacing={3}>
                          {comparisonMode ? (
                            <>
                              <Grid item xs={6}>
                                <Typography variant="h6" color="primary" align="center">
                                  Model X
                                </Typography>
                                <Typography variant="h3" color="primary" align="center">
                                  76%
                                </Typography>
                                <Typography variant="body2" color="text.secondary" align="center">
                                  71 total violations
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="h6" color="secondary" align="center">
                                  Model Y
                                </Typography>
                                <Typography variant="h3" color="secondary" align="center">
                                  88%
                                </Typography>
                                <Typography variant="body2" color="text.secondary" align="center">
                                  45 total violations
                                </Typography>
                              </Grid>
                            </>
                          ) : (
                            <Grid item xs={12}>
                              <Typography variant="h3" color="primary" align="center">
                                76%
                              </Typography>
                              <Typography variant="body2" color="text.secondary" align="center">
                                71 total violations detected
                              </Typography>
                            </Grid>
                          )}
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={7}>
                    <Card>
                      <CardHeader title="Violation Comparison" />
                      <CardContent>
                        <ReactApexChart
                          options={comparisonChartOptions}
                          series={comparisonChartSeries}
                          type="bar"
                          height={300}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Card>
                      <CardHeader 
                        title="Key Findings"
                        action={
                          <IconButton>
                            <InfoIcon />
                          </IconButton>
                        }
                      />
                      <CardContent>
                        <Typography variant="body1" paragraph>
                          {comparisonMode ? (
                            "Model Y performs significantly better than Model X across all compliance metrics. Key differences:"
                          ) : (
                            "Model evaluation shows several areas for improvement:"
                          )}
                        </Typography>
                        
                        <Typography component="div">
                          <ul>
                            <li>
                              <Typography variant="body1">
                                PII Detection: {comparisonMode ? 
                                  "Model Y detected and masked 98% of PII instances vs Model X's 85% detection rate." : 
                                  "85% of PII instances were correctly detected and masked."}
                              </Typography>
                            </li>
                            <li>
                              <Typography variant="body1">
                                Content Safety: {comparisonMode ? 
                                  "Model Y had 50% fewer content safety violations than Model X." : 
                                  "Content safety violations were found in 0.3% of processed items."}
                              </Typography>
                            </li>
                            <li>
                              <Typography variant="body1">
                                Bias: {comparisonMode ? 
                                  "Model Y showed 40% less bias in outputs compared to Model X." : 
                                  "Bias was detected in several scenarios related to gender and age."}
                              </Typography>
                            </li>
                          </ul>
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              )}
              
              {/* Compliance By Policy Tab */}
              {tabValue === 1 && (
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Policy</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell>Severity</TableCell>
                        {comparisonMode ? (
                          <>
                            <TableCell align="center">Model X Violations</TableCell>
                            <TableCell align="center">Model Y Violations</TableCell>
                            <TableCell align="center">Difference</TableCell>
                          </>
                        ) : (
                          <>
                            <TableCell align="center">Pass Rate</TableCell>
                            <TableCell align="center">Violations</TableCell>
                          </>
                        )}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedPolicies.map(policyId => {
                        const policy = mockPolicies.find(p => p.id === policyId);
                        
                        // Mock data generation
                        const modelXViolations = Math.floor(Math.random() * 30) + 5;
                        const modelYViolations = Math.floor(modelXViolations * 0.6);
                        const passRate = 100 - (modelXViolations / 2);
                        
                        return (
                          <TableRow key={policyId}>
                            <TableCell>{policy?.name}</TableCell>
                            <TableCell>{policy?.category}</TableCell>
                            <TableCell>
                              <Chip 
                                label={policy?.severity}
                                size="small"
                                color={
                                  policy?.severity === 'high' 
                                    ? 'error' 
                                    : policy?.severity === 'medium' 
                                      ? 'warning' 
                                      : 'info'
                                }
                              />
                            </TableCell>
                            {comparisonMode ? (
                              <>
                                <TableCell align="center">{modelXViolations}</TableCell>
                                <TableCell align="center">{modelYViolations}</TableCell>
                                <TableCell align="center">
                                  <Chip 
                                    label={`-${modelXViolations - modelYViolations}`}
                                    color="success" 
                                    size="small"
                                  />
                                </TableCell>
                              </>
                            ) : (
                              <>
                                <TableCell align="center">{passRate.toFixed(1)}%</TableCell>
                                <TableCell align="center">{modelXViolations}</TableCell>
                              </>
                            )}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
              
              {/* Timeline Projection Tab */}
              {tabValue === 2 && (
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Card>
                      <CardHeader 
                        title={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TimelineIcon />
                            <Typography variant="h6">Future Compliance Projection</Typography>
                          </Box>
                        }
                        subheader="How violations are projected to change over the coming months"
                      />
                      <CardContent>
                        <ReactApexChart
                          options={timelineChartOptions}
                          series={timelineChartSeries}
                          type="line"
                          height={350}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Card>
                      <CardHeader title="Policy Change Impact" />
                      <CardContent>
                        <Typography variant="body1" paragraph>
                          If stricter PII policy goes into effect next month (as planned):
                        </Typography>
                        
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <Card variant="outlined">
                              <CardContent>
                                <Typography variant="h6" color="primary">
                                  Model X
                                </Typography>
                                <Typography variant="body1">
                                  Violations would increase by approximately 15%
                                </Typography>
                                <Typography variant="body2" color="error">
                                  Would not meet compliance threshold (85%)
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                          
                          <Grid item xs={12} md={6}>
                            <Card variant="outlined">
                              <CardContent>
                                <Typography variant="h6" color="secondary">
                                  Model Y
                                </Typography>
                                <Typography variant="body1">
                                  Violations would increase by approximately 8%
                                </Typography>
                                <Typography variant="body2" color="success">
                                  Would still meet compliance threshold (85%)
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              )}
              
              {/* Violation Details Tab */}
              {tabValue === 3 && (
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                      Sample Violations
                    </Typography>
                    
                    <TableContainer component={Paper} variant="outlined">
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Policy</TableCell>
                            <TableCell>Severity</TableCell>
                            <TableCell>Description</TableCell>
                            {comparisonMode && <TableCell>Model</TableCell>}
                            <TableCell>Confidence</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {/* Sample violations */}
                          <TableRow>
                            <TableCell>V1</TableCell>
                            <TableCell>PII Detection</TableCell>
                            <TableCell>
                              <Chip label="High" color="error" size="small" />
                            </TableCell>
                            <TableCell>Driver's license number visible in generated image</TableCell>
                            {comparisonMode && <TableCell>Model X</TableCell>}
                            <TableCell>97%</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>V2</TableCell>
                            <TableCell>Content Safety</TableCell>
                            <TableCell>
                              <Chip label="Medium" color="warning" size="small" />
                            </TableCell>
                            <TableCell>Potentially harmful instructions in response</TableCell>
                            {comparisonMode && <TableCell>Model X</TableCell>}
                            <TableCell>85%</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>V3</TableCell>
                            <TableCell>Bias Detection</TableCell>
                            <TableCell>
                              <Chip label="Low" color="info" size="small" />
                            </TableCell>
                            <TableCell>Subtle gender bias in professional descriptions</TableCell>
                            {comparisonMode && <TableCell>Both</TableCell>}
                            <TableCell>76%</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                </Grid>
              )}
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}