'use strict';

const topViewCanvas = document.getElementById('');
const sideViewCanvas = document.getElementById('');

const VerySimpleEngine = new NoFrictionFixedLengthEngine();
var TableMeasures = new Vector3(1800, 900, 900);
var simulation = new Simulation(VerySimpleEngine, topViewCanvas, sideViewCanvas, TableMeasures);

