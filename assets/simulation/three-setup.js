'use strict';

if ( !('THREE' in window) )
{
    throw new Error('THREE.js not loaded properly');
}
const screenContainer = document.getElementById('d3-container');

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, screenContainer.clientWidth / screenContainer.clientHeight, 0.1, 1000 );
camera.position.set( 100, 100, 100 );
camera.lookAt( 0, 0, 0 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( screenContainer.clientWidth, screenContainer.clientHeight );

const light = new THREE.AmbientLight( 0x505050 );
scene.add( light );

screenContainer.appendChild( renderer.domElement );
screenContainer.addEventListener('resize', () => {
    camera.aspect = screenContainer.clientWidth / screenContainer.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( screenContainer.clientWidth, screenContainer.clientHeight );
}, false);

const tableMesh = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const massesMesh = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const lineMaterial = new THREE.LineBasicMaterial( { color: 0x0000ff } );

const tableMassGeometry = new THREE.CylinderGeometry( 5, 5, 20, 32 );

function threeAnimate()
{
    if (!isRunning)
    {
        //Will check again in two secs
        return setTimeout(threeAnimate, 2000);
    }




	renderer.render( scene, camera );
    return requestAnimationFrame(threeAnimate);
}