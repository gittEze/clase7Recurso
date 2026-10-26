const nodesData = [
    { id: 'documentos', label: 'Documentos', type: 'root', parent: null, x: 500, y: 65, icon: 'fa-folder-open' },
    { id: 'informatica', label: 'Informática', type: 'folder', parent: 'documentos', x: 310, y: 175, icon: 'fa-folder' },
    { id: 'matematica', label: 'Matemática', type: 'folder', parent: 'documentos', x: 690, y: 175, icon: 'fa-folder' },
    { id: 'trabajos', label: 'Trabajos', type: 'folder', parent: 'informatica', x: 180, y: 290, icon: 'fa-folder' },
    { id: 'imagenes', label: 'Imágenes', type: 'folder', parent: 'informatica', x: 440, y: 290, icon: 'fa-folder' },
    { id: 'ejercicios.pdf', label: 'ejercicios.pdf', type: 'file-pdf', parent: 'matematica', x: 690, y: 290, icon: 'fa-file-pdf' },
    { id: 'grafos.docx', label: 'grafos.docx', type: 'file-word', parent: 'trabajos', x: 180, y: 405, icon: 'fa-file-word' },
    { id: 'árbol.png', label: 'árbol.png', type: 'file-image', parent: 'imagenes', x: 440, y: 405, icon: 'fa-file-image' }
];

const edgesData = [
    { from: 'documentos', to: 'informatica' },
    { from: 'documentos', to: 'matematica' },
    { from: 'informatica', to: 'trabajos' },
    { from: 'informatica', to: 'imagenes' },
    { from: 'matematica', to: 'ejercicios.pdf' },
    { from: 'trabajos', to: 'grafos.docx' },
    { from: 'imagenes', to: 'árbol.png' }
];

let currentSelectedId = 'documentos';
let showAllGraphNodes = false;
let illuminateAllEdges = false;
let customEdgeMode = false;
let customEdgeSource = null;
let customEdges = [];
const openFolders = new Set(['documentos']);

function initApp() {
    renderTree();
    setupEventListeners();
    selectElement('documentos');
    initClock();
}

function initClock() {
    const clockEl = document.getElementById('live-clock');
    if (!clockEl) return;
    const updateTime = () => {
        const now = new Date();
        clockEl.textContent = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    };
    updateTime();
    setInterval(updateTime, 1000);
}

function renderTree() {
    const connectionsLayer = document.getElementById('connections-layer');
    const nodesLayer = document.getElementById('nodes-layer');
    connectionsLayer.innerHTML = '';
    nodesLayer.innerHTML = '';

    edgesData.forEach(edge => {
        const parentNode = nodesData.find(n => n.id === edge.from);
        const childNode = nodesData.find(n => n.id === edge.to);
        if (!parentNode || !childNode) return;
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const midY = (parentNode.y + childNode.y) / 2;
        const d = `M ${parentNode.x} ${parentNode.y + 27} C ${parentNode.x} ${midY}, ${childNode.x} ${midY}, ${childNode.x} ${childNode.y - 27}`;
        path.setAttribute('d', d);
        path.setAttribute('class', 'svg-edge');
        path.setAttribute('data-from', edge.from);
        path.setAttribute('data-to', edge.to);
        const isVisible = showAllGraphNodes || isNodeVisible(edge.to);
        if (!isVisible) {
            path.style.opacity = '0';
            path.style.pointerEvents = 'none';
        } else {
            path.style.opacity = '1';
        }
        connectionsLayer.appendChild(path);
    });

    customEdges.forEach((edge, index) => {
        const fromNode = nodesData.find(n => n.id === edge.from);
        const toNode = nodesData.find(n => n.id === edge.to);
        if (!fromNode || !toNode) return;
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const d = `M ${fromNode.x} ${fromNode.y} L ${toNode.x} ${toNode.y}`;
        path.setAttribute('d', d);
        path.setAttribute('class', 'svg-edge custom-red');
        const isVisible = (showAllGraphNodes || isNodeVisible(edge.from)) && (showAllGraphNodes || isNodeVisible(edge.to));
        if (!isVisible) {
            path.style.opacity = '0';
            path.style.pointerEvents = 'none';
        } else {
            path.style.opacity = '1';
        }
        path.addEventListener('click', (e) => {
            e.stopPropagation();
            customEdges.splice(index, 1);
            renderTree();
            highlightAncestors(currentSelectedId);
            updateGlobalEdgesIllumination();
        });
        connectionsLayer.appendChild(path);
    });

    nodesData.forEach(node => {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        const isVisible = showAllGraphNodes || isNodeVisible(node.id);
        g.setAttribute('class', `svg-node ${node.type === 'root' ? 'root-node' : ''}`);
        g.setAttribute('data-id', node.id);
        g.setAttribute('transform', `translate(${node.x}, ${node.y})`);
        if (!isVisible) {
            g.style.opacity = '0';
            g.style.pointerEvents = 'none';
        } else {
            g.style.opacity = '1';
        }
        const width = 180;
        const height = 54;
        const x = -width / 2;
        const y = -height / 2;
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', x);
        rect.setAttribute('y', y);
        rect.setAttribute('width', width);
        rect.setAttribute('height', height);
        const foreign = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
        foreign.setAttribute('x', x);
        foreign.setAttribute('y', y);
        foreign.setAttribute('width', width);
        foreign.setAttribute('height', height);
        const div = document.createElement('div');
        div.style.cssText = 'display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; height: 100%; padding: 0 10px; pointer-events: none;';
        const icon = document.createElement('i');
        icon.className = `fa-solid ${node.icon}`;
        if (node.type === 'root') icon.style.color = '#79c0ff';
        else if (node.type === 'folder') icon.style.color = '#d2a8ff';
        else if (node.id.endsWith('.docx')) icon.style.color = '#58a6ff';
        else if (node.id.endsWith('.png')) icon.style.color = '#7ee787';
        else if (node.id.endsWith('.pdf')) icon.style.color = '#ff7b72';
        const span = document.createElement('span');
        span.style.cssText = 'font-size: 14px; font-weight: 500; color: #f0f6fc; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;';
        span.textContent = node.label;
        div.appendChild(icon);
        div.appendChild(span);
        foreign.appendChild(div);
        g.appendChild(rect);
        g.appendChild(foreign);
        g.addEventListener('click', () => {
            if (showAllGraphNodes || isNodeVisible(node.id)) {
                handleNodeClick(node.id);
            }
        });
        nodesLayer.appendChild(g);
    });

    updateGlobalEdgesIllumination();
}

function updateGlobalEdgesIllumination() {
    if (illuminateAllEdges) {
        requestAnimationFrame(() => {
            document.querySelectorAll('.svg-edge:not(.custom-red)').forEach(edge => {
                edge.classList.add('highlighted');
            });
        });
    }
}

function isNodeVisible(id) {
    if (id === 'documentos') return true;
    const node = nodesData.find(n => n.id === id);
    if (!node) return false;
    if (node.parent && openFolders.has(node.parent)) {
        return isNodeVisible(node.parent);
    }
    return false;
}

function handleNodeClick(id) {
    if (customEdgeMode) {
        if (!customEdgeSource) {
            customEdgeSource = id;
            document.querySelectorAll('.svg-node').forEach(el => {
                if (el.getAttribute('data-id') === id) {
                    el.querySelector('rect').style.stroke = '#cc625b';
                }
            });
        } else {
            if (customEdgeSource !== id) {
                const exists = customEdges.some(e => 
                    (e.from === customEdgeSource && e.to === id) || 
                    (e.from === id && e.to === customEdgeSource)
                );
                if (!exists) {
                    customEdges.push({ from: customEdgeSource, to: id });
                }
            }
            customEdgeSource = null;
            renderTree();
            highlightAncestors(currentSelectedId);
        }
    } else {
        selectElement(id);
    }
}

function setupEventListeners() {
    const itemContents = document.querySelectorAll('.sidebar .item-content');
    itemContents.forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = item.getAttribute('data-id');
            selectElement(id);
            const treeItem = item.closest('.tree-item');
            const subTree = treeItem.querySelector('.sub-tree');
            if (subTree) {
                const isOpen = openFolders.has(id);
                if (isOpen) {
                    openFolders.delete(id);
                    item.classList.remove('open');
                    subTree.classList.remove('open');
                } else {
                    openFolders.add(id);
                    item.classList.add('open');
                    subTree.classList.add('open');
                }
                renderTree();
                highlightAncestors(currentSelectedId);
            }
        });
    });

    window.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();
        if (key === 'q') {
            toggleGraphMode();
        } else if (key === 'w') {
            illuminateAllEdges = !illuminateAllEdges;
            if (illuminateAllEdges) {
                document.querySelectorAll('.svg-edge:not(.custom-red)').forEach(edge => {
                    edge.classList.add('highlighted');
                });
            } else {
                document.querySelectorAll('.svg-edge:not(.custom-red)').forEach(edge => {
                    edge.classList.remove('highlighted');
                });
                highlightAncestors(currentSelectedId);
            }
        } else if (key === 'e') {
            customEdgeMode = !customEdgeMode;
            customEdgeSource = null;
            if (!customEdgeMode) {
                renderTree();
                highlightAncestors(currentSelectedId);
            }
        }
    });
}

function toggleGraphMode() {
    showAllGraphNodes = !showAllGraphNodes;
    renderTree();
    highlightAncestors(currentSelectedId);
}

function selectElement(id) {
    currentSelectedId = id;
    document.querySelectorAll('.item-content').forEach(el => {
        if (el.getAttribute('data-id') === id) {
            el.classList.add('selected');
        } else {
            el.classList.remove('selected');
        }
    });
    document.querySelectorAll('.svg-node').forEach(nodeEl => {
        if (nodeEl.getAttribute('data-id') === id) {
            nodeEl.classList.add('selected');
        } else {
            nodeEl.classList.remove('selected');
        }
    });
    if (!illuminateAllEdges) {
        document.querySelectorAll('.svg-edge').forEach(edgeEl => {
            edgeEl.classList.remove('highlighted');
        });
        highlightAncestors(id);
    }
}

function highlightAncestors(id) {
    let currentNode = nodesData.find(n => n.id === id);
    while (currentNode && currentNode.parent) {
        const edge = document.querySelector(`.svg-edge[data-from="${currentNode.parent}"][data-to="${currentNode.id}"]`);
        if (edge && edge.style.opacity !== '0') {
            edge.classList.add('highlighted');
        }
        currentNode = nodesData.find(n => n.id === currentNode.parent);
    }
}

window.addEventListener('DOMContentLoaded', initApp);