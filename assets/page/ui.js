const promptMathBtn = document.getElementById('show-math-btn');
const promptShellBtn = document.getElementById('show-terminal-btn');
const promptSettingsBtn = document.getElementById('show-settings');
promptMathBtn.onclick = () => {
    document.getElementById('math').classList.add('show');
}
promptShellBtn.onclick = () => {
    document.getElementById('shell').classList.add('show');
}
promptSettingsBtn.onclick = () => {
    simulation.pause();
    document.getElementById('settings').classList.add('show');
}
document.getElementById('close-settings').onclick = () => {
    document.getElementById('settings').classList.remove('show');
}