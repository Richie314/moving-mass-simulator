'use strict';

const topViewCanvas = document.getElementById('top-view');
const sideViewCanvas = document.getElementById('side-view');

const tableMass = new MassRotatingObject(
    new Decimal(1),
    new PolarVector(12, 0), //Initial position
    new PolarVector(4, 2),  //Initial radial and angular speed
    new PolarVector(0, 0)); //Initial acceleration doesn't really count

const fallingMass = new MassFallingObject(
    new Decimal(2),
    new Vector3(0, 0, -5),
    new Vector3(0, 0, -2),
    new Vector3(0, 0, -9.81));
    var dt = new Decimal(0.001);

const VerySimpleEngine = new NoFrictionFixedLengthEngine(tableMass, fallingMass, 17, dt);
var TableMeasures = new Vector3(1800, 900, 900);
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
threeAnimate(simulation);