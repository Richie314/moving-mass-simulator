var isRunning = false;

const pauseBtn = document.getElementById('play-pause');
if (!pauseBtn)
{
    throw new Error('Internal error: can\'t start or stop the simulation');
}
pauseBtn.onlick = () => {
    isRunning = !isRunning;
    if (isRunning) {
        pauseBtn.innerHTML = '<i class="material-icons">pause</i>';
        pauseBtn.title = 'Metti in pausa';
    } else {
        pauseBtn.innerHTML = '<i class="material-icons">play_arrow</i>';
        pauseBtn.title = 'Riprendi';
    }
}