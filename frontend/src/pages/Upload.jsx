import { useState, useEffect } from 'react'
import { FaUpload, FaSpinner, FaCheckCircle, FaWhatsapp, FaCreditCard, FaInfoCircle, FaPlus, FaMinus, FaChevronDown } from 'react-icons/fa'
import ModelViewer from '../components/ModelViewer'
import { uploadModel, createRazorpayOrder, verifyPayment, getOrder } from '../api/api'

// ─── Full JLCPCB-style spec data ─────────────────────────────────────────────
const TECH_OPTIONS = [
  { id: 'FDM', label: 'FDM (Plastic)', desc: 'Cost-effective, wide compatibility', basePrice: 1.00 },
  { id: 'SLA', label: 'SLA (Resin)', desc: 'High resolution, smooth surface', basePrice: 0.30 },
]

const MATERIALS_BY_TECH = {
  SLA: [
    { id: 'grey_resin',       label: 'Grey Resin',          priceMultiplier: 1.0 },
    { id: 'black_resin',      label: 'Black Resin',          priceMultiplier: 1.0 },
    { id: 'jlc_black_resin',  label: 'JLC Black Resin',      priceMultiplier: 1.1 },
    { id: '9600_resin',       label: '9600 Resin',           priceMultiplier: 1.15 },
    { id: 'x_resin',          label: 'X Resin',              priceMultiplier: 1.2 },
    { id: 'ledo_6060',        label: 'LEDO 6060 Resin',      priceMultiplier: 1.1 },
    { id: 'cby_resin',        label: 'CBY Resin',            priceMultiplier: 1.05 },
    { id: 'imagine_black',    label: 'Imagine Black Resin',  priceMultiplier: 1.15 },
    { id: '8228_resin',       label: '8228 Resin',           priceMultiplier: 1.1 },
    { id: '8001_resin',       label: '8001 Resin (Transparent)', priceMultiplier: 1.2 },
    { id: '9000he_resin',     label: '9000HE Industrial Resin', priceMultiplier: 1.3 },
  ],
  MJF: [
    { id: 'pa12_hp',   label: 'PA12-HP Nylon', priceMultiplier: 1.0 },
    { id: 'pac_hp',    label: 'PAC-HP Nylon',  priceMultiplier: 1.1 },
    { id: 'pa11_hp',   label: 'PA11-HP Nylon', priceMultiplier: 1.15 },
  ],
  SLM: [
    { id: 'titanium',  label: 'Titanium TC4',         priceMultiplier: 1.5 },
    { id: 'ss316l',    label: '316L Stainless Steel', priceMultiplier: 1.0 },
  ],
  FDM: [
    { id: 'pla',       label: 'PLA Plastic',    priceMultiplier: 1.0 },
    { id: 'abs',       label: 'ABS Plastic',    priceMultiplier: 1.1 },
    { id: 'asa',       label: 'ASA Plastic',    priceMultiplier: 1.2 },
    { id: 'pa12_cf',   label: 'PA12-CF Plastic',priceMultiplier: 1.4 },
    { id: 'tpu',       label: 'TPU Plastic',    priceMultiplier: 1.3 },
  ],
  SLS: [
    { id: '3301pa',    label: '3301PA Nylon',   priceMultiplier: 1.0 },
    { id: '3201paf',   label: '3201PA-F Nylon', priceMultiplier: 1.05 },
    { id: '1172pro',   label: '1172 Pro Nylon', priceMultiplier: 1.15 },
    { id: '3401gb',    label: '3401GB Nylon',   priceMultiplier: 1.2 },
  ],
  WJP: [
    { id: 'fullcolor_resin', label: 'Full-Color Resin', priceMultiplier: 1.0 },
  ],
  BJ: [
    { id: 'bj_316l', label: 'BJ-316L Stainless Steel', priceMultiplier: 1.0 },
  ],
}

const COLORS_BY_TECH = {
  SLA: [
    { id: 'natural', label: 'Natural / Default', hex: '#d4c9b0' },
    { id: 'black',   label: 'Black',  hex: '#1a1a1a' },
    { id: 'white',   label: 'White',  hex: '#f5f5f5' },
    { id: 'grey',    label: 'Grey',   hex: '#888888' },
    { id: 'clear',   label: 'Clear / Transparent', hex: '#c8e6ff', transparent: true },
  ],
  FDM: [
    { id: 'black',   label: 'Black',   hex: '#1a1a1a' },
    { id: 'white',   label: 'White',   hex: '#f5f5f5' },
    { id: 'grey',    label: 'Grey',    hex: '#888888' },
    { id: 'red',     label: 'Red',     hex: '#e53e3e' },
    { id: 'blue',    label: 'Blue',    hex: '#3b82f6' },
    { id: 'green',   label: 'Green',   hex: '#22c55e' },
    { id: 'yellow',  label: 'Yellow',  hex: '#facc15' },
    { id: 'orange',  label: 'Orange',  hex: '#f97316' },
    { id: 'purple',  label: 'Purple',  hex: '#a855f7' },
  ],
  MJF: [
    { id: 'natural', label: 'Natural (White/Grey)', hex: '#d4d4d4' },
    { id: 'black',   label: 'Black (Dyed)',         hex: '#1a1a1a' },
  ],
  SLS: [
    { id: 'natural', label: 'Natural (White)',  hex: '#f5f5f5' },
    { id: 'black',   label: 'Black (Dyed)',     hex: '#1a1a1a' },
  ],
  SLM: [{ id: 'metal', label: 'Metal (Natural)', hex: '#aab0bc' }],
  WJP: [{ id: 'fullcolor', label: 'Full Color (as modeled)', hex: 'gradient' }],
  BJ:  [{ id: 'metal', label: 'Metal (Natural)', hex: '#aab0bc' }],
}

const SURFACE_FINISH_BY_TECH = {
  SLA: [
    { id: 'standard',       label: 'Standard (as printed)',       priceAdd: 0 },
    { id: 'sanding',        label: 'Sanding',                     priceAdd: 2.0 },
    { id: 'spray_painting', label: 'Spray Painting',              priceAdd: 5.0 },
    { id: 'electroplating', label: 'Electroplating',              priceAdd: 8.0 },
  ],
  FDM: [
    { id: 'standard', label: 'Standard (as printed)', priceAdd: 0 },
    { id: 'sanding',  label: 'Sanding',               priceAdd: 2.0 },
  ],
  MJF: [
    { id: 'standard',      label: 'Standard (as printed)', priceAdd: 0 },
    { id: 'dyeing_black',  label: 'Dyeing (Black)',         priceAdd: 1.5 },
  ],
  SLS: [
    { id: 'standard',     label: 'Standard (as printed)', priceAdd: 0 },
    { id: 'dyeing_black', label: 'Dyeing (Black)',         priceAdd: 1.5 },
  ],
  SLM: [
    { id: 'standard',      label: 'Standard (as printed)',  priceAdd: 0 },
    { id: 'polishing',     label: 'Polishing',              priceAdd: 5.0 },
    { id: 'sandblasting',  label: 'Sandblasting',           priceAdd: 4.0 },
  ],
  WJP: [{ id: 'standard', label: 'Standard (Full Color)', priceAdd: 0 }],
  BJ:  [
    { id: 'standard',      label: 'Standard (as printed)', priceAdd: 0 },
    { id: 'sandblasting',  label: 'Sandblasting',          priceAdd: 4.0 },
  ],
}

const USD_TO_INR = 84

function SelectDropdown({ label, options, value, onChange, renderOption }) {
  const [open, setOpen] = useState(false)
  const selected = options.find(o => o.id === value)
  return (
    <div className="relative">
      <label className="block text-xs text-gray-400 mb-1 font-semibold tracking-wide uppercase">{label}</label>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2.5 bg-dark-tertiary border border-dark-border rounded-lg text-sm hover:border-accent-primary transition-all text-left"
      >
        <span>{renderOption ? renderOption(selected) : selected?.label}</span>
        <FaChevronDown className={`ml-2 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-dark-secondary border border-dark-border rounded-lg shadow-2xl max-h-64 overflow-y-auto">
          {options.map(opt => (
            <button
              key={opt.id}
              type="button"
              onClick={() => { onChange(opt.id); setOpen(false) }}
              className={`w-full flex items-center px-3 py-2.5 text-sm text-left hover:bg-dark-tertiary transition-colors ${opt.id === value ? 'text-accent-primary bg-dark-tertiary' : ''}`}
            >
              {renderOption ? renderOption(opt) : opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Upload() {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadResult, setUploadResult] = useState(null)
  const [error, setError] = useState(null)
  const [processing, setProcessing] = useState(false)

  // Config state
  const [technology, setTechnology] = useState('FDM')
  const [material, setMaterial] = useState(MATERIALS_BY_TECH['FDM'][0].id)
  const [color, setColor] = useState(COLORS_BY_TECH['FDM'][0].id)
  const [surfaceFinish, setSurfaceFinish] = useState(SURFACE_FINISH_BY_TECH['FDM'][0].id)
  const [qty, setQty] = useState(1)
  const [infill, setInfill] = useState(20)
  const [remark, setRemark] = useState('')
  const [configuredPrice, setConfiguredPrice] = useState(null)

  // When tech changes, reset dependent fields
  useEffect(() => {
    setMaterial(MATERIALS_BY_TECH[technology][0].id)
    setColor(COLORS_BY_TECH[technology][0].id)
    setSurfaceFinish(SURFACE_FINISH_BY_TECH[technology][0].id)
  }, [technology])

  // Recalculate price whenever options change
  useEffect(() => {
    if (!uploadResult) return
    const tech = TECH_OPTIONS.find(t => t.id === technology)
    const mat  = (MATERIALS_BY_TECH[technology] || []).find(m => m.id === material)
    const surf = (SURFACE_FINISH_BY_TECH[technology] || []).find(s => s.id === surfaceFinish)
    if (!tech || !mat) return
    
    // Base calculation: adjust grams based on infill (backend uses 15% as base)
    const infillRatio = infill / 15
    const baseAdjustedPrice = uploadResult.price * infillRatio
    
    const baseUSD  = baseAdjustedPrice / USD_TO_INR
    const computed = (baseUSD * mat.priceMultiplier + (surf?.priceAdd || 0)) * qty * USD_TO_INR
    setConfiguredPrice(Math.max(computed, tech.basePrice * USD_TO_INR * qty))
  }, [technology, material, surfaceFinish, qty, infill, uploadResult])

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      const allowed = ['.stl', '.obj', '.3mf', '.step', '.stp', '.ply']
      const ext = selectedFile.name.slice((selectedFile.name.lastIndexOf(".") - 1 >>> 0) + 2).toLowerCase()
      
      if (allowed.includes('.' + ext)) {
        setFile(selectedFile)
        setError(null)
        setUploadResult(null)
        setConfiguredPrice(null)
      } else {
        setError(`Please select a valid 3D file (${allowed.join(', ')})`)
        setFile(null)
      }
    }
  }

  const handleUpload = async () => {
    if (!file) { setError('Please select a file first'); return }
    setUploading(true); setError(null); setUploadProgress(0)
    try {
      const result = await uploadModel(file, (progress) => setUploadProgress(progress))
      if (result.success) { setUploadResult(result.data) }
      else { setError(result.error || 'Upload failed') }
    } catch (err) {
      setError(err.message || 'Failed to upload file')
    } finally {
      setUploading(false); setUploadProgress(0)
    }
  }

  const handlePayment = async () => {
    if (!uploadResult) return
    setProcessing(true); setError(null)
    try {
      const orderData = await createRazorpayOrder(uploadResult.orderId)
      if (!orderData.success) throw new Error('Failed to create payment order')
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.async = true
      document.body.appendChild(script)
      script.onload = () => {
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: Math.round((configuredPrice || uploadResult.price) * 100),
          currency: 'INR',
          name: 'Tesseract Labs',
          description: `3D Print: ${uploadResult.filename} | Tech: ${technology} | Qty: ${qty}`,
          order_id: orderData.data.razorpayOrderId,
          handler: async function (response) {
            try {
              const verifyData = {
                orderId: uploadResult.orderId,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              }
              const verifyResult = await verifyPayment(verifyData)
              if (verifyResult.success) {
                setUploadResult(prev => ({ ...prev, payment_status: 'completed' }))
              }
            } catch (err) {
              setError('Payment verification failed: ' + err.message)
            } finally { setProcessing(false) }
          },
          prefill: { name: '', email: '', contact: '' },
          theme: { color: '#3b82f6' },
          modal: { ondismiss: () => setProcessing(false) },
        }
        new window.Razorpay(options).open()
      }
      script.onerror = () => { setError('Failed to load payment gateway'); setProcessing(false) }
    } catch (err) {
      setError(err.message || 'Payment initialization failed')
      setProcessing(false)
    }
  }

  const handleWhatsApp = async () => {
    if (!uploadResult) return
    const techLabel  = TECH_OPTIONS.find(t => t.id === technology)?.label || technology
    const matLabel   = (MATERIALS_BY_TECH[technology] || []).find(m => m.id === material)?.label || material
    const colLabel   = (COLORS_BY_TECH[technology] || []).find(c => c.id === color)?.label || color
    const surfLabel  = (SURFACE_FINISH_BY_TECH[technology] || []).find(s => s.id === surfaceFinish)?.label || surfaceFinish
    const displayPrice = configuredPrice || uploadResult.price
    const message = encodeURIComponent(
      `🖨️ 3D Print Order Request\n\nFile: ${uploadResult.filename}\nTechnology: ${techLabel}\nMaterial: ${matLabel}\nColor: ${colLabel}\nInfill: ${infill}%\nSurface Finish: ${surfLabel}\nQuantity: ${qty}\nEstimated Price: ₹${displayPrice.toFixed(2)}\n${remark ? `\nRemark: ${remark}` : ''}\n\nVolume: ${uploadResult.volume.toFixed(2)} mm³\nWeight: ${(uploadResult.grams * (infill / 15)).toFixed(2)} g`
    )
    const whatsappUrl = `https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER || '917069315037'}?text=${message}`
    window.open(whatsappUrl, '_blank')
  }

  const displayPrice = configuredPrice || uploadResult?.price
  const selectedTech = TECH_OPTIONS.find(t => t.id === technology)
  const selectedColor = (COLORS_BY_TECH[technology] || []).find(c => c.id === color)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-2 text-center">Upload 3D Files</h1>
      <p className="text-center text-gray-400 mb-8">Configure your 3D print, get an instant quote</p>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* ── Left Column ── */}
        <div className="space-y-6">
          {/* File Upload */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">① Select File</h2>
            <input type="file" accept=".stl,.obj,.3mf,.step,.stp,.ply" onChange={handleFileChange} className="hidden" id="model-upload" disabled={uploading} />
            <label htmlFor="model-upload" className="block w-full p-8 border-2 border-dashed border-dark-border rounded-lg text-center cursor-pointer hover:border-accent-primary transition-all">
              <FaUpload className="text-4xl mx-auto mb-4 text-accent-primary" />
              <p className="text-lg">{file ? file.name : 'Click to select 3D model'}</p>
              <p className="text-sm text-gray-400 mt-2">Supports: STL, OBJ, 3MF, STEP, PLY • Max 100MB</p>
            </label>
            {file && !uploadResult && (
              <button onClick={handleUpload} disabled={uploading} className="btn-primary w-full mt-4">
                {uploading ? <><FaSpinner className="animate-spin inline mr-2" />Uploading... {uploadProgress}%</> : <><FaUpload className="inline mr-2" />Analyze & Get Quote</>}
              </button>
            )}
            {error && <div className="mt-4 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-400 text-sm">{error}</div>}
          </div>

          {/* 3D Preview */}
          {file && (
            <div className="card">
              <h2 className="text-xl font-bold mb-4">3D Preview</h2>
              <ModelViewer file={file} onError={setError} />
              <div className="mt-3 text-xs text-gray-400 flex items-start space-x-2">
                <FaInfoCircle className="mt-0.5 flex-shrink-0" />
                <p>Rotate: left-drag · Zoom: scroll · Pan: right-drag</p>
              </div>
            </div>
          )}
        </div>

        {/* ── Right Column ── */}
        <div className="space-y-6">
          {/* ── Config Panel ── */}
          <div className="card">
            <h2 className="text-xl font-bold mb-5">② Configure Print Options</h2>

            {/* Technology Row */}
            <div className="mb-5">
              <label className="block text-xs text-gray-400 mb-2 font-semibold tracking-wide uppercase">3D Technology</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {TECH_OPTIONS.map(tech => (
                  <button
                    key={tech.id}
                    type="button"
                    disabled={tech.disabled}
                    onClick={() => setTechnology(tech.id)}
                    title={tech.desc}
                    className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all text-left ${
                      technology === tech.id
                        ? 'border-accent-primary bg-accent-primary/15 text-accent-primary'
                        : tech.disabled
                        ? 'border-dark-border bg-dark-bg/50 text-gray-600 cursor-not-allowed opacity-60'
                        : 'border-dark-border bg-dark-tertiary hover:border-accent-primary/50 text-gray-300'
                    }`}
                  >
                    <span className="font-bold flex items-center justify-between">
                      {tech.id}
                      {tech.disabled && <span className="text-[10px] bg-dark-border px-1.5 py-0.5 rounded ml-1 text-gray-500">SOON</span>}
                    </span>
                    <span className="block text-xs text-gray-400 mt-0.5 truncate">{tech.disabled ? 'Coming Soon' : tech.desc.split(',')[0]}</span>
                  </button>
                ))}
              </div>
              {selectedTech && (
                <p className="mt-2 text-xs text-gray-500">{selectedTech.desc} · From ${selectedTech.basePrice.toFixed(2)}</p>
              )}
            </div>

            <div className="grid gap-4">
              {/* Material */}
              <SelectDropdown
                label="Material"
                options={MATERIALS_BY_TECH[technology] || []}
                value={material}
                onChange={setMaterial}
              />

              {/* Color */}
              <div>
                <label className="block text-xs text-gray-400 mb-2 font-semibold tracking-wide uppercase">Color</label>
                <div className="flex flex-wrap gap-2">
                  {(COLORS_BY_TECH[technology] || []).map(col => (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() => setColor(col.id)}
                      title={col.label}
                      className={`w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center ${
                        color === col.id ? 'border-accent-primary scale-110 shadow-lg shadow-accent-primary/30' : 'border-dark-border hover:border-gray-400'
                      }`}
                      style={{
                        background: col.hex === 'gradient'
                          ? 'conic-gradient(red,yellow,green,cyan,blue,magenta,red)'
                          : col.hex,
                      }}
                    >
                      {color === col.id && (
                        <FaCheckCircle className={`text-xs ${col.hex === '#f5f5f5' || col.hex === '#facc15' || col.hex === '#d4c9b0' ? 'text-gray-700' : 'text-white'}`} />
                      )}
                    </button>
                  ))}
                </div>
                {selectedColor && (
                  <p className="mt-1.5 text-xs text-gray-400">{selectedColor.label}</p>
                )}
              </div>

              {/* Surface Finish */}
              <SelectDropdown
                label="Surface Finish"
                options={SURFACE_FINISH_BY_TECH[technology] || []}
                value={surfaceFinish}
                onChange={setSurfaceFinish}
                renderOption={(opt) => opt && (
                  <span className="flex items-center justify-between w-full">
                    <span>{opt.label}</span>
                    {opt.priceAdd > 0 && <span className="text-xs text-accent-primary ml-2">+${opt.priceAdd.toFixed(2)}</span>}
                  </span>
                )}
              />

              {/* Quantity */}
              <div>
                <label className="block text-xs text-gray-400 mb-2 font-semibold tracking-wide uppercase">Quantity</label>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="w-9 h-9 rounded-lg bg-dark-tertiary border border-dark-border hover:border-accent-primary flex items-center justify-center transition-all"
                  >
                    <FaMinus className="text-xs" />
                  </button>
                  <span className="w-12 text-center text-lg font-bold">{qty}</span>
                  <button
                    type="button"
                    onClick={() => setQty(q => q + 1)}
                    className="w-9 h-9 rounded-lg bg-dark-tertiary border border-dark-border hover:border-accent-primary flex items-center justify-center transition-all"
                  >
                    <FaPlus className="text-xs" />
                  </button>
                  <span className="text-sm text-gray-500">pieces</span>
                </div>
              </div>

              {/* Infill Density */}
              <div>
                <label className="block text-xs text-gray-400 mb-2 font-semibold tracking-wide uppercase">Infill Density</label>
                <div className="flex flex-wrap gap-2">
                  {[10, 20, 30, 40, 50, 70, 90, 100].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setInfill(val)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        infill === val
                          ? 'border-accent-primary bg-accent-primary/15 text-accent-primary'
                          : 'border-dark-border bg-dark-tertiary hover:border-accent-primary/40 text-gray-400'
                      }`}
                    >
                      {val}%
                    </button>
                  ))}
                </div>
                <p className="mt-1.5 text-[10px] text-gray-500 italic">Increases strength and material usage</p>
              </div>

              {/* 3D Remark */}
              <div>
                <label className="block text-xs text-gray-400 mb-2 font-semibold tracking-wide uppercase">3D Remark</label>
                <textarea
                  value={remark}
                  onChange={e => setRemark(e.target.value)}
                  rows={3}
                  placeholder="Special instructions (e.g. tight tolerances, specific orientation, packaging notes…)"
                  className="w-full px-3 py-2 bg-dark-tertiary border border-dark-border rounded-lg text-sm text-gray-200 placeholder-gray-600 resize-none focus:outline-none focus:border-accent-primary transition-all"
                />
              </div>
            </div>
          </div>

          {/* ── Price Summary ── */}
          {uploadResult && (
            <div className="space-y-4">
              {/* Quote card */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">③ Quote</h2>
                  <FaCheckCircle className="text-2xl text-accent-success" />
                </div>

                <div className="p-5 bg-gradient-to-r from-accent-primary to-accent-secondary rounded-xl text-center mb-4">
                  <p className="text-sm text-blue-100 mb-1">Total Estimated Price</p>
                  <p className="text-4xl font-bold">₹{displayPrice ? displayPrice.toFixed(2) : '—'}</p>
                  <p className="text-xs text-blue-200 mt-1">for {qty} {qty === 1 ? 'piece' : 'pieces'}</p>
                </div>

                {/* Spec summary */}
                <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                  <SpecBox label="Technology" value={technology} />
                  <SpecBox label="Material"   value={(MATERIALS_BY_TECH[technology] || []).find(m => m.id === material)?.label} />
                  <SpecBox label="Color"      value={selectedColor?.label} />
                  <SpecBox label="Surface"    value={(SURFACE_FINISH_BY_TECH[technology] || []).find(s => s.id === surfaceFinish)?.label} />
                  <SpecBox label="Volume"     value={`${uploadResult.volume.toFixed(1)} mm³`} />
                  <SpecBox label="Weight"     value={`${(uploadResult.grams * (infill / 15)).toFixed(2)} g`} />
                  <SpecBox label="Infill"     value={`${infill}%`} />
                  {uploadResult.boundingBox && <>
                    <SpecBox label="Width"  value={`${uploadResult.boundingBox.width.toFixed(1)} mm`} />
                    <SpecBox label="Height" value={`${uploadResult.boundingBox.height.toFixed(1)} mm`} />
                  </>}
                </div>
              </div>

              {/* Actions */}
              <div className="card">
                <h2 className="text-xl font-bold mb-4">④ Next Steps</h2>
                <div className="space-y-3">
                  <button
                    onClick={handlePayment}
                    disabled={processing || uploadResult.payment_status === 'completed'}
                    className="btn-primary w-full"
                  >
                    {processing ? (
                      <><FaSpinner className="animate-spin inline mr-2" />Processing...</>
                    ) : uploadResult.payment_status === 'completed' ? (
                      <><FaCheckCircle className="inline mr-2" />Payment Completed</>
                    ) : (
                      <><FaCreditCard className="inline mr-2" />Pay via Razorpay</>
                    )}
                  </button>

                  <div className="flex items-center space-x-4">
                    <div className="flex-1 h-px bg-dark-border" />
                    <span className="text-gray-400 text-sm">OR</span>
                    <div className="flex-1 h-px bg-dark-border" />
                  </div>

                  <button onClick={handleWhatsApp} className="btn-success w-full">
                    <FaWhatsapp className="inline mr-2 text-xl" />
                    Send Order via WhatsApp
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function SpecBox({ label, value }) {
  return (
    <div className="p-3 bg-dark-tertiary rounded-lg">
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className="font-semibold text-sm truncate">{value || '—'}</p>
    </div>
  )
}
