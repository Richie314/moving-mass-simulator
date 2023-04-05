'use strict';

if (!('threeAnimate' in window))
{
    throw new Error('THREE.js setup not loaded');
}

const topViewCanvas = document.getElementById('top-view');
const sideViewCanvas = document.getElementById('side-view');

const tableMass = new MassRotatingObject(
    new Decimal(1),
    new PolarVector(1, pi.div(4)), //Initial position
    new PolarVector(0, 0),  //Initial radial and angular speed
    new PolarVector(0, 0)); //Initial acceleration doesn't really count

const fallingMass = new MassFallingObject(
    new Decimal(2),
    new Vector3(0, 0, -0.50),
    new Vector3(0, 0, 0),
    gravity);
var dt = new Decimal(0.03);

const VerySimpleEngine = new NoFrictionFixedLengthEngine(tableMass, fallingMass, 1.5, dt);
var TableMeasures = new Vector3(3, 1.5, 1.5);
var simulation = new Simulation(VerySimpleEngine, topViewCanvas, sideViewCanvas, TableMeasures);

/**
 * @param {Simulation} sim 
 */
function RefreshSimulationParams(sim)
{
    sim.dt = dt;
}
simulation.onRefresh(RefreshSimulationParams);

//All is loaded:
//Start the simulation
window.threeAnimate(simulation);