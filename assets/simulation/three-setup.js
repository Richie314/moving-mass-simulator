'use strict';
if ('THREE' in window)
{
    throw new Error('THREE.js not loaded properly');
}
const screenContainer = document.getElementById('3d-container');

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
const camera = new THREE.PerspectiveCamera( 75, 16 / 9, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( 3200, 1800 );
screenContainer.appendChild( renderer.domElement );