import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Galaxy
 */

const parameters = {
    particles :{
        count:100000,
        size:0.01
    },
    galaxy:{
        radius:5,
        branches:3,
        spin:1,
        randomness:0.2,
        randomnessPower: 3,
        insideColor: 0xff6030,
        outsideColor: 0x1b3984
    }
}

let particleGeometry = null;
let particleMaterial = null;
let particleMesh = null;

const generateGalaxy = ()=>{
    /**Destroy old galaxy to avoid memory leak */
    if(particleMesh !== null) {
        particleGeometry.dispose();
        particleMaterial.dispose();
        scene.remove(particleMesh);
    }
    const {particles, galaxy} = parameters;
    particleGeometry = new THREE.BufferGeometry();
    const positionsOfParticles = new Float32Array(particles.count * 3);
    const colorsOfParticles = new Float32Array(particles.count * 3);

    //colors

    const colorInside = new THREE.Color(galaxy.insideColor);
    const colorOutisde = new THREE.Color(galaxy.outsideColor);



    for(let i =0; i < particles.count; i++) {
        let i3 = i*3;
        const radius = Math.random() * galaxy.radius;
        const spinAngle = radius * galaxy.spin;
        const branchAngle = ((i % galaxy.branches) / galaxy.branches) * 2 * Math.PI;
        const randomX = Math.pow(Math.random(), galaxy.randomnessPower) * ( Math.random() < 0.5 ? 1: -1);
        const randomY = Math.pow(Math.random(), galaxy.randomnessPower) * ( Math.random() < 0.5 ? 1: -1);
        const randomZ = Math.pow(Math.random(), galaxy.randomnessPower) * ( Math.random() < 0.5 ? 1: -1);
        positionsOfParticles[i3] = radius * Math.cos(branchAngle + spinAngle) + randomX; // x
        positionsOfParticles[i3+1] = randomY; // y
        positionsOfParticles[i3+2] = radius * Math.sin(branchAngle + spinAngle) + randomZ; // z


        // Color
        const mixedColor = colorInside.clone();
        mixedColor.lerp(colorOutisde, radius/galaxy.radius);

        colorsOfParticles[i3] = mixedColor.r;
        colorsOfParticles[i3 + 1] = mixedColor.g;
        colorsOfParticles[i3 + 2] = mixedColor.b;
    }
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(positionsOfParticles,3));
    particleGeometry.setAttribute("color", new THREE.BufferAttribute(colorsOfParticles,3));

    /** Material */
    particleMaterial = new THREE.PointsMaterial({
        size:particles.size,
        sizeAttenuation:true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true
    });

    particleMesh = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleMesh);
}
generateGalaxy();

/**Debug UI */
gui.add(parameters.particles, 'count').min(100).max(1000000).step(100).onFinishChange(generateGalaxy).name('Stars Count');
gui.add(parameters.particles, 'size').min(0.001).max(0.1).step(0.001).onFinishChange(generateGalaxy).name('Size of Stars');
gui.add(parameters.galaxy, 'radius').min(0.01).max(20).step(0.01).onFinishChange(generateGalaxy).name('Galaxy Size');
gui.add(parameters.galaxy, 'branches').min(2).max(20).step(1).onFinishChange(generateGalaxy).name('Galaxy Branches');
gui.add(parameters.galaxy, 'spin').min(-5).max(5).step(0.001).onFinishChange(generateGalaxy).name('Curviness');
gui.add(parameters.galaxy, 'randomness').min(0).max(2).step(0.01).onFinishChange(generateGalaxy).name('Randomness');
gui.add(parameters.galaxy, 'randomnessPower').min(1).max(10).step(0.001).onFinishChange(generateGalaxy).name('Spread');
gui.addColor(parameters.galaxy, 'insideColor').onFinishChange(generateGalaxy).name('Core Color');
gui.addColor(parameters.galaxy, 'outsideColor').onFinishChange(generateGalaxy).name('Edge Color');
/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 3
camera.position.y = 3
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()