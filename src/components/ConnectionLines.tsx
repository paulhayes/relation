import { useFrame } from '@react-three/fiber'
import { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { Contact, Tag } from '../types'

interface ConnectionLinesProps {
  contacts: Contact[]
  tags: Tag[]
  nodeRefs: React.MutableRefObject<{ [key: string]: THREE.Object3D | null }>
  visible: boolean
}

function ConnectionLines({ contacts, tags, nodeRefs, visible }: ConnectionLinesProps) {
  const groupRef = useRef<THREE.Group>(null)
  const linesRef = useRef<{ [key: string]: THREE.Line }>({})

  // Generate connections between nodes with shared tags
  const connections = useMemo(() => {
    const connectionsList: Array<{
      id: string
      contact1: Contact
      contact2: Contact
      sharedTags: string[]
    }> = []

    // Only calculate connections between visible nodes
    const visibleContacts = contacts.filter(contact => nodeRefs.current[contact.id])

    visibleContacts.forEach((contact1, i) => {
      visibleContacts.forEach((contact2, j) => {
        if (i >= j) return // Avoid duplicates

        // Find shared visible tags
        const sharedTags = contact1.tags.filter(tag1 => 
          contact2.tags.includes(tag1) && 
          tags.find(t => t.name === tag1)?.visible
        )

        if (sharedTags.length > 0) {
          connectionsList.push({
            id: `${contact1.id}-${contact2.id}`,
            contact1,
            contact2,
            sharedTags
          })
        }
      })
    })

    return connectionsList
  }, [contacts, tags, nodeRefs])

  useFrame(() => {
    if (!visible || !groupRef.current) return

    // Clear old lines
    Object.values(linesRef.current).forEach(line => {
      if (groupRef.current?.children.includes(line)) {
        groupRef.current.remove(line)
      }
    })
    linesRef.current = {}

    // Create new lines for current connections
    connections.forEach(connection => {
      const node1 = nodeRefs.current[connection.contact1.id]
      const node2 = nodeRefs.current[connection.contact2.id]

      if (!node1 || !node2) return

      // Create line geometry
      const points = [
        node1.position.clone(),
        node2.position.clone()
      ]

      const geometry = new THREE.BufferGeometry().setFromPoints(points)
      
      // Get the primary shared tag color (first shared tag)
      const primaryTag = connection.sharedTags[0]
      const tagColor = tags.find(t => t.name === primaryTag)?.color || '#64748b'
      
      // Create material with transparency and thick lines
      const material = new THREE.LineBasicMaterial({
        color: new THREE.Color(tagColor),
        transparent: true,
        opacity: 0.15, // Very faint
        linewidth: 10 // Note: linewidth may not work on all systems, but we'll try
      })

      const line = new THREE.Line(geometry, material)
      linesRef.current[connection.id] = line
      groupRef.current?.add(line)

      // For systems that don't support linewidth, we can create a thick line using a cylinder
      // This provides consistent thick lines across all systems
      const distance = node1.position.distanceTo(node2.position)
      if (distance > 0) {
        // Remove the thin line
        groupRef.current?.remove(line)
        
        // Create thick line using cylinder geometry (same diameter as nodes: 0.6)
        const cylinderGeometry = new THREE.CylinderGeometry(0.3, 0.3, distance, 8)
        const cylinderMaterial = new THREE.MeshBasicMaterial({
          color: new THREE.Color(tagColor),
          transparent: true,
          opacity: 0.15
        })
        
        const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial)
        
        // Position and orient cylinder between the two nodes
        const midpoint = new THREE.Vector3()
          .addVectors(node1.position, node2.position)
          .multiplyScalar(0.5)
        
        cylinder.position.copy(midpoint)
        
        // Orient cylinder to point from node1 to node2
        const direction = new THREE.Vector3()
          .subVectors(node2.position, node1.position)
          .normalize()
        
        cylinder.lookAt(node2.position)
        cylinder.rotateX(Math.PI / 2) // Cylinder is created along Y axis, rotate to align with direction
        
        linesRef.current[connection.id] = cylinder as any
        groupRef.current?.add(cylinder)
      }
    })
  })

  if (!visible) return null

  return <group ref={groupRef} />
}

export default ConnectionLines