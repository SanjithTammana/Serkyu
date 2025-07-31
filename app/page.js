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
import { mergeBufferGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

// Dynamic import of STLExporter (client only)
const loadSTLExporter = async () => {
  const module = await import('three/examples/jsm/exporters/STLExporter.js');
  return module.STLExporter;
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

// Modifier extraction
const colorWordToHex = {
  red: '#ff0000',
  blue: '#0000ff',
  orange: '#ffa500',
  green: '#00ff00',
  white: '#ffffff',
  black: '#000000',
};
const extractModifiers = (text) => {
  const lower = text.toLowerCase();
  const color = Object.entries(colorWordToHex).find(([word]) => lower.includes(word))?.[1] || null;
  let size = 1;
  if (lower.includes('small')) size = 0.6;
  if (lower.includes('large')) size = 1.5;
  return { color, size };
};

// Few-shot examples
const fewShotExamples = {
  generic: [
    {
      request: 'a simple red cube',
      spec: {
        model: {
          type: 'primitive',
          primitive: 'box',
          scale: 1,
          color: '#ff0000',
        },
        explanation: 'red cube',
      },
    },
  ],
  cat: [
    {
      request: 'a red cat composed of simple shapes',
      spec: {
        model: {
          type: 'composite',
          components: [
            { name: 'body', primitive: 'sphere', scale: 1.2, color: '#ff0000', offset: [0, 0, 0], rotation: [0, 0, 0] },
            { name: 'head', primitive: 'sphere', scale: 0.8, color: '#ff0000', offset: [0, 1.3, 0], rotation: [0, 0, 0] },
            { name: 'left_ear', primitive: 'cone', scale: 0.3, color: '#ff0000', offset: [-0.5, 1.8, 0], rotation: [0, 0, 0] },
            { name: 'right_ear', primitive: 'cone', scale: 0.3, color: '#ff0000', offset: [0.5, 1.8, 0], rotation: [0, 0, 0] },
            { name: 'leg_front_left', primitive: 'cylinder', scale: 0.4, color: '#ff0000', offset: [-0.4, -1.2, 0.5], rotation: [0, 0, 0] },
            { name: 'leg_front_right', primitive: 'cylinder', scale: 0.4, color: '#ff0000', offset: [0.4, -1.2, 0.5], rotation: [0, 0, 0] },
            { name: 'leg_back_left', primitive: 'cylinder', scale: 0.4, color: '#ff0000', offset: [-0.4, -1.2, -0.5], rotation: [0, 0, 0] },
            { name: 'leg_back_right', primitive: 'cylinder', scale: 0.4, color: '#ff0000', offset: [0.4, -1.2, -0.5], rotation: [0, 0, 0] },
            { name: 'tail', primitive: 'cylinder', scale: 0.2, color: '#ff0000', offset: [0, -0.3, -1.0], rotation: [1.2, 0, 0] },
          ],
        },
        explanation: 'basic red cat made from primitives',
      },
    },
  ],
  elephant: [
    {
      request: 'a blue elephant with trunk and ears',
      spec: {
        model: {
          type: 'composite',
          components: [
            { name: 'body', primitive: 'sphere', scale: 1.5, color: '#0000ff', offset: [0, 0, 0], rotation: [0, 0, 0] },
            { name: 'head', primitive: 'sphere', scale: 1.0, color: '#0000ff', offset: [0, 1.7, 0], rotation: [0, 0, 0] },
            { name: 'trunk', primitive: 'cylinder', scale: 0.4, color: '#0000ff', offset: [0, 0.8, 0.3], rotation: [1.2, 0, 0] },
            { name: 'left_ear', primitive: 'sphere', scale: 0.8, color: '#0000ff', offset: [-1.2, 1.7, 0], rotation: [0, 0, 0] },
            { name: 'right_ear', primitive: 'sphere', scale: 0.8, color: '#0000ff', offset: [1.2, 1.7, 0], rotation: [0, 0, 0] },
            { name: 'leg_front_left', primitive: 'cylinder', scale: 0.5, color: '#0000ff', offset: [-0.6, -1.2, 0], rotation: [0, 0, 0] },
            { name: 'leg_front_right', primitive: 'cylinder', scale: 0.5, color: '#0000ff', offset: [0.6, -1.2, 0], rotation: [0, 0, 0] },
            { name: 'leg_back_left', primitive: 'cylinder', scale: 0.5, color: '#0000ff', offset: [-0.6, -1.2, -1], rotation: [0, 0, 0] },
            { name: 'leg_back_right', primitive: 'cylinder', scale: 0.5, color: '#0000ff', offset: [0.6, -1.2, -1], rotation: [0, 0, 0] },
          ],
        },
        explanation: 'blue elephant composed of head, trunk, ears, and legs',
      },
    },
  ],
};

// Prompt builder that chooses examples by keyword presence
const buildGeneralPrompt = (userText) => {
  const lower = userText.toLowerCase();
  let examples = fewShotExamples.generic;

  if (lower.includes('cat')) examples = fewShotExamples.cat;
  else if (lower.includes('elephant')) examples = fewShotExamples.elephant;

  const exampleBlock = examples
    .map(
      (e) => `Request: "${e.request}"
\`\`\`json
${JSON.stringify(e.spec, null, 2)}
\`\`\``
    )
    .join('\n\n');

  // If asking for animal-like, add explicit decomposition instruction
  const animalHint = lower.includes('cat') || lower.includes('elephant')
    ? 'Because this is an animal, decompose it into logical parts (body, head, limbs, etc.) using simple primitives.'
    : '';

  return `
Translate the following natural-language design request into a structured JSON specification using this schema:

{
  "model": {
    "type": "primitive" | "composite",
    "primitive": "sphere" | "box" | "cylinder" | "cone" | "torus" | "...",
    "scale": number,
    "color": "#rrggbb",
    "components": [
      {
        "name": "string",
        "primitive": "...",
        "scale": number,
        "color": "#rrggbb",
        "offset": [x,y,z],
        "rotation": [rx,ry,rz],
        "relation": "optional",
        "metadata": {}
      }
    ]
  },
  "explanation": "brief human-readable summary"
}

Respond with:
1. A one-sentence acknowledgement.
2. A single \`json\` code block containing only valid JSON following the schema (no extra prose).

${animalHint}

Here are examples to follow:
${exampleBlock}

Now translate this request: "${userText}"
`;
};

// Extraction & validation of JSON block
const extractStructuredSpec = (rawText) => {
  const match = rawText.match(/```json\s*([\s\S]*?)```/i);
  if (!match) return null;
  try {
    return JSON.parse(match[1]);
  } catch (e) {
    console.warn('Failed to parse JSON spec:', e);
    return null;
  }
};

const isValidSpec = (parsed) => {
  if (!parsed || !parsed.model) return false;
  const m = parsed.model;
  if (m.type === 'primitive') {
    if (!['sphere', 'box', 'cylinder', 'cone', 'torus'].includes(m.primitive)) return false;
    if (typeof m.scale !== 'number') return false;
    if (!/^#[0-9A-Fa-f]{6}$/.test(m.color)) return false;
    return true;
  }
  if (m.type === 'composite') {
    if (!Array.isArray(m.components)) return false;
    return m.components.every((c) => {
      if (!['sphere', 'box', 'cylinder', 'cone', 'torus'].includes(c.primitive)) return false;
      if (typeof c.scale !== 'number') return false;
      if (!/^#[0-9A-Fa-f]{6}$/.test(c.color)) return false;
      if (!Array.isArray(c.offset) || c.offset.length !== 3) return false;
      if (!Array.isArray(c.rotation) || c.rotation.length !== 3) return false;
      return true;
    });
  }
  return false;
};

// Mesh construction from spec
const makeMesh = (primitive, scale, color, offset = [0, 0, 0], rotation = [0, 0, 0]) => {
  let geometry;
  if (primitive === 'sphere') geometry = new THREE.SphereGeometry(0.7, 32, 32);
  else if (primitive === 'cylinder') geometry = new THREE.CylinderGeometry(0.5, 0.5, 1.5, 32);
  else if (primitive === 'cone') geometry = new THREE.ConeGeometry(0.5, 1, 32);
  else if (primitive === 'torus') geometry = new THREE.TorusGeometry(0.5, 0.2, 16, 100);
  else geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshStandardMaterial({ color });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.scale.set(scale, scale, scale);
  mesh.position.set(...offset);
  mesh.rotation.set(...rotation);
  return mesh;
};

const CompositeModel = ({ model }) => {
  const groupRef = useRef();
  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.3;
  });

  if (!model) return null;

  if (model.type === 'composite' && Array.isArray(model.components)) {
    return (
      <group ref={groupRef}>
        {model.components.map((c, i) => (
          <primitive
            key={i}
            object={makeMesh(
              c.primitive,
              c.scale,
              c.color,
              Array.isArray(c.offset) ? c.offset : [0, 0, 0],
              Array.isArray(c.rotation) ? c.rotation : [0, 0, 0]
            )}
          />
        ))}
      </group>
    );
  }

  return (
    <group ref={groupRef}>
      <primitive object={makeMesh(model.primitive || 'box', model.scale || 1, model.color || '#8b8ac7')} />
    </group>
  );
};

const ThreeDViewport = React.memo(({ activeDesign }) => {
  return (
    <Canvas style={{ width: '100%', height: '100%', borderRadius: 12 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <OrbitControls />
      {activeDesign ? (
        activeDesign.model ? (
          <CompositeModel model={activeDesign.model} />
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
  const spec = design.model || {
    type: 'primitive',
    primitive: 'box',
    scale: 1,
    color: '#8b8ac7',
  };
  const schematic = {
    name: design.name,
    createdAt: design.createdAt,
    model: spec,
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
  const current = design.model || {
    type: 'primitive',
    primitive: 'box',
    scale: 1,
    color: '#8b8ac7',
  };
  past.push(current);
  return { ...design, model: newModel, past, future: [] };
};

// Core interpret & refine
const interpretAndRefine = async (userText, previousModel = null, history = []) => {
  const modifiers = extractModifiers(userText);
  let prompt = buildGeneralPrompt(userText);

  // initial call
  const resp = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: prompt, history, systemPrompt: null }),
  });
  const data = await resp.json();
  const raw = data.response || data.responseMessage || '';
  let structured = extractStructuredSpec(raw);
  let model = previousModel || {
    type: 'primitive',
    primitive: 'box',
    scale: modifiers.size || 1,
    color: modifiers.color || '#8b8ac7',
  };
  let explanation = 'Interpreted design.';

  if (structured && isValidSpec(structured)) {
    model = structured.model;
    explanation = structured.explanation || explanation;
  }

  if (modifiers.color) {
    if (model.type === 'primitive') model.color = modifiers.color;
    else if (model.type === 'composite') {
      model.components = model.components.map((c) => ({ ...c, color: modifiers.color }));
    }
  }

  if (modifiers.size && model.type === 'primitive' && (!('scale' in model) || model.scale === 1)) {
    model.scale = modifiers.size;
  }

  // fallback refine if initial was invalid
  if (!structured || !isValidSpec(structured)) {
    const refinementPrompt = `
Previous attempt to interpret: "${userText}" produced an invalid or incomplete spec.
Please revise the JSON to comply exactly with the schema, correct any errors, and keep as close as possible to the user's intent.
Return a single \`json\` block only.
`;
    const secondResp = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: refinementPrompt, history, systemPrompt: null }),
    });
    const secondData = await secondResp.json();
    const secondRaw = secondData.response || secondData.responseMessage || '';
    const secondStructured = extractStructuredSpec(secondRaw);
    if (secondStructured && isValidSpec(secondStructured)) {
      model = secondStructured.model;
      explanation = secondStructured.explanation || explanation;
      if (modifiers.color) {
        if (model.type === 'primitive') model.color = modifiers.color;
        else if (model.type === 'composite') {
          model.components = model.components.map((c) => ({ ...c, color: modifiers.color }));
        }
      }
    }
  }

  return { model, explanation };
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
      const { model: newModel, explanation } = await interpretAndRefine(prompt, null, history);
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: explanation,
        timestamp: new Date(),
      };
      setDesigns((prev) =>
        prev.map((d) =>
          d.id === newDesign.id
            ? { ...d, messages: [...d.messages, botMessage], model: newModel }
            : d
        )
      );
      setIsLanding(false);
      showSnackbar('Design created!');
    } catch (e) {
      console.error(e);
      showSnackbar('Failed to generate model', 'error');
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
      const { model: newModel, explanation } = await interpretAndRefine(
        chatInput,
        activeDesign?.model,
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
          return { ...updated, messages: [...design.messages, botMessage] };
        })
      );
      showSnackbar('Response generated!');
    } catch (e) {
      console.error(e);
      showSnackbar('Failed to get assistant response', 'error');
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
    if (!activeDesign) return;

    const scene = new THREE.Scene();
    const spec = activeDesign.model || {
      type: 'primitive',
      primitive: 'box',
      scale: 1,
      color: '#8b8ac7',
    };

    const mergedGeometries = [];
    let material = new THREE.MeshStandardMaterial({ color: '#8b8ac7' });

    if (spec.type === 'composite' && Array.isArray(spec.components)) {
      spec.components.forEach((c) => {
        const prim = c.primitive || 'box';
        const scale = typeof c.scale === 'number' ? c.scale : 1;
        const color = c.color || '#8b8ac7';
        const offset = Array.isArray(c.offset) ? c.offset : [0, 0, 0];
        const rotation = Array.isArray(c.rotation) ? c.rotation : [0, 0, 0];
        const mesh = makeMesh(prim, scale, color, offset, rotation);
        mesh.updateMatrix();
        if (mesh.geometry) {
          const geomCopy = mesh.geometry.clone();
          geomCopy.applyMatrix4(mesh.matrix);
          mergedGeometries.push(geomCopy);
        }
        material = new THREE.MeshStandardMaterial({ color });
      });
    } else {
      const prim = spec.primitive || 'box';
      const scale = typeof spec.scale === 'number' ? spec.scale : 1;
      const color = spec.color || '#8b8ac7';
      const mesh = makeMesh(prim, scale, color);
      mesh.updateMatrix();
      if (mesh.geometry) {
        const geomCopy = mesh.geometry.clone();
        geomCopy.applyMatrix4(mesh.matrix);
        mergedGeometries.push(geomCopy);
      }
      material = new THREE.MeshStandardMaterial({ color });
    }

    let finalGeometry;
    if (mergedGeometries.length === 0) return;
    else if (mergedGeometries.length === 1) finalGeometry = mergedGeometries[0];
    else finalGeometry = mergeBufferGeometries(mergedGeometries, true);

    if (finalGeometry) finalGeometry.computeVertexNormals();
    const mergedMesh = new THREE.Mesh(finalGeometry, material);
    scene.add(mergedMesh);

    await exportSTL(scene, activeDesign.name);
    showSnackbar('STL exported successfully!');
  };

  const handleExportSCH = () => {
    handleExportClose();
    if (!activeDesign) return;
    exportSCH(activeDesign, activeDesign.name);
    showSnackbar('Schematic exported successfully!');
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
