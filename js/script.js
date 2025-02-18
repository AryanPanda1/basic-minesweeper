class Minesweeper {
    constructor() {
        this.difficulties = {
            beginner: { rows: 9, cols: 9, mines: 10 },
            intermediate: { rows: 16, cols: 16, mines: 40 },
            expert: { rows: 16, cols: 30, mines: 99 },
            custom: { rows: 0, cols: 0, mines: 0 }
        };
        
        this.board = [];
        this.gameOver = false;
        this.minesLeft = 0;
        this.timer = 0;
        this.timerInterval = null;
        
        // Initialize audio
        this.audio = new AudioManager();
        
        this.initializeDOM();
        this.setupEventListeners();
        this.loadTheme();
        this.initializeAudioControls();
        this.startNewGame();
    }

    initializeDOM() {
        this.boardElement = document.getElementById('game-board');
        this.mineCountElement = document.getElementById('mine-count');
        this.timerElement = document.getElementById('timer');
        this.difficultySelect = document.getElementById('difficulty');
        this.newGameButton = document.getElementById('new-game');
        this.gameOverElement = document.getElementById('game-over');
        this.restartButton = document.getElementById('restart');
        this.themeToggle = document.getElementById('theme-toggle');
        this.customDifficultyDiv = document.getElementById('custom-difficulty');
        this.customRowsInput = document.getElementById('custom-rows');
        this.customColsInput = document.getElementById('custom-cols');
        this.customMinesInput = document.getElementById('custom-mines');
        this.applyCustomButton = document.getElementById('apply-custom');
        
        // Audio controls
        this.soundToggle = document.getElementById('sound-toggle');
        this.volumeSlider = document.getElementById('volume-slider');
    }

    initializeAudioControls() {
        // Set initial states
        this.soundToggle.textContent = this.audio.isMuted ? '🔈 Sound Off' : '🔊 Sound On';
        this.volumeSlider.value = this.audio.volume * 100;
        
        // Add event listeners
        this.soundToggle.addEventListener('click', () => {
            const isMuted = this.audio.toggleMute();
            this.soundToggle.textContent = isMuted ? '🔈 Sound Off' : '🔊 Sound On';
        });
        
        this.volumeSlider.addEventListener('input', (e) => {
            this.audio.setVolume(e.target.value / 100);
        });
    }

    setupEventListeners() {
        this.newGameButton.addEventListener('click', () => this.startNewGame());
        this.restartButton.addEventListener('click', () => {
            this.gameOverElement.classList.add('hidden');
            this.startNewGame();
        });
        this.difficultySelect.addEventListener('change', () => {
            if (this.difficultySelect.value === 'custom') {
                this.customDifficultyDiv.classList.remove('hidden');
            } else {
                this.customDifficultyDiv.classList.add('hidden');
                this.startNewGame();
            }
        });
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        this.applyCustomButton.addEventListener('click', () => this.applyCustomDifficulty());
        
        // Add input validation for custom difficulty
        this.customRowsInput.addEventListener('input', () => this.validateCustomInputs());
        this.customColsInput.addEventListener('input', () => this.validateCustomInputs());
        this.customMinesInput.addEventListener('input', () => this.validateCustomInputs());
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.body.setAttribute('data-theme', savedTheme);
        this.themeToggle.textContent = savedTheme === 'light' ? '🌞 Light Mode' : '🌙 Dark Mode';
    }

    toggleTheme() {
        const currentTheme = document.body.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        this.themeToggle.textContent = newTheme === 'light' ? '🌞 Light Mode' : '🌙 Dark Mode';
    }

    validateCustomInputs() {
        const rows = parseInt(this.customRowsInput.value) || 0;
        const cols = parseInt(this.customColsInput.value) || 0;
        const maxMines = Math.floor((rows * cols) * 0.9); // Maximum 90% of cells can be mines
        
        this.customMinesInput.max = maxMines;
        
        if (this.customMinesInput.value > maxMines) {
            this.customMinesInput.value = maxMines;
        }
        
        this.applyCustomButton.disabled = rows < 5 || rows > 30 || cols < 5 || cols > 30 || 
                                        this.customMinesInput.value < 1 || this.customMinesInput.value > maxMines;
    }

    applyCustomDifficulty() {
        const rows = parseInt(this.customRowsInput.value);
        const cols = parseInt(this.customColsInput.value);
        const mines = parseInt(this.customMinesInput.value);
        
        if (rows >= 5 && rows <= 30 && cols >= 5 && cols <= 30 && mines >= 1) {
            this.difficulties.custom = { rows, cols, mines };
            this.startNewGame();
        }
    }

    startNewGame() {
        clearInterval(this.timerInterval);
        this.timer = 0;
        this.updateTimer();
        
        const difficulty = this.difficulties[this.difficultySelect.value];
        this.rows = difficulty.rows;
        this.cols = difficulty.cols;
        this.minesLeft = difficulty.mines;
        this.updateMineCount();
        
        this.createBoard();
        this.placeMines();
        this.calculateNumbers();
        this.renderBoard();
        
        this.gameOver = false;
        this.gameOverElement.classList.add('hidden');
    }

    createBoard() {
        this.board = [];
        for (let i = 0; i < this.rows; i++) {
            this.board[i] = [];
            for (let j = 0; j < this.cols; j++) {
                this.board[i][j] = {
                    isMine: false,
                    isRevealed: false,
                    isFlagged: false,
                    neighborMines: 0
                };
            }
        }
    }

    placeMines() {
        let minesPlaced = 0;
        while (minesPlaced < this.minesLeft) {
            const row = Math.floor(Math.random() * this.rows);
            const col = Math.floor(Math.random() * this.cols);
            
            if (!this.board[row][col].isMine) {
                this.board[row][col].isMine = true;
                minesPlaced++;
            }
        }
    }

    calculateNumbers() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (!this.board[row][col].isMine) {
                    this.board[row][col].neighborMines = this.countNeighborMines(row, col);
                }
            }
        }
    }

    countNeighborMines(row, col) {
        let count = 0;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                const newRow = row + i;
                const newCol = col + j;
                if (this.isValidCell(newRow, newCol) && this.board[newRow][newCol].isMine) {
                    count++;
                }
            }
        }
        return count;
    }

    isValidCell(row, col) {
        return row >= 0 && row < this.rows && col >= 0 && col < this.cols;
    }

    renderBoard() {
        this.boardElement.style.gridTemplateColumns = `repeat(${this.cols}, var(--cell-size))`;
        this.boardElement.innerHTML = '';
        
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                
                cell.addEventListener('click', () => this.handleCellClick(row, col));
                cell.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    this.handleRightClick(row, col);
                });
                
                this.boardElement.appendChild(cell);
                this.updateCellDisplay(row, col);
            }
        }
    }

    updateCellDisplay(row, col) {
        const index = row * this.cols + col;
        const cell = this.boardElement.children[index];
        const cellData = this.board[row][col];
        
        cell.className = 'cell';
        if (cellData.isRevealed) {
            cell.classList.add('revealed');
            if (cellData.isMine) {
                cell.classList.add('mine');
                cell.textContent = '💣';
            } else if (cellData.neighborMines > 0) {
                cell.textContent = cellData.neighborMines;
            }
        } else if (cellData.isFlagged) {
            cell.classList.add('flagged');
            cell.textContent = '🚩';
        } else {
            cell.textContent = '';
        }
    }

    handleCellClick(row, col) {
        if (this.gameOver || this.board[row][col].isFlagged) return;
        
        if (!this.timerInterval) {
            this.startTimer();
        }
        
        if (this.board[row][col].isMine) {
            this.audio.play('explosion');
            this.revealAllMines();
            this.endGame(false);
        } else {
            this.audio.play('click');
            this.revealCell(row, col);
            if (this.checkWin()) {
                this.audio.play('win');
                this.endGame(true);
            }
        }
    }

    handleRightClick(row, col) {
        if (this.gameOver || this.board[row][col].isRevealed) return;
        
        const cell = this.board[row][col];
        cell.isFlagged = !cell.isFlagged;
        this.audio.play(cell.isFlagged ? 'flag' : 'unflag');
        
        this.minesLeft += cell.isFlagged ? -1 : 1;
        this.updateMineCount();
        this.updateCellDisplay(row, col);
    }

    revealCell(row, col) {
        if (!this.isValidCell(row, col) || this.board[row][col].isRevealed || this.board[row][col].isFlagged) {
            return;
        }
        
        this.board[row][col].isRevealed = true;
        this.updateCellDisplay(row, col);
        
        if (this.board[row][col].neighborMines === 0) {
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    this.revealCell(row + i, col + j);
                }
            }
        }
    }

    revealAllMines() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.board[row][col].isMine) {
                    this.board[row][col].isRevealed = true;
                    this.updateCellDisplay(row, col);
                }
            }
        }
    }

    checkWin() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (!this.board[row][col].isMine && !this.board[row][col].isRevealed) {
                    return false;
                }
            }
        }
        return true;
    }

    endGame(won) {
        this.gameOver = true;
        clearInterval(this.timerInterval);
        this.timerInterval = null;
        
        const message = won ? 'Congratulations! You won! 🎉' : 'Game Over! 💥';
        this.gameOverElement.querySelector('.message').textContent = message;
        this.gameOverElement.classList.remove('hidden');
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timer++;
            this.updateTimer();
        }, 1000);
    }

    updateTimer() {
        this.timerElement.textContent = `⏱️ ${this.timer}`;
    }

    updateMineCount() {
        this.mineCountElement.textContent = `💣 ${this.minesLeft}`;
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    new Minesweeper();
});
