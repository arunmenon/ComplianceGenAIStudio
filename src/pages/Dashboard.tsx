import { useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Stack,
  Badge,
  Card,
  CardContent,
  Divider,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

// Mock data for charts and tables
const violationTrendData = {
  series: [
    {
      name: 'Severe Violations',
      data: [5, 3, 4, 7, 2, 5, 8, 3, 4, 3, 5, 4, 6, 3],
      color: '#f44336',
    },
    {
      name: 'Potential Violations',
      data: [15, 13, 20, 17, 12, 17, 24, 18, 19, 14, 15, 21, 23, 18],
      color: '#ff9800',
    },
    {
      name: 'Mild Violations',
      data: [30, 40, 35, 50, 49, 60, 70, 91, 125, 80, 75, 60, 85, 95],
      color: '#2196f3',
    },
  ],
  options: {
    chart: {
      type: 'line',
      height: 350,
      toolbar: {
        show: true,
      },
      zoom: {
        enabled: true,
      },
    },
    grid: {
      borderColor: '#e0e0e0',
    },
    stroke: {
      width: 3,
      curve: 'smooth',
    },
    xaxis: {
      categories: Array.from({ length: 14 }, (_, i) => `Day ${i + 1}`),
      labels: {
        style: {
          colors: '#718096',
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: '#718096',
        },
      },
    },
    tooltip: {
      theme: 'dark',
    },
    legend: {
      position: 'top',
    },
  } as ApexOptions,
};

const heatmapData = {
  series: [
    {
      name: 'Privacy',
      data: Array.from({ length: 7 }, () => Math.floor(Math.random() * 30) + 5),
    },
    {
      name: 'Content Safety',
      data: Array.from({ length: 7 }, () => Math.floor(Math.random() * 20) + 3),
    },
    {
      name: 'Legal Compliance',
      data: Array.from({ length: 7 }, () => Math.floor(Math.random() * 15) + 2),
    },
    {
      name: 'Ethics',
      data: Array.from({ length: 7 }, () => Math.floor(Math.random() * 10) + 1),
    },
    {
      name: 'Data Security',
      data: Array.from({ length: 7 }, () => Math.floor(Math.random() * 25) + 4),
    },
  ],
  options: {
    chart: {
      type: 'heatmap',
      height: 300,
      toolbar: {
        show: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    colors: ['#008FFB'],
    xaxis: {
      categories: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      labels: {
        style: {
          colors: '#718096',
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: '#718096',
        },
      },
    },
    tooltip: {
      theme: 'dark',
    },
  } as ApexOptions,
};

const precisionRecallData = {
  series: [
    {
      name: 'Precision',
      data: [0.6, 0.7, 0.75, 0.8, 0.83, 0.87, 0.9, 0.94, 0.97, 0.99],
    },
  ],
  options: {
    chart: {
      height: 300,
      type: 'line',
      toolbar: {
        show: false,
      },
    },
    stroke: {
      curve: 'smooth',
      width: 3,
    },
    markers: {
      size: 4,
    },
    xaxis: {
      title: {
        text: 'Recall',
      },
      categories: [0.99, 0.9, 0.85, 0.8, 0.75, 0.7, 0.65, 0.6, 0.55, 0.5],
      labels: {
        style: {
          colors: '#718096',
        },
      },
    },
    yaxis: {
      title: {
        text: 'Precision',
      },
      min: 0.5,
      max: 1,
      labels: {
        style: {
          colors: '#718096',
        },
      },
    },
    annotations: {
      points: [
        {
          x: 0.75,
          y: 0.83,
          marker: {
            size: 6,
            fillColor: '#ff9800',
            strokeColor: '#FFF',
            radius: 2,
          },
          label: {
            text: 'High Recall',
          },
        },
        {
          x: 0.6,
          y: 0.94,
          marker: {
            size: 6,
            fillColor: '#2196f3',
            strokeColor: '#FFF',
            radius: 2,
          },
          label: {
            text: 'High Precision',
          },
        },
      ],
    },
    tooltip: {
      theme: 'dark',
    },
  } as ApexOptions,
};

type ViolationSeverity = 'Mild' | 'Potential' | 'Severe';

interface Violation {
  id: number;
  timestamp: string;
  modelName: string;
  policy: string;
  severity: ViolationSeverity;
  description: string;
  confidence: number;
}

const recentViolations: Violation[] = [
  {
    id: 1,
    timestamp: '2025-03-08 09:23:15',
    modelName: 'Content Moderation v3',
    policy: 'Privacy',
    severity: 'Severe',
    description: 'PII detection in user image (driver license visible)',
    confidence: 0.97,
  },
  {
    id: 2,
    timestamp: '2025-03-08 08:45:32',
    modelName: 'Image Recognition v2',
    policy: 'Content Safety',
    severity: 'Potential',
    description: 'Possible inappropriate content detected',
    confidence: 0.76,
  },
  {
    id: 3,
    timestamp: '2025-03-08 07:12:05',
    modelName: 'Text Classification v4',
    policy: 'Ethics',
    severity: 'Mild',
    description: 'Subtle bias in generated text response',
    confidence: 0.68,
  },
  {
    id: 4,
    timestamp: '2025-03-08 06:30:18',
    modelName: 'Content Moderation v3',
    policy: 'Data Security',
    severity: 'Severe',
    description: 'API key exposed in model response',
    confidence: 0.99,
  },
  {
    id: 5,
    timestamp: '2025-03-07 23:45:10',
    modelName: 'Text Classification v4',
    policy: 'Legal Compliance',
    severity: 'Potential',
    description: 'Possible GDPR violation in stored data',
    confidence: 0.82,
  },
];

// Severity color mapping
const severityColors: Record<ViolationSeverity, string> = {
  Mild: 'info',
  Potential: 'warning',
  Severe: 'error',
};

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState('daily');
  const [detectionMode, setDetectionMode] = useState('precision');
  const [tabValue, setTabValue] = useState(0);

  const handleTimeRangeChange = (
    event: React.MouseEvent<HTMLElement>,
    newTimeRange: string | null
  ) => {
    if (newTimeRange !== null) {
      setTimeRange(newTimeRange);
    }
  };

  const handleDetectionModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newMode: string | null
  ) => {
    if (newMode !== null) {
      setDetectionMode(newMode);
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Live Model Decision Analytics Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Controls */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="subtitle1">Time Range:</Typography>
              <ToggleButtonGroup
                size="small"
                value={timeRange}
                exclusive
                onChange={handleTimeRangeChange}
              >
                <ToggleButton value="hourly">Hourly</ToggleButton>
                <ToggleButton value="daily">Daily</ToggleButton>
                <ToggleButton value="weekly">Weekly</ToggleButton>
              </ToggleButtonGroup>
            </Stack>
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="subtitle1">Detection Mode:</Typography>
              <ToggleButtonGroup
                size="small"
                value={detectionMode}
                exclusive
                onChange={handleDetectionModeChange}
              >
                <ToggleButton value="recall">High Recall</ToggleButton>
                <ToggleButton value="precision">High Precision</ToggleButton>
              </ToggleButtonGroup>
            </Stack>
          </Paper>
        </Grid>

        {/* KPI Cards */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Accuracy
            </Typography>
            <Typography variant="h4" color="primary">
              {detectionMode === 'precision' ? '95%' : '70%'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Precision
            </Typography>
            <Divider sx={{ my: 1 }} />
            <Typography variant="h4" color="secondary">
              {detectionMode === 'precision' ? '70%' : '95%'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Recall
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Violation Summary
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="space-between">
              <Badge badgeContent={5} color="error" sx={{ '& .MuiBadge-badge': { fontSize: 14, height: 22, minWidth: 22 } }}>
                <Typography variant="body1">Severe</Typography>
              </Badge>
              <Badge badgeContent={30} color="warning" sx={{ '& .MuiBadge-badge': { fontSize: 14, height: 22, minWidth: 22 } }}>
                <Typography variant="body1">Potential</Typography>
              </Badge>
              <Badge badgeContent={95} color="info" sx={{ '& .MuiBadge-badge': { fontSize: 14, height: 22, minWidth: 22 } }}>
                <Typography variant="body1">Mild</Typography>
              </Badge>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Items Processed
            </Typography>
            <Typography variant="h4">50,000</Typography>
            <Typography variant="body2" color="text.secondary">
              Last 24 hours
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Violation Rate
            </Typography>
            <Typography variant="h4" color={detectionMode === 'precision' ? 'primary' : 'secondary'}>
              {detectionMode === 'precision' ? '0.3%' : '0.5%'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Overall
            </Typography>
          </Paper>
        </Grid>

        {/* Trend Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Violation Trends Over Time
            </Typography>
            <ReactApexChart
              options={violationTrendData.options}
              series={violationTrendData.series}
              type="line"
              height={350}
            />
          </Paper>
        </Grid>

        {/* Precision-Recall Curve */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Precision-Recall Curve
            </Typography>
            <ReactApexChart
              options={precisionRecallData.options}
              series={precisionRecallData.series}
              type="line"
              height={350}
            />
          </Paper>
        </Grid>

        {/* Heatmap */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Violation Patterns (Heatmap)
            </Typography>
            <ReactApexChart
              options={heatmapData.options}
              series={heatmapData.series}
              type="heatmap"
              height={300}
            />
          </Paper>
        </Grid>

        {/* Violation Log */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
              <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
                <Tab label="Recent Violations" />
                <Tab label="Anomalies" />
                <Tab label="Compliance Metrics" />
              </Tabs>
            </Box>

            {tabValue === 0 && (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Timestamp</TableCell>
                      <TableCell>Model</TableCell>
                      <TableCell>Policy</TableCell>
                      <TableCell>Severity</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Confidence</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentViolations.map((violation) => (
                      <TableRow key={violation.id}>
                        <TableCell>{violation.timestamp}</TableCell>
                        <TableCell>{violation.modelName}</TableCell>
                        <TableCell>{violation.policy}</TableCell>
                        <TableCell>
                          <Chip
                            label={violation.severity}
                            color={severityColors[violation.severity] as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{violation.description}</TableCell>
                        <TableCell>{`${(violation.confidence * 100).toFixed(0)}%`}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {tabValue === 1 && (
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" color="error">
                    Anomaly Alert: Unusual spike in Privacy violations (3x above normal)
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Detected at 08:45 today. 15 severe violations in a 30-minute window compared to average of 5 per day.
                  </Typography>
                </CardContent>
              </Card>
            )}

            {tabValue === 2 && (
              <Typography variant="body1" color="text.secondary">
                Compliance metrics data would be shown here...
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}