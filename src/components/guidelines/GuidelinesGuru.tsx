import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  Card,
  CardContent,
  Stack,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tooltip,
  Avatar,
  CircularProgress,
  useTheme,
  alpha,
  Zoom,
  Fade,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  MarkerType,
  NodeProps,
} from 'react-flow-renderer';
import { 
  ThumbUpAlt, 
  ThumbDownAlt, 
  ZoomIn, 
  ZoomOut, 
  Fullscreen, 
  FullscreenExit,
  SmartToy as BotIcon,
  Person as PersonIcon,
  QuestionAnswer as QuestionIcon,
  Info as InfoIcon,
  Search as SearchIcon,
} from '@mui/icons-material';

// Create a custom Panel component since it's not exported from react-flow-renderer
interface PanelProps {
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  children: React.ReactNode;
}

const Panel: React.FC<PanelProps> = ({ position, children }) => {
  const positionStyles = {
    'top-left': { top: 10, left: 10 },
    'top-right': { top: 10, right: 10 },
    'bottom-left': { bottom: 10, left: 10 },
    'bottom-right': { bottom: 10, right: 10 },
  };

  return (
    <div
      style={{
        position: 'absolute',
        zIndex: 5,
        ...positionStyles[position],
      }}
    >
      {children}
    </div>
  );
};

interface ChatMessage {
  id: number;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  references?: {
    policyId: string;
    section: string;
  }[];
  highlighted_nodes?: string[];
}

interface FeedbackDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (type: string, comment: string) => void;
}

const FeedbackDialog: React.FC<FeedbackDialogProps> = ({ open, onClose, onSubmit }) => {
  const [feedbackType, setFeedbackType] = useState('');
  const [comment, setComment] = useState('');
  const theme = useTheme();

  const handleSubmit = () => {
    onSubmit(feedbackType, comment);
    onClose();
    setFeedbackType('');
    setComment('');
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
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
      }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <QuestionIcon color="primary" />
          <Typography variant="h6">Provide Feedback</Typography>
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Your feedback helps us improve the accuracy and relevance of our responses.
        </Typography>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip
              label="Irrelevant answer"
              onClick={() => setFeedbackType('irrelevant')}
              color={feedbackType === 'irrelevant' ? 'primary' : 'default'}
              sx={{ 
                borderRadius: '16px',
                '&.MuiChip-colorPrimary': {
                  boxShadow: `0 0 0 1px ${theme.palette.primary.main}`,
                },
                transition: 'all 0.2s',
              }}
              clickable
            />
            <Chip
              label="Outdated policy"
              onClick={() => setFeedbackType('outdated')}
              color={feedbackType === 'outdated' ? 'primary' : 'default'}
              sx={{ 
                borderRadius: '16px',
                '&.MuiChip-colorPrimary': {
                  boxShadow: `0 0 0 1px ${theme.palette.primary.main}`,
                },
                transition: 'all 0.2s',
              }}
              clickable
            />
            <Chip
              label="Unclear response"
              onClick={() => setFeedbackType('unclear')}
              color={feedbackType === 'unclear' ? 'primary' : 'default'}
              sx={{ 
                borderRadius: '16px',
                '&.MuiChip-colorPrimary': {
                  boxShadow: `0 0 0 1px ${theme.palette.primary.main}`,
                },
                transition: 'all 0.2s',
              }}
              clickable
            />
          </Stack>
          <TextField
            multiline
            rows={3}
            fullWidth
            label="Additional comments"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              }
            }}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button 
          onClick={onClose}
          sx={{ 
            borderRadius: '8px',
            textTransform: 'none',
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={!feedbackType}
          sx={{ 
            borderRadius: '8px',
            textTransform: 'none',
            px: 3,
          }}
        >
          Submit Feedback
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Custom node renderer for the graph
interface CustomNodeData {
  label: string;
  color?: string;
  borderColor?: string;
  isHighlighted?: boolean;
}

interface CustomNodeProps {
  data: CustomNodeData;
}

const CustomNode: React.FC<CustomNodeProps> = ({ data }) => {
  const theme = useTheme();
  const isHighlighted = data.isHighlighted || false;
  
  return (
    <div
      style={{
        padding: '12px 16px',
        borderRadius: '8px',
        background: data.color || theme.palette.primary.main,
        color: 'white',
        border: `1px solid ${data.borderColor || theme.palette.primary.dark}`,
        boxShadow: isHighlighted 
          ? `0 0 0 2px ${theme.palette.primary.main}, 0 4px 8px rgba(0,0,0,0.2)` 
          : '0 2px 4px rgba(0,0,0,0.1)',
        opacity: isHighlighted ? 1 : 0.7,
        minWidth: '120px',
        maxWidth: '200px',
        transition: 'all 0.3s ease',
        fontSize: '14px',
        fontWeight: isHighlighted ? 600 : 400,
      }}
    >
      {data.label}
    </div>
  );
};

interface GuidelinesGuruProps {
  initialNodes: Node[];
  initialEdges: Edge[];
}

export const GuidelinesGuru: React.FC<GuidelinesGuruProps> = ({
  initialNodes,
  initialEdges,
}) => {
  const theme = useTheme();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      sender: 'ai',
      text: "Welcome to Guidelines Guru! I'm here to help you understand and navigate our AI guidelines and policies. What would you like to know?",
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [nodes, setNodes] = useState(initialNodes.map(node => ({
    ...node,
    data: {
      ...node.data,
      color: node.style?.background,
      borderColor: node.style?.border,
    },
  })));
  const [edges, setEdges] = useState(initialEdges);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<number | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Enhanced nodes with custom styling
  const enhancedNodes = nodes.map(node => ({
    ...node,
    type: 'custom',
    data: {
      ...node.data,
      isHighlighted: node.style?.opacity === 1,
    },
  }));

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: messages.length + 1,
      sender: 'user',
      text: newMessage,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setNewMessage('');
    setIsTyping(true);

    // Simulate AI response with graph highlighting
    setTimeout(() => {
      setIsTyping(false);
      const aiResponse: ChatMessage = {
        id: messages.length + 2,
        sender: 'ai',
        text: "According to Policy IMG-005, you must not include personal identifiers (faces, license plates, etc.) in product images. These rules align with our Data Privacy standards.",
        timestamp: new Date().toLocaleTimeString(),
        references: [
          { policyId: 'IMG-005', section: 'Personal Identifiers' },
          { policyId: 'PRV-001', section: 'Data Privacy Standards' },
        ],
        highlighted_nodes: ['privacy', 'pii'],
      };
      setMessages((prev) => [...prev, aiResponse]);
      
      // Highlight relevant nodes in the graph with a smoother transition
      setNodes((prevNodes) =>
        prevNodes.map((node) => ({
          ...node,
          style: {
            ...node.style,
            opacity: aiResponse.highlighted_nodes?.includes(node.id) ? 1 : 0.3,
            transition: 'opacity 0.5s ease',
          },
        }))
      );
    }, 1500);
  };

  const handleFeedback = (messageId: number) => {
    setSelectedMessageId(messageId);
    setFeedbackDialogOpen(true);
  };

  const handleFeedbackSubmit = (type: string, comment: string) => {
    console.log('Feedback submitted:', { messageId: selectedMessageId, type, comment });
    // Here you would typically send this feedback to your backend
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Custom node types for the ReactFlow renderer
  const nodeTypes = {
    custom: (props: any) => <CustomNode data={props.data} />,
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      height: '100%', 
      gap: 2,
      position: 'relative',
    }}>
      {/* Chat Panel */}
      <Paper 
        elevation={3}
        sx={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          p: 0,
          borderRadius: 2,
          overflow: 'hidden',
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Box sx={{ 
          p: 2, 
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
        }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BotIcon color="primary" /> Guidelines Guru
          </Typography>
        </Box>
        
        <Box
          ref={chatContainerRef}
          sx={{
            flex: 1,
            overflowY: 'auto',
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            backgroundColor: alpha(theme.palette.background.default, 0.5),
          }}
        >
          {messages.map((message) => (
            <Fade in={true} key={message.id} timeout={500}>
              <Box sx={{
                display: 'flex',
                flexDirection: message.sender === 'user' ? 'row-reverse' : 'row',
                alignItems: 'flex-start',
                gap: 1,
              }}>
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: message.sender === 'user' ? 'primary.main' : 'secondary.main',
                  }}
                >
                  {message.sender === 'user' ? <PersonIcon /> : <BotIcon />}
                </Avatar>
                
                <Card
                  elevation={0}
                  sx={{
                    maxWidth: '80%',
                    borderRadius: 2,
                    bgcolor: message.sender === 'user' 
                      ? alpha(theme.palette.primary.main, 0.1)
                      : theme.palette.background.paper,
                    border: `1px solid ${message.sender === 'user' 
                      ? alpha(theme.palette.primary.main, 0.3)
                      : theme.palette.divider}`,
                  }}
                >
                  <CardContent sx={{ pb: 1 }}>
                    <Typography color="text.primary" variant="body1">
                      {message.text}
                    </Typography>
                    
                    {message.references && (
                      <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: 'wrap', gap: 0.5 }}>
                        {message.references.map((ref, idx) => (
                          <Chip
                            key={idx}
                            label={`${ref.policyId} - ${ref.section}`}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ 
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                            }}
                          />
                        ))}
                      </Stack>
                    )}
                    
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                      {message.timestamp}
                    </Typography>
                    
                    {message.sender === 'ai' && (
                      <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                        <Tooltip title="Helpful">
                          <IconButton 
                            size="small" 
                            onClick={() => handleFeedback(message.id)}
                            sx={{ 
                              color: theme.palette.success.main,
                              '&:hover': {
                                backgroundColor: alpha(theme.palette.success.main, 0.1),
                              }
                            }}
                          >
                            <ThumbUpAlt fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Not Helpful">
                          <IconButton 
                            size="small" 
                            onClick={() => handleFeedback(message.id)}
                            sx={{ 
                              color: theme.palette.error.main,
                              '&:hover': {
                                backgroundColor: alpha(theme.palette.error.main, 0.1),
                              }
                            }}
                          >
                            <ThumbDownAlt fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Box>
            </Fade>
          ))}
          
          {isTyping && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pl: 1 }}>
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: 'secondary.main',
                }}
              >
                <BotIcon />
              </Avatar>
              <Card
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <CircularProgress size={12} />
                  <CircularProgress size={12} sx={{ animationDelay: '0.2s' }} />
                  <CircularProgress size={12} sx={{ animationDelay: '0.4s' }} />
                </Box>
              </Card>
            </Box>
          )}
        </Box>
        
        <Box sx={{ 
          p: 2, 
          borderTop: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
        }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              placeholder="Ask about policies..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              InputProps={{
                startAdornment: <SearchIcon color="action" sx={{ ml: 1, mr: 0.5 }} />,
                sx: {
                  borderRadius: '24px',
                  backgroundColor: alpha(theme.palette.background.paper, 0.5),
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderRadius: '24px',
                  },
                  pl: 0.5,
                }
              }}
              variant="outlined"
              size="medium"
            />
            <IconButton 
              color="primary" 
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              sx={{ 
                bgcolor: theme.palette.primary.main,
                color: 'white',
                '&:hover': {
                  bgcolor: theme.palette.primary.dark,
                },
                '&.Mui-disabled': {
                  bgcolor: alpha(theme.palette.primary.main, 0.3),
                  color: 'white',
                },
                borderRadius: '50%',
              }}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </Box>
      </Paper>
      
      {/* Knowledge Graph Panel */}
      <Paper 
        elevation={3}
        sx={{ 
          flex: isFullscreen ? 2 : 1, 
          height: '100%',
          borderRadius: 2,
          overflow: 'hidden',
          transition: 'all 0.3s ease',
        }}
      >
        <Box sx={{ 
          p: 2, 
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <InfoIcon color="primary" /> Knowledge Graph
          </Typography>
          <IconButton onClick={toggleFullscreen}>
            {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
          </IconButton>
        </Box>
        
        <Box sx={{ height: 'calc(100% - 60px)', position: 'relative' }}>
          <ReactFlow
            nodes={enhancedNodes}
            edges={edges}
            fitView
            nodeTypes={nodeTypes}
            minZoom={0.5}
            maxZoom={1.5}
            defaultZoom={0.8}
            nodesDraggable={false}
            panOnDrag={true}
            elementsSelectable={true}
            attributionPosition="bottom-right"
          >
            <Background color="#f0f0f0" gap={16} />
            <Controls showInteractive={false} />
            <MiniMap
              nodeStrokeWidth={3}
              nodeColor={(n: any) => {
                if (n.data?.color) return n.data.color;
                return '#eee';
              }}
              nodeBorderRadius={2}
              maskColor={alpha(theme.palette.background.paper, 0.5)}
            />
            
            <Panel position="top-left">
              <Card
                elevation={0}
                sx={{
                  p: 1.5,
                  borderRadius: 1,
                  bgcolor: alpha(theme.palette.background.paper, 0.8),
                  backdropFilter: 'blur(4px)',
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 'bold' }}>Legend</Typography>
                <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, bgcolor: '#4A90E2', borderRadius: '50%' }} />
                    <Typography variant="caption">Privacy</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, bgcolor: '#E67E22', borderRadius: '50%' }} />
                    <Typography variant="caption">Ethics</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, bgcolor: '#E74C3C', borderRadius: '50%' }} />
                    <Typography variant="caption">Content Safety</Typography>
                  </Box>
                </Stack>
              </Card>
            </Panel>
          </ReactFlow>
        </Box>
      </Paper>

      <FeedbackDialog
        open={feedbackDialogOpen}
        onClose={() => setFeedbackDialogOpen(false)}
        onSubmit={handleFeedbackSubmit}
      />
    </Box>
  );
}; 