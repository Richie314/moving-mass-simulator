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

const WindowTemplate = Msg.factory( {
    class: 'blue',
    preset: 'popup',
    position: 'center',
    sideStack: 'vertical',

    enable_titlebar: true,
    center_titlebar: true,

    persistent: false,
    closeable: true,
    close_on_escape: true,
    close_others_on_show: true,
    lock: true,
    remove_after_close: false,
    
    window_min_height: '45vh',
    window_height: 'auto',
    window_max_height: '90vh',

    window_min_width: '75vw',
    window_width: 'auto',
    window_max_width: '95vw',

    after_show: DisableButtons,
    after_close: ReEnableButtons
} );

const settings = document.getElementById('settings');
const math = document.getElementById('math');
const shell = document.getElementById('shell');
const exportMenu = document.getElementById('export-menu');

const tutorial = document.getElementById('tutorial');

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
    math.style.display = 'block';
    WindowTemplate.show(['Equazioni del moto', math]);
}
promptShellBtn.onclick = () => {
    shell.style.display = 'block';
    WindowTemplate.show(['Console script', shell]);
}
promptSettingsBtn.onclick = () => {
    pause();
    settings.style.display = 'block';
    WindowTemplate.show(['Parametri della simulazione', settings]);
}
promptExportBtn.onclick = () => {
    exportMenu.style.display = 'block';
    WindowTemplate.show(['Esporta simulazione', exportMenu]);
};

/**********************************************/
/*                Tutorial                    */
/**********************************************/

const TutorialWindow = Msg.factory({
    class: 'blue',
    preset: 'popup',
    position: 'center',
    sideStack: 'vertical',

    enable_titlebar: true,
    center_titlebar: true,

    persistent: false,
    closeable: true,
    close_on_escape: true,
    close_others_on_show: true,
    lock: true,
    remove_after_close: false,
    
    window_min_height: '45vh',
    window_height: 'auto',
    window_max_height: '90vh',

    window_min_width: '75vw',
    window_width: 'auto',
    window_max_width: '95vw',

    after_show: () => {
        DisableButtons();
        Cookies.set('tutorial', 1);
    },
    after_close: ReEnableButtons
});
if (Cookies.get('tutorial') != 1)
{
    ShowTutorial();
}
function ShowTutorial()
{
    tutorial.style.display = 'block';
    TutorialWindow.show(['Leggi qui', tutorial]);
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
function UpdateDtCount()
{
    dtCount = Number(dtCountInput.value);
    dtCountShow.innerHTML = dtCount;
}
dtCountInput.addEventListener('input', UpdateDtCount);

const cavalieriInput = document.getElementById('cavalieri-weight');
const cavalieriShow = document.getElementById('cavalieri-weight-value-display');
function UpdateIntegrationWieghts()
{
    cavalieriWeight = Number(cavalieriInput.value);
    cavalieriShow.innerHTML = cavalieriWeight;
}
cavalieriInput.addEventListener('input',UpdateIntegrationWieghts);

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
const engineFamily = document.getElementById('engine');
const cavalieriInputContainer = document.getElementById('cavalieri-input-container');
engineFamily.addEventListener('change', () => {
    if (engineFamily.value === 'simple')
    {
        cavalieriInputContainer.style.display = 'block';
    } else {
        cavalieriInputContainer.style.display = 'none';
    }
});

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

const exportBtn = document.getElementById('export-btn');