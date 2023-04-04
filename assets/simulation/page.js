'use strict';

const topViewCanvas = document.getElementById('top-view');
const sideViewCanvas = document.getElementById('side-view');

const VerySimpleEngine = new NoFrictionFixedLengthEngine();
var TableMeasures = new Vector3(1800, 900, 900);
var simulation = new Simulation(VerySimpleEngine, topViewCanvas, sideViewCanvas, TableMeasures);

//All is loaded:
//Start the simulation
threeAnimate();