// Three.js loaded from CDN, available as global THREE object

// 导航逻辑
const navBtns = document.querySelectorAll('.nav-btn');
const sections = document.querySelectorAll('.section');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');

navBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const sectionId = btn.dataset.section;
    navigateTo(sectionId);
    mobileMenu.classList.remove('active');
  });
});

mobileMenuBtn.addEventListener('click', () => {
  mobileMenu.classList.toggle('active');
});

function navigateTo(sectionId) {
  sections.forEach(section => section.classList.remove('active'));
  document.getElementById(sectionId).classList.add('active');
  navBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.section === sectionId);
  });
}

// 三维可视化
let scene, camera, renderer, tubes = [];
let isRotating = true;
let currentPattern = 'star';
let numTubes = 320;
let tubeRadius = 0.014;

function initThree() {
  const container = document.getElementById('three-container');
  if (!container) return;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0f172a);

  camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.z = 5;

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0x6366f1, 0.8);
  directionalLight.position.set(5, 5, 5);
  scene.add(directionalLight);

  const pointLight = new THREE.PointLight(0x06b6d4, 0.5);
  pointLight.position.set(-5, -5, 5);
  scene.add(pointLight);

  createTubes();
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });

  // 鼠标交互
  let isDragging = false;
  let previousMousePosition = { x: 0, y: 0 };

  container.addEventListener('mousedown', (e) => {
    isDragging = true;
    previousMousePosition = { x: e.clientX, y: e.clientY };
  });

  container.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const deltaMove = {
      x: e.clientX - previousMousePosition.x,
      y: e.clientY - previousMousePosition.y
    };
    scene.rotation.y += deltaMove.x * 0.005;
    scene.rotation.x += deltaMove.y * 0.005;
    previousMousePosition = { x: e.clientX, y: e.clientY };
  });

  container.addEventListener('mouseup', () => {
    isDragging = false;
  });

  container.addEventListener('wheel', (e) => {
    e.preventDefault();
    camera.position.z = Math.max(2, Math.min(10, camera.position.z + e.deltaY * 0.005));
  });
}

function createTubes() {
  // 清除旧的管
  tubes.forEach(tube => scene.remove(tube));
  tubes = [];

  const geometry = new THREE.CylinderGeometry(tubeRadius, tubeRadius, 1.5, 8);
  const material = new THREE.MeshPhongMaterial({
    color: 0x6366f1,
    transparent: true,
    opacity: 0.6,
    side: THREE.DoubleSide
  });

  switch (currentPattern) {
    case 'star':
      createStarPattern(geometry, material);
      break;
    case 'scattered':
      createScatteredPattern(geometry, material);
      break;
    case 'sticky':
      createStickyPattern(geometry, material);
      break;
    case 'grain':
      createGrainPattern(geometry, material);
      break;
  }
}

function createStarPattern(geometry, material) {
  for (let i = 0; i < numTubes; i++) {
    const tube = new THREE.Mesh(geometry, material);
    
    const theta = (i / numTubes) * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    
    const direction = new THREE.Vector3(
      Math.sin(phi) * Math.cos(theta),
      Math.sin(phi) * Math.sin(theta),
      Math.cos(phi)
    );
    
    tube.position.set(0, 0, 0);
    tube.lookAt(direction);
    tube.position.copy(direction.clone().multiplyScalar(0.25));
    
    tubes.push(tube);
    scene.add(tube);
  }
}

function createScatteredPattern(geometry, material) {
  for (let i = 0; i < numTubes; i++) {
    const tube = new THREE.Mesh(geometry, material);
    
    const theta = (i / numTubes) * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    
    const direction = new THREE.Vector3(
      Math.sin(phi) * Math.cos(theta),
      Math.sin(phi) * Math.sin(theta),
      Math.cos(phi)
    );
    
    const offset = new THREE.Vector3(
      (Math.random() - 0.5) * 0.8,
      (Math.random() - 0.5) * 0.8,
      (Math.random() - 0.5) * 0.8
    );
    
    tube.position.copy(offset);
    tube.lookAt(offset.clone().add(direction));
    
    tubes.push(tube);
    scene.add(tube);
  }
}

function createStickyPattern(geometry, material) {
  const groups = 8;
  const tubesPerGroup = Math.floor(numTubes / groups);
  
  for (let g = 0; g < groups; g++) {
    const groupCenter = new THREE.Vector3(
      Math.cos((g / groups) * Math.PI * 2) * 0.4,
      Math.sin((g / groups) * Math.PI * 2) * 0.4,
      (Math.random() - 0.5) * 0.3
    );
    
    for (let i = 0; i < tubesPerGroup; i++) {
      const tube = new THREE.Mesh(geometry, material);
      
      const angle = (i / tubesPerGroup) * Math.PI * 2;
      const spread = 0.3;
      const direction = new THREE.Vector3(
        Math.cos(angle) * (1 + (Math.random() - 0.5) * spread),
        Math.sin(angle) * (1 + (Math.random() - 0.5) * spread),
        (Math.random() - 0.5) * spread
      ).normalize();
      
      tube.position.copy(groupCenter);
      tube.lookAt(groupCenter.clone().add(direction));
      
      tubes.push(tube);
      scene.add(tube);
    }
  }
}

function createGrainPattern(geometry, material) {
  const gridSize = 6;
  const tubesPerCell = Math.floor(numTubes / (gridSize * gridSize));
  
  for (let x = -gridSize/2; x < gridSize/2; x++) {
    for (let y = -gridSize/2; y < gridSize/2; y++) {
      const cellCenter = new THREE.Vector3(x * 0.3, y * 0.3, 0);
      
      for (let i = 0; i < tubesPerCell; i++) {
        const tube = new THREE.Mesh(geometry, material);
        
        const layer = Math.floor(i / 3);
        const withinLayer = i % 3;
        
        let direction;
        if (layer % 3 === 0) {
          direction = new THREE.Vector3(1, 0, (withinLayer - 1) * 0.3).normalize();
        } else if (layer % 3 === 1) {
          direction = new THREE.Vector3(0, 1, (withinLayer - 1) * 0.3).normalize();
        } else {
          direction = new THREE.Vector3((withinLayer - 1) * 0.3, (withinLayer - 1) * 0.3, 1).normalize();
        }
        
        tube.position.copy(cellCenter);
        tube.lookAt(cellCenter.clone().add(direction));
        
        tubes.push(tube);
        scene.add(tube);
      }
    }
  }
}

function animate() {
  requestAnimationFrame(animate);
  
  if (isRotating) {
    scene.rotation.y += 0.003;
  }
  
  renderer.render(scene, camera);
}

// 三维实验控制
const patternButtons = document.querySelectorAll('.pattern-btn');
patternButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    patternButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentPattern = btn.dataset.pattern;
    createTubes();
  });
});

const tubeCountSlider = document.getElementById('tubeCount');
const tubeCountValue = document.getElementById('tubeCountValue');
tubeCountSlider.addEventListener('input', (e) => {
  numTubes = parseInt(e.target.value);
  tubeCountValue.textContent = numTubes;
  createTubes();
});

const radiusSlider = document.getElementById('tubeRadius');
const radiusValue = document.getElementById('radiusValue');
radiusSlider.addEventListener('input', (e) => {
  tubeRadius = parseFloat(e.target.value);
  radiusValue.textContent = tubeRadius.toFixed(3);
  createTubes();
});

const pauseBtn = document.getElementById('pauseBtn');
pauseBtn.addEventListener('click', () => {
  isRotating = !isRotating;
  pauseBtn.textContent = isRotating ? '⏸ 暂停旋转' : '▶ 继续旋转';
});

const startBtn = document.getElementById('startBtn');
startBtn.addEventListener('click', () => {
  navigateTo('experiment-2d');
});

// 二维直觉实验
let canvas2d, ctx2d;
let directionCount = 60;
let compression = 0.5;
let mode = 'center';

function initCanvas2d() {
  canvas2d = document.getElementById('canvas2d');
  if (!canvas2d) return;
  
  ctx2d = canvas2d.getContext('2d');
  canvas2d.width = canvas2d.offsetWidth;
  canvas2d.height = canvas2d.offsetHeight;
  
  draw2dExperiment();
  
  window.addEventListener('resize', () => {
    canvas2d.width = canvas2d.offsetWidth;
    canvas2d.height = canvas2d.offsetHeight;
    draw2dExperiment();
  });
}

const directionSlider = document.getElementById('directionCount');
const directionValue = document.getElementById('directionValue');
directionSlider.addEventListener('input', (e) => {
  directionCount = parseInt(e.target.value);
  directionValue.textContent = directionCount;
  draw2dExperiment();
});

const compressionSlider = document.getElementById('compression');
const compressionValue = document.getElementById('compressionValue');
compressionSlider.addEventListener('input', (e) => {
  compression = parseFloat(e.target.value);
  compressionValue.textContent = compression;
  draw2dExperiment();
});

const modeSelect = document.getElementById('modeSelect');
modeSelect.addEventListener('change', (e) => {
  mode = e.target.value;
  draw2dExperiment();
});

function draw2dExperiment() {
  if (!ctx2d) return;
  
  const width = canvas2d.width;
  const height = canvas2d.height;
  const centerX = width / 2;
  const centerY = height / 2;
  const scale = Math.min(width, height) * 0.3;
  
  ctx2d.fillStyle = '#1e293b';
  ctx2d.fillRect(0, 0, width, height);
  
  ctx2d.strokeStyle = '#334155';
  ctx2d.lineWidth = 1;
  ctx2d.beginPath();
  ctx2d.arc(centerX, centerY, scale, 0, Math.PI * 2);
  ctx2d.stroke();
  
  const imageData = ctx2d.getImageData(0, 0, width, height);
  const pixels = imageData.data;
  
  let drawnSegments = 0;
  
  for (let i = 0; i < directionCount; i++) {
    const angle = (i / directionCount) * Math.PI * 2;
    
    let x1, y1, x2, y2;
    
    switch (mode) {
      case 'center':
        x1 = centerX - Math.cos(angle) * scale * compression;
        y1 = centerY - Math.sin(angle) * scale * compression;
        x2 = centerX + Math.cos(angle) * scale * compression;
        y2 = centerY + Math.sin(angle) * scale * compression;
        break;
      case 'offset':
        const offset = (i % 3 - 1) * scale * 0.2;
        x1 = centerX - Math.cos(angle) * scale + offset * Math.sin(angle);
        y1 = centerY - Math.sin(angle) * scale + offset * Math.cos(angle);
        x2 = centerX + Math.cos(angle) * scale + offset * Math.sin(angle);
        y2 = centerY + Math.sin(angle) * scale + offset * Math.cos(angle);
        break;
      case 'bundle':
        const bundleSize = 5;
        const bundleIndex = Math.floor(i / bundleSize);
        const withinBundle = i % bundleSize;
        const baseAngle = (bundleIndex / (directionCount / bundleSize)) * Math.PI * 2;
        const spread = (withinBundle - bundleSize / 2) * 0.1;
        const bundleAngle = baseAngle + spread;
        x1 = centerX - Math.cos(bundleAngle) * scale * compression;
        y1 = centerY - Math.sin(bundleAngle) * scale * compression;
        x2 = centerX + Math.cos(bundleAngle) * scale * compression;
        y2 = centerY + Math.sin(bundleAngle) * scale * compression;
        break;
    }
    
    ctx2d.beginPath();
    ctx2d.moveTo(x1, y1);
    ctx2d.lineTo(x2, y2);
    ctx2d.strokeStyle = `rgba(99, 102, 241, ${0.8 / Math.sqrt(directionCount)})`;
    ctx2d.lineWidth = 1;
    ctx2d.stroke();
    
    drawnSegments++;
  }
  
  ctx2d.putImageData(imageData, 0, 0);
  
  updateStats(width, height);
}

function updateStats(width, height) {
  const imageData = ctx2d.getImageData(0, 0, width, height);
  const pixels = imageData.data;
  let coveredPixels = 0;
  
  for (let i = 3; i < pixels.length; i += 4) {
    if (pixels[i] > 0) {
      coveredPixels++;
    }
  }
  
  const totalPixels = width * height;
  const coverage = (coveredPixels / totalPixels * 100).toFixed(1);
  
  document.getElementById('segmentCount').textContent = directionCount;
  document.getElementById('coverageRatio').textContent = coverage + '%';
}

// δ邻域可视化
let deltaCanvas, deltaCtx;
let delta = 0.05;

function initDeltaCanvas() {
  deltaCanvas = document.getElementById('deltaCanvas');
  if (!deltaCanvas) return;
  
  deltaCtx = deltaCanvas.getContext('2d');
  deltaCanvas.width = deltaCanvas.offsetWidth;
  deltaCanvas.height = deltaCanvas.offsetHeight;
  
  drawDeltaExperiment();
  
  window.addEventListener('resize', () => {
    deltaCanvas.width = deltaCanvas.offsetWidth;
    deltaCanvas.height = deltaCanvas.offsetHeight;
    drawDeltaExperiment();
  });
}

const deltaSlider = document.getElementById('deltaSlider');
const deltaValue = document.getElementById('deltaValue');
deltaSlider.addEventListener('input', (e) => {
  delta = parseFloat(e.target.value);
  deltaValue.textContent = delta;
  drawDeltaExperiment();
});

function drawDeltaExperiment() {
  if (!deltaCtx) return;
  
  const width = deltaCanvas.width;
  const height = deltaCanvas.height;
  const centerX = width / 2;
  const centerY = height / 2;
  const scale = Math.min(width, height) * 0.3;
  
  deltaCtx.fillStyle = '#1e293b';
  deltaCtx.fillRect(0, 0, width, height);
  
  const numLines = 12;
  
  for (let i = 0; i < numLines; i++) {
    const angle = (i / numLines) * Math.PI * 2;
    const x1 = centerX - Math.cos(angle) * scale;
    const y1 = centerY - Math.sin(angle) * scale;
    const x2 = centerX + Math.cos(angle) * scale;
    const y2 = centerY + Math.sin(angle) * scale;
    
    const tubeWidth = delta * scale * 10;
    
    deltaCtx.beginPath();
    deltaCtx.moveTo(x1, y1);
    deltaCtx.lineTo(x2, y2);
    deltaCtx.strokeStyle = 'rgba(99, 102, 241, 0.3)';
    deltaCtx.lineWidth = tubeWidth;
    deltaCtx.lineCap = 'round';
    deltaCtx.stroke();
    
    deltaCtx.beginPath();
    deltaCtx.moveTo(x1, y1);
    deltaCtx.lineTo(x2, y2);
    deltaCtx.strokeStyle = '#6366f1';
    deltaCtx.lineWidth = 1;
    deltaCtx.stroke();
  }
  
  const textY = height - 30;
  deltaCtx.fillStyle = '#94a3b8';
  deltaCtx.font = '14px sans-serif';
  deltaCtx.textAlign = 'center';
  deltaCtx.fillText(`δ = ${delta}`, centerX, textY);
}

// 证明地图切换
const toggleBtns = document.querySelectorAll('.toggle-btn');
toggleBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const layer = btn.dataset.layer;
    
    toggleBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    document.querySelectorAll('.layer-content').forEach(content => {
      if (content.classList.contains(layer)) {
        content.style.display = 'block';
      } else {
        content.style.display = 'none';
      }
    });
  });
});

// Kakeya维数估计实验
let dimensionCanvas, dimensionCtx;
let structureType = 'true3d';
let noiseLevel = 0.1;

function initDimensionCanvas() {
  dimensionCanvas = document.getElementById('dimensionCanvas');
  if (!dimensionCanvas) return;
  
  dimensionCtx = dimensionCanvas.getContext('2d');
  dimensionCanvas.width = dimensionCanvas.offsetWidth;
  dimensionCanvas.height = dimensionCanvas.offsetHeight;
  
  drawDimensionExperiment();
  
  window.addEventListener('resize', () => {
    dimensionCanvas.width = dimensionCanvas.offsetWidth;
    dimensionCanvas.height = dimensionCanvas.offsetHeight;
    drawDimensionExperiment();
  });
}

const structureSelect = document.getElementById('structureType');
const noiseSlider = document.getElementById('noiseLevel');
const noiseValue = document.getElementById('noiseValue');

structureSelect.addEventListener('change', (e) => {
  structureType = e.target.value;
  drawDimensionExperiment();
});

noiseSlider.addEventListener('input', (e) => {
  noiseLevel = parseFloat(e.target.value);
  noiseValue.textContent = noiseLevel;
  drawDimensionExperiment();
});

function generateStructure(type, width, height, noise) {
  const data = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let value = 0;
      const nx = (x / width - 0.5) * 2;
      const ny = (y / height - 0.5) * 2;
      
      switch (type) {
        case 'true3d':
          value = Math.sin(nx * Math.PI * 4) * Math.cos(ny * Math.PI * 4) + 
                  Math.sin(nx * Math.PI * 2) * Math.sin(ny * Math.PI * 2);
          break;
        case 'thin':
          value = Math.sin(nx * Math.PI * 8) * Math.exp(-ny * ny * 4);
          break;
        case 'needle':
          value = Math.exp(-nx * nx * 30) * Math.exp(-ny * ny * 30) * 5;
          break;
        case 'kakeya':
          for (let i = 0; i < 30; i++) {
            const angle = (i / 30) * Math.PI * 2;
            const cx = Math.cos(angle) * 0.3;
            const cy = Math.sin(angle) * 0.3;
            const dist = Math.abs((nx - cx) * Math.cos(angle) + (ny - cy) * Math.sin(angle));
            if (dist < 0.05) {
              value += Math.exp(-dist * 50);
            }
          }
          break;
      }
      
      value += (Math.random() - 0.5) * noise * 2;
      data.push(Math.max(0, Math.min(1, (value + 2) / 4)));
    }
  }
  return data;
}

function estimateKakeyaDimension(data, width, height) {
  let gradX = 0, gradY = 0, gradZ = 0;
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      gradX += Math.abs(data[idx] - data[idx - 1]);
      gradY += Math.abs(data[idx] - data[idx - width]);
    }
  }
  
  gradZ = (gradX + gradY) / 2;
  const total = gradX + gradY + gradZ + 1e-8;
  const normalized = [gradX, gradY, gradZ].map(v => v / total);
  
  const entropy = -normalized.reduce((acc, v) => acc + v * Math.log(v + 1e-8), 0) / Math.log(3);
  const kakeyaDim = 1 + 2 * entropy;
  
  const imbalance = Math.max(...normalized) - Math.min(...normalized);
  
  return { kakeyaDim, imbalance, normalized };
}

function drawDimensionExperiment() {
  if (!dimensionCtx) return;
  
  const width = dimensionCanvas.width;
  const height = dimensionCanvas.height;
  
  dimensionCtx.fillStyle = '#1e293b';
  dimensionCtx.fillRect(0, 0, width, height);
  
  const data = generateStructure(structureType, width, height, noiseLevel);
  
  const imageData = dimensionCtx.createImageData(width, height);
  const pixels = imageData.data;
  
  for (let i = 0; i < data.length; i++) {
    const val = Math.floor(data[i] * 255);
    pixels[i * 4] = val;
    pixels[i * 4 + 1] = Math.floor(val * 0.7);
    pixels[i * 4 + 2] = Math.floor(val * 1.3);
    pixels[i * 4 + 3] = 255;
  }
  
  dimensionCtx.putImageData(imageData, 0, 0);
  
  const result = estimateKakeyaDimension(data, width, height);
  
  document.getElementById('kakeyaDim').textContent = result.kakeyaDim.toFixed(2);
  document.getElementById('energyImbalance').textContent = result.imbalance.toFixed(3);
  document.getElementById('energyX').textContent = (result.normalized[0] * 100).toFixed(1) + '%';
  document.getElementById('energyY').textContent = (result.normalized[1] * 100).toFixed(1) + '%';
  document.getElementById('energyZ').textContent = (result.normalized[2] * 100).toFixed(1) + '%';
}

// 多尺度颗粒化采样实验
let scaleCanvas, scaleCtx;
let currentScale = 4;
let grainCount = 16;
let samplingMode = 'uniform';

function initScaleCanvas() {
  scaleCanvas = document.getElementById('scaleCanvas');
  if (!scaleCanvas) return;
  
  scaleCtx = scaleCanvas.getContext('2d');
  scaleCanvas.width = scaleCanvas.offsetWidth;
  scaleCanvas.height = scaleCanvas.offsetHeight;
  
  drawScaleExperiment();
  
  window.addEventListener('resize', () => {
    scaleCanvas.width = scaleCanvas.offsetWidth;
    scaleCanvas.height = scaleCanvas.offsetHeight;
    drawScaleExperiment();
  });
}

const scaleSlider = document.getElementById('currentScale');
const scaleValue = document.getElementById('scaleValue');
const grainSlider = document.getElementById('grainCount');
const grainValue = document.getElementById('grainValue');
const samplingSelect = document.getElementById('samplingMode');

scaleSlider.addEventListener('input', (e) => {
  currentScale = parseInt(e.target.value);
  scaleValue.textContent = currentScale;
  drawScaleExperiment();
});

grainSlider.addEventListener('input', (e) => {
  grainCount = parseInt(e.target.value);
  grainValue.textContent = grainCount;
  drawScaleExperiment();
});

samplingSelect.addEventListener('change', (e) => {
  samplingMode = e.target.value;
  drawScaleExperiment();
});

function drawScaleExperiment() {
  if (!scaleCtx) return;
  
  const width = scaleCanvas.width;
  const height = scaleCanvas.height;
  
  scaleCtx.fillStyle = '#1e293b';
  scaleCtx.fillRect(0, 0, width, height);
  
  const gridSize = Math.floor(Math.sqrt(grainCount));
  const cellWidth = width / gridSize;
  const cellHeight = height / gridSize;
  
  let samples = [];
  let totalSamples = 0;
  
  for (let gy = 0; gy < gridSize; gy++) {
    for (let gx = 0; gx < gridSize; gx++) {
      const cx = gx * cellWidth + cellWidth / 2;
      const cy = gy * cellHeight + cellHeight / 2;
      
      let sampleCount = 1;
      if (samplingMode === 'adaptive') {
        const complexity = Math.sin(gx * 0.5) * Math.cos(gy * 0.5) + 0.5;
        sampleCount = Math.floor(1 + complexity * 4);
      } else if (samplingMode === 'directional') {
        sampleCount = 3;
      }
      
      totalSamples += sampleCount;
      
      for (let i = 0; i < sampleCount; i++) {
        let sx = cx;
        let sy = cy;
        
        if (samplingMode === 'adaptive') {
          sx += (Math.random() - 0.5) * cellWidth * 0.3;
          sy += (Math.random() - 0.5) * cellHeight * 0.3;
        } else if (samplingMode === 'directional') {
          const angle = (i / sampleCount) * Math.PI * 2;
          sx += Math.cos(angle) * 10;
          sy += Math.sin(angle) * 10;
        }
        
        samples.push({ x: sx, y: sy, size: 2 + sampleCount });
      }
      
      scaleCtx.strokeStyle = 'rgba(51, 65, 85, 0.5)';
      scaleCtx.lineWidth = 1;
      scaleCtx.strokeRect(gx * cellWidth, gy * cellHeight, cellWidth, cellHeight);
    }
  }
  
  samples.forEach(sample => {
    scaleCtx.beginPath();
    scaleCtx.arc(sample.x, sample.y, sample.size, 0, Math.PI * 2);
    scaleCtx.fillStyle = samplingMode === 'uniform' ? '#6366f1' : 
                         samplingMode === 'adaptive' ? '#06b6d4' : '#8b5cf6';
    scaleCtx.fill();
  });
  
  const coverage = (totalSamples / (width * height / 100) * 100).toFixed(1);
  const infoGain = samplingMode === 'adaptive' ? '75-95' : 
                   samplingMode === 'directional' ? '60-85' : '50-70';
  
  document.getElementById('sampleCount').textContent = totalSamples;
  document.getElementById('infoGain').textContent = infoGain + '%';
  document.getElementById('coverage').textContent = coverage + '%';
}

// 波包分解实验
let waveCanvas, waveCtx;
let waveScales = 4;
let waveDirections = 8;
let waveMode = 'sum';
let currentWavePacket = 0;

function initWaveCanvas() {
  waveCanvas = document.getElementById('waveCanvas');
  if (!waveCanvas) return;
  
  waveCtx = waveCanvas.getContext('2d');
  waveCanvas.width = waveCanvas.offsetWidth;
  waveCanvas.height = waveCanvas.offsetHeight;
  
  drawWaveExperiment();
  
  window.addEventListener('resize', () => {
    waveCanvas.width = waveCanvas.offsetWidth;
    waveCanvas.height = waveCanvas.offsetHeight;
    drawWaveExperiment();
  });
}

const waveScalesSlider = document.getElementById('waveScales');
const waveScalesValue = document.getElementById('waveScalesValue');
const waveDirectionsSlider = document.getElementById('waveDirections');
const waveDirectionsValue = document.getElementById('waveDirectionsValue');
const waveModeSelect = document.getElementById('waveMode');

waveScalesSlider.addEventListener('input', (e) => {
  waveScales = parseInt(e.target.value);
  waveScalesValue.textContent = waveScales;
  drawWaveExperiment();
});

waveDirectionsSlider.addEventListener('input', (e) => {
  waveDirections = parseInt(e.target.value);
  waveDirectionsValue.textContent = waveDirections;
  drawWaveExperiment();
});

waveModeSelect.addEventListener('change', (e) => {
  waveMode = e.target.value;
  drawWaveExperiment();
});

function createWavePacket(x, y, sigma, angle, width, height) {
  const packet = [];
  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      const dx = px - x;
      const dy = py - y;
      
      const rotX = dx * Math.cos(angle) + dy * Math.sin(angle);
      const rotY = -dx * Math.sin(angle) + dy * Math.cos(angle);
      
      const value = Math.exp(-(rotX * rotX) / (2 * sigma * sigma) - (rotY * rotY) / (2 * (sigma / 3) * (sigma / 3)));
      packet.push(value);
    }
  }
  return packet;
}

function drawWaveExperiment() {
  if (!waveCtx) return;
  
  const width = waveCanvas.width;
  const height = waveCanvas.height;
  
  waveCtx.fillStyle = '#1e293b';
  waveCtx.fillRect(0, 0, width, height);
  
  const centerX = width / 2;
  const centerY = height / 2;
  
  let totalEnergy = 0;
  let highFreqEnergy = 0;
  const directionCounts = new Array(waveDirections).fill(0);
  
  if (waveMode === 'sum') {
    const imageData = waveCtx.createImageData(width, height);
    const pixels = imageData.data;
    
    for (let scale = 0; scale < waveScales; scale++) {
      const sigma = 30 / Math.pow(2, scale);
      
      for (let dir = 0; dir < waveDirections; dir++) {
        const angle = (dir / waveDirections) * Math.PI * 2;
        const packet = createWavePacket(centerX, centerY, sigma, angle, width, height);
        
        for (let i = 0; i < packet.length; i++) {
          const energy = packet[i];
          totalEnergy += energy;
          if (scale >= waveScales - 2) highFreqEnergy += energy;
          directionCounts[dir] += energy;
          
          pixels[i * 4] = Math.min(255, pixels[i * 4] + Math.floor(energy * 200));
          pixels[i * 4 + 1] = Math.min(255, pixels[i * 4 + 1] + Math.floor(energy * 150));
          pixels[i * 4 + 2] = Math.min(255, pixels[i * 4 + 2] + Math.floor(energy * 255));
        }
      }
    }
    
    waveCtx.putImageData(imageData, 0, 0);
  } else if (waveMode === 'individual') {
    const sigma = 30 / Math.pow(2, currentWavePacket % waveScales);
    const angle = ((currentWavePacket % waveDirections) / waveDirections) * Math.PI * 2;
    const packet = createWavePacket(centerX, centerY, sigma, angle, width, height);
    
    const imageData = waveCtx.createImageData(width, height);
    const pixels = imageData.data;
    
    for (let i = 0; i < packet.length; i++) {
      const val = Math.floor(packet[i] * 255);
      pixels[i * 4] = val;
      pixels[i * 4 + 1] = Math.floor(val * 0.7);
      pixels[i * 4 + 2] = Math.floor(val * 1.3);
      pixels[i * 4 + 3] = 255;
    }
    
    waveCtx.putImageData(imageData, 0, 0);
    
    waveCtx.fillStyle = '#fff';
    waveCtx.font = '14px sans-serif';
    waveCtx.fillText(`波包 ${currentWavePacket + 1} / ${waveScales * waveDirections}`, 10, 25);
    
    setTimeout(() => {
      currentWavePacket = (currentWavePacket + 1) % (waveScales * waveDirections);
      if (waveMode === 'individual') drawWaveExperiment();
    }, 500);
  } else if (waveMode === 'energy') {
    const barWidth = width / (waveScales * waveDirections);
    
    for (let scale = 0; scale < waveScales; scale++) {
      for (let dir = 0; dir < waveDirections; dir++) {
        const index = scale * waveDirections + dir;
        const energy = 1 / (scale + 1);
        const barHeight = energy * height * 0.8;
        
        const hue = (dir / waveDirections) * 360;
        waveCtx.fillStyle = `hsl(${hue}, 70%, ${40 + scale * 10}%)`;
        waveCtx.fillRect(index * barWidth, height - barHeight, barWidth - 2, barHeight);
      }
    }
  }
  
  const maxDir = Math.max(...directionCounts);
  const minDir = Math.min(...directionCounts);
  const uniformity = maxDir > 0 ? ((1 - (maxDir - minDir) / maxDir) * 100).toFixed(1) : '100';
  
  document.getElementById('wavePacketCount').textContent = waveScales * waveDirections;
  document.getElementById('highFreqEnergy').textContent = totalEnergy > 0 ? ((highFreqEnergy / totalEnergy) * 100).toFixed(1) + '%' : '0%';
  document.getElementById('directionUniformity').textContent = uniformity + '%';
}

// 初始化
window.addEventListener('DOMContentLoaded', () => {
  initThree();
  initCanvas2d();
  initDeltaCanvas();
  initDimensionCanvas();
  initScaleCanvas();
  initWaveCanvas();
});