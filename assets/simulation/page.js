'use strict';

if (!('threeAnimate' in window))
{
    throw new Error('THREE.js setup not loaded');
}

const topViewCanvas = document.getElementById('top-view');
const sideViewCanvas = document.getElementById('side-view');

const rHtml = document.getElementById('r-html');
const rpHtml = document.getElementById('rp-html');
const rppHtml = document.getElementById('rpp-html');

const hHtml = document.getElementById('h-html');
const hpHtml = document.getElementById('hp-html');
const hppHtml = document.getElementById('hpp-html');

const lHtml = document.getElementById('l-html');
const momentumHtml = document.getElementById('momentum-html');

const thHtml = document.getElementById('th-html');
const thpHtml = document.getElementById('thp-html');
const thppHtml = document.getElementById('thpp-html');

const tHtml = document.getElementById('t-html');
const ugHtml = document.getElementById('ug-html');
const ukHtml = document.getElementById('uk-html');
const tuHtml = document.getElementById('tu-html');
const lagrHtml = document.getElementById('lagr-html');

const elapsedTimeHtml = document.getElementById('elapsed-time');
const itarationCountHtml = document.getElementById('iteration-count');

var tableMassMass = new Decimal(1.5);
var fallingMassMass = new Decimal(2);

var DefaultR = 0.7;
var DefaultH = -0.4;

var InitialRPrime = new Decimal(0.5);
var InitialThetaPrime = new Decimal(1.3);
var InitialHPrime = new Decimal(0.2);

var springRelaxLength = new Decimal(1.1);
var springConstant = new Decimal(300);

var dt = new Decimal(0.00005);
var dtCount = 15;
var cavalieriWeight = 0.3;

var drawTail = true;
var tailFreq = 1;

function LoadInitialVariables()
{
    SetInitialRPrime();
    SetInitialHPrime();
    SetInitialThetaPrime();

    UpdateFallingMass();
    UpdateTableMass();

    UpdateSpringValue();

    UpdateDtCount();
    UpdateDt();
    UpdateIntegrationWieghts();

    UpdateTailSettings();
    UpdateTailFrequency();
}
LoadInitialVariables();
const tableMass = new MassRotatingObject(
    tableMassMass,
    new PolarVector(DefaultR, pi.div(6).times(5)), //Initial position
    new PolarVector(InitialRPrime, InitialThetaPrime),  //Initial radial and angular speed
    new PolarVector(0, 0)); //Initial acceleration doesn't really count

const fallingMass = new MassFallingObject(
    fallingMassMass,
    new Vector3(0, 0, DefaultH),
    new Vector3(0, 0, InitialHPrime),
    gravity);

/**
 * Engine declaration here
 */
const SimpleEngine2 = new TaylorEngine2(tableMass.r.plus( fallingMass.height.abs() ), dt, cavalieriWeight);
const SimpleEngine3 = new TaylorEngine3(springRelaxLength, springConstant, dt, cavalieriWeight);

const RKE_Engine2 = new EulerEngine2(tableMass.r.plus( fallingMass.height.abs() ), dt);
const RKE_Engine3 = new EulerEngine3(springRelaxLength, springConstant, dt);

const RKN_Engine2 = new RungeKuttaNistromEngine2(tableMass.r.plus( fallingMass.height.abs() ), dt);
const RKN_Engine3 = new RungeKuttaNistromEngine3(springRelaxLength, springConstant, dt);

const TableMeasures = new Vector3(5, 2.5, 2.5);
var simulation = new Simulation(
    SimpleEngine3, 
    tableMass, fallingMass,
    topViewCanvas, sideViewCanvas, 
    TableMeasures, dtCount);

var smoothRefresher = 0;
/**
 * @param {Simulation} sim 
 */
function RefreshSimulationParams(sim)
{
    sim.dt = dt;
    sim.dtCount = dtCount;
    sim.cavalieriWeight = cavalieriWeight;

    sim.tableMass.mass = tableMassMass;
    sim.fallingMass.mass = fallingMassMass;

    if (sim.drawTail && !drawTail)
    {
        window.EraseTail();
    }
    sim.drawTail = drawTail;
    sim.tableStaticFrequencyMax = tailFreq;
    
    sim.updateSpring(springConstant, springRelaxLength);

    if (smoothRefresher++ % 4 == 0)
    {
        rHtml.innerHTML = sim.tableMass.r.toSignificantDigits(6, Decimal.ROUND_HALF_EVEN);
        rpHtml.innerHTML = sim.tableMass.rPrime.toSignificantDigits(6, Decimal.ROUND_HALF_EVEN);
        rppHtml.innerHTML = sim.tableMass.rDoublePrime.toSignificantDigits(6, Decimal.ROUND_HALF_EVEN);
    
        hHtml.innerHTML = sim.fallingMass.height.toSignificantDigits(6, Decimal.ROUND_HALF_EVEN);
        hpHtml.innerHTML = sim.fallingMass.heightPrime.toSignificantDigits(6, Decimal.ROUND_HALF_EVEN);
        hppHtml.innerHTML = sim.fallingMass.heightDoublePrime.toSignificantDigits(6, Decimal.ROUND_HALF_EVEN);
    
        lHtml.innerHTML = sim.cable.toSignificantDigits(6, Decimal.ROUND_UP);
        momentumHtml.innerHTML = sim.tableMass.momentum.toSignificantDigits(6, Decimal.ROUND_HALF_EVEN);

        thHtml.innerHTML = sim.tableMass.theta.toSignificantDigits(6, Decimal.ROUND_HALF_EVEN);
        thpHtml.innerHTML = sim.tableMass.thetaPrime.toSignificantDigits(6, Decimal.ROUND_HALF_EVEN);
        thppHtml.innerHTML = sim.tableMass.thetaDoublePrime.toSignificantDigits(6, Decimal.ROUND_HALF_EVEN);
    
        const totalT = sim.fallingMass.kinetic.plus( sim.tableMass.kinetic );
        const Ug = sim.fallingMass.gravityPotential;
        const Uk = sim.Engine.SpringEnergy ? sim.Engine.SpringEnergy(sim.tableMass, sim.fallingMass) : new Decimal(0);
        tHtml.innerHTML = totalT.toSignificantDigits(6, Decimal.ROUND_UP);
        ugHtml.innerHTML = Ug.toSignificantDigits(6, Decimal.ROUND_HALF_EVEN);
        ukHtml.innerHTML = Uk.toSignificantDigits(6, Decimal.ROUND_HANF_EVEN);
        tuHtml.innerHTML = (totalT.plus(Ug).plus(Uk)).toSignificantDigits(6, Decimal.ROUND_HALF_EVEN);
        lagrHtml.innerHTML = (totalT.minus(Ug).minus(Uk)).toSignificantDigits(6, Decimal.ROUND_HALF_EVEN);

        itarationCountHtml.innerHTML = simulation.iterationCount.toExponential(8, Decimal.ROUND_DOWN);
        elapsedTimeHtml.innerHTML = simulation.elapsedTime.toExponential(9, Decimal.ROUND_DOWN);

        smoothRefresher = 1;
    }
}
simulation.onRefresh(RefreshSimulationParams);
function SetSimpleEngine()
{
    if (isNotFixedLength.checked)
    {
        simulation.changeEngine(SimpleEngine3);
    } else {
        SimpleEngine2.cableLength = simulation.cable;
        simulation.changeEngine(SimpleEngine2);
    }
}
function SetRungeKuttaEulerEngine()
{
    if (isNotFixedLength.checked)
    {
        simulation.changeEngine(RKE_Engine3);
    } else {
        RKE_Engine2.cableLength = simulation.cable;
        simulation.changeEngine(RKE_Engine2);
    }
}
function SetRungeKuttaNistromEngine()
{
    if (isNotFixedLength.checked)
    {
        simulation.changeEngine(RKN_Engine3);
    } else {
        RKN_Engine2.cableLength = simulation.cable;
        simulation.changeEngine(RKN_Engine2);
    }
}
const engine_handlers = {
    'simple': SetSimpleEngine,
    'runge-kutta-euler': SetRungeKuttaEulerEngine,
    'runge-kutta-nystrom': SetRungeKuttaNistromEngine
}
function UpdateEngine(name = null)
{
    if (!name || typeof name !== 'string')
    {
        UpdateEngine(engineFamily.value);
        return;
    }
    for (const [key, handler] of Object.entries(engine_handlers))
    {
        if (key === name)
        {
            engineFamily.value = key;
            handler();
            log(`Engine set to '${key}'`);
            Cookies.set('engine', key);
            return;
        }
    }
}
isNotFixedLength.addEventListener('change', UpdateEngine);
engineFamily.addEventListener('change', UpdateEngine);
const cookie_engine = Cookies.get('engine');
UpdateEngine(cookie_engine);

function reset()
{
    LoadInitialVariables();
    const newTableMass = new MassRotatingObject(
        tableMassMass,
        new PolarVector(DefaultR, pi.div(6).times(5)), //Initial position
        new PolarVector(InitialRPrime, InitialThetaPrime),  //Initial radial and angular speed
        new PolarVector(0, 0)); //Initial acceleration doesn't really count
    
    simulation.tableMass = newTableMass;
    const newFallingMass = new MassFallingObject(
        fallingMassMass,
        new Vector3(0, 0, DefaultH),
        new Vector3(0, 0, InitialHPrime),
        gravity);
    simulation.fallingMass = newFallingMass;
    UpdateEngine();
    simulation.restart();
}
simulation.onRestart(window.EraseTail);

var isGrabbing = false;
topViewCanvas.addEventListener('mousedown', evt => {
    //console.log('mousedown');
    if (!allowGrabbing.checked) return;
    pause();
    const rect = evt.target.getBoundingClientRect();
    const cosine = (evt.clientX - rect.left) / evt.target.clientWidth * 2 - 1;
    const sine = -( (evt.clientY - rect.top) / evt.target.clientHeight * 2 - 1 );
    const vec3 = new Vector3(
        cosine * TableMeasures.x / 2 * simulation.topCanvasScaleX, 
        sine * TableMeasures.y / 2 * simulation.topCanvasScaleY,
        0);
    const canvasPos = simulation.tableMass.position.toVec3();
    canvasPos.x = canvasPos.x.times(simulation.topCanvasScaleX);
    canvasPos.y = canvasPos.y.times(simulation.topCanvasScaleY);
    //console.log(vec3.toNumbers(), canvasPos.toNumbers());
    if ( ( vec3.minus(canvasPos) ).module() < simulation.topCanvasDiscRadius )
    {
        isGrabbing = true;
        topViewCanvas.classList.add('grabbing');
    }
});
function grab(evt)
{
    if (!isGrabbing)
    {
        return;
    }
    //console.log('grabbing...');
    const rect = evt.target.getBoundingClientRect();
    const cosine = (evt.clientX - rect.left) / evt.target.clientWidth * 2 - 1;
    const sine = -( (evt.clientY - rect.top) / evt.target.clientHeight * 2 - 1 );
    const vec3 = new Vector3(
        cosine * TableMeasures.x / 2, 
        sine * TableMeasures.y / 2, 0);
    simulation.tableMass.position = vec3.toPolar();
}
function releaseGrab(evt)
{
    grab(evt);
    topViewCanvas.classList.remove('grabbing');
    isGrabbing = false;
}
topViewCanvas.addEventListener('mouseup', evt => {
    //console.log('mouseup')
    releaseGrab(evt);
});
topViewCanvas.addEventListener('mousemove', evt => {
    //console.log('mousemove')
    grab(evt);
});
topViewCanvas.addEventListener('mouseleave', evt => {
    releaseGrab(evt);
});
//All is loaded:
//Start the simulation
window.threeAnimate(simulation);