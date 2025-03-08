import { useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Tabs,
  Tab,
  Button,
  Stack,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ArticleIcon from '@mui/icons-material/Article';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import SendIcon from '@mui/icons-material/Send';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap, 
  Node, 
  Edge,
  MarkerType,
} from 'react-flow-renderer';

// Mock data for guidelines
interface Guideline {
  id: string;
  title: string;
  category: string;
  description: string;
  status: 'active' | 'draft' | 'archived';
  severity: 'high' | 'medium' | 'low';
  lastModified: string;
  relatedPolicies: string[];
}

const mockGuidelines: Guideline[] = [
  {
    id: 'G001',
    title: 'PII Detection and Masking',
    category: 'Privacy',
    description: 'All models must detect and mask personally identifiable information (PII) including but not limited to: social security numbers, credit card numbers, physical addresses, and government IDs.',
    status: 'active',
    severity: 'high',
    lastModified: '2025-02-25',
    relatedPolicies: ['Data Protection', 'GDPR Compliance'],
  },
  {
    id: 'G002',
    title: 'Content Safety Filtering',
    category: 'Content Safety',
    description: 'AI models must filter harmful, illegal, or explicitly violent content from all outputs. This includes hate speech, explicit imagery, and content encouraging illegal activities.',
    status: 'active',
    severity: 'high',
    lastModified: '2025-02-20',
    relatedPolicies: ['Community Standards', 'Legal Compliance'],
  },
  {
    id: 'G003',
    title: 'Bias Mitigation',
    category: 'Ethics',
    description: 'All AI systems must implement bias detection and mitigation techniques to prevent unfair discrimination based on protected characteristics.',
    status: 'active',
    severity: 'medium',
    lastModified: '2025-02-15',
    relatedPolicies: ['Ethical AI', 'Fairness Standards'],
  },
  {
    id: 'G004',
    title: 'Model Performance Transparency',
    category: 'Transparency',
    description: 'All AI models must expose confidence scores and explain their limitations to users to ensure proper understanding of model capabilities.',
    status: 'draft',
    severity: 'medium',
    lastModified: '2025-02-10',
    relatedPolicies: ['Model Cards', 'User Trust'],
  },
  {
    id: 'G005',
    title: 'Environmental Impact Assessment',
    category: 'Sustainability',
    description: 'Large-scale AI model training and deployment must be evaluated for environmental impact and carbon footprint.',
    status: 'draft',
    severity: 'low',
    lastModified: '2025-02-05',
    relatedPolicies: ['Sustainability Goals', 'Carbon Reduction'],
  },
];

// Mock data for the knowledge graph
const initialNodes: Node[] = [
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

const initialEdges: Edge[] = [
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

// Mock chat messages for Guidelines Guru
interface ChatMessage {
  id: number;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

const initialChatMessages: ChatMessage[] = [
  {
    id: 1,
    sender: 'ai',
    text: "Welcome to Guidelines Guru! I'm here to help you understand and navigate our AI guidelines and policies. What would you like to know?",
    timestamp: new Date().toLocaleTimeString(),
  },
];

export default function GuidelinesGovernance() {
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGuideline, setSelectedGuideline] = useState<Guideline | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [chatMessages, setChatMessages] = useState(initialChatMessages);
  const [newMessage, setNewMessage] = useState('');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleGuidelineClick = (guideline: Guideline) => {
    setSelectedGuideline(guideline);
  };

  const handleAddGuideline = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleSendMessage = () => {
    if (newMessage.trim() === '') return;

    const userMessage: ChatMessage = {
      id: chatMessages.length + 1,
      sender: 'user',
      text: newMessage,
      timestamp: new Date().toLocaleTimeString(),
    };

    setChatMessages([...chatMessages, userMessage]);
    setNewMessage('');

    // Simulate AI response after a short delay
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: chatMessages.length + 2,
        sender: 'ai',
        text: generateAIResponse(newMessage),
        timestamp: new Date().toLocaleTimeString(),
      };
      setChatMessages((prev) => [...prev, aiResponse]);
    }, 1000);
  };

  // Simple mock AI response generator
  const generateAIResponse = (message: string) => {
    const lowercaseMessage = message.toLowerCase();
    
    if (lowercaseMessage.includes('pii') || lowercaseMessage.includes('personal')) {
      return "Our PII Detection and Masking guideline (G001) requires all models to identify and mask personally identifiable information. This includes social security numbers, credit card information, physical addresses, and any government-issued IDs. This guideline has a HIGH severity rating and is currently ACTIVE.";
    } else if (lowercaseMessage.includes('bias') || lowercaseMessage.includes('fairness')) {
      return "The Bias Mitigation guideline (G003) requires all AI systems to implement bias detection and mitigation techniques to prevent unfair discrimination based on protected characteristics. This has a MEDIUM severity rating and is currently ACTIVE.";
    } else if (lowercaseMessage.includes('content') || lowercaseMessage.includes('safety') || lowercaseMessage.includes('harmful')) {
      return "Our Content Safety Filtering guideline (G002) mandates that AI models must filter harmful, illegal, or explicitly violent content from outputs. This includes hate speech, explicit imagery, and content encouraging illegal activities. This has a HIGH severity rating and is currently ACTIVE.";
    } else if (lowercaseMessage.includes('environment') || lowercaseMessage.includes('sustain')) {
      return "The Environmental Impact Assessment guideline (G005) requires that large-scale AI model training and deployment must be evaluated for environmental impact and carbon footprint. This has a LOW severity rating and is currently in DRAFT status.";
    } else {
      return "I found several guidelines that might be relevant to your question. You can explore them in the Guidelines Manager tab, or ask me more specific questions about a particular policy area like 'privacy', 'ethics', 'content safety', or 'sustainability'.";
    }
  };

  const filteredGuidelines = mockGuidelines.filter(guideline => 
    guideline.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    guideline.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    guideline.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Guidelines Governance
      </Typography>

      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
      >
        <Tab label="Guidelines Manager" />
        <Tab label="Knowledge Graph" />
        <Tab label="Guidelines Guru" />
      </Tabs>

      {/* Guidelines Manager Tab */}
      {tabValue === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, height: '75vh', overflow: 'auto' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Guidelines</Typography>
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />}
                  onClick={handleAddGuideline}
                >
                  Add Guideline
                </Button>
              </Box>
              
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search guidelines..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />

              <List>
                {filteredGuidelines.map((guideline) => (
                  <React.Fragment key={guideline.id}>
                    <ListItem 
                      button 
                      onClick={() => handleGuidelineClick(guideline)}
                      selected={selectedGuideline?.id === guideline.id}
                    >
                      <ListItemIcon>
                        <ArticleIcon color={guideline.status === 'active' ? 'primary' : 'disabled'} />
                      </ListItemIcon>
                      <ListItemText 
                        primary={guideline.title}
                        secondary={`${guideline.category} • ${guideline.status} • Last modified: ${guideline.lastModified}`}
                      />
                      <Chip 
                        label={guideline.severity}
                        color={
                          guideline.severity === 'high' 
                            ? 'error' 
                            : guideline.severity === 'medium' 
                              ? 'warning' 
                              : 'info'
                        }
                        size="small"
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, height: '75vh', overflow: 'auto' }}>
              {selectedGuideline ? (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6">{selectedGuideline.title}</Typography>
                    <Stack direction="row" spacing={1}>
                      <IconButton size="small" color="primary">
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  </Box>
                  
                  <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                    <Chip 
                      label={selectedGuideline.category}
                      color="primary"
                      size="small"
                    />
                    <Chip 
                      label={selectedGuideline.status}
                      color={selectedGuideline.status === 'active' ? 'success' : 'default'}
                      size="small"
                    />
                    <Chip 
                      label={`Severity: ${selectedGuideline.severity}`}
                      color={
                        selectedGuideline.severity === 'high' 
                          ? 'error' 
                          : selectedGuideline.severity === 'medium' 
                            ? 'warning' 
                            : 'info'
                      }
                      size="small"
                    />
                  </Stack>
                  
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Last modified: {selectedGuideline.lastModified}
                  </Typography>
                  
                  <Typography variant="body1" paragraph>
                    {selectedGuideline.description}
                  </Typography>
                  
                  <Typography variant="subtitle1" gutterBottom>
                    Related Policies
                  </Typography>
                  
                  <Stack direction="row" spacing={1}>
                    {selectedGuideline.relatedPolicies.map((policy) => (
                      <Chip key={policy} label={policy} variant="outlined" size="small" />
                    ))}
                  </Stack>
                  
                  <Box sx={{ mt: 4 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Implementation Status
                    </Typography>
                    
                    <Card variant="outlined" sx={{ mb: 2 }}>
                      <CardContent>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <CheckCircleIcon color="success" />
                          <Typography variant="body1">Content Moderation Engine v3.2</Typography>
                        </Stack>
                      </CardContent>
                    </Card>
                    
                    <Card variant="outlined" sx={{ mb: 2 }}>
                      <CardContent>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <WarningIcon color="warning" />
                          <Typography variant="body1">Image Recognition Pipeline v1.5</Typography>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <Typography variant="body1" color="text.secondary">
                    Select a guideline to view details
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Knowledge Graph Tab */}
      {tabValue === 1 && (
        <Paper sx={{ height: '75vh', p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Policy Knowledge Graph</Typography>
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" startIcon={<VisibilityIcon />}>
                Focus View
              </Button>
              <Button variant="outlined" startIcon={<AddIcon />}>
                Add Node
              </Button>
            </Stack>
          </Box>
          
          <Box sx={{ height: '65vh' }}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              fitView
            >
              <Background />
              <Controls />
              <MiniMap
                nodeStrokeColor={(n) => {
                  if (n.style?.background) return n.style.background as string;
                  return '#eee';
                }}
                nodeColor={(n) => {
                  if (n.style?.background) return n.style.background as string;
                  return '#fff';
                }}
                nodeBorderRadius={2}
              />
            </ReactFlow>
          </Box>
        </Paper>
      )}

      {/* Guidelines Guru Chat Tab */}
      {tabValue === 2 && (
        <Paper sx={{ height: '75vh', p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Guidelines Guru
          </Typography>
          
          <Box sx={{ 
            height: 'calc(65vh - 80px)', 
            overflowY: 'auto', 
            mb: 2, 
            p: 2, 
            backgroundColor: 'background.default', 
            borderRadius: 1 
          }}>
            {chatMessages.map((message) => (
              <Box
                key={message.id}
                sx={{
                  display: 'flex',
                  justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                  mb: 2,
                }}
              >
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    maxWidth: '70%',
                    borderRadius: 2,
                    backgroundColor: message.sender === 'user' ? 'primary.main' : 'background.paper',
                    color: message.sender === 'user' ? 'white' : 'text.primary',
                  }}
                >
                  <Typography variant="body1">{message.text}</Typography>
                  <Typography variant="caption" color={message.sender === 'user' ? 'white' : 'text.secondary'} sx={{ display: 'block', mt: 1, textAlign: 'right' }}>
                    {message.timestamp}
                  </Typography>
                </Paper>
              </Box>
            ))}
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Ask about guidelines or policies..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSendMessage();
                }
              }}
            />
            <Button
              variant="contained"
              endIcon={<SendIcon />}
              onClick={handleSendMessage}
            >
              Send
            </Button>
          </Box>
        </Paper>
      )}

      {/* Add Guideline Dialog */}
      <Dialog open={isDialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Add New Guideline</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField label="Title" fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select label="Category" defaultValue="">
                  <MenuItem value="Privacy">Privacy</MenuItem>
                  <MenuItem value="Content Safety">Content Safety</MenuItem>
                  <MenuItem value="Ethics">Ethics</MenuItem>
                  <MenuItem value="Transparency">Transparency</MenuItem>
                  <MenuItem value="Sustainability">Sustainability</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Severity</InputLabel>
                <Select label="Severity" defaultValue="">
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={4}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Related Policies (comma separated)"
                fullWidth
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleCloseDialog}>
            Save Guideline
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}