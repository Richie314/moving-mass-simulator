const promptMathBtn = document.getElementById('show-math-btn');
const promptShellBtn = document.getElementById('show-terminal-btn');
promptMathBtn.onclick = () => {
    document.getElementById('math').classList.add('show');
}
promptShellBtn.onclick = () => {
    document.getElementById('shell').classList.add('show');
}