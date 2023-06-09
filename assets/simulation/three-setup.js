import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import WebGL from 'three/addons/capabilities/WebGL.js';

if ( !WebGL.isWebGLAvailable() ) {
    //Browser doesn't have WebGL support
	throw new Error(WebGL.getWebGLErrorMessage());
}

const stats = new Stats();
stats.showPanel( 0 );
document.getElementById('stats').appendChild(stats.dom);

const screenContainer = document.getElementById('d3-container');

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, screenContainer.clientWidth / screenContainer.clientHeight, 0.1, 1000 );
camera.position.set( -35, 240, -250 );

const renderer = new THREE.WebGLRenderer( { alpha: true, premultipliedAlpha: false } );
renderer.setSize( screenContainer.clientWidth, screenContainer.clientHeight );

screenContainer.appendChild( renderer.domElement );
screenContainer.addEventListener('resize', () => {
    camera.aspect = screenContainer.clientWidth / screenContainer.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( screenContainer.clientWidth, screenContainer.clientHeight );
}, false);

const light = new THREE.AmbientLight( 0xf4f4f4 );
scene.add( light );

const gridHelper = new THREE.GridHelper( 400, 50);
scene.add( gridHelper );

const controls = new OrbitControls( camera, renderer.domElement );
controls.mouseButtons = {
	LEFT: THREE.MOUSE.ROTATE,
	MIDDLE: THREE.MOUSE.DOLLY,
	RIGHT: THREE.MOUSE.PAN
}

//Dimensions
const tableHeight = 200;
const tableWidth = 400;
const tableDepth = 200;
const tableThickness = 10;
camera.lookAt( 0, tableHeight, 0 );

//Materials
const tableMesh = new THREE.MeshBasicMaterial( { color: 0x90e0ef, opacity: 0.85, transparent: true } );

const tableMassMesh = new THREE.MeshLambertMaterial( { color: 0xff0000 } );

const fallingMesh = new THREE.MeshLambertMaterial( { color: 0x00ee00 } );

const cableMaterial = new THREE.LineBasicMaterial( { color: 0x0000ff } );

const lineTopMaterial = new THREE.LineBasicMaterial( { color: 0xcc0000 } );
const lineSideMaterial = new THREE.LineBasicMaterial( { color: 0x00cc00 } );

//Geomeries
const tableGeometry = new THREE.BoxGeometry(tableWidth, tableThickness, tableDepth);

const tableMassGeometry = new THREE.CylinderGeometry( 10, 10, 10, 32, 8);

const fallingGeometry = new THREE.SphereGeometry( 10, 32, 32);

const tableGeometryPoints = new Float32Array( 6 );
tableGeometryPoints[0] = 0;
tableGeometryPoints[1] = tableHeight;
tableGeometryPoints[2] = 0;
tableGeometryPoints[3] = 10;
tableGeometryPoints[4] = tableHeight;
tableGeometryPoints[5] = 10;
const tableLineGeometry = new THREE.BufferGeometry();
tableLineGeometry.setAttribute( 'position', new THREE.BufferAttribute( tableGeometryPoints, 3 ) );
tableLineGeometry.setDrawRange( 0, 2 );

const fallingGeometryPoints = new Float32Array( 6 );
fallingGeometryPoints[0] = 0;
fallingGeometryPoints[1] = tableHeight;
fallingGeometryPoints[2] = 0;
fallingGeometryPoints[3] = 0;
fallingGeometryPoints[4] = tableHeight / 2;
fallingGeometryPoints[5] = 0;
const fallingLineGeometry = new THREE.BufferGeometry();
fallingLineGeometry.setAttribute( 'position', new THREE.BufferAttribute( fallingGeometryPoints, 3 ) );
fallingLineGeometry.setDrawRange( 0, 2 );

const oldTableMassPositionsCount = 500;
var oldTableMassPositionsUsed = 0;
const oldTableMassPositions = new Float32Array(3 * oldTableMassPositionsCount);
const followTopLineGeometry = new THREE.BufferGeometry();
followTopLineGeometry.setAttribute( 'position', new THREE.BufferAttribute( oldTableMassPositions, 3 ) );
followTopLineGeometry.setDrawRange( 0, oldTableMassPositionsUsed );

const oldFallingMassPositionsCount = 250;
var oldFallingMassPositionsUsed = 0;
const oldFallingMassPositions = new Float32Array(3 * oldFallingMassPositionsCount);
const followSideLineGeometry = new THREE.BufferGeometry();
followSideLineGeometry.setAttribute( 'position', new THREE.BufferAttribute( oldFallingMassPositions, 3 ) );
followSideLineGeometry.setDrawRange( 0, oldFallingMassPositionsUsed );

/**
 * @param {THREE.Line} line 
 */
function EraseLine(line)
{
    line.geometry.attributes.position.array.fill(0);
    line.geometry.setDrawRange(0, 0);
}
function EraseTail()
{
    EraseLine(followTopLine);
    oldTableMassPositionsUsed = 0;
    EraseLine(followSideLine);
    oldFallingMassPositionsUsed = 0;
}
window.EraseTail = EraseTail;
//Objects
const tableObject = new THREE.Mesh( tableGeometry, tableMesh );
tableObject.position.setY(tableHeight - tableThickness)
scene.add( tableObject );

const tableMassObject = new THREE.Mesh( tableMassGeometry, tableMassMesh );
scene.add( tableMassObject );

const fallingObject = new THREE.Mesh( fallingGeometry, fallingMesh );
scene.add( fallingObject );

const tableLine = new THREE.Line( tableLineGeometry, cableMaterial);
scene.add( tableLine );

const fallingLine = new THREE.Line( fallingLineGeometry, cableMaterial);
scene.add( fallingLine );

const followTopLine = new THREE.Line( followTopLineGeometry, lineTopMaterial);
scene.add( followTopLine );

const followSideLine = new THREE.Line( followSideLineGeometry, lineSideMaterial);
scene.add( followSideLine );

/**
 * @param {THREE.Vector3} threeV 
 * @param {PolarVector} polarV 
 * @param {THREE.Line} line
 * @param {THREE.Line} traceLine
 * @param {bool} updateTraceLine
 */
function tableCoordsToTHREE(threeV, polarV, line, traceLine, updateTraceLine)
{
    const scaled = polarV.scaled(tableWidth / 4);
    threeV.setFromCylindricalCoords(scaled.r.toNumber(), (scaled.theta.minus(halfPi)).toNumber(), tableHeight);

    line.geometry.attributes.position.array[3] = threeV.x;
    line.geometry.attributes.position.array[4] = threeV.y;
    line.geometry.attributes.position.array[5] = threeV.z;
    line.geometry.attributes.position.needsUpdate = true;

    if (updateTraceLine)
    {
        const traceLineArr = traceLine.geometry.attributes.position.array;
        let considerLast = 1;
        if (oldTableMassPositionsUsed < oldTableMassPositionsCount)
        {
            oldTableMassPositionsUsed++;
            traceLine.geometry.setDrawRange( 0, oldTableMassPositionsUsed );
            considerLast = 2;
        }
        
        for (let i = 0; i < oldTableMassPositionsUsed - considerLast; i++)
        {
            traceLineArr[3 * i] = traceLineArr[3 * (i + 1)];
            traceLineArr[3 * i + 1] = traceLineArr[3 * (i + 1) + 1];
            traceLineArr[3 * i + 2] = traceLineArr[3 * (i + 1) + 2];
        }
        traceLineArr[3 * (oldTableMassPositionsUsed - 1)    ] = threeV.x;
        traceLineArr[3 * (oldTableMassPositionsUsed - 1) + 1] = threeV.y;
        traceLineArr[3 * (oldTableMassPositionsUsed - 1) + 2] = threeV.z;
        traceLine.geometry.attributes.position.needsUpdate = true;
    }
}
/**
 * @param {THREE.Vector3} threeV 
 * @param {Vector3} vec 
 * @param {THREE.Line} traceLine
 * @param {bool} updateTraceLine
 */
function fallingCoordsToTHREE(threeV, vec, line, traceLine, updateTraceLine)
{
    const scaled = vec.times(tableWidth / 4);
    threeV.set(scaled.x.toNumber(), tableHeight + scaled.z.toNumber(), scaled.y.toNumber());
    line.geometry.attributes.position.array[3] = threeV.x;
    line.geometry.attributes.position.array[4] = threeV.y;
    line.geometry.attributes.position.array[5] = threeV.z;
    line.geometry.attributes.position.needsUpdate = true;

    if (updateTraceLine)
    {
        const traceLineArr = traceLine.geometry.attributes.position.array;
        let considerLast = 1;
        if (oldFallingMassPositionsUsed < oldFallingMassPositionsCount)
        {
            oldFallingMassPositionsUsed++;
            traceLine.geometry.setDrawRange( 0, oldFallingMassPositionsUsed );
            considerLast = 2;
        }
        
        for (let i = 0; i < oldFallingMassPositionsUsed - considerLast; i++)
        {
            traceLineArr[3 * i] = traceLineArr[3 * (i + 1)] - 0.5; //Pad on the X
            traceLineArr[3 * i + 1] = traceLineArr[3 * (i + 1) + 1];
            traceLineArr[3 * i + 2] = traceLineArr[3 * (i + 1) + 2];
        }
        traceLineArr[3 * (oldFallingMassPositionsUsed - 1)    ] = threeV.x;
        traceLineArr[3 * (oldFallingMassPositionsUsed - 1) + 1] = threeV.y;
        traceLineArr[3 * (oldFallingMassPositionsUsed - 1) + 2] = threeV.z;
        traceLine.geometry.attributes.position.needsUpdate = true;
    }
}
/**
 * Main animation rendering function
 * @param {Simulation} simulation 
 * @returns {number}
 */
function threeAnimate(simulation)
{
	stats.begin();
    if (isRunning)
    {
        simulation.refresh();
        if (!simulation.iterateAndDraw(simulation.dtCount))
            pause();
    } else {
        simulation.drawSimulation();
    }
    tableCoordsToTHREE(
        tableMassObject.position, simulation.tableMass.position, 
        tableLine, followTopLine, isRunning && simulation.drawTail && simulation.TableFrequency());
    fallingCoordsToTHREE(
        fallingObject.position, simulation.fallingMass.position, 
        fallingLine, followSideLine, isRunning && simulation.drawTail);
    controls.update();
	renderer.render( scene, camera );

	stats.end();
    return requestAnimationFrame(() => threeAnimate(simulation));
}
window.threeAnimate = threeAnimate;