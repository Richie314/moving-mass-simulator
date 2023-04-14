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
const promptSettingsBtn = document.getElementById('show-settings');
/**
 * @type {HTMLButtonElement}
 */
const promptExportBtn = document.getElementById('show-export');
/**
 * @type {HTMLButtonElement}
 */
const promptShellBtn = document.getElementById('show-terminal-btn');
/**
 * @type {HTMLButtonElement}
 */
const promptMathBtn = document.getElementById('show-math-btn');


function DisableButtons() {
    pauseBtn.disabled = true;
    resetBtn.disabled = true;
    promptMathBtn.disabled = true;
    promptShellBtn.disabled = true;
    promptSettingsBtn.disabled = true;
    promptExportBtn.disabled = true;
}
function ReEnableButtons() {
    pauseBtn.disabled = false;
    resetBtn.disabled = false;
    promptMathBtn.disabled = false;
    promptShellBtn.disabled = false;
    promptSettingsBtn.disabled = false;
    promptExportBtn.disabled = false;
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
/*             Tutorial buttons               */
/**********************************************/

const tutorialDivthree = document.getElementById('tutorial-3d');
const tutorialDivtwo = document.getElementById('tutorial-2d');
setTimeout(() => {
    tutorialDivthree.style.height = '0';
    tutorialDivtwo.style.height = '0';
    log('Nascosti i tutorial');
}, 60000);
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
function UpdateDtCount()
{
    dtCount = Number(dtCountInput.value);
    dtCountShow.innerHTML = dtCount;
}
dtCountInput.addEventListener('input', UpdateDtCount);

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

const isNotFixedLength = document.getElementById('cable');

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
    if (!isNotFixedLength.checked)
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
isNotFixedLength.addEventListener('change', SetInitialRPrime);

function SetInitialHPrime()
{
    hPrimeStartShow.innerHTML = hPrimeStartHtml.value;
    InitialHPrime = new Decimal(hPrimeStartHtml.value).times( Ten.pow(hPrimeExponent.value) );
}
hPrimeStartHtml.addEventListener('input', SetInitialHPrime);
hPrimeExponent.addEventListener('input', SetInitialHPrime);

const thetaPStartHtml = document.getElementById('thetap-start');
function SetInitialThetaPrime()
{
    InitialThetaPrime = new Decimal(thetaPStartHtml.value);
}

const springHtml = document.getElementById('hooke');
const springShow = document.getElementById('hooke-value-display');
const springRelaxHtml = document.getElementById('spring-relax');
const springRelaxShow = document.getElementById('spring-relax-value-display');

function UpdateSpringValue()
{
    springConstant = new Decimal(springHtml.value);
    springShow.innerHTML = springHtml.value;
    springRelaxLength = new Decimal(springRelaxHtml.value);
    springRelaxShow.innerHTML = springRelaxHtml.value;
}
springHtml.addEventListener('input', UpdateSpringValue);
springRelaxHtml.addEventListener('input', UpdateSpringValue);

const tailInput = document.getElementById('tail');
function UpdateTailSettings()
{
    drawTail = tailInput.checked;
}
tailInput.addEventListener('change', UpdateTailSettings);

const tailFreqHtml = document.getElementById('table-mass-tail-freq');
const tailFreqShow = document.getElementById('table-mass-tail-freq-show');

function UpdateTailFrequency()
{
    tailFreq = Number(tailFreqHtml.value);
    tailFreqShow.innerHTML = tailFreqHtml.value;
}
tailFreqHtml.addEventListener('input', UpdateTailFrequency);



const timeMaxInput = document.getElementById('max-export');
const timeMaxExponent = document.getElementById('max-export-unit');
const timeMaxShow = document.getElementById('max-export-value-display');

function UpdateTimeMax()
{
    timeMaxShow.innerHTML = timeMaxInput.value;
    TimeMax = new Decimal(timeMaxInput.value).times( Ten.pow(timeMaxExponent.value) );
}

timeMaxInput.addEventListener('input', UpdateTimeMax);
timeMaxExponent.addEventListener('input', UpdateTimeMax);

const hideExport = document.getElementById('close-export');
const exportPopUp = document.getElementById('export-menu');
const exportBtn = document.getElementById('export-btn');

promptExportBtn.onclick = () => {
    exportPopUp.classList.add('show');
    DisableButtons();
    exportPopUp.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
        inline: 'end'
    });
};
hideExport.onclick = () => {
    exportPopUp.classList.remove('show');
    ReEnableButtons();
};