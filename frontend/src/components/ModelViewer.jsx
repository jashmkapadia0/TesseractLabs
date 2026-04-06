import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { ThreeMFLoader } from 'three/examples/jsm/loaders/3MFLoader.js'
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export default function ModelViewer({ file, onError }) {
  const containerRef = useRef(null)
  const sceneRef = useRef(null)
  const rendererRef = useRef(null)
  const controlsRef = useRef(null)
  const [loading, setLoading] = useState(false)
  const [unsupported, setUnsupported] = useState(false)

  useEffect(() => {
    if (!file || !containerRef.current) return

    const ext = file.name.split('.').pop().toLowerCase()
    const canRender = ['stl', 'obj', '3mf', 'ply'].includes(ext)

    if (!canRender) {
      setUnsupported(true)
      return
    }

    setUnsupported(false)
    setLoading(true)

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0a0a0a) // Deeper black
    sceneRef.current = scene

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      50,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      10000
    )
    camera.position.set(0, 0, 300)

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    containerRef.current.innerHTML = '' // clear previous
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Controls setup
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.screenSpacePanning = false
    controls.minDistance = 20
    controls.maxDistance = 2000
    controlsRef.current = controls

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight1.position.set(1, 1, 1)
    scene.add(directionalLight1)

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4)
    directionalLight2.position.set(-1, -1, -1)
    scene.add(directionalLight2)

    // Grid and Axes helper
    const gridHelper = new THREE.GridHelper(500, 50, 0x444444, 0x222222)
    scene.add(gridHelper)
    
    const axesHelper = new THREE.AxesHelper(100)
    scene.add(axesHelper)

    // Load Model
    let loader
    if (ext === 'stl') {
      loader = new STLLoader()
    } else if (ext === 'obj') {
      loader = new OBJLoader()
    } else if (ext === '3mf') {
      loader = new ThreeMFLoader()
    } else if (ext === 'ply') {
      loader = new PLYLoader()
    }

    if (!loader) {
       setUnsupported(true)
       return
    }

    const onLoad = (object) => {
      setLoading(false)
      let geometry
      let mesh

      if (ext === 'stl' || ext === 'ply') {
        geometry = object
        geometry.center()
        const material = new THREE.MeshPhongMaterial({
          color: 0x3b82f6,
          specular: 0x111111,
          shininess: 200,
        })
        mesh = new THREE.Mesh(geometry, material)
      } else if (ext === 'obj' || ext === '3mf') {
        mesh = object
        // Normalize object size/position
        const box = new THREE.Box3().setFromObject(mesh)
        const center = box.getCenter(new THREE.Vector3())
        mesh.position.sub(center) // Center the object
      }

      scene.add(mesh)

      // Auto-position camera
      const box = new THREE.Box3().setFromObject(mesh)
      const size = box.getSize(new THREE.Vector3())
      const maxDim = Math.max(size.x, size.y, size.z)
      const fov = camera.fov * (Math.PI / 180)
      let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2))
      cameraZ *= 2.0
      camera.position.z = cameraZ
      camera.lookAt(0,0,0)

      // Add helper
      const helper = new THREE.BoxHelper(mesh, 0xffff00)
      scene.add(helper)

      URL.revokeObjectURL(url)
    }

    const onErrorLocal = (err) => {
      console.error('Error loading model:', err)
      setLoading(false)
      if (onError) onError('Failed to load 3D file for preview')
      URL.revokeObjectURL(url)
    }

    const url = URL.createObjectURL(file)
    loader.load(url, onLoad, undefined, onErrorLocal)

    // Animation loop
    const animate = () => {
      if (!rendererRef.current) return
      requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current) return
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (containerRef.current && renderer?.domElement) {
        if (containerRef.current.contains(renderer.domElement)) {
           containerRef.current.removeChild(renderer.domElement)
        }
      }
      renderer?.dispose()
      controls?.dispose()
      rendererRef.current = null
    }
  }, [file, onError])

  return (
    <div
      className="w-full h-full rounded-lg overflow-hidden bg-dark-tertiary relative group"
      style={{ minHeight: '500px' }}
    >
      <div ref={containerRef} className="w-full h-full" />
      
      {unsupported && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-dark-tertiary text-gray-500 p-8 text-center">
           <p className="text-xl font-bold mb-2 text-gray-400">Preview Unavailable</p>
           <p className="text-sm">3D preview is not yet available for .{file.name.split('.').pop()} files, but you can still proceed with your order!</p>
        </div>
      )}

      {loading && !unsupported && (
        <div className="absolute inset-0 flex items-center justify-center bg-dark-tertiary/50 backdrop-blur-sm">
           <div className="text-center">
              <div className="w-12 h-12 border-4 border-accent-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-300 font-medium">Loading 3D Model...</p>
           </div>
        </div>
      )}

      {!file && (
        <div className="flex items-center justify-center h-full text-gray-400">
          <p>Upload a 3D file to preview</p>
        </div>
      )}
    </div>
  )
}
