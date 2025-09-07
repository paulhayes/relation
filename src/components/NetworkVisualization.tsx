import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import ContactNode from './ContactNode'
import ForceSystem from './ForceSystem'
import ConnectionLines from './ConnectionLines'
import ForceControls, { ForceSettings } from './ForceControls'
import { Suspense, useRef, useState } from 'react'
import { useAppStore } from '../stores/appStore'
import * as THREE from 'three'

const defaultForces: ForceSettings = {
  springConstant: 2.0,
  idealDistance: 3.0,
  connectedIdealDistance: 2.0,
  centerStrength: 0.02,
  damping: 0.95,
  maxVelocity: 5,
  visualizeConnections: false
}

function NetworkVisualization() {
  const { contacts, tags } = useAppStore()
  const nodeRefs = useRef<{ [key: string]: THREE.Object3D | null }>({})
  const [forceSettings, setForceSettings] = useState<ForceSettings>(defaultForces)
  
  // Filter contacts based on tag visibility - only show contacts with tags
  const visibleContacts = contacts.filter(contact => 
    contact.tags.length > 0 && 
    contact.tags.some(tag => tags.find(t => t.name === tag)?.visible)
  )

  const handleNodeRef = (id: string, ref: THREE.Object3D) => {
    nodeRefs.current[id] = ref
  }

  const handleForceChange = (newForces: ForceSettings) => {
    setForceSettings(newForces)
  }

  return (
    <div className="h-full w-full bg-app-dark relative">
      <ForceControls onForceChange={handleForceChange} />
      
      <Canvas
        camera={{ position: [10, 10, 10], fov: 50 }}
        style={{ background: '#0a0a0a' }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.3} />
          <directionalLight position={[10, 10, 5]} intensity={0.5} />
          <pointLight position={[0, 0, 0]} intensity={0.3} />
          
          {visibleContacts.map((contact) => (
            <ContactNode
              key={contact.id}
              contact={contact}
              position={contact.position as [number, number, number]}
              tags={tags}
              onRef={handleNodeRef}
            />
          ))}
          
          <ForceSystem 
            contacts={visibleContacts}
            tags={tags}
            nodeRefs={nodeRefs}
            forceSettings={forceSettings}
          />

          <ConnectionLines
            contacts={visibleContacts}
            tags={tags}
            nodeRefs={nodeRefs}
            visible={forceSettings.visualizeConnections}
          />
          
          <OrbitControls 
            enablePan={true} 
            enableZoom={true} 
            enableRotate={true}
            minDistance={5}
            maxDistance={50}
          />
          
          <Environment preset="night" />
        </Suspense>
      </Canvas>
    </div>
  )
}

export default NetworkVisualization