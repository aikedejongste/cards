document.addEventListener('DOMContentLoaded', () => {
    // State
    const state = {
        questions: [],
        currentSet: [],
        currentIndex: 0,
        options: {
            set: 'all', // all, neutral, spicy
            shuffle: true
        }
    };

    // DOM Elements
    const elements = {
        startScreen: document.getElementById('start-screen'),
        gameScreen: document.getElementById('game-screen'),
        setBtns: document.querySelectorAll('.set-btn'),
        shuffleToggle: document.getElementById('shuffle-toggle'),
        startBtn: document.getElementById('start-btn'),
        exitBtn: document.getElementById('exit-btn'),
        card: document.getElementById('card'),
        questionText: document.getElementById('question-text')
    };

    // Initialization
    init();

    async function init() {
        try {
            await fetchQuestions();
            setupEventListeners();
        } catch (error) {
            console.error('Failed to init:', error);
            elements.questionText.innerText = "Error loading questions.";
        }
    }

    async function fetchQuestions() {
        try {
            const response = await fetch('questions.b64');
            const encoded = await response.text();
            // Decode base64
            const decoded = atob(encoded);
            state.questions = JSON.parse(decoded);
        } catch (e) {
            console.error('Failed to load questions:', e);
            // Fallback for local dev if b64 missing (though we just created it)
            const response = await fetch('questions.json');
            state.questions = await response.json();
        }
    }

    function setupEventListeners() {
        // Set Selection
        elements.setBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                elements.setBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.options.set = btn.dataset.set;
            });
        });

        // Shuffle Toggle
        elements.shuffleToggle.addEventListener('change', (e) => {
            state.options.shuffle = e.target.checked;
        });

        // Start Game
        elements.startBtn.addEventListener('click', startGame);

        // Exit Game
        elements.exitBtn.addEventListener('click', showStartScreen);

        // Card Interaction (Next Question)
        elements.card.addEventListener('click', nextCard);

        // Basic Swipe Support
        let touchStartX = 0;
        let touchEndX = 0;

        elements.card.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        });

        elements.card.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });

        function handleSwipe() {
            if (touchEndX < touchStartX - 50) nextCard('left');
            if (touchEndX > touchStartX + 50) nextCard('right');
        }
    }

    function startGame() {
        prepareQuestions();
        if (state.currentSet.length === 0) {
            alert('No questions found for this selection.');
            return;
        }

        state.currentIndex = 0;
        showGameScreen();
        displayCard();
    }

    function prepareQuestions() {
        let filtered = state.questions;
        if (state.options.set !== 'all') {
            filtered = state.questions.filter(q => q.category === state.options.set);
        }

        // Deep copy
        state.currentSet = JSON.parse(JSON.stringify(filtered));

        if (state.options.shuffle) {
            shuffleArray(state.currentSet);
        }
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function showStartScreen() {
        elements.gameScreen.classList.remove('active');
        elements.startScreen.classList.add('active');
        // minor delay to reset card state
        setTimeout(() => {
            elements.card.className = '';
        }, 300);
    }

    function showGameScreen() {
        elements.startScreen.classList.remove('active');
        elements.gameScreen.classList.add('active');
    }

    function displayCard() {
        const question = state.currentSet[state.currentIndex];
        elements.questionText.innerText = question.text;

        // Reset card animation classes
        elements.card.className = '';
        void elements.card.offsetWidth; // trigger reflow
        elements.card.classList.add('slide-in');
    }

    function nextCard(direction = 'left') {
        const exitClass = direction === 'right' ? 'slide-out-right' : 'slide-out-left';

        elements.card.classList.add(exitClass);

        setTimeout(() => {
            state.currentIndex = (state.currentIndex + 1) % state.currentSet.length;
            displayCard();
        }, 300); // Wait for animation
    }
});
