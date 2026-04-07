import { useState, useEffect } from 'react'
import { FaUpload, FaSpinner, FaCheckCircle, FaWhatsapp, FaCreditCard, FaInfoCircle, FaPlus, FaMinus, FaChevronDown } from 'react-icons/fa'
import ModelViewer from '../components/ModelViewer'
import { uploadModel, createRazorpayOrder, verifyPayment, getOrder } from '../api/api'

const MATERIALS = [
  { id: 'pla',  label: 'PLA Plastic', density: 1.24 },
  { id: 'petg', label: 'PETG',        density: 1.27 },
  { id: 'abs',  label: 'ABS Plastic', density: 1.04 },
  { id: 'tpu',  label: 'TPU Plastic', density: 1.21 },
]

const COLORS = [
  { id: 'black',   label: 'Black',   hex: '#1a1a1a' },
  { id: 'white',   label: 'White',   hex: '#f5f5f5' },
  { id: 'grey',    label: 'Grey',    hex: '#888888' },
  { id: 'red',     label: 'Red',     hex: '#e53e3e' },
  { id: 'blue',    label: 'Blue',    hex: '#3b82f6' },
  { id: 'green',   label: 'Green',   hex: '#22c55e' },
  { id: 'yellow',  label: 'Yellow',  hex: '#facc15' },
]



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
  const [material, setMaterial] = useState(MATERIALS[0].id)
  const [color, setColor] = useState(COLORS[0].id)
  const [qty, setQty] = useState(1)
  const [infill, setInfill] = useState(20)
  const [remark, setRemark] = useState('')
  const [configuredPrice, setConfiguredPrice] = useState(null)
  const [estimatedGrams, setEstimatedGrams] = useState(0)
  const [estimatedTime, setEstimatedTime] = useState(0)

  // Recalculate price whenever options change
  useEffect(() => {
    if (!uploadResult || !uploadResult.volume && !uploadResult.boundingBox) return
    const mat  = MATERIALS.find(m => m.id === material)
    if (!mat) return
    
    // Weight = Volume(cm³) × Density × Infill
    // Note: uploadResult.volume is in mm³
    const volumeCm3 = uploadResult.volume / 1000.0;
    const finalInfill = infill / 100.0;
    const calculatedGrams = volumeCm3 * mat.density * finalInfill;
    
    // Time Estimate (hours) = (Grams * 0.05) + (Height * 0.005)
    const heightMm = uploadResult.boundingBox?.height || 0;
    const calcTimeHours = (calculatedGrams * 0.05) + (heightMm * 0.005);
    
    // Calculate Price
    const costPerGram = 1.0; // ₹1 per gram
    const costPerHour = 30.0;
    const profitMultiplier = 1.5;
    
    const singlePrice = ((calculatedGrams * costPerGram) + (calcTimeHours * costPerHour)) * profitMultiplier;
    
    setEstimatedGrams(calculatedGrams);
    setEstimatedTime(calcTimeHours);
    setConfiguredPrice(singlePrice * qty);
  }, [material, qty, infill, uploadResult])

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
          description: `3D Print: ${uploadResult.filename} | ${material.toUpperCase()} | Qty: ${qty}`,
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
    const matLabel   = MATERIALS.find(m => m.id === material)?.label || material
    const colLabel   = COLORS.find(c => c.id === color)?.label || color
    const displayPrice = configuredPrice || uploadResult.price
    const message = encodeURIComponent(
      `🖨️ 3D Print Order Request\n\nFile: ${uploadResult.filename}\nMaterial: ${matLabel}\nColor: ${colLabel}\nInfill: ${infill}%\nQuantity: ${qty}\nEstimated Price: ₹${displayPrice.toFixed(2)}\n${remark ? `\nRemark: ${remark}` : ''}\n\nVolume: ${uploadResult.volume.toFixed(2)} mm³\nWeight: ${estimatedGrams.toFixed(2)} g`
    )
    const whatsappUrl = `https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER || '917069315037'}?text=${message}`
    window.open(whatsappUrl, '_blank')
  }

  const displayPrice = configuredPrice || uploadResult?.price
  const selectedColor = COLORS.find(c => c.id === color)

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

          {file && (
            <div className="card">
              <h2 className="text-xl font-bold mb-4">3D Preview</h2>
              <ModelViewer 
                file={file} 
                convertedGlbUrl={uploadResult?.convertedGlbUrl} 
                onError={setError}
                uploadComplete={!!uploadResult}
              />
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



            <div className="grid gap-4">
              {/* Material */}
              <SelectDropdown
                label="Material"
                options={MATERIALS}
                value={material}
                onChange={setMaterial}
              />

              {/* Color */}
              <div>
                <label className="block text-xs text-gray-400 mb-2 font-semibold tracking-wide uppercase">Color</label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map(col => (
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
                  <SpecBox label="Material"   value={MATERIALS.find(m => m.id === material)?.label} />
                  <SpecBox label="Color"      value={selectedColor?.label} />
                  <SpecBox label="Volume"     value={`${uploadResult.volume.toFixed(1)} mm³`} />
                  <SpecBox label="Weight"     value={`${estimatedGrams.toFixed(2)} g`} />
                  <SpecBox label="Time"       value={`${estimatedTime.toFixed(1)} hrs`} />
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
