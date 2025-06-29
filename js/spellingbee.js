const API_URL = "https://nodeapi-moneyblog.onrender.com";
let allGames = [];
let currentGame = null;
let gameTimers = {};
let gameState = {
    easy: { words: [], points: 0, centerLetter: '', availableLetters: [] },
    medium: { words: [], points: 0, centerLetter: '', availableLetters: [] },
    difficult: { words: [], points: 0, centerLetter: '', availableLetters: [] }
};

// DOM elements
const loadingEl = document.getElementById('loading');
const gameListEl = document.getElementById('gameList');
const errorEl = document.getElementById('error');
const welcomeMessageEl = document.getElementById('welcomeMessage');
const gameDisplayEl = document.getElementById('gameDisplay');
const gameTitleEl = document.getElementById('gameTitle');

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    await loadAllGames();
    setupEventListeners();
});

// Load all games from API
async function loadAllGames() {
    try {
        loadingEl.style.display = 'block';
        errorEl.style.display = 'none';
        
        const response = await fetch(`${API_URL}/public/all-spelling-bee-games`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch games');
        }
        
        const data = await response.json();



    
        allGames = data.games || [];
        
        displayGameList();
        loadingEl.style.display = 'none';
        gameListEl.style.display = 'block';
        
    } catch (error) {
        console.error('Error loading games:', error);
        loadingEl.style.display = 'none';
        errorEl.textContent = 'Failed to load games. Please try again.';
        errorEl.style.display = 'block';
    }
}

// Display the list of games in the sidebar
function displayGameList() {
    gameListEl.innerHTML = '';
    
    allGames.forEach((game) => {
        const gameItem = document.createElement('li');
        gameItem.className = 'game-item';
        gameItem.dataset.gameId = game._id;
        
        gameItem.innerHTML = `
            <div class="game-week">${game.weekName}</div>
            <div class="game-info">${game.spellings ? game.spellings.length : 3} difficulty levels</div>
        `;
        
        gameItem.addEventListener('click', () => selectGame(game._id));
        gameListEl.appendChild(gameItem);
    });
}

// Select and display a specific game
async function selectGame(gameId) {
    try {
        // Update UI to show selected game
        document.querySelectorAll('.game-item').forEach(item => {
            item.classList.remove('active');
        });
        const selectedItem = document.querySelector(`[data-game-id="${gameId}"]`);
        if (selectedItem) {
            selectedItem.classList.add('active');
        }
        
        // Load game details
        const response = await fetch(`${API_URL}/public/spelling-bee-game/${gameId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch game details');
        }
        
        const gameResponse = await response.json();
        currentGame = gameResponse;
        
        displayGame(gameResponse);
        
    } catch (error) {
        console.error('Error loading game:', error);
        alert('Failed to load game details. Please try again.');
    }
}

// Display the selected game
function displayGame(gameResponse) {
    welcomeMessageEl.style.display = 'none';
    gameDisplayEl.classList.add('active');
    gameDisplayEl.style.display = 'block';
    
    gameTitleEl.textContent = gameResponse.week;
    
    // Populate difficulty levels
    const difficulties = ['easy', 'medium', 'difficult'];
    difficulties.forEach(difficulty => {
        const gameLevel = gameResponse.game[difficulty];
        if (gameLevel) {
            populateLetters(difficulty, gameLevel.letters, gameLevel.centerLetter);
            updateDifficultyInfo(difficulty, gameLevel.centerLetter);
            
            // Store game data for timer and word validation
            gameState[difficulty].centerLetter = gameLevel.centerLetter;
            gameState[difficulty].availableLetters = gameLevel.letters;
            
            // Reset game state
            resetGameState(difficulty);
        }
    });

    // Show easy level by default
    showDifficulty('easy');
}

// Reset game state for a difficulty
function resetGameState(difficulty) {
    gameState[difficulty].words = [];
    gameState[difficulty].points = 0;
    
    // Reset UI elements
    const startBtn = document.getElementById(`${difficulty}StartBtn`);
    const wordInput = document.getElementById(`${difficulty}WordInput`);
    const stats = document.getElementById(`${difficulty}Stats`);
    const foundWords = document.getElementById(`${difficulty}FoundWords`);
    const wordField = document.getElementById(`${difficulty}WordField`);
    const submitBtn = document.getElementById(`${difficulty}SubmitBtn`);
    const timer = document.getElementById(`${difficulty}Timer`);
    
    if (startBtn) startBtn.style.display = 'block';
    if (wordInput) wordInput.style.display = 'none';
    if (stats) stats.style.display = 'none';
    if (foundWords) foundWords.style.display = 'none';
    if (wordField) {
        wordField.disabled = false;
        wordField.value = '';
    }
    if (submitBtn) submitBtn.disabled = false;
    if (timer) {
        timer.textContent = '2:00';
        timer.classList.remove('warning');
    }
    
    updateStats(difficulty);
    clearFoundWords(difficulty);
    clearMessage(difficulty);
    
    // Clear any existing timer
    if (gameTimers[difficulty]) {
        clearInterval(gameTimers[difficulty]);
        delete gameTimers[difficulty];
    }
}

// Populate letters for a difficulty level
function populateLetters(difficulty, letters, centerLetter) {
    const container = document.getElementById(`${difficulty}Letters`);
    if (!container) return;
    
    container.innerHTML = '';
    
    letters.forEach(letter => {
        const letterEl = document.createElement('div');
        letterEl.className = 'letter';
        letterEl.textContent = letter.toUpperCase();
        
        if (letter === centerLetter) {
            letterEl.classList.add('center');
        }
        
        container.appendChild(letterEl);
    });
    
    // Add click handlers after populating letters
    setupLetterClickHandlers(difficulty);
}

// Setup letter click handlers
function setupLetterClickHandlers(difficulty) {
    const container = document.getElementById(`${difficulty}Letters`);
    const wordField = document.getElementById(`${difficulty}WordField`);
    
    if (!container || !wordField) return;
    
    // Add click handlers to all letters
    container.querySelectorAll('.letter').forEach(letterEl => {
        letterEl.addEventListener('click', () => {
            // Only add letters if the game is active (word field is enabled)
            if (!wordField.disabled) {
                const letter = letterEl.textContent.toLowerCase();
                wordField.value += letter;
                wordField.focus(); // Keep focus on input field
            }
        });
    });
}

// Update difficulty info to show center letter
function updateDifficultyInfo(difficulty, centerLetter) {
    const contentEl = document.getElementById(`${difficulty}Content`);
    if (!contentEl) return;
    
    const heading = contentEl.querySelector('h3');
    if (heading) {
        heading.innerHTML = `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Level <span style="color: var(--primary-red, red); font-weight: bold;">(Center: ${centerLetter.toUpperCase()})</span>`;
    }
}

// Setup event listeners
function setupEventListeners() {
    // Difficulty tab switching
    document.querySelectorAll('.difficulty-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            const difficulty = e.target.dataset.difficulty;
            if (difficulty) {
                showDifficulty(difficulty);
            }
        });
    });

    // Game controls for each difficulty
    const difficulties = ['easy', 'medium', 'difficult'];
    difficulties.forEach(difficulty => {
        // Start button
        const startBtn = document.getElementById(`${difficulty}StartBtn`);
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                startGame(difficulty);
            });
        }

        // Submit button
        const submitBtn = document.getElementById(`${difficulty}SubmitBtn`);
        if (submitBtn) {
            submitBtn.addEventListener('click', () => {
                submitWord(difficulty);
            });
        }

        // Enter key in input field
        const wordField = document.getElementById(`${difficulty}WordField`);
        if (wordField) {
            wordField.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    submitWord(difficulty);
                }
            });
        }
    });
}

// Show specific difficulty level
function showDifficulty(difficulty) {
    // Update tabs
    document.querySelectorAll('.difficulty-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    const activeTab = document.querySelector(`[data-difficulty="${difficulty}"]`);
    if (activeTab) {
        activeTab.classList.add('active');
    }
    
    // Update content
    document.querySelectorAll('.game-content').forEach(content => {
        content.classList.remove('active');
    });
    const activeContent = document.getElementById(`${difficulty}Content`);
    if (activeContent) {
        activeContent.classList.add('active');
    }
}

// Start the 2-minute game timer
function startGame(difficulty) {
    // Reset game data
    gameState[difficulty].words = [];
    gameState[difficulty].points = 0;
    updateStats(difficulty);
    clearFoundWords(difficulty);
    clearMessage(difficulty);

    // Hide start button, show input field and stats
    const startBtn = document.getElementById(`${difficulty}StartBtn`);
    const wordInput = document.getElementById(`${difficulty}WordInput`);
    const stats = document.getElementById(`${difficulty}Stats`);
    const foundWords = document.getElementById(`${difficulty}FoundWords`);
    const wordField = document.getElementById(`${difficulty}WordField`);
    
    if (startBtn) startBtn.style.display = 'none';
    if (wordInput) wordInput.style.display = 'flex';
    if (stats) stats.style.display = 'flex';
    if (foundWords) foundWords.style.display = 'block';

    // Focus on input field
    if (wordField) wordField.focus();

    // Start 2-minute timer
    let timeLeft = 120; // 2 minutes in seconds
    const timerEl = document.getElementById(`${difficulty}Timer`);
    
    gameTimers[difficulty] = setInterval(() => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        if (timerEl) {
            timerEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            // Add warning style when under 30 seconds
            if (timeLeft <= 30) {
                timerEl.classList.add('warning');
            }
        }
        
        timeLeft--;
        
        if (timeLeft < 0) {
            endGame(difficulty);
        }
    }, 1000);
}

// End the game
function endGame(difficulty) {
    if (gameTimers[difficulty]) {
        clearInterval(gameTimers[difficulty]);
        delete gameTimers[difficulty];
    }
    
    // Disable input and submit button
    const wordField = document.getElementById(`${difficulty}WordField`);
    const submitBtn = document.getElementById(`${difficulty}SubmitBtn`);
    const timerEl = document.getElementById(`${difficulty}Timer`);
    
    if (wordField) wordField.disabled = true;
    if (submitBtn) submitBtn.disabled = true;
    
    // Show final message
    showMessage(difficulty, `Time's up! You found ${gameState[difficulty].words.length} words and scored ${gameState[difficulty].points} points!`, 'success');
    
    // Reset timer display
    if (timerEl) {
        timerEl.textContent = "0:00";
        timerEl.classList.remove('warning');
    }
}

// Submit a word
async function submitWord(difficulty) {
    const wordField = document.getElementById(`${difficulty}WordField`);
    if (!wordField) return;
    
    const word = wordField.value.trim().toLowerCase();
    
    if (!word) return;
    
    // Check if word was already found
    if (gameState[difficulty].words.some(w => w.word === word)) {
        showMessage(difficulty, "Word already found!", 'error');
        wordField.value = '';
        return;
    }
    
    try {
        const centerLetter = gameState[difficulty].centerLetter;
        const response = await fetch(`${API_URL}/public/play-spelling-bee-game?word=${word}&middleWord=${centerLetter}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Add word to found words
            gameState[difficulty].words.push({
                word: result.word,
                points: result.points,
                isPangram: result.isPangram
            });
            gameState[difficulty].points += result.points;
            
            // Update UI
            updateStats(difficulty);
            addFoundWord(difficulty, result.word, result.isPangram);
            showMessage(difficulty, `Great! +${result.points} points`, 'success');
        } else {
            showMessage(difficulty, result.msg || 'Word not found', 'error');
        }
        
    } catch (error) {
        console.error('Error submitting word:', error);
        showMessage(difficulty, 'Error checking word. Please try again.', 'error');
    }
    
    wordField.value = '';
    wordField.focus();
}

// Update game statistics
function updateStats(difficulty) {
    const wordsCountEl = document.getElementById(`${difficulty}WordsCount`);
    const pointsCountEl = document.getElementById(`${difficulty}PointsCount`);
    
    if (wordsCountEl) wordsCountEl.textContent = gameState[difficulty].words.length;
    if (pointsCountEl) pointsCountEl.textContent = gameState[difficulty].points;
}

// Add found word to the list
function addFoundWord(difficulty, word, isPangram) {
    const wordList = document.getElementById(`${difficulty}WordList`);
    if (!wordList) return;
    
    const wordEl = document.createElement('div');
    wordEl.className = 'found-word';
    wordEl.textContent = word.toUpperCase();
    
    if (isPangram) {
        wordEl.style.background = 'gold';
        wordEl.style.color = '#000';
        wordEl.title = 'Pangram!';
    }
    
    wordList.appendChild(wordEl);
}

// Clear found words list
function clearFoundWords(difficulty) {
    const wordList = document.getElementById(`${difficulty}WordList`);
    if (wordList) {
        wordList.innerHTML = '';
    }
}

// Show message to user
function showMessage(difficulty, message, type) {
    const messageEl = document.getElementById(`${difficulty}Message`);
    if (!messageEl) return;
    
    messageEl.textContent = message;
    messageEl.className = `message ${type}`;
    messageEl.style.display = 'block';
    
    // Hide message after 3 seconds
    setTimeout(() => {
        messageEl.style.display = 'none';
    }, 3000);
}

// Clear message
function clearMessage(difficulty) {
    const messageEl = document.getElementById(`${difficulty}Message`);
    if (messageEl) {
        messageEl.style.display = 'none';
    }
}