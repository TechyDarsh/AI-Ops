import React, { Suspense, useRef } from 'react';
import { useGLTF, OrbitControls, Environment, ContactShadows, Float, MeshReflectorMaterial, SpotLight, Sparkles } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Enhanced AssetViewer with Gesture Control Refs
 * Allows rotating and zooming programmatically via webcam hand gestures.
 */
export function AssetViewer({ asset, height = '100%', controlsRef, zoomLevel = 5, rotationOffset = [0, 0] }) {
  return (
    <div style={{ height, width: '100%', position: 'relative', overflow: 'hidden' }}>
      <Canvas
        camera={{ position: [zoomLevel, zoomLevel, zoomLevel], fov: 40 }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
      >
        <ambientLight intensity={0.4} color="#8ab0cc" />
        <SpotLight position={[10, 15, 10]} angle={0.35} penumbra={1} intensity={2.5} color="#00f0ff" castShadow />
        <SpotLight position={[-10, 15, -10]} angle={0.35} penumbra={1} intensity={1.5} color="#ff0055" castShadow />
        <pointLight position={[0, 3, 0]} intensity={1} color="#00ff9d" distance={8} />
        
        {/* Futuristic Floating Particles */}
        <Sparkles count={180} scale={14} size={3.5} speed={0.5} opacity={0.7} color="#00f0ff" />

        <Suspense fallback={null}>
          <group rotation={[rotationOffset[1], rotationOffset[0], 0]}>
            <Float speed={1.5} rotationIntensity={0.15} floatIntensity={0.4}>
              <Model path={asset.model} scale={asset.scale || 1} />
            </Float>
          </group>
        </Suspense>

        <Environment preset="night" />
        <ContactShadows position={[0, -0.5, 0]} opacity={0.6} scale={10} blur={2.5} far={10} color="#00f0ff" />
        
        {/* High-tech reflective grid floor */}
        <mesh receiveShadow rotation-x={-Math.PI / 2} position={[0, -0.55, 0]}>
          <planeGeometry args={[50, 50]} />
          <MeshReflectorMaterial
            blur={[300, 100]}
            resolution={512}
            mixBlur={1}
            mixStrength={50}
            roughness={0.2}
            depthScale={1.2}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.4}
            color="#040711"
            metalness={0.9}
          />
        </mesh>

        <OrbitControls
          ref={controlsRef}
          enableDamping
          dampingFactor={0.05}
          maxPolarAngle={Math.PI / 1.85}
          autoRotate={false}
        />
      </Canvas>
    </div>
  );
}

function Model({ path, scale }) {
  const { scene } = useGLTF(path);
  return <primitive object={scene.clone()} scale={scale} />;
}
