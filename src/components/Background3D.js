import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars } from '@react-three/drei';
import * as THREE from 'three';

function Particles({ count = 100 }) {
    const mesh = useRef();

    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            const time = Math.random() * 100;
            const factor = Math.random() * 100 + 20;
            const speed = Math.random() * 0.01 + 0.001;
            const x = Math.random() * 40 - 20;
            const y = Math.random() * 40 - 20;
            const z = Math.random() * 40 - 20;

            temp.push({ time, factor, speed, x, y, z });
        }
        return temp;
    }, [count]);

    const dummy = useMemo(() => new THREE.Object3D(), []);

    useFrame((state) => {
        particles.forEach((particle, i) => {
            const { factor, speed, x, y, z } = particle;
            const t = (particle.time += speed);

            dummy.position.set(
                x + Math.cos((t / 10) * factor) + (Math.sin(t * 1) * factor) / 10,
                y + Math.sin((t / 10) * factor) + (Math.cos(t * 2) * factor) / 10,
                z + Math.cos((t / 10) * factor) + (Math.sin(t * 3) * factor) / 10
            );

            const s = Math.cos(t);
            dummy.scale.set(s, s, s);
            dummy.rotation.set(s * 5, s * 5, s * 5);
            dummy.updateMatrix();

            mesh.current.setMatrixAt(i, dummy.matrix);
        });
        mesh.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={mesh} args={[null, null, count]}>
            <dodecahedronGeometry args={[0.2, 0]} />
            <meshPhongMaterial color="#6366f1" />
        </instancedMesh>
    );
}

function FloatingShapes() {
    return (
        <Float speed={1.5} rotationIntensity={1} floatIntensity={2}>
            <mesh position={[5, -5, -10]}>
                <torusKnotGeometry args={[3, 1, 100, 16]} />
                <meshStandardMaterial
                    color="#8b5cf6"
                    roughness={0.1}
                    metalness={0.8}
                    transparent
                    opacity={0.3}
                    wireframe
                />
            </mesh>
            <mesh position={[-5, 5, -15]} rotation={[0, 1, 0]}>
                <octahedronGeometry args={[4, 0]} />
                <meshStandardMaterial
                    color="#6366f1"
                    roughness={0.1}
                    metalness={0.8}
                    transparent
                    opacity={0.2}
                    wireframe
                />
            </mesh>
        </Float>
    )
}

export default function Background3D() {
    return (
        <div className="bg-canvas">
            <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
                <fog attach="fog" args={['#0a0a0a', 10, 40]} />
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1.5} color="#6366f1" />
                <pointLight position={[-10, -10, -10]} intensity={1} color="#8b5cf6" />

                <Particles count={150} />
                <FloatingShapes />
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            </Canvas>
        </div>
    );
}
