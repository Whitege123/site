// ===================== 游戏状态（对象+数组）=====================
const gameState = {
    disksCount: 3,
    pegs: [[3,2,1], [], []],  // 栈结构：pegs[0] A柱，pegs[1] B柱，pegs[2] C柱
    moves: 0,
    isAutoSolving: false,
    selectedPeg: null,
    autoSolveTimer: null
};

// ===================== DOM 元素=====================
const pegElements = document.querySelectorAll('.peg');
const diskSlider = document.getElementById('diskSlider');
const diskCountSpan = document.getElementById('diskCount');
const moveCountSpan = document.getElementById('moveCount');
const resetBtn = document.getElementById('resetBtn');
const autoSolveBtn = document.getElementById('autoSolveBtn');
const warningEl = document.getElementById('warning');
const victoryEl = document.getElementById('victory');

// ===================== 初始化游戏=====================
init();
function init() {
    render();
    bindEvents();
}

// ===================== 渲染界面（核心：数组→DOM）=====================
function render() {
    // 清空所有柱子
    pegElements.forEach(peg => peg.innerHTML = '');
    
    // 遍历柱子数组，渲染圆盘
    gameState.pegs.forEach((peg, pegIndex) => {
        const pegEl = pegElements[pegIndex];
        peg.forEach(diskSize => {
            const disk = document.createElement('div');
            disk.className = `disk disk-${diskSize}`;
            disk.dataset.size = diskSize;
            pegEl.appendChild(disk);
        });
    });

    // 更新步数与数量显示
    moveCountSpan.textContent = gameState.moves;
    diskCountSpan.textContent = gameState.disksCount;
}

// ===================== 事件绑定=====================
function bindEvents() {
    // 滑块修改数量
    diskSlider.addEventListener('input', () => {
        gameState.disksCount = parseInt(diskSlider.value);
        resetGame();
    });

    // 柱子点击
    pegElements.forEach((peg, index) => {
        peg.addEventListener('click', () => handlePegClick(index));
    });

    // 重置按钮
    resetBtn.addEventListener('click', resetGame);

    // 自动解题
    autoSolveBtn.addEventListener('click', startAutoSolve);
}

// ===================== 柱子点击逻辑=====================
function handlePegClick(pegIndex) {
    // 自动解题时禁止操作
    if (gameState.isAutoSolving) return;
    
    // 未选择柱子 → 选中当前柱子顶盘
    if (gameState.selectedPeg === null) {
        const peg = gameState.pegs[pegIndex];
        if (peg.length === 0) return;
        
        gameState.selectedPeg = pegIndex;
        highlightSelectedDisk();
        return;
    }

    // 已选择 → 尝试移动
    const from = gameState.selectedPeg;
    const to = pegIndex;
    attemptMove(from, to);
}

// 高亮选中的圆盘
function highlightSelectedDisk() {
    document.querySelectorAll('.disk').forEach(d => d.classList.remove('selected'));
    const pegEl = pegElements[gameState.selectedPeg];
    const topDisk = pegEl.lastChild;
    if (topDisk) topDisk.classList.add('selected');
}

// 清除选中状态
function clearSelection() {
    gameState.selectedPeg = null;
    document.querySelectorAll('.disk').forEach(d => d.classList.remove('selected'));
}

// ===================== 移动校验与执行=====================
function attemptMove(from, to) {
    if (!isValidMove(from, to)) {
        showWarning();
        clearSelection();
        return;
    }

    // 执行移动（数组 push/pop）
    const disk = gameState.pegs[from].pop();
    gameState.pegs[to].push(disk);
    gameState.moves++;
    clearSelection();
    render();
    checkWin();
}

// 校验移动是否合法
function isValidMove(from, to) {
    const fromPeg = gameState.pegs[from];
    const toPeg = gameState.pegs[to];
    if (fromPeg.length === 0) return false;
    if (toPeg.length === 0) return true;
    return fromPeg.at(-1) < toPeg.at(-1);
}

// ===================== 提示与胜利=====================
function showWarning() {
    warningEl.classList.remove('hidden');
    setTimeout(() => warningEl.classList.add('hidden'), 1500);
}

function checkWin() {
    if (gameState.pegs[2].length === gameState.disksCount) {
        victoryEl.classList.remove('hidden');
        disableControls(true);
    }
}

// ===================== 重置游戏=====================
function resetGame() {
    // 生成初始数组
    const initialPeg = Array.from({length: gameState.disksCount}, (_, i) => gameState.disksCount - i);
    gameState.pegs = [initialPeg, [], []];
    gameState.moves = 0;
    gameState.selectedPeg = null;
    stopAutoSolve();
    victoryEl.classList.add('hidden');
    disableControls(false);
    render();
}

// ===================== 自动解题（递归+延迟）=====================
function startAutoSolve() {
    if (gameState.isAutoSolving) return;
    stopAutoSolve();
    resetGame();
    
    gameState.isAutoSolving = true;
    disableControls(true);
    
    const moves = [];
    solveHanoi(gameState.disksCount, 0, 2, 1, moves);
    
    // 延迟执行每一步
    let index = 0;
    gameState.autoSolveTimer = setInterval(() => {
        if (index >= moves.length) {
            stopAutoSolve();
            return;
        }
        const [from, to] = moves[index++];
        attemptMove(from, to);
    }, 800);
}

// 递归生成解法
function solveHanoi(n, from, to, aux, moves) {
    if (n === 1) {
        moves.push([from, to]);
        return;
    }
    solveHanoi(n-1, from, aux, to, moves);
    moves.push([from, to]);
    solveHanoi(n-1, aux, to, from, moves);
}

function stopAutoSolve() {
    clearInterval(gameState.autoSolveTimer);
    gameState.isAutoSolving = false;
}

// 禁用/启用控件
function disableControls(disabled) {
    diskSlider.disabled = disabled;
    resetBtn.disabled = disabled;
    autoSolveBtn.disabled = disabled;
}