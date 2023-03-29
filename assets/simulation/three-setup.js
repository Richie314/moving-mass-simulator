'use strict';
if ( !('THREE' in window) )
{
    throw new Error('THREE.js not loaded properly');
}
const screenContainer = document.getElementById('d3-container');

function threeAnimate()
{
    if (!isRunning)
    {
        //Will check again in two secs
        return setTimeout(threeAnimate, 2000);
    }




    return requestAnimationFrame(threeAnimate);
}

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, screenContainer.clientWidth / screenContainer.clientHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( screenContainer.clientWidth, screenContainer.clientHeight );
screenContainer.appendChild( renderer.domElement );
screenContainer.addEventListener('resize', () => {
    camera.aspect = screenContainer.clientWidth / screenContainer.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( screenContainer.clientWidth, screenContainer.clientHeight );
}, false);