import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Billboard } from '@react-three/drei'
import { Mesh } from 'three'
import * as THREE from 'three'
import { Contact, Tag } from '../types'
import { useAppStore } from '../stores/appStore'

interface ContactNodeProps {
  contact: Contact
  position: [number, number, number]
  tags: Tag[]
  onRef?: (id: string, ref: THREE.Object3D) => void
}

function ContactNode({ contact, position, tags, onRef }: ContactNodeProps) {
  const groupRef = useRef<THREE.Group>(null)
  const meshRef = useRef<Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const [positionInitialized, setPositionInitialized] = useState(false)
  const { selectContact } = useAppStore()
  
  useEffect(() => {
    if (groupRef.current && onRef) {
      // Always pass the group reference to ForceSystem
      onRef(contact.id, groupRef.current as any)
    }
  }, [contact.id, onRef])

  useEffect(() => {
    if (groupRef.current && !positionInitialized) {
      // Set initial position only once when component mounts
      groupRef.current.position.set(position[0], position[1], position[2])
      setPositionInitialized(true)
    }
  }, [position, positionInitialized])

  // Get primary color based on first tag
  const getNodeColor = () => {
    if (contact.tags.length === 0) return '#64748b'
    const tagColor = tags.find(tag => tag.name === contact.tags[0])?.color
    return tagColor || '#64748b'
  }

  const handleClick = () => {
    selectContact(contact)
  }

  useFrame((state) => {
    if (meshRef.current && hovered) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.1
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
    }
  })

  return (
    <group ref={groupRef}>
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={handleClick}
        scale={hovered ? 1.2 : 1}
      >
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial 
          color={getNodeColor()}
          emissive={getNodeColor()}
          emissiveIntensity={hovered ? 0.3 : 0.1}
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>
      
      {/* Name - Always visible above the node */}
      <Billboard
        follow={true}
        lockX={false}
        lockY={false}
        lockZ={false}
        position={[0, 0.8, 0]}
      >
        <Text
          fontSize={0.25}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          maxWidth={3}
          textAlign="center"
        >
          {contact.name}
        </Text>
      </Billboard>
      
      {/* Additional info on hover */}
      {hovered && (
        <Billboard
          follow={true}
          lockX={false}
          lockY={false}
          lockZ={false}
          position={[0, 0.5, 0]}
        >
          <Text
            fontSize={0.15}
            color="#b3b3b3"
            anchorX="center"
            anchorY="middle"
            maxWidth={3}
            textAlign="center"
          >

            {contact.tags.length > 0 ? contact.tags.join(', ') : 'No tags'}
          </Text>
        </Billboard>
      )}
      
      {/* Email on hover if available */}
      {hovered && contact.email && (
        <Billboard
          follow={true}
          lockX={false}
          lockY={false}
          lockZ={false}
          position={[0, 0.3, 0]}
        >
          <Text
            fontSize={0.12}
            color="#888888"
            anchorX="center"
            anchorY="middle"
            maxWidth={4}
            textAlign="center"
          >
            {contact.email}
          </Text>
        </Billboard>
      )}
    </group>
  )
}

export default ContactNode