import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Alert,
  Divider,
  useTheme,
  alpha,
  Avatar,
  Fade,
  Zoom,
  Badge,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  History as HistoryIcon,
  Save as SaveIcon,
  AutoAwesome as AIIcon,
  Comment as CommentIcon,
  Description as PolicyIcon,
  Search as SearchIcon,
  CheckCircle as ApprovedIcon,
  Warning as ReviewIcon,
  DriveFileRenameOutline as DraftIcon,
} from '@mui/icons-material';

interface Policy {
  id: string;
  title: string;
  content: string;
  version: string;
  status: 'Draft' | 'Under Review' | 'Approved';
  lastUpdated: string;
  owner: string;
  approvers: string[];
  category: string;
}

interface Version {
  version: string;
  date: string;
  author: string;
  changes: string;
}

interface PolicyManagerProps {
  userRole: 'compliance_officer' | 'stakeholder';
}

export const PolicyManager: React.FC<PolicyManagerProps> = ({ userRole }) => {
  const theme = useTheme();
  
  const [policies, setPolicies] = useState<Policy[]>([
    {
      id: 'IMG-005',
      title: 'E-commerce Image PII Policy',
      content: 'Guidelines for handling personally identifiable information in product images...\n\nThis policy outlines requirements for managing personal information in product images across all e-commerce platforms. Images must not contain faces, license plates, addresses, or other identifiable information without explicit consent and proper processing.\n\nKey requirements:\n1. All human faces must be blurred or removed from product images\n2. License plates, street signs, and address information must be obscured\n3. Consent must be obtained for any identifiable person featured in promotional material\n4. Images must be scanned using PII detection tools before publication',
      version: '2.1',
      status: 'Approved',
      lastUpdated: '2025-01-15',
      owner: 'Alice Smith',
      approvers: ['Bob Johnson', 'Carol White'],
      category: 'Privacy',
    },
    {
      id: 'CON-023',
      title: 'Content Safety Guidelines',
      content: 'Guidelines for ensuring all content meets safety and ethical standards...',
      version: '1.3',
      status: 'Under Review',
      lastUpdated: '2025-02-10',
      owner: 'David Lee',
      approvers: ['Alice Smith', 'Frank Moore'],
      category: 'Safety',
    },
    {
      id: 'ETH-112',
      title: 'Ethical AI Development Standards',
      content: 'Framework for ensuring ethical AI development practices...',
      version: '1.0',
      status: 'Draft',
      lastUpdated: '2025-02-21',
      owner: 'Elena Rodriguez',
      approvers: [],
      category: 'Ethics',
    }
  ]);

  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const isComplianceOfficer = userRole === 'compliance_officer';
  
  const filteredPolicies = policies.filter(policy => 
    policy.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    policy.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    policy.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreatePolicy = () => {
    const newPolicy: Policy = {
      id: `POL-${Math.floor(Math.random() * 1000)}`,
      title: 'New Policy',
      content: '',
      version: '1.0',
      status: 'Draft',
      lastUpdated: new Date().toISOString().split('T')[0],
      owner: 'Current User',
      approvers: [],
      category: 'General',
    };
    setPolicies([...policies, newPolicy]);
    setSelectedPolicy(newPolicy);
    setIsEditing(true);
    setEditedContent('');
  };

  const handleEditPolicy = () => {
    if (selectedPolicy) {
      setEditedContent(selectedPolicy.content);
      setIsEditing(true);
    }
  };

  const handleSavePolicy = () => {
    if (selectedPolicy) {
      const updatedPolicy = {
        ...selectedPolicy,
        content: editedContent,
        lastUpdated: new Date().toISOString().split('T')[0],
        version: incrementVersion(selectedPolicy.version),
      };
      setPolicies(policies.map(p => p.id === selectedPolicy.id ? updatedPolicy : p));
      setSelectedPolicy(updatedPolicy);
      setIsEditing(false);
    }
  };

  const handleSubmitForApproval = () => {
    if (selectedPolicy) {
      const updatedPolicy = {
        ...selectedPolicy,
        status: 'Under Review' as const,
      };
      setPolicies(policies.map(p => p.id === selectedPolicy.id ? updatedPolicy : p));
      setSelectedPolicy(updatedPolicy);
      setIsEditing(false);
    }
  };

  const handleAIAssist = () => {
    // Simulate AI suggestion
    setAiSuggestion(
      "Suggested addition: Define 'personal identifier' more clearly per GDPR Article 4: 'personal data' means any information relating to an identified or identifiable natural person ('data subject')..."
    );
    setShowAIDialog(true);
  };

  const handleAcceptAISuggestion = () => {
    setEditedContent(prev => `${prev}\n\n${aiSuggestion}`);
    setShowAIDialog(false);
  };

  const incrementVersion = (version: string): string => {
    const [major, minor] = version.split('.').map(Number);
    return `${major}.${minor + 1}`;
  };

  const getStatusIcon = (status: Policy['status']) => {
    switch (status) {
      case 'Approved':
        return <ApprovedIcon sx={{ color: theme.palette.success.main }} />;
      case 'Under Review':
        return <ReviewIcon sx={{ color: theme.palette.warning.main }} />;
      case 'Draft':
        return <DraftIcon sx={{ color: theme.palette.text.secondary }} />;
    }
  };

  const getStatusColor = (status: Policy['status']) => {
    switch (status) {
      case 'Approved':
        return 'success';
      case 'Under Review':
        return 'warning';
      case 'Draft':
        return 'default';
    }
  };

  const mockVersionHistory: Version[] = [
    {
      version: '2.1',
      date: '2025-01-15',
      author: 'Alice Smith',
      changes: 'Updated PII definition per California privacy law',
    },
    {
      version: '2.0',
      date: '2024-12-01',
      author: 'Bob Johnson',
      changes: 'Major revision of image handling guidelines',
    },
    {
      version: '1.0',
      date: '2024-09-15',
      author: 'Carol White',
      changes: 'Initial policy creation',
    }
  ];

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Paper 
        elevation={3}
        sx={{ 
          p: 2, 
          borderRadius: 2,
          backgroundColor: theme.palette.background.paper 
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PolicyIcon color="primary" /> Policy Management
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              size="small"
              placeholder="Search policies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon color="action" sx={{ ml: 1, mr: 0.5 }} />,
                sx: {
                  borderRadius: '24px',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderRadius: '24px',
                  },
                }
              }}
            />
            {isComplianceOfficer && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreatePolicy}
                sx={{ 
                  borderRadius: '24px',
                  px: 2,
                  textTransform: 'none',
                  boxShadow: 2,
                }}
              >
                New Policy
              </Button>
            )}
          </Stack>
        </Stack>
      </Paper>

      <Grid container spacing={2} sx={{ flex: 1 }}>
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={3} 
            sx={{ 
              height: '100%', 
              overflow: 'auto',
              borderRadius: 2,
              backgroundColor: alpha(theme.palette.background.paper, 0.7),
            }}
          >
            <Typography 
              variant="subtitle2" 
              sx={{ 
                p: 2, 
                borderBottom: `1px solid ${theme.palette.divider}`,
                color: theme.palette.text.secondary,
                fontWeight: 500,
              }}
            >
              {filteredPolicies.length} Policies
            </Typography>
            
            <Stack spacing={1} sx={{ p: 1 }}>
              {filteredPolicies.length > 0 ? (
                filteredPolicies.map((policy) => (
                  <Fade in={true} key={policy.id} timeout={300}>
                    <Card
                      elevation={0}
                      sx={{
                        cursor: 'pointer',
                        bgcolor: selectedPolicy?.id === policy.id 
                          ? alpha(theme.palette.primary.main, 0.08)
                          : theme.palette.background.paper,
                        borderRadius: 2,
                        border: `1px solid ${selectedPolicy?.id === policy.id 
                          ? theme.palette.primary.main 
                          : theme.palette.divider}`,
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.05),
                          borderColor: alpha(theme.palette.primary.main, 0.3),
                        },
                        transition: 'all 0.2s',
                      }}
                      onClick={() => setSelectedPolicy(policy)}
                    >
                      <CardContent sx={{ '&:last-child': { pb: 2 }, pt: 2, pb: 2 }}>
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                          <Avatar
                            sx={{
                              width: 40,
                              height: 40,
                              bgcolor: policy.status === 'Approved'
                                ? alpha(theme.palette.success.main, 0.2)
                                : policy.status === 'Under Review'
                                  ? alpha(theme.palette.warning.main, 0.2)
                                  : alpha(theme.palette.grey[500], 0.2),
                              color: policy.status === 'Approved'
                                ? theme.palette.success.main
                                : policy.status === 'Under Review'
                                  ? theme.palette.warning.main
                                  : theme.palette.grey[500],
                            }}
                          >
                            {getStatusIcon(policy.status)}
                          </Avatar>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography 
                              variant="subtitle1" 
                              sx={{ 
                                fontWeight: 500,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {policy.title}
                            </Typography>
                            <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                              <Chip 
                                label={policy.status} 
                                size="small" 
                                color={getStatusColor(policy.status)} 
                                sx={{ height: 20, fontSize: '0.7rem' }}
                              />
                              <Chip 
                                label={`v${policy.version}`} 
                                size="small" 
                                sx={{ height: 20, fontSize: '0.7rem' }}
                              />
                              <Chip 
                                label={policy.category} 
                                size="small" 
                                sx={{ height: 20, fontSize: '0.7rem' }}
                              />
                            </Stack>
                          </Box>
                        </Stack>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ 
                            display: 'block',
                            mt: 1,
                            textAlign: 'right',
                            fontSize: '0.7rem',
                          }}
                        >
                          Updated: {policy.lastUpdated}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Fade>
                ))
              ) : (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography color="text.secondary">No policies found</Typography>
                </Box>
              )}
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper 
            elevation={3} 
            sx={{ 
              height: '100%', 
              p: 0, 
              display: 'flex', 
              flexDirection: 'column',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            {selectedPolicy ? (
              <>
                <Box sx={{ 
                  p: 2,
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  backgroundColor: theme.palette.background.paper,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 2,
                }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Badge
                      color={getStatusColor(selectedPolicy.status)}
                      variant="dot"
                      overlap="circular"
                      anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor: alpha(theme.palette.primary.main, 0.2),
                          color: theme.palette.primary.main,
                        }}
                      >
                        <PolicyIcon fontSize="small" />
                      </Avatar>
                    </Badge>
                    <Stack>
                      <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                        {selectedPolicy.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ID: {selectedPolicy.id} • v{selectedPolicy.version} • {selectedPolicy.category}
                      </Typography>
                    </Stack>
                  </Stack>
                  
                  {isComplianceOfficer && !isEditing && (
                    <Stack direction="row" spacing={1}>
                      <Button
                        startIcon={<EditIcon />}
                        variant="outlined"
                        onClick={handleEditPolicy}
                        size="small"
                        sx={{ 
                          borderRadius: '20px',
                          textTransform: 'none',
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        startIcon={<HistoryIcon />}
                        variant="outlined"
                        onClick={() => setShowVersionHistory(true)}
                        size="small"
                        sx={{ 
                          borderRadius: '20px',
                          textTransform: 'none',
                        }}
                      >
                        History
                      </Button>
                    </Stack>
                  )}
                </Box>

                <Box sx={{ 
                  flex: 1, 
                  overflowY: 'auto',
                  p: 3,
                }}>
                  {isEditing ? (
                    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <TextField
                        label="Policy Content"
                        multiline
                        fullWidth
                        rows={20}
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        sx={{ 
                          flex: 1,
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          },
                        }}
                      />
                      
                      <Stack direction="row" spacing={2} justifyContent="space-between">
                        <Button
                          startIcon={<AIIcon />}
                          onClick={handleAIAssist}
                          variant="outlined"
                          sx={{ 
                            borderRadius: '20px',
                            textTransform: 'none',
                          }}
                        >
                          AI Assist
                        </Button>
                        
                        <Stack direction="row" spacing={1}>
                          <Button 
                            onClick={() => setIsEditing(false)}
                            sx={{ 
                              borderRadius: '20px',
                              textTransform: 'none',
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="contained"
                            startIcon={<SaveIcon />}
                            onClick={handleSavePolicy}
                            sx={{ 
                              borderRadius: '20px',
                              textTransform: 'none',
                            }}
                          >
                            Save Draft
                          </Button>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSubmitForApproval}
                            sx={{ 
                              borderRadius: '20px',
                              textTransform: 'none',
                            }}
                          >
                            Submit for Approval
                          </Button>
                        </Stack>
                      </Stack>
                    </Box>
                  ) : (
                    <Box>
                      <Box sx={{ 
                        mb: 2,
                        p: 2,
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette.background.paper, 0.5),
                        border: `1px solid ${theme.palette.divider}`,
                      }}>
                        <Stack direction="row" justifyContent="space-between">
                          <Stack>
                            <Typography variant="body2" color="text.secondary">Owner</Typography>
                            <Typography variant="body1">{selectedPolicy.owner}</Typography>
                          </Stack>
                          <Stack>
                            <Typography variant="body2" color="text.secondary">Last Updated</Typography>
                            <Typography variant="body1">{selectedPolicy.lastUpdated}</Typography>
                          </Stack>
                          <Stack>
                            <Typography variant="body2" color="text.secondary">Status</Typography>
                            <Chip 
                              label={selectedPolicy.status} 
                              size="small" 
                              color={getStatusColor(selectedPolicy.status)} 
                            />
                          </Stack>
                        </Stack>
                        
                        {selectedPolicy.approvers.length > 0 && (
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="body2" color="text.secondary">Approvers</Typography>
                            <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                              {selectedPolicy.approvers.map((approver, index) => (
                                <Chip 
                                  key={index} 
                                  label={approver} 
                                  size="small" 
                                  variant="outlined"
                                  avatar={<Avatar sx={{ bgcolor: 'transparent' }}>{approver.charAt(0)}</Avatar>}
                                />
                              ))}
                            </Stack>
                          </Box>
                        )}
                      </Box>
                      
                      <Typography 
                        variant="body1" 
                        component="div" 
                        sx={{ 
                          whiteSpace: 'pre-wrap',
                          p: 1,
                          '& p': { mt: 2, mb: 2 },
                          '& ul, & ol': { pl: 4 },
                          '& li': { mb: 1 },
                        }}
                      >
                        {selectedPolicy.content}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </>
            ) : (
              <Box sx={{ 
                height: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexDirection: 'column', 
                p: 4,
              }}>
                <PolicyIcon sx={{ fontSize: 60, color: alpha(theme.palette.primary.main, 0.3), mb: 2 }} />
                <Typography color="text.secondary" variant="h6" sx={{ mb: 1 }}>
                  No Policy Selected
                </Typography>
                <Typography color="text.secondary" textAlign="center">
                  Select a policy from the list to view or edit its details
                </Typography>
                {isComplianceOfficer && (
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={handleCreatePolicy}
                    sx={{ 
                      mt: 3,
                      borderRadius: '20px',
                      textTransform: 'none',
                    }}
                  >
                    Create New Policy
                  </Button>
                )}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Version History Dialog */}
      <Dialog
        open={showVersionHistory}
        onClose={() => setShowVersionHistory(false)}
        maxWidth="md"
        fullWidth
        TransitionComponent={Zoom}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: theme.shadows[10],
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: `1px solid ${theme.palette.divider}`,
          pb: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}>
          <HistoryIcon color="primary" />
          <Typography variant="h6">Version History</Typography>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            View the history of changes made to this policy over time.
          </Typography>
          <Stack spacing={2}>
            {mockVersionHistory.map((version) => (
              <Card 
                key={version.version} 
                variant="outlined"
                sx={{
                  borderRadius: 2,
                  boxShadow: 'none',
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: alpha(theme.palette.primary.main, 0.2),
                        color: theme.palette.primary.main,
                      }}
                    >
                      {version.version}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1">Version {version.version}</Typography>
                      <Stack direction="row" spacing={2}>
                        <Typography variant="body2" color="text.secondary">
                          {version.date}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          by {version.author}
                        </Typography>
                      </Stack>
                      <Typography sx={{ mt: 1 }}>
                        {version.changes}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button 
            onClick={() => setShowVersionHistory(false)}
            sx={{ 
              borderRadius: '20px',
              textTransform: 'none',
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* AI Suggestions Dialog */}
      <Dialog
        open={showAIDialog}
        onClose={() => setShowAIDialog(false)}
        maxWidth="md"
        fullWidth
        TransitionComponent={Zoom}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: theme.shadows[10],
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: `1px solid ${theme.palette.divider}`,
          pb: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}>
          <AIIcon color="primary" />
          <Typography variant="h6">AI Suggestions</Typography>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Alert 
            severity="info" 
            sx={{ 
              mb: 2,
              borderRadius: 2,
              alignItems: 'center',
            }}
            icon={<AIIcon />}
          >
            <Typography variant="body2">
              The AI has analyzed your policy and suggests the following improvements:
            </Typography>
          </Alert>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              borderRadius: 2,
            }}
          >
            <Typography>
              {aiSuggestion}
            </Typography>
          </Paper>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button 
            onClick={() => setShowAIDialog(false)}
            sx={{ 
              borderRadius: '20px',
              textTransform: 'none',
            }}
          >
            Ignore
          </Button>
          <Button 
            variant="contained" 
            onClick={handleAcceptAISuggestion}
            sx={{ 
              borderRadius: '20px',
              textTransform: 'none',
            }}
          >
            Accept Suggestion
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 