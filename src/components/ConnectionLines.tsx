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
  const meshByColorRef = useRef<{ [color: string]: THREE.Mesh }>({})

  // Generate connections between nodes with shared tags, grouped by color
  const connectionsByColor = useMemo(() => {
    const colorGroups: { [color: string]: Array<{ node1Id: string, node2Id: string }> } = {}

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
          // Use the primary shared tag color
          const primaryTag = sharedTags[0]
          const tagColor = tags.find(t => t.name === primaryTag)?.color || '#64748b'
          
          if (!colorGroups[tagColor]) {
            colorGroups[tagColor] = []
          }
          
          colorGroups[tagColor].push({
            node1Id: contact1.id,
            node2Id: contact2.id
          })
        }
      })
    })

    return colorGroups
  }, [contacts, tags, nodeRefs])

  useFrame(() => {
    if (!visible || !groupRef.current) return

    // Clear old meshes
    Object.values(meshByColorRef.current).forEach(mesh => {
      if (groupRef.current?.children.includes(mesh)) {
        groupRef.current.remove(mesh)
      }
      mesh.geometry.dispose()
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach(mat => mat.dispose())
      } else {
        mesh.material.dispose()
      }
    })
    meshByColorRef.current = {}

    // Create merged geometry for each color
    Object.entries(connectionsByColor).forEach(([color, connections]) => {
      if (connections.length === 0) return

      const geometries: THREE.CylinderGeometry[] = []
      const matrices: THREE.Matrix4[] = []

      connections.forEach(connection => {
        const node1 = nodeRefs.current[connection.node1Id]
        const node2 = nodeRefs.current[connection.node2Id]

        if (!node1 || !node2) return

        const distance = node1.position.distanceTo(node2.position)
        if (distance === 0) return

        // Create cylinder geometry
        const geometry = new THREE.CylinderGeometry(0.05, 0.05, distance, 8)
        
        // Create transformation matrix for this cylinder
        const midpoint = new THREE.Vector3()
          .addVectors(node1.position, node2.position)
          .multiplyScalar(0.5)
        
        const direction = new THREE.Vector3()
          .subVectors(node2.position, node1.position)
          .normalize()
        
        // Create matrix for position and rotation
        const matrix = new THREE.Matrix4()
        const up = new THREE.Vector3(0, 1, 0)
        const quaternion = new THREE.Quaternion().setFromUnitVectors(up, direction)
        matrix.compose(midpoint, quaternion, new THREE.Vector3(1, 1, 1))
        
        geometries.push(geometry)
        matrices.push(matrix)
      })

      if (geometries.length === 0) return

      // Merge all geometries of the same color into one
      const mergedGeometry = new THREE.BufferGeometry()
      const positionArrays: number[] = []
      const normalArrays: number[] = []
      const indexArrays: number[] = []
      let indexOffset = 0

      geometries.forEach((geom, i) => {
        // Apply transformation matrix to geometry
        geom.applyMatrix4(matrices[i])
        
        // Get geometry attributes
        const positions = Array.from(geom.attributes.position.array)
        const normals = Array.from(geom.attributes.normal.array)
        const indices = geom.index ? Array.from(geom.index.array) : undefined

        // Add to merged arrays
        positionArrays.push(...positions)
        normalArrays.push(...normals)
        
        if (indices) {
          const offsetIndices = indices.map(index => index + indexOffset)
          indexArrays.push(...offsetIndices)
          indexOffset += positions.length / 3
        }

        // Dispose individual geometry
        geom.dispose()
      })

      // Set merged geometry attributes
      mergedGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positionArrays, 3))
      mergedGeometry.setAttribute('normal', new THREE.Float32BufferAttribute(normalArrays, 3))
      if (indexArrays.length > 0) {
        mergedGeometry.setIndex(indexArrays)
      }

      // Create material
      const material2 = new THREE.MeshBasicMaterial({
        color: new THREE.Color(color),
        transparent: true,
        opacity: 0.15,
        depthTest: true
      })

      const material1 = new THREE.MeshBasicMaterial({
        transparent: true,
        depthWrite: true,
        depthTest: true,
        colorWrite: false
      })

      // Create single mesh for this color
      const mats = [material1,material2]
      const triCount = mergedGeometry.index ? mergedGeometry.index.count : 0;
      mergedGeometry.addGroup(0,triCount,0);
      mergedGeometry.addGroup(0,triCount,1);
      const mesh = new THREE.Mesh(mergedGeometry, mats)
      
      mesh.renderOrder = -1
      
      meshByColorRef.current[color] = mesh
      groupRef.current?.add(mesh)
    })
  })

  if (!visible) return null

  return <group ref={groupRef} />
}

export default ConnectionLines