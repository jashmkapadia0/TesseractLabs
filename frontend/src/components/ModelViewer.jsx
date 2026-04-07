import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { ThreeMFLoader } from 'three/examples/jsm/loaders/3MFLoader.js'
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export default function ModelViewer({ file, convertedGlbUrl, onError, uploadComplete }) {
  const containerRef = useRef(null)
  const sceneRef = useRef(null)
  const rendererRef = useRef(null)
  const controlsRef = useRef(null)
  const [loading, setLoading] = useState(false)
  const [unsupported, setUnsupported] = useState(false)

  useEffect(() => {
    if (!file || !containerRef.current) return

    const ext = file.name.split('.').pop().toLowerCase()
    const canRenderDirectly = ['stl', 'obj', '3mf', 'ply'].includes(ext)

    if (!canRenderDirectly && !convertedGlbUrl) {
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
    if (convertedGlbUrl) {
      loader = new GLTFLoader()
    } else if (ext === 'stl') {
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

      if (convertedGlbUrl && object.scene) {
        mesh = object.scene
        const box = new THREE.Box3().setFromObject(mesh)
        const center = box.getCenter(new THREE.Vector3())
        mesh.position.sub(center) // Center the object
      } else if (ext === 'stl' || ext === 'ply') {
        geometry = object
        geometry.computeVertexNormals()
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
      if (cameraZ === 0 || isNaN(cameraZ) || !isFinite(cameraZ)) cameraZ = 300
      cameraZ *= 2.0
      camera.position.z = cameraZ
      camera.lookAt(0,0,0)

      // Add helper
      const helper = new THREE.BoxHelper(mesh, 0xffff00)
      scene.add(helper)

      if (url) URL.revokeObjectURL(url)
    }

    const onErrorLocal = (err) => {
      console.error('Error loading model:', err)
      setLoading(false)
      if (onError) onError('Failed to load 3D file for preview')
      if (url) URL.revokeObjectURL(url)
    }

    // Declare url before callbacks so revokeObjectURL works correctly
    let url = convertedGlbUrl ? null : URL.createObjectURL(file)
    if (convertedGlbUrl) {
      loader.load(convertedGlbUrl, onLoad, undefined, onErrorLocal)
    } else {
      loader.load(url, onLoad, undefined, onErrorLocal)
    }

    // Animation loop
    let animating = true
    const animate = () => {
      if (!animating || !rendererRef.current) return
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
      animating = false
      window.removeEventListener('resize', handleResize)
      if (url) URL.revokeObjectURL(url)
      if (containerRef.current && renderer?.domElement) {
        if (containerRef.current.contains(renderer.domElement)) {
           containerRef.current.removeChild(renderer.domElement)
        }
      }
      renderer?.dispose()
      controls?.dispose()
      rendererRef.current = null
    }
  }, [file, convertedGlbUrl, onError])

  const ext = file ? file.name.split('.').pop().toLowerCase() : ''
  const isStepFile = ['step', 'stp'].includes(ext)

  return (
    <div
      className="w-full rounded-lg overflow-hidden bg-dark-tertiary relative group"
      style={{ height: '500px' }}
    >
      {/* Canvas container — must have explicit height, not h-full with min-height parent */}
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      
      {unsupported && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-dark-tertiary text-gray-500 p-8 text-center">
          {uploadComplete && isStepFile ? (
            // Post-upload message for STEP: analysis done, preview just not available
            <>
              <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-lg font-bold mb-2 text-green-400">Analysis Complete!</p>
              <p className="text-sm text-gray-400">3D preview is not available for STEP files,<br/>but your file was analyzed successfully.<br/>You can proceed with your order below.</p>
            </>
          ) : (
            // Pre-upload message for STEP: ask to upload
            <>
              <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p className="text-lg font-bold mb-2 text-gray-300">Preview Unavailable</p>
              <p className="text-sm">Click <span className="text-accent-primary font-semibold">"Analyze &amp; Get Quote"</span> to process this {ext.toUpperCase()} file.</p>
            </>
          )}
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
