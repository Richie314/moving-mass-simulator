const log_div = document.getElementById('logs');
if (!log_div) {
    throw new Error('div#logs not found!');
}
const logData = (message, classname = '') =>
{
    if (message == '')
        return;
    const messageDiv = document.createElement('pre');
    messageDiv.classList.add('log');
    if (classname != '')
        messageDiv.classList.add(classname);
    messageDiv.innerHTML = message;
    log_div.appendChild(messageDiv);
    messageDiv.scrollIntoView({
        behavior: 'smooth',
        inline: 'nearest',
        block: 'end'
    });
}
const dotsToStr = function( ...args)
{ 
    if (!args || args.length === 0)
    {
        return '';
    }
    const first = args.shift();
    const others = args;
    if (first == null)
    {
        return 'null ' + dotsToStr(...others);
    }
    if (first == undefined)
    {
        return 'undefined ' + dotsToStr(...others);
    }
    if (typeof first === 'string' || typeof first === 'number' || typeof first === 'bigint')
    {
        return first + ' ' + dotsToStr(...others);
    }
    if (typeof first === 'boolean')
    {
        return (first ? 'true' : 'false') + ' ' + dotsToStr(...others);
    }
    if ('toString' in first.__proto__)
    {
        return first.toString() + ' ' + dotsToStr(...others);
    }
    return '<unknown> ' + dotsToStr(...others);
}
const log = function(...message)
{
    if (!message)
    {
        return;
    }
    console.log(...message);
    logData(dotsToStr(...message), '');
}
const warn = function(...message)
{
    if (!message)
    {
        return;
    }
    console.warn(...message);
    logData(dotsToStr(...message), 'warn');
}
const err = function(...message)
{
    if (!message)
    {
        return;
    }
    console.error(...message);
    logData(dotsToStr(...message), 'error');
}
document.addEventListener('error', evt => err(evt.message));
