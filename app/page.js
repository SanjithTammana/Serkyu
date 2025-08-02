'use client';

import React, { useState, useRef } from 'react';
import { styled } from '@mui/material/styles';
import {
  Box,
  TextField,
  Button,
  CircularProgress,
  Typography,
  IconButton,
  Snackbar,
  Alert,
  Card,
  CardContent,
  Fab,
  Menu,
  MenuItem,
  ListItemButton,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import DownloadIcon from '@mui/icons-material/Download';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Dynamic import of STLExporter (client only)
const loadSTLExporter = async () => {
  const mod = await import('three/examples/jsm/exporters/STLExporter.js');
  return mod.STLExporter;
};

// Styled components (condensed from original)
const LandingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 'calc(100vh - 90px)',
  background: '#9b9ddf',
  padding: '2rem',
  position: 'relative',
  overflow: 'hidden',
  '&::after': {
    content: '""',
    position: 'absolute',
    right: 0,
    top: 0,
    height: '100%',
    width: '135px',
    background: `linear-gradient(180deg, #fef2e0 0%, #fef2e0 40%, #c2c9ed 40%, #c2c9ed 70.6%, #9b9ddf 70.6%, #9b9ddf 86.2%, #8b8ac3 86.2%, #8b8ac3 100%)`,
    [theme.breakpoints.down('md')]: {
      right: 0,
      top: 'auto',
      bottom: 0,
      width: '100%',
      height: '80px',
      background: `linear-gradient(90deg, #fef2e0 0%, #fef2e0 40%, #c2c9ed 40%, #c2c9ed 70.6%, #9b9ddf 70.6%, #9b9ddf 86.2%, #8b8ac3 86.2%, #8b8ac3 100%)`,
    },
  },
  [theme.breakpoints.down('md')]: { paddingBottom: '100px' },
}));
const MainTitle = styled(Typography)(({ theme }) => ({
  fontSize: '4rem',
  fontWeight: 'bold',
  color: '#f5f5dc',
  marginBottom: '1rem',
  textAlign: 'center',
  letterSpacing: '0.1em',
  [theme.breakpoints.down('md')]: { fontSize: '3rem' },
  [theme.breakpoints.down('sm')]: { fontSize: '2.5rem' },
}));
const Subtitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.5rem',
  fontWeight: 'bold',
  color: '#2c2c2c',
  marginBottom: '3rem',
  textAlign: 'center',
  [theme.breakpoints.down('sm')]: { fontSize: '1.2rem' },
}));
const InputContainer = styled(Box)(() => ({ display: 'flex', width: '100%', maxWidth: '700px' }));
const PromptInput = styled(TextField)(() => ({
  flex: 1,
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'rgba(60,60,60,0.9)',
    borderRadius: '25px 0 0 25px',
    color: '#fff',
    fontSize: '1rem',
    padding: '10px 20px',
    height: '60px',
    '& fieldset': { border: 'none' },
    '&.Mui-focused fieldset': { border: '2px solid #ffffff' },
  },
  '& .MuiInputBase-input': {
    color: '#fff',
    '&::placeholder': { color: '#ccc', opacity: 1 },
  },
}));
const EditorContainer = styled(Box)(() => ({ display: 'flex', height: 'calc(100vh - 90px)', background: '#9b9ddf', position: 'relative', overflow: 'hidden' }));
const SidebarContainer = styled(Box)(() => ({ width: '300px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', zIndex: 1 }));
const MainContent = styled(Box)(() => ({ flex: 1, padding: '1rem', paddingRight: '150px', display: 'flex', flexDirection: 'column', gap: '1rem' }));
const StyledCard = styled(Card)(() => ({ backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }));
const ChatCard = styled(StyledCard)(() => ({ height: '100%', display: 'flex', flexDirection: 'column' }));
const PlaygroundCard = styled(StyledCard)(() => ({ flex: 1, display: 'flex', flexDirection: 'column' }));
const PlaygroundContent = styled(Box)(() => ({ flex: 1, minHeight: 0, backgroundColor: '#1e1e1e', borderRadius: '12px', position: 'relative', display: 'flex', flexDirection: 'column' }));
const DesignListItemStyled = styled(ListItemButton, { shouldForwardProp: (prop) => prop !== 'isActive' })(({ isActive }) => ({
  borderRadius: '12px',
  marginBottom: '0.5rem',
  backgroundColor: isActive ? 'rgba(155,157,223,0.1)' : 'transparent',
  '&:hover': { backgroundColor: 'rgba(155,157,223,0.05)' },
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}));
const NewDesignFab = styled(Fab)(() => ({ backgroundColor: '#9b9ddf', color: '#fff', '&:hover': { backgroundColor: '#8a8bc7' } }));

// (legacy prompt helpers removed)

// Generic JSON extraction helper
const extractJSON = (rawText) => {
  const match = rawText.match(/```json\s*([\s\S]*?)```/i);
  if (!match) return null;
  try {
    return JSON.parse(match[1]);
  } catch (e) {
    console.warn('Failed to parse JSON:', e);
    return null;
  }
};

// Simple GLTF wrapper with rotation
const GLTFModel = ({ model }) => {
  const ref = useRef();
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.3;
  });
  return model ? <primitive ref={ref} object={model} /> : null;
};

const ThreeDViewport = React.memo(function ThreeDViewport({ activeDesign }) {
  return (
    <Canvas style={{ width: '100%', height: '100%', borderRadius: 12 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <OrbitControls />
      {activeDesign ? (
        activeDesign.model ? (
          <GLTFModel model={activeDesign.model} />
        ) : (
          <Html center>
            <Typography variant="body1" color="white">
              Waiting for model instructions...
            </Typography>
          </Html>
        )
      ) : (
        <Html center>
          <Typography variant="body1" color="white">
            Select a design to start
          </Typography>
        </Html>
      )}
    </Canvas>
  );
});

// Export helpers
const exportSTL = async (scene, name = 'model') => {
  const STLExporter = await loadSTLExporter();
  const exporter = new STLExporter();
  const result = exporter.parse(scene, { binary: false });
  const blob = new Blob([result], { type: 'application/sla' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${name}.stl`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
};

const exportSCH = (design, name = 'design') => {
  const schematic = {
    name: design.name,
    createdAt: design.createdAt,
    refinedPrompt: design.refinedPrompt || '',
    recentMessages: design.messages.slice(-5),
  };
  const serialized = JSON.stringify(schematic, null, 2);
  const blob = new Blob([serialized], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${name}.sch`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
};

const pushToHistory = (design, newModel) => {
  const past = design.past ? [...design.past] : [];
  const current = design.model || null;
  past.push(current);
  return { ...design, model: newModel, past, future: [] };
};

// Generate 3D model by refining prompt then calling backend generator
const generate3DFromPrompt = async (prompt) => {
  const resp = await fetch('/api/generate3d', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });
  if (!resp.ok) {
    let message = '3D generation failed';
    try {
      const data = await resp.json();
      message = data?.error || message;
    } catch (e) {
      try {
        const text = await resp.text();
        if (text) message = text;
      } catch (_) {
        /* ignore */
      }
    }
    throw new Error(message);
  }
  const arrayBuffer = await resp.arrayBuffer();
  const blob = new Blob([arrayBuffer], {
    type: resp.headers.get('content-type') || 'application/octet-stream',
  });
  const url = URL.createObjectURL(blob);
  const loader = new GLTFLoader();
  return await new Promise((resolve, reject) => {
    loader.load(
      url,
      (gltf) => {
        URL.revokeObjectURL(url);
        resolve(gltf.scene);
      },
      undefined,
      (err) => {
        URL.revokeObjectURL(url);
        reject(err);
      }
    );
  });
};

const refineAndGenerate = async (userText, history = []) => {
  const refinementPrompt = `Refine the user's request into a concise prompt for a text-to-3D model.\nReturn a JSON block with keys: prompt, message.\nUser request: "${userText}"`;
  const systemPrompt = `You are a helpful assistant that improves user requests for 3D generation. Respond only with a JSON block containing {"prompt": "refined prompt", "message": "short friendly reply"}.`;
  const resp = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: refinementPrompt, history, systemPrompt }),
  });
  const data = await resp.json();
  const structured = extractJSON(data.response || data.responseMessage || '');
  const refinedPrompt = structured?.prompt || userText;
  const explanation = structured?.message || 'Generating model...';
  const model = await generate3DFromPrompt(refinedPrompt);
  return { model, explanation, refinedPrompt };
};

// Main page component
const SerkyuPage = () => {
  const [isLanding, setIsLanding] = useState(true);
  const [prompt, setPrompt] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [designs, setDesigns] = useState([]);
  const [activeDesignId, setActiveDesignId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [exportAnchorEl, setExportAnchorEl] = useState(null);
  const exportMenuOpen = Boolean(exportAnchorEl);
  const activeDesign = designs.find((d) => d.id === activeDesignId);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };
  const handleCloseSnackbar = () => setSnackbar((s) => ({ ...s, open: false }));

  const createNewDesign = (initialPrompt = '') => {
    const newDesign = {
      id: Date.now(),
      name: `Design ${designs.length + 1}`,
      messages: initialPrompt
        ? [
            { id: 1, type: 'user', content: initialPrompt, timestamp: new Date() },
            {
              id: 2,
              type: 'bot',
              content: "I'll help you create that! Let me generate the 3D model...",
              timestamp: new Date(),
            },
          ]
        : [],
      model: null,
      refinedPrompt: '',
      past: [],
      future: [],
      createdAt: new Date(),
    };
    setDesigns((prev) => [...prev, newDesign]);
    setActiveDesignId(newDesign.id);
    return newDesign;
  };

  const handleInitialSubmit = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    const newDesign = createNewDesign(prompt);
    try {
      const history = [];
      const { model: newModel, explanation, refinedPrompt } = await refineAndGenerate(prompt, history);
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: explanation,
        timestamp: new Date(),
      };
      setDesigns((prev) =>
        prev.map((d) =>
          d.id === newDesign.id
            ? { ...d, messages: [...d.messages, botMessage], model: newModel, refinedPrompt }
            : d
        )
      );
      setIsLanding(false);
      showSnackbar('Design created!');
    } catch (e) {
      console.error(e);
      showSnackbar(e.message || 'Failed to generate model', 'error');
    } finally {
      setPrompt('');
      setIsGenerating(false);
    }
  };

  const handleChatSubmit = async () => {
    if (!chatInput.trim() || !activeDesign) return;
    setIsGenerating(true);
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: chatInput,
      timestamp: new Date(),
    };
    setDesigns((prev) =>
      prev.map((d) => (d.id === activeDesignId ? { ...d, messages: [...d.messages, userMessage] } : d))
    );
    setChatInput('');
    try {
      const history = activeDesign.messages.map((m) => ({
        sender: m.type === 'user' ? 'user' : 'assistant',
        text: m.content,
      }));
      const { model: newModel, explanation, refinedPrompt } = await refineAndGenerate(
        chatInput,
        history
      );
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: explanation,
        timestamp: new Date(),
      };
      setDesigns((prev) =>
        prev.map((design) => {
          if (design.id !== activeDesignId) return design;
          const updated = pushToHistory(design, newModel);
          return { ...updated, messages: [...design.messages, botMessage], refinedPrompt };
        })
      );
      showSnackbar('Response generated!');
    } catch (e) {
      console.error(e);
      showSnackbar(e.message || 'Failed to get assistant response', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNewDesign = () => {
    createNewDesign();
    showSnackbar('New design created!');
  };

  const handleDeleteDesign = (id) => {
    setDesigns((prev) => prev.filter((d) => d.id !== id));
    if (activeDesignId === id) {
      const remaining = designs.filter((d) => d.id !== id);
      setActiveDesignId(remaining.length ? remaining[0].id : null);
    }
    showSnackbar('Design deleted');
  };

  const handleUndo = () => {
    setDesigns((prev) =>
      prev.map((design) => {
        if (design.id !== activeDesignId) return design;
        const past = design.past || [];
        if (past.length === 0) return design;
        const current = design.model;
        const previous = past[past.length - 1];
        const newPast = past.slice(0, -1);
        const future = design.future ? [...design.future, current] : [current];
        return { ...design, model: previous, past: newPast, future };
      })
    );
  };

  const handleRedo = () => {
    setDesigns((prev) =>
      prev.map((design) => {
        if (design.id !== activeDesignId) return design;
        const future = design.future || [];
        if (future.length === 0) return design;
        const current = design.model;
        const next = future[future.length - 1];
        const newFuture = future.slice(0, -1);
        const past = design.past ? [...design.past, current] : [current];
        return { ...design, model: next, past, future: newFuture };
      })
    );
  };

  const handleKeyPress = (e, isInitial = false) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (isInitial) handleInitialSubmit();
      else handleChatSubmit();
    }
  };

  const handleExportClick = (e) => setExportAnchorEl(e.currentTarget);
  const handleExportClose = () => setExportAnchorEl(null);

  const handleExportSTL = async () => {
    handleExportClose();
    if (!activeDesign || !activeDesign.model) return;

    const scene = new THREE.Scene();
    scene.add(activeDesign.model.clone());

    await exportSTL(scene, activeDesign.name);
    showSnackbar('STL exported successfully!');
  };

  const handleExportSCH = () => {
    handleExportClose();
    if (!activeDesign) return;
    exportSCH(activeDesign, activeDesign.name);
    showSnackbar('Schematic exported successfully!');
  };

  const handleGenerate3DFile = async () => {
    handleExportClose();
    if (!activeDesign) return;
    try {
      const promptText = activeDesign.refinedPrompt ||
        activeDesign.messages
          .map((m) => `${m.type === 'user' ? 'User' : 'Bot'}: ${m.content}`)
          .join('\n');
      const resp = await fetch('/api/generate3d', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptText }),
      });
      if (!resp.ok) throw new Error('Request failed');
      const blob = await resp.blob();
      const ext = resp.headers.get('content-type')?.includes('model/gltf-binary')
        ? 'glb'
        : 'bin';
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeDesign.name}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showSnackbar('3D model generated!');
    } catch (e) {
      console.error(e);
      showSnackbar('Failed to generate 3D model', 'error');
    }
  };

  if (isLanding) {
    return (
      <LandingContainer>
        <MainTitle>serkyu</MainTitle>
        <Subtitle>Think. Build. Create.</Subtitle>
        <InputContainer>
          <PromptInput
            variant="outlined"
            placeholder="Describe what you want to create..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyPress={(e) => handleKeyPress(e, true)}
            multiline
            rows={2}
            disabled={isGenerating}
          />
          <IconButton
            aria-label="generate"
            onClick={handleInitialSubmit}
            disabled={isGenerating || !prompt.trim()}
            sx={{
              width: '60px',
              height: '60px',
              backgroundColor: 'rgba(60,60,60,0.9)',
              color: '#fff',
              borderRadius: '0 25px 25px 0',
              '&:hover': { backgroundColor: 'rgba(80,80,80,0.9)' },
            }}
          >
            {isGenerating ? <CircularProgress size={24} color="inherit" /> : <PlayArrowIcon />}
          </IconButton>
        </InputContainer>
      </LandingContainer>
    );
  }

  return (
    <EditorContainer>
      <SidebarContainer>
        <StyledCard sx={{ flex: 1 }}>
          <CardContent sx={{ display: 'flex', flexDirection: 'column', p: '1rem' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="h6" fontWeight="bold" color="#333">
                Designs
              </Typography>
              <NewDesignFab size="small" onClick={handleNewDesign}>
                <AddIcon />
              </NewDesignFab>
            </Box>
            <Box sx={{ flex: 1, overflowY: 'auto' }}>
              {designs.map((design) => (
                <DesignListItemStyled
                  key={design.id}
                  isActive={activeDesignId === design.id}
                  onClick={() => setActiveDesignId(design.id)}
                  sx={{ mb: 0.5 }}
                >
                  <Box>
                    <Typography
                      variant="subtitle2"
                      fontWeight={activeDesignId === design.id ? 'bold' : 'normal'}
                    >
                      {design.name}
                    </Typography>
                    <Typography variant="caption">{design.messages.length} messages</Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteDesign(design.id);
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </DesignListItemStyled>
              ))}
            </Box>
          </CardContent>
        </StyledCard>

        <ChatCard>
          <CardContent sx={{ display: 'flex', flexDirection: 'column', p: 0, flex: 1 }}>
            <Box p={2} borderBottom="1px solid #e0e0e0">
              <Typography variant="h6" fontWeight="bold" color="#333">
                Chat
              </Typography>
            </Box>
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Box
                sx={{
                  flex: 1,
                  overflowY: 'auto',
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  maxHeight: 400,
                }}
              >
                {activeDesign?.messages.map((message) => (
                  <Box
                    key={message.id}
                    sx={{
                      display: 'flex',
                      gap: 1,
                      alignSelf: message.type === 'user' ? 'flex-end' : 'flex-start',
                      maxWidth: '80%',
                    }}
                  >
                    {message.type === 'user' ? <PersonIcon /> : <SmartToyIcon />}
                    <Box
                      sx={{
                        backgroundColor: message.type === 'user' ? '#9b9ddf' : '#f0f0f0',
                        color: message.type === 'user' ? '#fff' : '#333',
                        p: 1,
                        borderRadius:
                          message.type === 'user' ? '20px 20px 5px 20px' : '20px 20px 20px 5px',
                        fontSize: '0.85rem',
                      }}
                    >
                      {message.content}
                    </Box>
                  </Box>
                ))}
                {isGenerating && (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <SmartToyIcon />
                    <Box
                      sx={{
                        backgroundColor: '#f0f0f0',
                        color: '#333',
                        p: 1,
                        borderRadius: '20px',
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <CircularProgress size={16} /> Thinking...
                    </Box>
                  </Box>
                )}
              </Box>
              <Box p={2}>
                <Box display="flex" gap={1}>
                  <TextField
                    fullWidth
                    placeholder="Ask about your design..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, false)}
                    disabled={isGenerating || !activeDesign}
                    size="small"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '25px' } }}
                  />
                  <IconButton
                    onClick={handleChatSubmit}
                    disabled={isGenerating || !chatInput.trim() || !activeDesign}
                    sx={{
                      backgroundColor: '#9b9ddf',
                      color: '#fff',
                      '&:hover': { backgroundColor: '#8a8bc7' },
                    }}
                  >
                    <PlayArrowIcon />
                  </IconButton>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </ChatCard>
      </SidebarContainer>

      <MainContent>
        <PlaygroundCard>
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 1,
                p: 2,
                borderBottom: '1px solid #e0e0e0',
              }}
            >
              <Typography variant="h6" fontWeight="bold" color="#333">
                3D Development Playground
              </Typography>
              <Box display="flex" gap={1} alignItems="center">
                <IconButton size="small" disabled={!activeDesign} onClick={handleUndo}>
                  <UndoIcon />
                </IconButton>
                <IconButton size="small" disabled={!activeDesign} onClick={handleRedo}>
                  <RedoIcon />
                </IconButton>
                <Button
                  startIcon={<DownloadIcon />}
                  variant="outlined"
                  size="small"
                  disabled={!activeDesign}
                  onClick={handleExportClick}
                >
                  Export
                </Button>
                <Menu
                  anchorEl={exportAnchorEl}
                  open={exportMenuOpen}
                  onClose={handleExportClose}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                  <MenuItem onClick={handleExportSTL} disabled={!activeDesign}>
                    Export STL
                  </MenuItem>
                  <MenuItem onClick={handleExportSCH} disabled={!activeDesign}>
                    Export SCH
                  </MenuItem>
                  <MenuItem onClick={handleGenerate3DFile} disabled={!activeDesign}>
                    Generate 3D File
                  </MenuItem>
                </Menu>
              </Box>
            </Box>
            <Box sx={{ flex: 1, position: 'relative', minHeight: 300, display: 'flex', flexDirection: 'column' }}>
              <PlaygroundContent>
                {activeDesign ? (
                  <Box sx={{ width: '100%', height: '100%', flex: 1, minHeight: 0 }}>
                    <ThreeDViewport activeDesign={activeDesign} />
                  </Box>
                ) : (
                  <Typography variant="h6" color="rgba(255,255,255,0.5)">
                    Select a design to start building
                  </Typography>
                )}
              </PlaygroundContent>
            </Box>
          </Box>
        </PlaygroundCard>
      </MainContent>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </EditorContainer>
  );
};

export default SerkyuPage;
