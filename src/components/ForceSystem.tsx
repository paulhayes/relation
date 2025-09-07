import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Contact, Tag } from '../types'
import * as THREE from 'three'
import { ForceSettings } from './ForceControls'

interface ForceSystemProps {
  contacts: Contact[]
  tags: Tag[]
  nodeRefs: React.MutableRefObject<{ [key: string]: THREE.Object3D | null }>
  forceSettings: ForceSettings
}

function ForceSystem({ contacts, tags, nodeRefs, forceSettings }: ForceSystemProps) {
  const forces = useRef<{ [key: string]: THREE.Vector3 }>({})
  const velocities = useRef<{ [key: string]: THREE.Vector3 }>({})

  useEffect(() => {
    // Initialize forces and velocities for each contact
    contacts.forEach(contact => {
      if (!forces.current[contact.id]) {
        forces.current[contact.id] = new THREE.Vector3()
      }
      if (!velocities.current[contact.id]) {
        velocities.current[contact.id] = new THREE.Vector3()
      }
    })
  }, [contacts])

  useFrame((_, delta) => {
    // Reset forces
    Object.keys(forces.current).forEach(id => {
      forces.current[id].set(0, 0, 0)
    })

    // Only calculate forces between visible nodes (those that have refs)
    const visibleContacts = contacts.filter(contact => nodeRefs.current[contact.id])

    // Calculate forces between all pairs of visible contacts
    visibleContacts.forEach((contact1, i) => {
      const node1 = nodeRefs.current[contact1.id]
      if (!node1) return

      visibleContacts.forEach((contact2, j) => {
        if (i >= j) return // Avoid duplicate calculations
        
        const node2 = nodeRefs.current[contact2.id]
        if (!node2) return

        // Calculate distance
        const distance = node1.position.distanceTo(node2.position)
        if (distance === 0) return

        // Check for shared tags to determine ideal distance
        const sharedTags = contact1.tags.filter(tag1 => 
          contact2.tags.includes(tag1) && 
          tags.find(t => t.name === tag1)?.visible
        )

        // Determine ideal distance based on relationship
        const hasSharedTags = sharedTags.length > 0
        const idealDistance = forceSettings.connectedIdealDistance;

      
        // Spring force calculation: F = k * (current_distance - ideal_distance)
        const displacement = distance - idealDistance
        const springForce = forceSettings.springConstant * displacement

        // Direction vector from node1 to node2
        const direction = new THREE.Vector3()
          .subVectors(node2.position, node1.position)
          .normalize()

        // Apply spring force (positive displacement pushes apart, negative pulls together)
        
        const forceVector = (hasSharedTags) ? direction.clone().multiplyScalar(springForce) : direction.clone().multiplyScalar(-1/distance*distance)
        
        forces.current[contact1.id].add(forceVector)
        forces.current[contact2.id].sub(forceVector)
      })
    })

    // Add center attraction to prevent nodes from floating away (only for visible nodes)
    visibleContacts.forEach(contact => {
      const node = nodeRefs.current[contact.id]
      if (!node) return

      const centerForce = new THREE.Vector3()
        .subVectors(new THREE.Vector3(0, 0, 0), node.position)
        .multiplyScalar(forceSettings.centerStrength)

      forces.current[contact.id].add(centerForce)
    })

    // Apply physics: F = ma, so a = F/m (assuming mass = 1)
    // v += a * dt
    // p += v * dt
    
    visibleContacts.forEach(contact => {
      const node = nodeRefs.current[contact.id]
      if (!node || !forces.current[contact.id] || !velocities.current[contact.id]) return

      // Apply force to velocity (acceleration = force / mass, assuming mass = 1)
      const acceleration = forces.current[contact.id].clone().multiplyScalar(delta)
      velocities.current[contact.id].add(acceleration)
      
      // Apply damping to velocity
      velocities.current[contact.id].multiplyScalar(forceSettings.damping)
      
      // Clamp velocity to prevent instability
      if (velocities.current[contact.id].length() > forceSettings.maxVelocity) {
        velocities.current[contact.id].normalize().multiplyScalar(forceSettings.maxVelocity)
      }
      
      // Apply velocity to position
      const deltaPosition = velocities.current[contact.id].clone().multiplyScalar(delta)
      node.position.add(deltaPosition)
      
      // Constrain to reasonable bounds
      const maxDistance = 10
      if (node.position.length() > maxDistance) {
        node.position.normalize().multiplyScalar(maxDistance)
        // Also reduce velocity when hitting bounds
        velocities.current[contact.id].multiplyScalar(0.5)
      }
    })
  })

  return null // This component doesn't render anything visible
}

export default ForceSystem