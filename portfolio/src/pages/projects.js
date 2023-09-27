import React, { useRef, useState, useEffect } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { degreesToRadians, mix } from "popmotion";
import * as THREE from 'three';
import Head from 'next/head'
import { useScroll } from "framer-motion";


const color = "#D4ADFC";

// A single icosahedron
const Icosahedron = () => {
    const ref = useRef();
    useFrame((state) => {
        if (ref.current) {
            const time = state.clock.elapsedTime;
            ref.current.rotation.y = time * -0.25;  // Adjust the rotation speed as needed
        }
    });

    return (
        <mesh ref={ref}>
            <icosahedronGeometry args={[1, 1]} />
            <meshBasicMaterial wireframe color={color} />
        </mesh>
    );
};


// A single star
const Star = ({ initialPosition, scrollProgress, speed }) => {
    const ref = useRef();
    const time = useRef(0);  // Using useRef to persist state across renders

    // Calculate initial angle
    const initialAngle = Math.atan2(initialPosition.z, initialPosition.x);

    useFrame((state, delta) => {
        if (ref.current) {
            const radius = initialPosition.length();
            const adjustedSpeed = (Math.abs(scrollProgress - 0.5) * 2) * speed; // Speed adjustment according to scroll
            time.current += delta * adjustedSpeed;  // increment time based on the current frame duration and speed
            const angle = time.current + initialAngle;
            const y = initialPosition.y;
            const x = radius * Math.cos(angle);
            const z = radius * Math.sin(angle);
            ref.current.position.set(x, y, z);
        }
    });

    return (
        <mesh ref={ref} position={initialPosition}>
            <octahedronGeometry args={[0.05, 0]} />
            <meshBasicMaterial wireframe color={color} />
        </mesh>
    );
};


// The scene
const Scene = ({ scrollYProgress }) => {
    const { camera } = useThree();
    const [scrollProgress, setScrollProgress] = useState(0);


    // Keep track of the initial stars' positions and speeds
    const [starsData, setStarsData] = useState([]);
    useEffect(() => {
        const newStarsData = [];
        for (let i = 0; i < 200; i++) {
            const distance = mix(2, 3.5, Math.random());
            const yAngle = mix(
                degreesToRadians(80),
                degreesToRadians(100),
                Math.random()
            );
            const xAngle = degreesToRadians(360) * Math.random();
            const position = new THREE.Vector3().setFromSphericalCoords(distance, yAngle, xAngle);
            const speed = mix(0.25, 0.5, Math.random()); // speed is set as a random value between 0.25 and 0.5
            newStarsData.push({ position: position.clone(), speed });
        }
        setStarsData(newStarsData);
    }, []);

    // Update the stars whenever scrollProgress changes
    const [stars, setStars] = useState([]);
    useEffect(() => {
        setStars(starsData.map((starData, i) => (
            <Star key={i} initialPosition={starData.position} scrollProgress={scrollProgress} speed={starData.speed} />
        )));
    }, [starsData, scrollProgress]);

    // Update the camera position based on scroll progress
    useFrame((state, delta) => {
        const yAngle = mix(0.001, degreesToRadians(180), scrollProgress);
        const distance = mix(10, 3, scrollProgress);
        camera.position.setFromSphericalCoords(distance, yAngle, 0);
        camera.updateProjectionMatrix();
        camera.lookAt(0, 0, 0);
    });

    useEffect(() => {
        const onScroll = () => {
            const scrollY = window.scrollY;
            const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
            const newProgress = scrollY / documentHeight;
            setScrollProgress(newProgress);
        };

        window.addEventListener('scroll', onScroll);

        return () => window.removeEventListener('scroll', onScroll);
    }, []);


    // Return the scene
    return (
        <>
            <ambientLight />
            <Icosahedron />
            {stars}
        </>
    );
};


// export projects page
const projects = () => {
    const containerRef = useRef();
    const { scrollYProgress } = useScroll({ container: containerRef });

    return (
        <>
            <Head>
                <title>Lukas Thrane | Projects Page</title>
                <meta name='description' content='any description' />
            </Head>

            <Canvas style={{ position: 'fixed', top: 0, left: 0, bottom: 0, right: 0, zIndex: -1, backgroundColor: "#1D267D" }}>
                <Scene scrollYProgress={scrollYProgress} />
            </Canvas>

            <main ref={containerRef} className='w-full h-[500vh] bg-transparent'>
            </main>
        </>
    );
};

export default projects;

