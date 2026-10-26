const grafosData = [
    { 
        id: 1, 
        name: "Grafo 1", 
        vertices: "V = {A,B,C,D,E}", 
        edges: "E = {{A,B},{A,C},{D,E}}", 
        answers: [false, true, false] 
    },
    { 
        id: 2, 
        name: "Grafo 2", 
        vertices: "V = {A,B,C,D,E}", 
        edges: "E = {{A,B},{A,C},{D,E}}", 
        answers: [true, false, false] 
    },
    { 
        id: 3, 
        name: "Grafo 3", 
        vertices: "V = {A,B,C,D,E}", 
        edges: "E = {{A,B},{A,C},{D,E}}", 
        answers: [true, true, true] 
    },
    { 
        id: 4, 
        name: "Grafo 4", 
        vertices: "V = {A,B,C,D,E}", 
        edges: "E = {{A,B},{A,C},{D,E}}", 
        answers: [false, false, false] 
    }
];

const questionTexts = [
    "¿Es un grafo conexo?",
    "¿Es un grafo acíclico?",
    "¿Es un grafo árbol?"
];

let userState = {
    1: { completed: false, answers: [null, null, null] },
    2: { completed: false, answers: [null, null, null] },
    3: { completed: false, answers: [null, null, null] },
    4: { completed: false, answers: [null, null, null] }
};

let currentGraphId = null;

const gridView = document.getElementById('grid-view');
const expandedView = document.getElementById('expanded-view');
const cardsContainer = document.getElementById('cards-container');
const expandedImg = document.getElementById('expanded-img');
const questionsContainer = document.getElementById('questions-container');
const btnContinuar = document.getElementById('btn-continuar');
const feedbackMessage = document.getElementById('feedback-message');
const overlay3 = document.getElementById('overlay-3');

function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateAllImages();
}

// Devuelve siempre img/grafoXl.png o img/grafoXd.png según el tema actual
function getGraphImagePath(id) {
    const theme = document.documentElement.getAttribute('data-theme') || 'light';
    const modeSuffix = theme === 'dark' ? 'd' : 'l';
    return `img/grafo${id}${modeSuffix}.png`;
}

function updateAllImages() {
    grafosData.forEach(grafo => {
        const imgEl = document.getElementById(`img-card-${grafo.id}`);
        if (imgEl) {
            imgEl.src = getGraphImagePath(grafo.id);
        }
    });
    if (currentGraphId !== null) {
        expandedImg.src = getGraphImagePath(currentGraphId);
    }
}

function createGrid() {
    cardsContainer.innerHTML = '';
    grafosData.forEach(grafo => {
        const card = document.createElement('div');
        card.className = 'card';
        card.onclick = () => openExpandedView(grafo.id);

        const tick = document.createElement('div');
        tick.className = `tick-icon ${userState[grafo.id].completed ? 'visible' : ''}`;
        tick.innerHTML = '✓';
        tick.id = `tick-${grafo.id}`;

        const imgContainer = document.createElement('div');
        imgContainer.className = 'card-img-container';
        
        const img = document.createElement('img');
        img.id = `img-card-${grafo.id}`;
        img.src = getGraphImagePath(grafo.id);
        img.alt = grafo.name;
        imgContainer.appendChild(img);

        const infoContainer = document.createElement('div');
        infoContainer.className = 'card-info';

        const title = document.createElement('div');
        title.className = 'card-title';
        title.textContent = `${grafo.name}:`;

        const vertices = document.createElement('div');
        vertices.className = 'card-math';
        vertices.textContent = grafo.vertices;

        const edges = document.createElement('div');
        edges.className = 'card-math';
        edges.textContent = grafo.edges;

        const questionsList = document.createElement('ul');
        questionsList.className = 'card-questions';

        questionTexts.forEach((qText, index) => {
            const li = document.createElement('li');
            
            const spanText = document.createElement('span');
            spanText.textContent = qText;
            li.appendChild(spanText);

            const userAns = userState[grafo.id].answers[index];
            if (userAns !== null) {
                const badge = document.createElement('span');
                badge.className = 'answer-badge';
                badge.textContent = userAns ? 'Sí' : 'No';
                li.appendChild(badge);
            }

            questionsList.appendChild(li);
        });

        infoContainer.appendChild(title);
        infoContainer.appendChild(vertices);
        infoContainer.appendChild(edges);
        infoContainer.appendChild(questionsList);

        card.appendChild(tick);
        card.appendChild(imgContainer);
        card.appendChild(infoContainer);
        cardsContainer.appendChild(card);
    });
}

function openExpandedView(id) {
    currentGraphId = id;
    expandedImg.src = getGraphImagePath(id);
    feedbackMessage.className = 'hidden';
    feedbackMessage.textContent = '';
    renderQuestions();
    
    gridView.classList.remove('active-view');
    setTimeout(() => {
        expandedView.classList.add('active-view');
    }, 50);
}

function renderQuestions() {
    questionsContainer.innerHTML = '';
    questionTexts.forEach((text, index) => {
        const row = document.createElement('div');
        row.className = 'question-row';

        const qText = document.createElement('span');
        qText.className = 'question-text';
        qText.textContent = text;

        const optionsContainer = document.createElement('div');
        optionsContainer.className = 'options-container';

        const btnSi = document.createElement('button');
        btnSi.className = 'option-btn';
        btnSi.textContent = 'Sí';
        if (userState[currentGraphId].answers[index] === true) btnSi.classList.add('selected');
        btnSi.onclick = () => setAnswer(index, true, btnSi, btnNo);

        const btnNo = document.createElement('button');
        btnNo.className = 'option-btn';
        btnNo.textContent = 'No';
        if (userState[currentGraphId].answers[index] === false) btnNo.classList.add('selected');
        btnNo.onclick = () => setAnswer(index, false, btnNo, btnSi);

        optionsContainer.appendChild(btnSi);
        optionsContainer.appendChild(btnNo);
        row.appendChild(qText);
        row.appendChild(optionsContainer);
        questionsContainer.appendChild(row);
    });
}

function setAnswer(questionIndex, value, selectedBtn, unselectedBtn) {
    userState[currentGraphId].answers[questionIndex] = value;
    selectedBtn.classList.add('selected');
    unselectedBtn.classList.remove('selected');
    feedbackMessage.className = 'hidden';
}

function validateAnswers() {
    const currentAnswers = userState[currentGraphId].answers;
    
    if (currentAnswers.includes(null)) {
        feedbackMessage.textContent = 'Debes responder las tres preguntas antes de continuar.';
        feedbackMessage.className = 'error';
        return;
    }

    const correctAnswers = grafosData.find(g => g.id === currentGraphId).answers;
    let correctCount = 0;
    
    for (let i = 0; i < 3; i++) {
        if (currentAnswers[i] === correctAnswers[i]) {
            correctCount++;
        }
    }

    if (correctCount === 3) {
        userState[currentGraphId].completed = true;
        closeExpandedView();
    } else {
        const incorrectCount = 3 - correctCount;
        feedbackMessage.textContent = `Tienes ${correctCount} respuesta${correctCount === 1 ? '' : 's'} correcta${correctCount === 1 ? '' : 's'} de 3. Hay ${incorrectCount} respuesta${incorrectCount === 1 ? '' : 's'} incorrecta${incorrectCount === 1 ? '' : 's'}. Revisa tus respuestas e inténtalo nuevamente.`;
        feedbackMessage.className = 'error';
    }
}

function closeExpandedView() {
    expandedView.classList.remove('active-view');
    setTimeout(() => {
        gridView.classList.add('active-view');
        createGrid(); // Recarga la cuadrícula para actualizar los badges y tildes
        currentGraphId = null;
    }, 300);
}

// Inicializar y actualizar el reloj en tiempo real
function initClock() {
    const clockEl = document.getElementById('real-time-clock');
    if (!clockEl) return;

    function updateClock() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        clockEl.textContent = `${hours}:${minutes}`;
    }

    updateClock();
    setInterval(updateClock, 1000);
}

btnContinuar.addEventListener('click', validateAnswers);

document.addEventListener('keydown', (e) => {
    const isInput = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
    if (isInput) return;

    if (e.key.toLowerCase() === 'o') {
        toggleTheme();
    } else if (e.key === '3') {
        if (!overlay3.classList.contains('visible')) {
            overlay3.classList.remove('hidden');
            setTimeout(() => overlay3.classList.add('visible'), 10);
        }
    } else if (e.key === 'Escape') {
        if (overlay3.classList.contains('visible')) {
            overlay3.classList.remove('visible');
            setTimeout(() => overlay3.classList.add('hidden'), 300);
        }
    }
});

initTheme();
createGrid();
initClock();