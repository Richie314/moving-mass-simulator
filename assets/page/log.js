const log_div = document.getElementById('logs');
if (!log_div) {
    throw new Error('div#logs not found!');
}
const log_data = (message, classname) =>
{
    if (message == '' || classname == '')
        return;
    const messageDiv = document.createElement('pre');
    messageDiv.classList.add('log');
    messageDiv.classList.add(classname);
    messageDiv.innerHTML = message;
    log_div.appendChild(messageDiv);
    messageDiv.scrollIntoView({
        behavior: 'smooth',
        inline: 'nearest',
        block: 'end'
    });
}
const log = function(...message)
{
    console.log(...message);

}
const warn = function(...message)
{
    console.warn(...message);
}
const err = function(...message)
{
    console.error(...message);
}