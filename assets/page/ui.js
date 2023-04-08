'use strict';
/**
 * @type {HTMLButtonElement}
 */
const pauseBtn = document.getElementById('play-pause');
/**
 * @type {HTMLButtonElement}
 */
const resetBtn = document.getElementById('restart');
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
    pauseBtn.disabled = true;
    resetBtn.disabled = true;
    promptMathBtn.disabled = true;
    promptShellBtn.disabled = true;
    promptSettingsBtn.disabled = true;
}
function ReEnableButtons() {
    pauseBtn.disabled = false;
    resetBtn.disabled = false;
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
const dtCountShow = document.getElementById('dt-count-value-display');
const dtShow = document.getElementById('dt-value-display');

function UpdateDt()
{
    dtShow.innerHTML = dtInput.value;
    dt = new Decimal(dtInput.value).times( Ten.pow(dtExponent.value) );
}

dtInput.addEventListener('input', UpdateDt);
dtExponent.addEventListener('input', UpdateDt);

const dtCountInput = document.getElementById('dt-count');
dtCountInput.addEventListener('input', () => {
    try {
        dtCount = Number(dtCountInput.value);
    } catch {
        dtCount = 1;
        dtCountInput.value = 1;
    } finally {
        dtCountShow.innerHTML = dtCount;
    }
});

const tableMassInput = document.getElementById('table-mass');
const tableMassExponent = document.getElementById('table-mass-unit');
const tableMassCountShow = document.getElementById('table-mass-value-display');

function UpdateTableMass()
{
    tableMassCountShow.innerHTML = tableMassInput.value;
    tableMassMass = new Decimal(tableMassInput.value).times( Ten.pow(tableMassExponent.value) );
}

tableMassInput.addEventListener('input', UpdateTableMass);
tableMassExponent.addEventListener('input', () => {
    UpdateTableMass();
    resetUI();
});

const fallingMassInput = document.getElementById('falling-mass');
const fallingMassExponent = document.getElementById('falling-mass-unit');
const fallingMassCountShow = document.getElementById('falling-mass-value-display');

function UpdateFallingMass()
{
    fallingMassCountShow.innerHTML = fallingMassInput.value;
    fallingMassMass = new Decimal(fallingMassInput.value).times( Ten.pow(fallingMassExponent.value) );
}

fallingMassInput.addEventListener('input', UpdateFallingMass);
fallingMassExponent.addEventListener('input', () => {
    UpdateFallingMass();
    resetUI();
});

const isFixedLength = document.getElementById('cable');

const allowGrabbing = document.getElementById('interactions');

const rPrimeStartHtml = document.getElementById('rp-start');
const rPrimeStartShow = document.getElementById('rp-start-display');
const rPrimeExponent = document.getElementById('rp-start-unit');

const hPrimeStartHtml = document.getElementById('hp-start');
const hPrimeStartShow = document.getElementById('hp-start-display');
const hPrimeExponent = document.getElementById('hp-start-unit');

function SetInitialRPrime()
{
    InitialRPrime = new Decimal(rPrimeStartHtml.value).times( Ten.pow(rPrimeExponent.value) );
    rPrimeStartShow.innerHTML = rPrimeStartHtml.value;
    if (isFixedLength.checked)
    { //Mirror, as the two values cannot diverge
        InitialHPrime = InitialRPrime;
        hPrimeStartHtml.value = rPrimeStartHtml.value;
        hPrimeStartHtml.disabled = true;
        hPrimeStartShow.innerHTML = rPrimeStartHtml.value;
        hPrimeExponent.value = rPrimeExponent.value;
        hPrimeExponent.disabled = true;
        return;
    }
    hPrimeStartHtml.disabled = hPrimeExponent.disabled = false;
}
rPrimeStartHtml.addEventListener('input', SetInitialRPrime);
rPrimeExponent.addEventListener('input', SetInitialRPrime);