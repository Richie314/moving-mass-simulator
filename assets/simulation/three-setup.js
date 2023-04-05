import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const screenContainer = document.getElementById('d3-container');

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, screenContainer.clientWidth / screenContainer.clientHeight, 0.1, 1000 );
camera.position.set( 200, 200, 200 );
camera.lookAt( 0, 0, 0 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( screenContainer.clientWidth, screenContainer.clientHeight );

screenContainer.appendChild( renderer.domElement );
screenContainer.addEventListener('resize', () => {
    camera.aspect = screenContainer.clientWidth / screenContainer.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( screenContainer.clientWidth, screenContainer.clientHeight );
}, false);

const light = new THREE.AmbientLight( 0x505050 );
scene.add( light );

const axesHelper = new THREE.AxesHelper( 1000 );
scene.add( axesHelper );

const gridHelper = new THREE.GridHelper(1000, 100);
scene.add( gridHelper );

const controls = new OrbitControls( camera, renderer.domElement );

const tableMesh = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const massesMesh = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const lineMaterial = new THREE.LineBasicMaterial( { color: 0x0000ff } );

const tableMassGeometry = new THREE.CylinderGeometry( 5, 5, 20, 32 );

/**
 * 
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
    simulation.iterateAndDraw(1);


	renderer.render( scene, camera );
    return requestAnimationFrame(()=> threeAnimate(simulation));
}
window.threeAnimate = threeAnimate;