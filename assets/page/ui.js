/**
 * @type {HTMLButtonElement}
 */
const promptMathBtn = document.getElementById('show-math-btn');
/**
 * @type {HTMLButtonElement}
 */
const promptShellBtn = document.getElementById('show-terminal-btn');
/**
 * @type {HTMLButtonElement}
 */
const promptSettingsBtn = document.getElementById('show-settings');
function DisableButtons() {
    promptMathBtn.disabled = true;
    promptShellBtn.disabled = true;
    promptSettingsBtn.disabled = true;
}
function ReEnableButtons() {
    promptMathBtn.disabled = false;
    promptShellBtn.disabled = false;
    promptSettingsBtn.disabled = false;
}
promptMathBtn.onclick = () => {
    document.getElementById('math').classList.add('show');
    document.getElementById('math').scrollIntoView({
        behavior: 'smooth',
        block: 'end',
        inline: 'end'
    });
    DisableButtons();
}
promptShellBtn.onclick = () => {
    document.getElementById('shell').classList.add('show');
    document.getElementById('shell').scrollIntoView({
        behavior: 'smooth',
        block: 'end',
        inline: 'end'
    });
    DisableButtons();
}
promptSettingsBtn.onclick = () => {
    pause();
    document.getElementById('settings').classList.add('show');
    document.getElementById('settings').scrollIntoView({
        behavior: 'smooth',
        block: 'end',
        inline: 'end'
    });
    DisableButtons();
}
document.getElementById('close-settings').onclick = () => {
    document.getElementById('settings').classList.remove('show');
    ReEnableButtons();
}

/**********************************************/
/*              Form inputs                   */
/**********************************************/

const dtInput = document.getElementById('dt-number');
const dtExponent = document.getElementById('dt-unit');

function UpdateDt()
{
    dt = new Decimal(dtInput.value).times( new Decimal(10).pow(dtExponent.value) );
}

dtInput.addEventListener('input', UpdateDt);
dtExponent.addEventListener('input', UpdateDt);

const dtCountInput = document.getElementById('dt-count');
dtCountInput.addEventListener('input', () => {
    try {
        dtCount = dtCountInput.value = Math.floor(dtCountInput.value);
    } catch {
        dtCount = 1;
        dtCountInput.value = 1;
    }
});