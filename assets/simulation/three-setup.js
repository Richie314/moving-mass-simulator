import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
//import { WebGL } from 'three/addons/capabilities/WebGL.js';
/*
if ( !WebGL.isWebGLAvailable() ) {

	throw new Error(WebGL.getWebGLErrorMessage());
}
*/
const screenContainer = document.getElementById('d3-container');

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, screenContainer.clientWidth / screenContainer.clientHeight, 0.1, 1000 );
camera.position.set( -35, 240, -250 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( screenContainer.clientWidth, screenContainer.clientHeight );

screenContainer.appendChild( renderer.domElement );
screenContainer.addEventListener('resize', () => {
    camera.aspect = screenContainer.clientWidth / screenContainer.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( screenContainer.clientWidth, screenContainer.clientHeight );
}, false);

const light = new THREE.AmbientLight( 0x909090 );
scene.add( light );

//Axis confuse a bit
//const axesHelper = new THREE.AxesHelper( 1000 );
//scene.add( axesHelper );

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
const tableMesh = new THREE.MeshBasicMaterial( { color: 0x2f2312 } );

const tableMassMesh = new THREE.MeshBasicMaterial( { color: 0xff0000 } );

const fallingMesh = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );

const lineMaterial = new THREE.LineBasicMaterial( { color: 0x0000ff } );

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

//Objects
const tableObject = new THREE.Mesh( tableGeometry, tableMesh );
tableObject.position.setY(tableHeight - tableThickness)
scene.add( tableObject );

const tableMassObject = new THREE.Mesh( tableMassGeometry, tableMassMesh );
scene.add( tableMassObject );

const fallingObject = new THREE.Mesh( fallingGeometry, fallingMesh );
scene.add( fallingObject );

const tableLine = new THREE.Line( tableLineGeometry, lineMaterial);
scene.add( tableLine );

const fallingLine = new THREE.Line( fallingLineGeometry, lineMaterial);
scene.add( fallingLine );

/**
 * @param {THREE.Vector3} threeV 
 * @param {PolarVector} polarV 
 * @param {THREE.Line} line
 */
function tableCoordsToTHREE(threeV, polarV, line)
{
    const scaled = polarV.scaled(tableWidth / 4);
    threeV.setFromCylindricalCoords(scaled.r.toNumber(), -scaled.theta.toNumber(), tableHeight);
    line.geometry.attributes.position.array[3] = threeV.x;
    line.geometry.attributes.position.array[4] = threeV.y;
    line.geometry.attributes.position.array[5] = threeV.z;
    line.geometry.attributes.position.needsUpdate = true;
}
/**
 * @param {THREE.Vector3} threeV 
 * @param {Vector3} vec 
 */
function fallingCoordsToTHREE(threeV, vec, line)
{
    const scaled = vec.times(tableWidth / 4);
    threeV.set(scaled.x.toNumber(), tableHeight + scaled.z.toNumber(), scaled.y.toNumber());
    line.geometry.attributes.position.array[3] = threeV.x;
    line.geometry.attributes.position.array[4] = threeV.y;
    line.geometry.attributes.position.array[5] = threeV.z;
    line.geometry.attributes.position.needsUpdate = true;
}
/**
 * Main animation rendering function
 * @param {Simulation} simulation 
 * @returns {number}
 */
function threeAnimate(simulation)
{
    if (!isRunning)
    {
        //Will check again in one second
        return setTimeout(threeAnimate, 1000, simulation);
    }
    simulation.refresh();
    simulation.iterateAndDraw(simulation.dtCount);
    controls.update();

    tableCoordsToTHREE(tableMassObject.position, simulation.tableMass.position, tableLine);
    fallingCoordsToTHREE(fallingObject.position, simulation.fallingMass.position, fallingLine);

	renderer.render( scene, camera );
    return requestAnimationFrame(()=> threeAnimate(simulation));
}
window.threeAnimate = threeAnimate;