const levelsData = [
    {
        mission: "Nivel 1: El siguiente grafo tiene un ciclo, elimina ese ciclo para lograr formar un grafo árbol.",
        instruction: "Posiciónate en la arista que quieras eliminar y haz clic en ella.",
        nodes: [
            { id: 'A', x: 320, y: 100 },
            { id: 'B', x: 180, y: 240 },
            { id: 'C', x: 460, y: 240 },
            { id: 'D', x: 460, y: 340 }
        ],
        edges: [
            { u: 'A', v: 'B' },
            { u: 'B', v: 'C' },
            { u: 'C', v: 'A' },
            { u: 'C', v: 'D' }
        ]
    },
    {
        mission: "Nivel 2: Hay un vértice aislado, genera un arista para lograr formar un árbol.",
        instruction: "Haz clic en un vértice y luego en otro para lograr formar una arista.",
        nodes: [
            { id: 'A', x: 320, y: 100 },
            { id: 'B', x: 180, y: 240 },
            { id: 'C', x: 320, y: 240 },
            { id: 'D', x: 460, y: 240 }
        ],
        edges: [
            { u: 'A', v: 'B' },
            { u: 'A', v: 'C' }
        ]
    },
    {
        mission: "Nivel 3: El siguiente grafo tiene un ciclo y hay un vértice aislado, elimina una arista para eliminar el ciclo y genera otra para lograr formar un árbol.",
        instruction: "Posiciónate en la arista que quieras eliminar y haz clic en ella, haz clic en un vértice y luego en otro para lograr formar una arista.",
        nodes: [
            { id: 'A', x: 320, y: 90 },
            { id: 'B', x: 180, y: 210 },
            { id: 'C', x: 460, y: 210 },
            { id: 'D', x: 180, y: 330 },
            { id: 'F', x: 460, y: 330 }
        ],
        edges: [
            { u: 'A', v: 'B' },
            { u: 'B', v: 'C' },
            { u: 'C', v: 'A' },
            { u: 'C', v: 'F' }
        ]
    },
    {
        mission: "Nivel 4: Hay dos vértice aislado, genera dos arista para lograr formar un árbol.",
        instruction: "Haz clic en un vértice y luego en otro para lograr formar una arista.",
        nodes: [
            { id: 'A', x: 320, y: 80 },
            { id: 'B', x: 320, y: 200 },
            { id: 'D', x: 320, y: 320 },
            { id: 'C', x: 160, y: 320 },
            { id: 'F', x: 480, y: 320 }
        ],
        edges: [
            { u: 'A', v: 'B' },
            { u: 'B', v: 'D' }
        ]
    }
];

let currentLevelIndex = 0;
let internalScore = 0;
let isGameOver = false;
let selectedNode = null;
let currentGraphNodes = [];
let currentGraphEdges = [];

const svg = document.getElementById('graph-svg');
const levelNumEl = document.getElementById('current-level-num');
const progressBarEl = document.getElementById('progress-bar');
const missionTextEl = document.getElementById('mission-text');
const instructionDetailEl = document.getElementById('instruction-detail');
const statusBoxEl = document.getElementById('status-box');
const continueBtnEl = document.getElementById('continue-btn');
const endModalEl = document.getElementById('end-modal');
const modalTitleEl = document.getElementById('modal-title');
const modalMessageEl = document.getElementById('modal-message');
const modalScoreDisplayEl = document.getElementById('modal-score-display');
const floatingNotificationEl = document.getElementById('floating-notification');
const realtimeClockEl = document.getElementById('realtime-clock');

function initGame() {
    loadLevel(0);
    window.addEventListener('keydown', handleKeyPress);
    startClock();
}

function startClock() {
    function updateClock() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        realtimeClockEl.textContent = `${hours}:${minutes}`;
    }
    updateClock();
    setInterval(updateClock, 1000);
}

function loadLevel(index) {
    currentLevelIndex = index;
    levelNumEl.textContent = currentLevelIndex + 1;
    // progressBarEl.style.width = `${((currentLevelIndex + 1) / levelsData.length) * 100}%`;
    missionTextEl.textContent = levelsData[currentLevelIndex].mission;
    instructionDetailEl.textContent = levelsData[currentLevelIndex].instruction;
    
    currentGraphNodes = JSON.parse(JSON.stringify(levelsData[currentLevelIndex].nodes));
    currentGraphEdges = JSON.parse(JSON.stringify(levelsData[currentLevelIndex].edges));
    
    selectedNode = null;
    updateStatus();
    renderGraph();
}

function renderGraph() {
    svg.innerHTML = '';
    
    currentGraphEdges.forEach((edge, idx) => {
        const nodeU = currentGraphNodes.find(n => n.id === edge.u);
        const nodeV = currentGraphNodes.find(n => n.id === edge.v);
        if (!nodeU || !nodeV) return;

        const lineHit = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        lineHit.setAttribute('x1', nodeU.x);
        lineHit.setAttribute('y1', nodeU.y);
        lineHit.setAttribute('x2', nodeV.x);
        lineHit.setAttribute('y2', nodeV.y);
        lineHit.setAttribute('class', 'edge-hit');
        lineHit.addEventListener('click', () => handleEdgeClick(idx));

        const lineVis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        lineVis.setAttribute('x1', nodeU.x);
        lineVis.setAttribute('y1', nodeU.y);
        lineVis.setAttribute('x2', nodeV.x);
        lineVis.setAttribute('y2', nodeV.y);
        lineVis.setAttribute('class', 'edge-visible');

        svg.appendChild(lineHit);
        svg.appendChild(lineVis);
    });

    currentGraphNodes.forEach(node => {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('class', 'node-group');
        g.addEventListener('click', () => handleNodeClick(node.id));

        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', node.x);
        circle.setAttribute('cy', node.y);
        circle.setAttribute('r', '24');
        circle.setAttribute('class', `node-circle ${selectedNode === node.id ? 'selected' : ''}`);

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', node.x);
        text.setAttribute('y', node.y);
        text.setAttribute('class', 'node-text');
        text.textContent = node.id;

        g.appendChild(circle);
        g.appendChild(text);
        svg.appendChild(g);
    });
}

function handleEdgeClick(edgeIndex) {
    if (isGameOver) return;
    currentGraphEdges.splice(edgeIndex, 1);
    renderGraph();
    checkGraphState();
}

function handleNodeClick(nodeId) {
    if (isGameOver) return;
    if (!selectedNode) {
        selectedNode = nodeId;
    } else {
        if (selectedNode !== nodeId) {
            addEdge(selectedNode, nodeId);
        }
        selectedNode = null;
    }
    renderGraph();
}

function addEdge(u, v) {
    const exists = currentGraphEdges.some(e => (e.u === u && e.v === v) || (e.u === v && e.v === u));
    if (!exists) {
        currentGraphEdges.push({ u, v });
        checkGraphState();
    }
}

function checkGraphState() {
    const isTreeValid = validateTree(currentGraphNodes, currentGraphEdges);
    if (isTreeValid) {
        statusBoxEl.textContent = "¡Árbol válido! Haz clic en Continuar";
        statusBoxEl.classList.add('success');
        continueBtnEl.disabled = false;
        continueBtnEl.classList.add('active');
    } else {
        statusBoxEl.textContent = "Estado: No es un árbol";
        statusBoxEl.classList.remove('success');
        continueBtnEl.disabled = true;
        continueBtnEl.classList.remove('active');
    }
}

function validateTree(nodes, edges) {
    const n = nodes.length;
    if (edges.length !== n - 1) return false;

    const adj = {};
    nodes.forEach(node => { adj[node.id] = []; });
    edges.forEach(edge => {
        if (adj[edge.u] && adj[edge.v]) {
            adj[edge.u].push(edge.v);
            adj[edge.v].push(edge.u);
        }
    });

    const visited = new Set();
    const queue = [nodes[0].id];
    visited.add(nodes[0].id);

    while (queue.length > 0) {
        const curr = queue.shift();
        adj[curr].forEach(neighbor => {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                queue.push(neighbor);
            }
        });
    }

    return visited.size === n;
}

function updateStatus() {
    checkGraphState();
}

function handleContinueClick() {
    if (isGameOver || continueBtnEl.disabled) return;
    isGameOver = true;
    internalScore += 100;
    showNotification();

    setTimeout(() => {
        if (currentLevelIndex < levelsData.length - 1) {
            isGameOver = false;
            continueBtnEl.disabled = true;
            continueBtnEl.classList.remove('active');
            loadLevel(currentLevelIndex + 1);
        } else {
            showEndModal(false);
        }
    }, 600);
}

function showNotification() {
    floatingNotificationEl.classList.add('show');
    setTimeout(() => {
        floatingNotificationEl.classList.remove('show');
    }, 1200);
}

function handleKeyPress(e) {
    if (e.key.toLowerCase() === 'f' && !isGameOver) {
        isGameOver = true;
        internalScore += 100;
        showEndModal(true);
    }
}

function showEndModal(forcedByF) {
    isGameOver = true;
    endModalEl.style.display = 'flex';
    
    // Muestra el total acumulado de puntos (incluye los puntos sumados al presionar F o completar los niveles)
    modalScoreDisplayEl.textContent = `${internalScore} puntos`;

    if (forcedByF) {
        modalTitleEl.textContent = "¡Juego Finalizado!";
        modalMessageEl.textContent = "Haz finalizado la actividad. ¡Buen trabajo!";
    } else {
        modalTitleEl.textContent = "¡Felicitaciones!";
        modalMessageEl.textContent = "Completaste exitosamente todos los niveles del desafío de grafos árbol.";
    }
}

window.addEventListener('DOMContentLoaded', initGame);