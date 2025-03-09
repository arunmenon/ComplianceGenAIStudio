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
  Switch,
  FormControlLabel,
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
  AccountTree as GraphIcon,
} from '@mui/icons-material';
import KnowledgeGraph from './KnowledgeGraph';

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
  type?: string;
  description?: string;
}

interface CustomNodeProps {
  data: CustomNodeData;
}

const CustomNode: React.FC<CustomNodeProps> = ({ data }) => {
  const theme = useTheme();
  const isHighlighted = data.isHighlighted || false;
  
  // Determine node type styling
  const getNodeColor = () => {
    const typeColors: {[key: string]: {bg: string, border: string}} = {
      'Policy': {bg: '#4A90E2', border: '#2171C7'},
      'Category': {bg: '#E67E22', border: '#B35C0F'},
      'Subcategory': {bg: '#67B7DC', border: '#4295BA'},
      'Rule': {bg: '#E74C3C', border: '#B83024'},
      'ProductType': {bg: '#F5B041', border: '#D4932A'}
    };
    
    const type = data.type || '';
    return typeColors[type] || {bg: '#999999', border: '#777777'};
  };
  
  const colors = getNodeColor();
  
  // Dynamic node size based on type
  const getNodeSize = () => {
    const type = data.type || '';
    switch(type) {
      case 'Policy': return { width: 180, height: 80 };
      case 'Category': return { width: 160, height: 70 };
      case 'Subcategory': return { width: 150, height: 70 };
      case 'Rule': return { width: 140, height: 60 };
      case 'ProductType': return { width: 130, height: 60 };
      default: return { width: 140, height: 60 };
    }
  };
  
  const nodeSize = getNodeSize();
  
  return (
    <div
      style={{
        width: nodeSize.width,
        height: nodeSize.height,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '8px 12px',
        borderRadius: '8px',
        background: isHighlighted ? colors.bg : alpha(colors.bg, 0.7),
        color: 'white',
        border: `2px solid ${isHighlighted ? colors.border : alpha(colors.border, 0.5)}`,
        boxShadow: isHighlighted 
          ? `0 0 12px ${alpha(colors.bg, 0.8)}, 0 0 0 2px ${alpha(colors.border, 0.5)}` 
          : `0 2px 5px ${alpha('#000', 0.2)}`,
        opacity: isHighlighted ? 1 : 0.8,
        transition: 'all 0.3s ease',
        fontSize: '13px',
        fontWeight: isHighlighted ? 600 : 400,
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {data.type && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          padding: '2px 4px',
          fontSize: '10px',
          backgroundColor: alpha(colors.border, 0.8),
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}>
          {data.type}
        </div>
      )}
      <div style={{ 
        marginTop: data.type ? '14px' : 0,
        padding: '0 8px'
      }}>
        {data.label || ''}
      </div>
      {data.description && (
        <div style={{
          fontSize: '9px',
          opacity: 0.9,
          marginTop: '4px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          maxWidth: '95%'
        }}>
          {data.description.length > 60 
            ? `${data.description.substring(0, 60)}...` 
            : data.description}
        </div>
      )}
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
  const [useD3Graph, setUseD3Graph] = useState(true); // Set to true to use the improved D3 visualization
  
  console.log("[GuidelinesGuru] Rendering with state:", { 
    useD3Graph, 
    nodesCount: nodes.length, 
    edgesCount: edges.length 
  });
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const reactFlowInstanceRef = useRef<any>(null);

  // Enhanced nodes with custom styling
  const enhancedNodes = nodes.map(node => ({
    ...node,
    type: 'custom',
    data: {
      ...node.data,
      isHighlighted: node.style?.opacity === 1,
    },
  }));

  // Add a function to fit view to highlighted nodes
  const fitViewToHighlighted = (nodeIds: string[]) => {
    if (reactFlowInstanceRef.current && nodeIds.length > 0) {
      const nodesToFit = nodes.filter(node => nodeIds.includes(node.id));
      if (nodesToFit.length > 0) {
        setTimeout(() => {
          reactFlowInstanceRef.current.fitView({
            padding: 0.5,
            includeHiddenNodes: false,
            nodes: nodesToFit,
          });
        }, 800); // Delay to allow node transitions to complete
      }
    }
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);
  
  // Add this new effect to handle graph layout focusing on highlighted nodes
  useEffect(() => {
    // Find the most recent AI message with highlighted nodes
    const lastAIMessage = [...messages].reverse().find(m => 
      m.sender === 'ai' && m.highlighted_nodes && m.highlighted_nodes.length > 0
    );
    
    if (lastAIMessage?.highlighted_nodes) {
      // Get highlighted node IDs
      const highlightedNodes = lastAIMessage.highlighted_nodes;
      
      // First, categorize nodes by type
      const nodesByType: {[key: string]: string[]} = {};
      nodes.forEach(node => {
        const type = node.data?.type || 'unknown';
        if (!nodesByType[type]) nodesByType[type] = [];
        if (highlightedNodes.includes(node.id)) {
          nodesByType[type].push(node.id);
        }
      });
      
      // Create a hierarchical layout
      const positionMap: {[key: string]: {x: number, y: number}} = {};
      const centerX = 500;
      const centerY = 300;
      
      // Position nodes by type in layers
      const typeOrder = ['Policy', 'Category', 'Subcategory', 'Rule', 'ProductType'];
      const typePositions = {
        'Policy': { y: centerY - 200, xSpread: 150 },
        'Category': { y: centerY - 100, xSpread: 180 },
        'Subcategory': { y: centerY, xSpread: 200 },
        'Rule': { y: centerY + 100, xSpread: 180 },
        'ProductType': { y: centerY + 200, xSpread: 150 },
      };
      
      // Position nodes by type
      typeOrder.forEach(type => {
        const nodeIds = nodesByType[type] || [];
        const nodeCount = nodeIds.length;
        
        if (nodeCount > 0) {
          const typePosition = typePositions[type as keyof typeof typePositions] || 
                              { y: centerY, xSpread: 150 };
          
          // Calculate horizontal spacing
          const totalWidth = nodeCount * typePosition.xSpread;
          const startX = centerX - (totalWidth / 2) + (typePosition.xSpread / 2);
          
          // Position each node in the type group
          nodeIds.forEach((nodeId, idx) => {
            positionMap[nodeId] = {
              x: startX + (idx * typePosition.xSpread),
              y: typePosition.y
            };
          });
        }
      });
      
      // Position any remaining highlighted nodes in a circle
      const unpositionedNodes = highlightedNodes.filter(id => !positionMap[id]);
      if (unpositionedNodes.length > 0) {
        const radius = 250;
        unpositionedNodes.forEach((nodeId, index) => {
          const angle = (index / unpositionedNodes.length) * 2 * Math.PI;
          positionMap[nodeId] = {
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle),
          };
        });
      }
      
      // Update node positions and styles
      setNodes(prevNodes => 
        prevNodes.map(node => {
          const isHighlighted = highlightedNodes.includes(node.id);
          
          // Determine node position
          const position = positionMap[node.id] || node.position;
          
          return {
            ...node,
            position,
            data: {
              ...node.data,
              isHighlighted,
            },
            style: {
              ...node.style,
              opacity: isHighlighted ? 1 : 0.15,
              zIndex: isHighlighted ? 10 : 1,
            },
          };
        })
      );
      
      // Update edge styles
      setEdges(prevEdges => 
        prevEdges.map(edge => {
          const sourceHighlighted = highlightedNodes.includes(edge.source);
          const targetHighlighted = highlightedNodes.includes(edge.target);
          const isHighlighted = sourceHighlighted && targetHighlighted;
          
          return {
            ...edge,
            type: 'smoothstep', // Use smoothstep for nicer curves
            style: {
              ...edge.style,
              stroke: isHighlighted ? '#4A90E2' : '#aaa',
              strokeWidth: isHighlighted ? 3 : 1,
              opacity: sourceHighlighted || targetHighlighted ? 0.9 : 0.05,
              transition: 'all 0.5s ease',
            },
            animated: isHighlighted,
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: isHighlighted ? 20 : 15,
              height: isHighlighted ? 20 : 15,
              color: isHighlighted ? '#4A90E2' : '#aaa',
            },
          };
        })
      );
      
      // Fit view to the highlighted nodes
      fitViewToHighlighted(highlightedNodes);
    }
  }, [messages]);
  
  // Fetch graph data from the API on component mount
  useEffect(() => {
    const fetchGraphData = async () => {
      console.log('Fetching graph data from API...');
      try {
        const response = await fetch('http://localhost:8000/api/graph');
        console.log('API response status:', response.status);
        if (!response.ok) {
          throw new Error('Failed to fetch graph data');
        }
        
        const data = await response.json();
        console.log('Received graph data:', data);
        
        if (data.nodes && data.nodes.length > 0) {
          // Calculate positions for nodes using a force-directed layout algorithm
          // This is a simple circular layout algorithm
          const totalNodes = data.nodes.length;
          const radius = Math.min(window.innerWidth, window.innerHeight) / 3;
          const centerX = window.innerWidth / 3;
          const centerY = window.innerHeight / 3;
          
          const positionedNodes = data.nodes.map((node: any, index: number) => {
            // Calculate position in a circle
            const angle = (index / totalNodes) * 2 * Math.PI;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            
            // Group similar nodes together
            const nodeType = node.data?.type || '';
            let groupRadius = radius;
            let groupAngle = angle;
            
            if (nodeType === 'Policy') {
              groupRadius = radius * 0.5;
            } else if (nodeType === 'Category') {
              groupRadius = radius * 0.7;
            } else if (nodeType === 'Subcategory') {
              groupRadius = radius * 0.9;
            } else if (nodeType === 'Rule') {
              groupRadius = radius * 1.1;
            } else if (nodeType === 'ProductType') {
              groupRadius = radius * 1.3;
            }
            
            const groupX = centerX + groupRadius * Math.cos(groupAngle);
            const groupY = centerY + groupRadius * Math.sin(groupAngle);
            
            return {
              ...node,
              position: { x: groupX, y: groupY },
              data: {
                ...node.data,
                color: node.style?.background || getNodeTypeColor(nodeType),
                borderColor: node.style?.border || 'rgba(0,0,0,0.2)',
                isHighlighted: false
              },
              style: {
                ...node.style,
                opacity: 0.7,
                transition: 'all 0.5s ease',
              }
            };
          });
          
          setNodes(positionedNodes);
          setEdges(data.edges.map((edge: any) => ({
            ...edge,
            type: 'smoothstep',
            animated: false,
            style: {
              ...edge.style,
              stroke: '#aaa'
            }
          })));
        }
      } catch (error) {
        console.error('Error fetching graph data:', error);
        // Fallback to initial nodes if API call fails
      }
    };
    
    const getNodeTypeColor = (type: string): string => {
      const colors: {[key: string]: string} = {
        'Policy': '#4A90E2',
        'Category': '#E67E22',
        'Subcategory': '#67B7DC',
        'Rule': '#E74C3C',
        'ProductType': '#F5B041',
        'ContentType': '#9B59B6',
        'ProductCategory': '#27AE60'
      };
      
      return colors[type] || '#999999';
    };
    
    fetchGraphData();
  }, []);

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
    
    // Reset all nodes to neutral state during typing
    setNodes((prevNodes) =>
      prevNodes.map((node) => ({
        ...node,
        style: {
          ...node.style,
          opacity: 0.6,
          boxShadow: 'none',
          border: node.style?.border || '1px solid #ccc',
          zIndex: 1,
        },
      }))
    );
    
    // Reset all edges to neutral state
    setEdges((prevEdges) =>
      prevEdges.map((edge) => ({
        ...edge,
        style: {
          ...edge.style,
          stroke: '#aaa',
          strokeWidth: 1,
          opacity: 0.4,
        },
        animated: false,
      }))
    );

    // Create conversation history for the API
    const conversationHistory = messages
      .filter(m => m.id > 1) // Skip welcome message
      .map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }));

    try {
      // Make API call to the Python backend
      const response = await fetch('http://localhost:8000/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: newMessage,
          conversation_history: conversationHistory,
        }),
      });
      
      const data = await response.json();
      
      setIsTyping(false);
      const aiResponse: ChatMessage = {
        id: messages.length + 2,
        sender: 'ai',
        text: data.answer || "I'm sorry, I couldn't find an answer to that question.",
        timestamp: new Date().toLocaleTimeString(),
        highlighted_nodes: data.highlighted_nodes || [],
      };
      
      setMessages((prev) => [...prev, aiResponse]);
      
      // Highlight nodes based on the response
      if (data.highlighted_nodes && data.highlighted_nodes.length > 0) {
        console.log("Highlighting nodes:", data.highlighted_nodes);
        
        // Update node styles based on highlighted nodes
        setNodes((prevNodes) =>
          prevNodes.map((node) => {
            const isHighlighted = data.highlighted_nodes.includes(node.id);
            return {
              ...node,
              data: {
                ...node.data,
                isHighlighted,
              },
              style: {
                ...node.style,
                opacity: isHighlighted ? 1 : 0.15,
                boxShadow: isHighlighted ? '0 0 10px rgba(33, 150, 243, 0.8)' : 'none',
                border: isHighlighted 
                  ? `2px solid ${(() => {
                      const nodeType = node.data?.type || '';
                      const colors: {[key: string]: string} = {
                        'Policy': '#4A90E2',
                        'Category': '#E67E22',
                        'Subcategory': '#67B7DC',
                        'Rule': '#E74C3C',
                        'ProductType': '#F5B041'
                      };
                      return colors[nodeType] || '#4A90E2';
                    })()}`
                  : node.style?.border || '1px solid #ccc',
                zIndex: isHighlighted ? 10 : 1,
              },
            };
          })
        );
        
        // Update edge styles based on highlighted nodes
        setEdges((prevEdges) =>
          prevEdges.map((edge) => {
            const sourceHighlighted = data.highlighted_nodes.includes(edge.source);
            const targetHighlighted = data.highlighted_nodes.includes(edge.target);
            const isHighlighted = sourceHighlighted && targetHighlighted;
            
            return {
              ...edge,
              style: {
                ...edge.style,
                stroke: isHighlighted ? (
                  (() => {
                    const sourceNode = nodes.find(n => n.id === edge.source);
                    const nodeType = sourceNode?.data?.type || '';
                    const colors: {[key: string]: string} = {
                      'Policy': '#4A90E2',
                      'Category': '#E67E22',
                      'Subcategory': '#67B7DC',
                      'Rule': '#E74C3C',
                      'ProductType': '#F5B041'
                    };
                    return colors[nodeType] || '#4A90E2';
                  })()
                ) : '#aaa',
                strokeWidth: isHighlighted ? 2 : 1,
                opacity: isHighlighted ? 1 : 0.2,
              },
              animated: isHighlighted,
            };
          })
        );
        
        // If using ReactFlow, fit the view to the highlighted nodes
        if (!useD3Graph) {
          fitViewToHighlighted(data.highlighted_nodes);
        }
      }
      
    } catch (error) {
      console.error('Error fetching response:', error);
      setIsTyping(false);
      
      const errorMessage: ChatMessage = {
        id: messages.length + 2,
        sender: 'ai',
        text: "I'm sorry, there was an error processing your request. Please try again.",
        timestamp: new Date().toLocaleTimeString(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const handleFeedback = (messageId: number) => {
    setSelectedMessageId(messageId);
    setFeedbackDialogOpen(true);
  };

  const handleFeedbackSubmit = async (type: string, comment: string) => {
    try {
      await fetch('http://localhost:8000/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message_id: selectedMessageId?.toString(),
          feedback_type: type,
          comment: comment
        }),
      });
      
      console.log('Feedback submitted:', { messageId: selectedMessageId, type, comment });
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Handle node click to show info and highlight connections
  const handleNodeClick = (event: React.MouseEvent, node: Node) => {
    // Prevent event from propagating
    event.stopPropagation();
    
    // Get node information
    const nodeLabel = node.data?.label || node.id;
    const nodeType = node.data?.type || '';
    const nodeDescription = node.data?.description || '';
    
    // Create a question about the clicked node
    let question = `Tell me about ${nodeLabel}`;
    if (nodeType) {
      question += ` ${nodeType.toLowerCase()}`;
    }
    
    // Add the node description as context in the question
    if (nodeDescription) {
      question += `. The description says: "${nodeDescription}"`;
    }
    
    // Set the question in the input field
    setNewMessage(question);
    
    // Optional: Automatically send the message
    // handleSendMessage();
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
                  <CardContent>
                    <Typography 
                      variant="body1" 
                      component="div" 
                      sx={{ 
                        whiteSpace: 'pre-wrap', 
                        fontFamily: message.sender === 'ai' ? 'inherit' : 'inherit',
                      }}
                    >
                      {message.sender === 'ai' ? (
                        <Box
                          dangerouslySetInnerHTML={{
                            __html: message.text
                              // Format headings
                              .replace(/^# (.*?)$/gm, '<h2 style="font-size: 20px; margin-top: 12px; margin-bottom: 8px; font-weight: 600; color: #1976d2;">$1</h2>')
                              .replace(/^## (.*?)$/gm, '<h3 style="font-size: 18px; margin-top: 10px; margin-bottom: 6px; font-weight: 500; color: #1976d2;">$1</h3>')
                              // Format lists
                              .replace(/^\* (.*?)$/gm, '<li style="margin-bottom: 4px;">$1</li>')
                              .replace(/^- (.*?)$/gm, '<li style="margin-bottom: 4px;">$1</li>')
                              .replace(/^(\d+)\. (.*?)$/gm, '<li style="margin-bottom: 4px;"><strong>$1.</strong> $2</li>')
                              // Add proper list formatting
                              .replace(/(<li.*?>.*?<\/li>)\n(?!<li)/g, '$1</ul>\n')
                              .replace(/(?<!<\/ul>\n)(<li.*?>)/g, '<ul style="padding-left: 20px; margin-top: 4px; margin-bottom: 8px;">$1')
                              // Format paragraphs with spacing
                              .replace(/\n\n/g, '</p><p style="margin-top: 8px; margin-bottom: 8px;">')
                              // Format bold text
                              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                              // Format key terms
                              .replace(/`(.*?)`/g, '<code style="background-color: rgba(0,0,0,0.05); padding: 2px 4px; border-radius: 3px; font-family: monospace;">$1</code>')
                              // Ensure we start and end with paragraph tags
                              .replace(/^(?!<h[1-6]|<ul|<p)/, '<p style="margin-top: 0; margin-bottom: 8px;">')
                              .replace(/(?!<\/h[1-6]>|<\/ul>|<\/p>)$/, '</p>')
                          }}
                        />
                      ) : (
                        message.text
                      )}
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Guidelines Governance</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Tooltip title="Stable graph visualization that doesn't move while typing">
              <FormControlLabel
                control={
                  <Switch
                    checked={useD3Graph}
                    onChange={(e) => setUseD3Graph(e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <GraphIcon fontSize="small" />
                    <Typography variant="body2">Enhanced Graph</Typography>
                  </Box>
                }
              />
            </Tooltip>
            <Tooltip title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
              <IconButton onClick={toggleFullscreen}>
                {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        <Box sx={{ height: 'calc(100% - 60px)', position: 'relative' }}>
          {useD3Graph ? (
            <Box sx={{ height: '100%', flex: 1 }}>
              <KnowledgeGraph 
                nodes={nodes.map(node => ({
                  id: node.id,
                  data: {
                    label: node.data?.label || '',
                    type: node.data?.type || '',
                    description: node.data?.description || '',
                  }
                }))} 
                edges={edges.filter(edge => {
                  // Verify that both source and target nodes exist
                  const sourceExists = nodes.some(node => node.id === edge.source);
                  const targetExists = nodes.some(node => node.id === edge.target);
                  return sourceExists && targetExists;
                }).map(edge => ({
                  id: edge.id,
                  source: edge.source,
                  target: edge.target,
                  label: '',  // Simplify to avoid type issues
                }))}
                highlightedNodes={nodes
                  .filter(node => node.style?.opacity === 1)
                  .map(node => node.id)
                }
                onNodeClick={(nodeId) => {
                  // Find the node with this ID
                  const node = nodes.find(n => n.id === nodeId);
                  if (node) {
                    // Create a synthetic event
                    const syntheticEvent = new MouseEvent('click') as unknown as React.MouseEvent;
                    handleNodeClick(syntheticEvent, node as Node);
                  }
                }}
                isSearching={isTyping || newMessage.length > 0}
              />
            </Box>
          ) : (
            <ReactFlow
              nodes={enhancedNodes}
              edges={edges}
              onNodeClick={handleNodeClick}
              onInit={(instance) => (reactFlowInstanceRef.current = instance)}
              nodeTypes={nodeTypes}
              minZoom={0.3}
              maxZoom={2.0}
              defaultZoom={1}
              fitView
              attributionPosition="bottom-left"
              nodesDraggable={true}
              style={{
                backgroundColor: alpha(theme.palette.background.default, 0.95),
              }}
            >
              <Background 
                color="#333" 
                gap={16} 
                size={1.5}
              />
              <Controls 
                showInteractive={false}
                style={{
                  bottom: 10,
                  right: 10,
                  top: 'auto',
                  left: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: '8px',
                  padding: '4px',
                  gap: '4px',
                  backgroundColor: alpha(theme.palette.background.paper, 0.8),
                  backdropFilter: 'blur(4px)',
                  border: `1px solid ${theme.palette.divider}`,
                }}
              />
              <MiniMap
                nodeStrokeWidth={3}
                nodeStrokeColor="#fff"
                nodeColor={(n: any) => {
                  const type = n.data?.type || '';
                  const typeColors: {[key: string]: string} = {
                    'Policy': '#4A90E2',
                    'Category': '#E67E22',
                    'Subcategory': '#67B7DC',
                    'Rule': '#E74C3C',
                    'ProductType': '#F5B041'
                  };
                  return typeColors[type] || '#999';
                }}
                nodeBorderRadius={4}
                maskColor={alpha(theme.palette.background.paper, 0.5)}
                style={{
                  bottom: 10,
                  left: 10,
                  background: alpha(theme.palette.background.paper, 0.8),
                  backdropFilter: 'blur(4px)',
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: '8px',
                }}
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
          )}
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