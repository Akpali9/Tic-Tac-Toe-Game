 document.addEventListener('DOMContentLoaded', () => {
            // Game elements
            const gameBoard = document.getElementById('gameBoard');
            const cells = document.querySelectorAll('.cell');
            const currentPlayerEl = document.getElementById('currentPlayer');
            const messageEl = document.getElementById('message');
            const resetBtn = document.getElementById('resetBtn');
            const restartBtn = document.getElementById('restartBtn');
            const scoreXEl = document.getElementById('scoreX');
            const scoreOEl = document.getElementById('scoreO');
            const scoreDrawEl = document.getElementById('scoreDraw');
            const pvpBtn = document.getElementById('pvpBtn');
            const pvcBtn = document.getElementById('pvcBtn');
            const difficultyContainer = document.getElementById('difficultyContainer');
            const difficultyBtns = document.querySelectorAll('.difficulty-btn');
            
            // Game state
            let board = ['', '', '', '', '', '', '', '', ''];
            let currentPlayer = 'X';
            let gameActive = true;
            let scores = { X: 0, O: 0, draw: 0 };
            let gameMode = 'pvp'; // 'pvp' or 'pvc'
            let difficulty = 'medium'; // 'easy', 'medium', 'hard'
            
            // Winning combinations
            const winCombinations = [
                [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
                [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
                [0, 4, 8], [2, 4, 6]             // Diagonals
            ];
            
            // Initialize game
            initGame();
            
            // Event listeners
            cells.forEach(cell => {
                cell.addEventListener('click', handleCellClick);
            });
            
            resetBtn.addEventListener('click', resetGame);
            restartBtn.addEventListener('click', restartGame);
            
            pvpBtn.addEventListener('click', () => {
                setGameMode('pvp');
                pvpBtn.classList.add('active');
                pvcBtn.classList.remove('active');
                difficultyContainer.style.display = 'none';
            });
            
            pvcBtn.addEventListener('click', () => {
                setGameMode('pvc');
                pvcBtn.classList.add('active');
                pvpBtn.classList.remove('active');
                difficultyContainer.style.display = 'flex';
            });
            
            difficultyBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    difficultyBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    difficulty = btn.dataset.difficulty;
                });
            });
            
            // Functions
            function initGame() {
                board = ['', '', '', '', '', '', '', '', ''];
                currentPlayer = 'X';
                gameActive = true;
                
                updateBoard();
                updateMessage(`Player ${currentPlayer}'s turn`);
                updatePlayerDisplay();
            }
            
            function handleCellClick(e) {
                const cell = e.target;
                const index = parseInt(cell.getAttribute('data-cell-index'));
                
                if (board[index] !== '' || !gameActive) return;
                
                makeMove(index);
                
                // Computer move in PVC mode
                if (gameActive && gameMode === 'pvc' && currentPlayer === 'O') {
                    setTimeout(makeComputerMove, 500);
                }
            }
            
            function makeMove(index) {
                board[index] = currentPlayer;
                updateBoard();
                
                if (checkWin()) {
                    endGame(false);
                    scores[currentPlayer]++;
                    updateScores();
                    updateMessage(`Player ${currentPlayer} wins!`);
                    messageEl.classList.add('win-message');
                } else if (checkDraw()) {
                    endGame(true);
                    scores.draw++;
                    updateScores();
                    updateMessage(`It's a draw!`);
                    messageEl.classList.add('draw-message');
                } else {
                    switchPlayer();
                    updatePlayerDisplay();
                    updateMessage(`Player ${currentPlayer}'s turn`);
                }
            }
            
            function makeComputerMove() {
                if (!gameActive) return;
                
                let move;
                
                if (difficulty === 'easy') {
                    move = getRandomMove();
                } else if (difficulty === 'medium') {
                    // 70% chance of best move, 30% random
                    move = Math.random() < 0.7 ? getBestMove() : getRandomMove();
                } else {
                    move = getBestMove();
                }
                
                if (move !== null) {
                    makeMove(move);
                }
            }
            
            function getRandomMove() {
                const emptyCells = [];
                board.forEach((cell, index) => {
                    if (cell === '') emptyCells.push(index);
                });
                
                if (emptyCells.length > 0) {
                    const randomIndex = Math.floor(Math.random() * emptyCells.length);
                    return emptyCells[randomIndex];
                }
                
                return null;
            }
            
            function getBestMove() {
                // Try to win
                for (let i = 0; i < winCombinations.length; i++) {
                    const [a, b, c] = winCombinations[i];
                    if (board[a] === 'O' && board[b] === 'O' && board[c] === '') return c;
                    if (board[a] === 'O' && board[c] === 'O' && board[b] === '') return b;
                    if (board[b] === 'O' && board[c] === 'O' && board[a] === '') return a;
                }
                
                // Block opponent from winning
                for (let i = 0; i < winCombinations.length; i++) {
                    const [a, b, c] = winCombinations[i];
                    if (board[a] === 'X' && board[b] === 'X' && board[c] === '') return c;
                    if (board[a] === 'X' && board[c] === 'X' && board[b] === '') return b;
                    if (board[b] === 'X' && board[c] === 'X' && board[a] === '') return a;
                }
                
                // Take center if available
                if (board[4] === '') return 4;
                
                // Take a corner if available
                const corners = [0, 2, 6, 8];
                const emptyCorners = corners.filter(index => board[index] === '');
                if (emptyCorners.length > 0) {
                    return emptyCorners[Math.floor(Math.random() * emptyCorners.length)];
                }
                
                // Take any available edge
                const edges = [1, 3, 5, 7];
                const emptyEdges = edges.filter(index => board[index] === '');
                if (emptyEdges.length > 0) {
                    return emptyEdges[Math.floor(Math.random() * emptyEdges.length)];
                }
                
                return null;
            }
            
            function switchPlayer() {
                currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            }
            
            function checkWin() {
                for (let i = 0; i < winCombinations.length; i++) {
                    const [a, b, c] = winCombinations[i];
                    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                        // Highlight winning cells
                        cells[a].classList.add('winning-cell');
                        cells[b].classList.add('winning-cell');
                        cells[c].classList.add('winning-cell');
                        return true;
                    }
                }
                return false;
            }
            
            function checkDraw() {
                return !board.includes('');
            }
            
            function endGame(isDraw) {
                gameActive = false;
                if (!isDraw) {
                    messageEl.classList.add('win-message');
                } else {
                    messageEl.classList.add('draw-message');
                }
            }
            
            function updateBoard() {
                board.forEach((value, index) => {
                    cells[index].textContent = value;
                    if (value === 'X') {
                        cells[index].classList.add('x');
                        cells[index].classList.remove('o');
                    } else if (value === 'O') {
                        cells[index].classList.add('o');
                        cells[index].classList.remove('x');
                    } else {
                        cells[index].classList.remove('x', 'o');
                    }
                });
            }
            
            function updatePlayerDisplay() {
                currentPlayerEl.textContent = currentPlayer;
                currentPlayerEl.className = currentPlayer === 'X' ? 'player-x' : 'player-o';
            }
            
            function updateMessage(msg) {
                messageEl.textContent = msg;
                messageEl.className = 'message';
            }
            
            function updateScores() {
                scoreXEl.textContent = scores.X;
                scoreOEl.textContent = scores.O;
                scoreDrawEl.textContent = scores.draw;
            }
            
            function resetGame() {
                scores = { X: 0, O: 0, draw: 0 };
                updateScores();
                restartGame();
            }
            
            function restartGame() {
                // Remove winning cell highlights
                cells.forEach(cell => cell.classList.remove('winning-cell'));
                
                initGame();
            }
            
            function setGameMode(mode) {
                gameMode = mode;
                restartGame();
            }
        });
