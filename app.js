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
        aboutScreen: document.getElementById('about-screen'),
        aboutLink: document.getElementById('about-link'),
        aboutBackBtn: document.getElementById('about-back-btn'),
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
        // Set Selection (Radio Buttons)
        document.querySelectorAll('input[name="set"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                state.options.set = e.target.value;
            });
        });

        // Shuffle Toggle
        elements.shuffleToggle.addEventListener('change', (e) => {
            state.options.shuffle = e.target.checked;
        });

        // Start Game
        elements.startBtn.addEventListener('click', startGame);

        // About
        elements.aboutLink.addEventListener('click', (e) => {
            e.preventDefault();
            elements.startScreen.classList.remove('active');
            elements.aboutScreen.classList.add('active');
        });

        elements.aboutBackBtn.addEventListener('click', () => {
            elements.aboutScreen.classList.remove('active');
            elements.startScreen.classList.add('active');
        });

        // Exit Game
        elements.exitBtn.addEventListener('click', showStartScreen);

        // Card Interaction (Next Question)
        elements.card.addEventListener('click', () => nextCard('left'));

        // Basic Swipe Support
        let touchStartX = 0;
        let touchStartY = 0;
        let touchEndX = 0;
        let touchEndY = 0;

        elements.card.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        });

        elements.card.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            touchEndY = e.changedTouches[0].screenY;
            handleSwipe();
        });

        function handleSwipe() {
            const isPortrait = window.innerHeight > window.innerWidth;

            if (isPortrait) {
                // In portrait, visual "left/right" corresponds to physical Up/Down (Y axis) due to rotation
                // Swipe Up (physically) -> Visually Left -> Next Card
                if (touchEndY < touchStartY - 50) nextCard('left');
                if (touchEndY > touchStartY + 50) nextCard('right');
            } else {
                // In landscape, visual "left/right" corresponds to physical Left/Right (X axis)
                if (touchEndX < touchStartX - 50) nextCard('left');
                if (touchEndX > touchStartX + 50) nextCard('right');
            }
        }
    }

    async function startGame() {
        prepareQuestions();
        if (state.currentSet.length === 0) {
            alert('No questions found for this selection.');
            return;
        }

        // Fullscreen only - removed orientation lock
        try {
            if (document.documentElement.requestFullscreen) {
                await document.documentElement.requestFullscreen();
            } else if (document.documentElement.webkitRequestFullscreen) {
                await document.documentElement.webkitRequestFullscreen();
            }
        } catch (e) {
            console.log('Fullscreen error:', e);
        }

        state.currentIndex = 0;
        showGameScreen();
        displayCard();
    }

    function prepareQuestions() {
        let filtered = state.questions;
        // Since all questions are currently neutral, and we want to prevent empty sets if user selects Spicy
        // We will just ignore the filter or default to all if the filter returns empty
        if (state.options.set !== 'all') {
            const tempFiltered = state.questions.filter(q => q.category === state.options.set);
            if (tempFiltered.length > 0) {
                filtered = tempFiltered;
            } else {
                // If filter results in empty (e.g. Spicy selected but none exist), fallback to all
                // This matches the "choices have no effect" message
                console.log('Selection yielded no results, falling back to all');
            }
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
        // Exit fullscreen on return to menu
        if (document.exitFullscreen) {
            document.exitFullscreen().catch(err => console.log(err));
        }

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

    let isAnimating = false;

    function nextCard(direction = 'left') {
        if (isAnimating) return;
        isAnimating = true;

        const exitClass = direction === 'right' ? 'slide-out-right' : 'slide-out-left';

        elements.card.classList.add(exitClass);

        // Total delay: Animation time (400ms) + User pause (200ms)
        setTimeout(() => {
            state.currentIndex = (state.currentIndex + 1) % state.currentSet.length;
            displayCard();
            isAnimating = false;
        }, 600);
    }
});
