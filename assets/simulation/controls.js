'use strict';
var isRunning = false;

if (!pauseBtn)
{
    throw new Error('Internal error: can\'t start or stop the simulation');
}
pauseBtn.onclick = () => {
    if (isRunning) {
        pause();
    } else {
        restart();
    }
}
function pause()
{
    isRunning = false;
    pauseBtn.innerHTML = '<i class="material-icons">play_arrow</i>';
    pauseBtn.title = 'Riprendi';
}
function restart()
{
    isRunning = true;
    pauseBtn.innerHTML = '<i class="material-icons">pause</i>';
    pauseBtn.title = 'Metti in pausa';
}
function resetUI()
{
    pause();
    if (!confirm('Sei sicuro di voler riavviare la simulazione?'))
    {
        restart();
        return;
    }
    pauseBtn.title = 'Avvia';
    DisableButtons();
    setTimeout(() => {
        reset();
        ReEnableButtons();
        restart();
    }, 100);
}
resetBtn.onclick = resetUI;