import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as d3 from 'd3';
import { Box, useTheme, alpha, Typography } from '@mui/material';

interface Node {
  id: string;
  data: {
    label: string;
    type?: string;
    description?: string;
  };
}

interface Edge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

interface KnowledgeGraphProps {
  nodes: Node[];
  edges: Edge[];
  highlightedNodes: string[];
  onNodeClick: (nodeId: string) => void;
  isSearching?: boolean; // Add prop to track if searching is active
}

// Define position storage outside component to persist across renders
const STABLE_NODE_POSITIONS: {[key: string]: {x: number, y: number}} = {};

const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({
  nodes,
  edges,
  highlightedNodes,
  onNodeClick,
  isSearching = false,
}) => {
  const theme = useTheme();
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const simulationRef = useRef<d3.Simulation<any, any> | null>(null);
  const graphInitializedRef = useRef<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Memoize the node click handler to prevent reference changes
  const handleNodeClick = useCallback((nodeId: string) => {
    onNodeClick(nodeId);
  }, [onNodeClick]);

  // Process nodes with stable positions
  const processedNodes = useMemo(() => {
    if (nodes.length === 0) return [];
    
    return nodes.map(node => {
      const nodeId = node.id;
      const savedPosition = STABLE_NODE_POSITIONS[nodeId];
      
      return {
        id: nodeId,
        label: node.data.label || nodeId,
        type: node.data.type || 'unknown',
        description: node.data.description || '',
        highlighted: highlightedNodes.includes(nodeId),
        // Use saved position if available, otherwise null (will be calculated)
        x: savedPosition ? savedPosition.x : null,
        y: savedPosition ? savedPosition.y : null,
        // Node sizes
        width: node.data.type === 'Policy' ? 140 : 
               node.data.type === 'Category' ? 120 :
               node.data.type === 'Subcategory' ? 110 : 100,
        height: node.data.type === 'Policy' ? 60 : 
                node.data.type === 'Category' ? 50 :
                node.data.type === 'Subcategory' ? 45 : 40,
      };
    });
  }, [nodes, highlightedNodes]);
  
  // Process edges, memoized to prevent unnecessary recalculations
  const processedEdges = useMemo(() => {
    return edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label || '',
      highlighted: highlightedNodes.includes(edge.source) && highlightedNodes.includes(edge.target),
    }));
  }, [edges, highlightedNodes]);

  // Function to save node positions for persistence
  const saveNodePositions = useCallback((nodeElements: any[]) => {
    nodeElements.forEach(node => {
      if (node.x !== undefined && node.y !== undefined) {
        STABLE_NODE_POSITIONS[node.id] = { x: node.x, y: node.y };
      }
    });
  }, []);

  // Create and update the graph visualization
  const updateGraph = useCallback(() => {
    try {
      if (!svgRef.current || !containerRef.current || processedNodes.length === 0) {
        return;
      }
      
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      // Stop existing simulation if there is one
      if (simulationRef.current) {
        simulationRef.current.stop();
      }
      
      // First time initialization
      if (!graphInitializedRef.current) {
        // Clear existing SVG content
        d3.select(svgRef.current).selectAll('*').remove();

        // Create new SVG
        const svg = d3.select(svgRef.current)
          .attr('width', width)
          .attr('height', height)
          .attr('viewBox', [0, 0, width, height]);

        // Create a group for the graph
        const g = svg.append('g')
          .attr('class', 'graph-container');

        // Add zoom behavior
        const zoom = d3.zoom()
          .scaleExtent([0.1, 3])
          .on('zoom', (event) => {
            g.attr('transform', event.transform);
          });

        svg.call(zoom as any);
        
        // Node type colors
        const typeColors: {[key: string]: {fill: string, stroke: string}} = {
          'Policy': {fill: '#4A90E2', stroke: '#2171C7'},
          'Category': {fill: '#E67E22', stroke: '#B35C0F'},
          'Subcategory': {fill: '#67B7DC', stroke: '#4295BA'},
          'Rule': {fill: '#E74C3C', stroke: '#B83024'},
          'ProductType': {fill: '#F5B041', stroke: '#D4932A'},
        };

        // Default color
        const defaultColor = {fill: '#999', stroke: '#666'};
        
        // Add a filter for the glow effect
        const defs = svg.append('defs');
        
        const filter = defs.append('filter')
          .attr('id', 'glow')
          .attr('x', '-50%')
          .attr('y', '-50%')
          .attr('width', '200%')
          .attr('height', '200%');
        
        filter.append('feGaussianBlur')
          .attr('stdDeviation', '3')
          .attr('result', 'coloredBlur');
        
        const feMerge = filter.append('feMerge');
        feMerge.append('feMergeNode')
          .attr('in', 'coloredBlur');
        feMerge.append('feMergeNode')
          .attr('in', 'SourceGraphic');
        
        // Add arrowhead marker
        defs.append('marker')
          .attr('id', 'arrowhead')
          .attr('viewBox', '0 -5 10 10')
          .attr('refX', 30)
          .attr('refY', 0)
          .attr('markerWidth', 6)
          .attr('markerHeight', 6)
          .attr('orient', 'auto')
          .append('path')
          .attr('d', 'M0,-5L10,0L0,5')
          .attr('fill', '#aaa');
        
        // Add highlighted arrowhead marker
        defs.append('marker')
          .attr('id', 'arrowhead-highlighted')
          .attr('viewBox', '0 -5 10 10')
          .attr('refX', 30)
          .attr('refY', 0)
          .attr('markerWidth', 6)
          .attr('markerHeight', 6)
          .attr('orient', 'auto')
          .append('path')
          .attr('d', 'M0,-5L10,0L0,5')
          .attr('fill', '#4A90E2');
          
        graphInitializedRef.current = true;
      }

      const svg = d3.select(svgRef.current);
      const g = svg.select('.graph-container');
      
      // For checking if all nodes have positions already
      const allNodesHavePositions = processedNodes.every(node => 
        node.x !== null && node.y !== null
      );
      
      // Init positions for nodes that don't have them yet
      if (!allNodesHavePositions) {
        // Calculate initial positions for nodes without positions
        const nodeElements = processedNodes.map(node => {
          if (node.x === null || node.y === null) {
            // Group nodes by type
            const typeCounts: {[key: string]: number} = {};
            const typeOffsets: {[key: string]: {x: number, y: number}} = {};
            
            processedNodes.forEach(n => {
              if (!typeCounts[n.type]) {
                typeCounts[n.type] = 0;
                
                // Place different types in different areas
                const angle = (Object.keys(typeCounts).length / 5) * 2 * Math.PI;
                const radius = Math.min(width, height) * 0.35;
                typeOffsets[n.type] = {
                  x: width/2 + radius * Math.cos(angle),
                  y: height/2 + radius * Math.sin(angle)
                };
              }
              typeCounts[n.type]++;
            });
            
            // Place node with slight offset based on its type
            const offset = typeOffsets[node.type] || {x: width/2, y: height/2};
            const typeCount = typeCounts[node.type] || 1;
            const spreadFactor = 50;
            
            return {
              ...node,
              x: offset.x + (Math.random() - 0.5) * spreadFactor * Math.sqrt(typeCount),
              y: offset.y + (Math.random() - 0.5) * spreadFactor * Math.sqrt(typeCount)
            };
          }
          return node;
        });
        
        // Create links data with proper source/target references
        const linkElements = processedEdges.map(edge => {
          const source = nodeElements.find(n => n.id === edge.source);
          const target = nodeElements.find(n => n.id === edge.target);
          return {
            ...edge,
            source,
            target
          };
        });
        
        // Run a simulation to position nodes if needed
        const simulation = d3.forceSimulation(nodeElements)
          .force('link', d3.forceLink(linkElements).id((d: any) => d.id).distance(150))
          .force('charge', d3.forceManyBody().strength(-500))
          .force('center', d3.forceCenter(width / 2, height / 2))
          .force('collision', d3.forceCollide().radius((d: any) => Math.max(d.width, d.height) / 1.5))
          .alpha(1)
          .alphaDecay(0.1) // Faster decay for quicker stabilization
          .alphaMin(0.001);
        
        // Store simulation reference
        simulationRef.current = simulation;
        
        // Run the simulation for a fixed number of ticks, then stop
        // This avoids waiting for the simulation to reach equilibrium
        simulation.tick(100);
        simulation.stop();
        
        // Save final positions
        saveNodePositions(nodeElements);
      } else {
        // Use saved positions for all nodes
        processedNodes.forEach(node => {
          const savedPos = STABLE_NODE_POSITIONS[node.id];
          if (savedPos) {
            node.x = savedPos.x;
            node.y = savedPos.y;
          }
        });
      }
      
      // Node type colors
      const typeColors: {[key: string]: {fill: string, stroke: string}} = {
        'Policy': {fill: '#4A90E2', stroke: '#2171C7'},
        'Category': {fill: '#E67E22', stroke: '#B35C0F'},
        'Subcategory': {fill: '#67B7DC', stroke: '#4295BA'},
        'Rule': {fill: '#E74C3C', stroke: '#B83024'},
        'ProductType': {fill: '#F5B041', stroke: '#D4932A'},
      };

      // Default color
      const defaultColor = {fill: '#999', stroke: '#666'};
      
      // Update links
      const links = g.selectAll('.link')
        .data(processedEdges, (d: any) => d.id);
      
      // Remove old links
      links.exit().remove();
      
      // Add new links
      const linksEnter = links.enter()
        .append('g')
        .attr('class', 'link');
      
      linksEnter.append('path')
        .attr('id', d => `link-${d.id}`)
        .attr('stroke', d => d.highlighted ? '#4A90E2' : '#aaa')
        .attr('stroke-width', d => d.highlighted ? 2 : 1)
        .attr('opacity', d => d.highlighted ? 1 : 0.5)
        .attr('marker-end', d => d.highlighted ? 'url(#arrowhead-highlighted)' : 'url(#arrowhead)');
      
      // Update existing links
      links.select('path')
        .attr('stroke', d => d.highlighted ? '#4A90E2' : '#aaa')
        .attr('stroke-width', d => d.highlighted ? 2 : 1)
        .attr('opacity', d => d.highlighted ? 1 : 0.5)
        .attr('marker-end', d => d.highlighted ? 'url(#arrowhead-highlighted)' : 'url(#arrowhead)');
        
      // Combine all links for path updates
      const allLinks = linksEnter.merge(links as any);
      
      // Update nodes
      const nodes = g.selectAll('.node')
        .data(processedNodes, (d: any) => d.id);
      
      // Remove old nodes
      nodes.exit().remove();
      
      // Add new nodes
      const nodesEnter = nodes.enter()
        .append('g')
        .attr('class', 'node')
        .attr('cursor', 'pointer')
        .attr('transform', d => `translate(${d.x},${d.y})`)
        .on('click', (event, d) => handleNodeClick(d.id))
        .call(d3.drag()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended) as any);
          
      nodesEnter.append('rect')
        .attr('width', d => d.width)
        .attr('height', d => d.height)
        .attr('rx', 5)
        .attr('ry', 5)
        .attr('x', d => -d.width / 2)
        .attr('y', d => -d.height / 2)
        .attr('fill', d => {
          const color = typeColors[d.type] || defaultColor;
          return d.highlighted ? color.fill : alpha(color.fill, 0.6);
        })
        .attr('stroke', d => {
          const color = typeColors[d.type] || defaultColor;
          return d.highlighted ? color.stroke : alpha(color.stroke, 0.6);
        })
        .attr('stroke-width', d => d.highlighted ? 2 : 1)
        .attr('filter', d => d.highlighted ? 'url(#glow)' : '');
      
      // Add type label to new nodes
      nodesEnter.append('text')
        .attr('class', 'type-label')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'hanging')
        .attr('font-size', '8px')
        .attr('font-weight', 'bold')
        .attr('fill', 'white')
        .attr('x', 0)
        .attr('y', d => -d.height / 2 + 3)
        .text(d => d.type.toUpperCase());
      
      // Add main label to new nodes
      nodesEnter.append('text')
        .attr('class', 'main-label')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', '12px')
        .attr('font-weight', d => d.highlighted ? 'bold' : 'normal')
        .attr('fill', 'white')
        .attr('x', 0)
        .attr('y', 3)
        .text(d => d.label)
        .each(function(d) {
          const label = d3.select(this);
          const words = d.label.split(' ');
          const lineHeight = 14;
          let line: string[] = [];
          let lineNumber = 0;
          let tspan = label.text('').append('tspan').attr('x', 0).attr('dy', 0);
          
          words.forEach(word => {
            line.push(word);
            tspan.text(line.join(' '));
            
            if ((tspan.node() as SVGTextContentElement).getComputedTextLength() > d.width - 10) {
              line.pop();
              tspan.text(line.join(' '));
              line = [word];
              tspan = label.append('tspan').attr('x', 0).attr('dy', lineHeight).text(word);
              lineNumber++;
            }
          });
          
          // Adjust vertical position
          const height = (lineNumber + 1) * lineHeight;
          label.selectAll('tspan').attr('y', -height / 2 + 10);
        });
      
      // Update existing nodes
      nodes.select('rect')
        .attr('fill', d => {
          const color = typeColors[d.type] || defaultColor;
          return d.highlighted ? color.fill : alpha(color.fill, 0.6);
        })
        .attr('stroke', d => {
          const color = typeColors[d.type] || defaultColor;
          return d.highlighted ? color.stroke : alpha(color.stroke, 0.6);
        })
        .attr('stroke-width', d => d.highlighted ? 2 : 1)
        .attr('filter', d => d.highlighted ? 'url(#glow)' : '');
      
      nodes.select('.main-label')
        .attr('font-weight', d => d.highlighted ? 'bold' : 'normal');
      
      // Combine for transformation
      const allNodes = nodesEnter.merge(nodes as any);
      
      // Update node positions - no animation needed here since we want stability
      allNodes.attr('transform', d => `translate(${d.x},${d.y})`);
      
      // Update link paths
      allLinks.select('path').attr('d', d => {
        const source = processedNodes.find(n => n.id === d.source);
        const target = processedNodes.find(n => n.id === d.target);
        if (!source || !target) {
          return '';
        }

        // Calculate edge points considering node dimensions
        const sourceX = source.x;
        const sourceY = source.y;
        const targetX = target.x;
        const targetY = target.y;
        
        // Calculate the angle between source and target
        const angle = Math.atan2(targetY - sourceY, targetX - sourceX);
        
        // Calculate source and target point offsets based on node shape
        const sourceOffset = {
          x: (source.width / 2) * Math.cos(angle),
          y: (source.height / 2) * Math.sin(angle)
        };
        
        const targetOffset = {
          x: (target.width / 2) * Math.cos(angle + Math.PI),
          y: (target.height / 2) * Math.sin(angle + Math.PI)
        };
        
        // Calculate actual connection points
        const sx = sourceX + sourceOffset.x;
        const sy = sourceY + sourceOffset.y;
        const tx = targetX + targetOffset.x;
        const ty = targetY + targetOffset.y;
        
        // Create a curved path for better visualization
        const dx = tx - sx;
        const dy = ty - sy;
        const dr = Math.sqrt(dx * dx + dy * dy) * 1.2;
        
        return `M${sx},${sy}A${dr},${dr} 0 0,1 ${tx},${ty}`;
      });
      
      // Drag functions that update the stable positions
      function dragstarted(event: any, d: any) {
        d.fx = d.x;
        d.fy = d.y;
      }

      function dragged(event: any, d: any) {
        d.fx = event.x;
        d.fy = event.y;
        d.x = event.x;
        d.y = event.y;
        d3.select(this).attr('transform', `translate(${d.x},${d.y})`);
        
        // Update connected links
        allLinks.select('path').attr('d', l => {
          if (l.source === d.id || l.target === d.id) {
            const source = processedNodes.find(n => n.id === l.source);
            const target = processedNodes.find(n => n.id === l.target);
            if (!source || !target) return '';

            // Check if we're dealing with the dragged node
            if (source.id === d.id) source.x = d.x, source.y = d.y;
            if (target.id === d.id) target.x = d.x, target.y = d.y;
            
            // Calculate the angle between source and target
            const angle = Math.atan2(target.y - source.y, target.x - source.x);
            
            // Calculate source and target point offsets
            const sourceOffset = {
              x: (source.width / 2) * Math.cos(angle),
              y: (source.height / 2) * Math.sin(angle)
            };
            
            const targetOffset = {
              x: (target.width / 2) * Math.cos(angle + Math.PI),
              y: (target.height / 2) * Math.sin(angle + Math.PI)
            };
            
            // Calculate actual connection points
            const sx = source.x + sourceOffset.x;
            const sy = source.y + sourceOffset.y;
            const tx = target.x + targetOffset.x;
            const ty = target.y + targetOffset.y;
            
            const dx = tx - sx;
            const dy = ty - sy;
            const dr = Math.sqrt(dx * dx + dy * dy) * 1.2;
            
            return `M${sx},${sy}A${dr},${dr} 0 0,1 ${tx},${ty}`;
          }
          return null;
        });
      }

      function dragended(event: any, d: any) {
        d.fx = null;
        d.fy = null;
        
        // Save the new position
        STABLE_NODE_POSITIONS[d.id] = { x: d.x, y: d.y };
      }
      
      // Auto-focus on highlighted nodes if specified
      if (highlightedNodes.length > 0) {
        const focusOnHighlightedNodes = () => {
          const highlightedNodeEls = processedNodes.filter(n => highlightedNodes.includes(n.id));
          
          if (highlightedNodeEls.length > 0) {
            // Calculate bounds
            const minX = Math.min(...highlightedNodeEls.map(n => n.x - n.width/2));
            const maxX = Math.max(...highlightedNodeEls.map(n => n.x + n.width/2));
            const minY = Math.min(...highlightedNodeEls.map(n => n.y - n.height/2));
            const maxY = Math.max(...highlightedNodeEls.map(n => n.y + n.height/2));
            
            // Add padding
            const padding = 50;
            const dx = maxX - minX + padding * 2;
            const dy = maxY - minY + padding * 2;
            
            // Calculate zoom scale
            const scale = Math.min(width / dx, height / dy, 1.5);
            
            // Calculate transform
            const centerX = (minX + maxX) / 2;
            const centerY = (minY + maxY) / 2;
            const transform = d3.zoomIdentity
              .translate(width / 2, height / 2)
              .scale(scale)
              .translate(-centerX, -centerY);
            
            // Apply zoom transform with transition
            const zoom = d3.zoom().on('zoom', (event) => {
              g.attr('transform', event.transform);
            });
            
            svg.transition().duration(750).call(zoom.transform as any, transform);
          }
        };
        
        // Delay focusing to ensure rendering is complete
        setTimeout(focusOnHighlightedNodes, 100);
      }
      
    } catch (err) {
      console.error("Error in D3 graph rendering:", err);
      setError(err instanceof Error ? err.message : String(err));
    }
  }, [processedNodes, processedEdges, handleNodeClick, saveNodePositions]);

  // Initial setup & updates to visualization
  useEffect(() => {
    if (isSearching) {
      // If searching, don't redraw the graph
      if (simulationRef.current) {
        simulationRef.current.stop();
      }
      return;
    }
    
    // Only update the graph if it's initialized or we have nodes
    if (graphInitializedRef.current || processedNodes.length > 0) {
      updateGraph();
    }
    
    // Cleanup on unmount
    return () => {
      if (simulationRef.current) {
        simulationRef.current.stop();
      }
    };
  }, [isSearching, processedNodes.length, updateGraph]);
  
  // Handle highlighted nodes changes separately with debounce to avoid redraws during typing
  useEffect(() => {
    // Only update highlights if we're not searching and have already initialized
    if (!isSearching && graphInitializedRef.current) {
      const svg = d3.select(svgRef.current);
      if (!svg.empty()) {
        // Update node highlighting without full redraw
        svg.selectAll('.node')
          .select('rect')
          .attr('filter', (d: any) => highlightedNodes.includes(d.id) ? 'url(#glow)' : '')
          .transition()
          .duration(300)
          .attr('fill', (d: any) => {
            const typeColors: {[key: string]: {fill: string, stroke: string}} = {
              'Policy': {fill: '#4A90E2', stroke: '#2171C7'},
              'Category': {fill: '#E67E22', stroke: '#B35C0F'},
              'Subcategory': {fill: '#67B7DC', stroke: '#4295BA'},
              'Rule': {fill: '#E74C3C', stroke: '#B83024'},
              'ProductType': {fill: '#F5B041', stroke: '#D4932A'},
            };
            const defaultColor = {fill: '#999', stroke: '#666'};
            const color = typeColors[d.type] || defaultColor;
            return highlightedNodes.includes(d.id) ? color.fill : alpha(color.fill, 0.6);
          })
          .attr('stroke', (d: any) => {
            const typeColors: {[key: string]: {fill: string, stroke: string}} = {
              'Policy': {fill: '#4A90E2', stroke: '#2171C7'},
              'Category': {fill: '#E67E22', stroke: '#B35C0F'},
              'Subcategory': {fill: '#67B7DC', stroke: '#4295BA'},
              'Rule': {fill: '#E74C3C', stroke: '#B83024'},
              'ProductType': {fill: '#F5B041', stroke: '#D4932A'},
            };
            const defaultColor = {fill: '#999', stroke: '#666'};
            const color = typeColors[d.type] || defaultColor;
            return highlightedNodes.includes(d.id) ? color.stroke : alpha(color.stroke, 0.6);
          });
        
        // Update link highlighting
        svg.selectAll('.link')
          .select('path')
          .transition()
          .duration(300)
          .attr('stroke', (d: any) => {
            const sourceHighlighted = highlightedNodes.includes(d.source);
            const targetHighlighted = highlightedNodes.includes(d.target);
            return (sourceHighlighted && targetHighlighted) ? '#4A90E2' : '#aaa';
          })
          .attr('stroke-width', (d: any) => {
            const sourceHighlighted = highlightedNodes.includes(d.source);
            const targetHighlighted = highlightedNodes.includes(d.target);
            return (sourceHighlighted && targetHighlighted) ? 2 : 1;
          })
          .attr('opacity', (d: any) => {
            const sourceHighlighted = highlightedNodes.includes(d.source);
            const targetHighlighted = highlightedNodes.includes(d.target);
            return (sourceHighlighted || targetHighlighted) ? 1 : 0.5;
          })
          .attr('marker-end', (d: any) => {
            const sourceHighlighted = highlightedNodes.includes(d.source);
            const targetHighlighted = highlightedNodes.includes(d.target);
            return (sourceHighlighted && targetHighlighted) ? 'url(#arrowhead-highlighted)' : 'url(#arrowhead)';
          });
      }
    }
  }, [highlightedNodes, isSearching]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (graphInitializedRef.current && containerRef.current && svgRef.current && !isSearching) {
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        
        d3.select(svgRef.current)
          .attr('width', width)
          .attr('height', height)
          .attr('viewBox', [0, 0, width, height]);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSearching]);

  if (error) {
    return (
      <Box sx={{ 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 2,
        p: 3
      }}>
        <Typography variant="h6" color="error">
          Error rendering graph
        </Typography>
        <Typography variant="body1">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box 
      ref={containerRef} 
      sx={{ 
        width: '100%', 
        height: '100%', 
        position: 'relative',
        bgcolor: alpha(theme.palette.background.default, 0.9),
      }}
    >
      <svg ref={svgRef} width="100%" height="100%" />
    </Box>
  );
};

export default KnowledgeGraph; 