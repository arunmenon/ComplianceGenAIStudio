import { useState } from 'react';
import {
  Box,
  Paper,
  Tabs,
  Tab,
} from '@mui/material';
import { GuidelinesGuru } from '../components/guidelines/GuidelinesGuru';
import { PolicyManager } from '../components/guidelines/PolicyManager';
import { MarkerType } from 'react-flow-renderer';

// Mock data for the knowledge graph
const initialNodes = [
  {
    id: 'privacy',
    data: { label: 'Privacy' },
    position: { x: 250, y: 25 },
    style: { background: '#4A90E2', color: 'white', border: '1px solid #2A70C2', width: 150 },
  },
  {
    id: 'pii',
    data: { label: 'PII Detection' },
    position: { x: 100, y: 150 },
    style: { background: '#67B7DC', color: 'white', border: '1px solid #4797BC', width: 150 },
  },
  {
    id: 'gdpr',
    data: { label: 'GDPR Compliance' },
    position: { x: 400, y: 150 },
    style: { background: '#67B7DC', color: 'white', border: '1px solid #4797BC', width: 150 },
  },
  {
    id: 'ethics',
    data: { label: 'Ethics' },
    position: { x: 650, y: 25 },
    style: { background: '#E67E22', color: 'white', border: '1px solid #C65E02', width: 150 },
  },
  {
    id: 'bias',
    data: { label: 'Bias Detection' },
    position: { x: 550, y: 150 },
    style: { background: '#F5B041', color: 'white', border: '1px solid #D59021', width: 150 },
  },
  {
    id: 'fairness',
    data: { label: 'Fairness Metrics' },
    position: { x: 750, y: 150 },
    style: { background: '#F5B041', color: 'white', border: '1px solid #D59021', width: 150 },
  },
  {
    id: 'content',
    data: { label: 'Content Safety' },
    position: { x: 450, y: 250 },
    style: { background: '#E74C3C', color: 'white', border: '1px solid #C72C1C', width: 150 },
  },
];

const initialEdges = [
  {
    id: 'privacy-pii',
    source: 'privacy',
    target: 'pii',
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { stroke: '#4A90E2' },
  },
  {
    id: 'privacy-gdpr',
    source: 'privacy',
    target: 'gdpr',
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { stroke: '#4A90E2' },
  },
  {
    id: 'ethics-bias',
    source: 'ethics',
    target: 'bias',
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { stroke: '#E67E22' },
  },
  {
    id: 'ethics-fairness',
    source: 'ethics',
    target: 'fairness',
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { stroke: '#E67E22' },
  },
  {
    id: 'bias-fairness',
    source: 'bias',
    target: 'fairness',
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { stroke: '#F5B041' },
  },
  {
    id: 'gdpr-content',
    source: 'gdpr',
    target: 'content',
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { stroke: '#67B7DC' },
  },
];

export default function GuidelinesGovernance() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
      <Paper sx={{ borderRadius: 0 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Guidelines Guru" />
          <Tab label="Policy Management" />
        </Tabs>
      </Paper>

      <Box sx={{ flex: 1, p: 2 }}>
        {tabValue === 0 ? (
          <GuidelinesGuru initialNodes={initialNodes} initialEdges={initialEdges} />
        ) : (
          <PolicyManager userRole="compliance_officer" />
        )}
      </Box>
    </Box>
  );
}