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

const thHtml = document.getElementById('th-html');
const thpHtml = document.getElementById('thp-html');
const thppHtml = document.getElementById('thpp-html');

const tHtml = document.getElementById('t-html');
const ugHtml = document.getElementById('ug-html');
const ukHtml = document.getElementById('uk-html');
const tuHtml = document.getElementById('tu-html');

var tableMassMass = new Decimal(1);
var fallingMassMass = new Decimal(2);

const tableMass = new MassRotatingObject(
    tableMassMass,
    new PolarVector(1, pi.div(4)), //Initial position
    new PolarVector(0, 0),  //Initial radial and angular speed
    new PolarVector(0, 0)); //Initial acceleration doesn't really count

const fallingMass = new MassFallingObject(
    fallingMassMass,
    new Vector3(0, 0, -0.50),
    new Vector3(0, 0, 0),
    gravity);
var dt = new Decimal(0.001);
var dtCount = 1;

const VerySimpleEngine = new NoFrictionFixedLengthEngine(tableMass, fallingMass, 1.5, dt);
var TableMeasures = new Vector3(4, 2, 2);
var simulation = new Simulation(VerySimpleEngine, topViewCanvas, sideViewCanvas, TableMeasures, dtCount);

var smoothRefresher = 0;
/**
 * @param {Simulation} sim 
 */
function RefreshSimulationParams(sim)
{
    sim.dt = dt;
    sim.dtCount = dtCount;
    sim.tableMass.mass = tableMassMass;
    sim.fallingMass.mass = fallingMassMass;

    if (smoothRefresher++ == 4)
    {
        rHtml.innerHTML = sim.tableMass.r.toSignificantDigits(6, Decimal.ROUND_UP);
        rpHtml.innerHTML = sim.tableMass.rPrime.toSignificantDigits(6, Decimal.ROUND_UP);
        rppHtml.innerHTML = sim.tableMass.rDoublePrime.toSignificantDigits(6, Decimal.ROUND_UP);
    
        hHtml.innerHTML = sim.fallingMass.height.toSignificantDigits(6, Decimal.ROUND_UP);
        hpHtml.innerHTML = sim.fallingMass.heightPrime.toSignificantDigits(6, Decimal.ROUND_UP);
        hppHtml.innerHTML = sim.fallingMass.heightDoublePrime.toSignificantDigits(6, Decimal.ROUND_UP);
    
        lHtml.innerHTML = (sim.fallingMass.height.abs().plus(sim.tableMass.r) ).toSignificantDigits(6, Decimal.ROUND_UP);

        thHtml.innerHTML = sim.tableMass.theta.toSignificantDigits(6, Decimal.ROUND_UP);
        thpHtml.innerHTML = sim.tableMass.thetaPrime.toSignificantDigits(6, Decimal.ROUND_UP);
        thppHtml.innerHTML = sim.tableMass.thetaDoublePrime.toSignificantDigits(6, Decimal.ROUND_UP);
    
        tHtml.innerHTML = sim.fallingMass.kinetic.plus( sim.tableMass.kinetic ).toSignificantDigits(6, Decimal.ROUND_UP);
        ugHtml.innerHTML = sim.fallingMass.gravityPotential.toSignificantDigits(6, Decimal.ROUND_UP);
        //tuHtml.innerHTML = sim.fallingMass.heightDoublePrime.toSignificantDigits(6, Decimal.ROUND_UP);

        smoothRefresher = 0;
    }
}
simulation.onRefresh(RefreshSimulationParams);

//All is loaded:
//Start the simulation
window.threeAnimate(simulation);