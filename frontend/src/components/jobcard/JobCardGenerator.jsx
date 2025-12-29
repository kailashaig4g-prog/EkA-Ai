import { useState, useCallback, useMemo, memo } from 'react';
import { useVehicle } from '../../contexts/VehicleContext';

/**
 * JobCardGenerator - Complete job card modal with print/export
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {Function} props.onClose - Callback to close modal
 * @param {Object} props.damageAnalysis - Pre-filled damage analysis data
 */
export const JobCardGenerator = memo(({ isOpen, onClose, damageAnalysis }) => {
  const { activeVehicle } = useVehicle();

  const [formData, setFormData] = useState({
    // Customer Info
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    customerAddress: '',
    // Job Details
    jobType: 'general_service',
    complaints: [''],
    workDone: [''],
    // Parts
    parts: [{ name: '', qty: 1, unitPrice: 0 }],
    // Labor
    laborCharges: 0,
  });

  const [errors, setErrors] = useState({});

  // Job type options
  const JOB_TYPES = [
    { value: 'general_service', label: 'General Service' },
    { value: 'repair', label: 'Repair Work' },
    { value: 'body_work', label: 'Body & Paint' },
    { value: 'electrical', label: 'Electrical' },
    { value: 'ac_service', label: 'AC Service' },
    { value: 'tyre_wheel', label: 'Tyre & Wheel' },
    { value: 'accident', label: 'Accident Repair' },
    { value: 'denting_painting', label: 'Denting & Painting' },
  ];

  // Pre-fill from damage analysis
  useMemo(() => {
    if (damageAnalysis) {
      setFormData((prev) => ({
        ...prev,
        jobType: 'repair',
        complaints: damageAnalysis.damageAreas?.map((a) => `${a.location}: ${a.type}`) || [''],
        workDone: damageAnalysis.damageAreas?.map((a) => a.repairMethod) || [''],
        laborCharges: damageAnalysis.laborHours ? damageAnalysis.laborHours * 500 : 0,
      }));
    }
  }, [damageAnalysis]);

  // Calculate totals
  const calculations = useMemo(() => {
    const partsTotal = formData.parts.reduce(
      (sum, part) => sum + (part.qty * part.unitPrice || 0),
      0
    );
    const laborTotal = formData.laborCharges || 0;
    const subtotal = partsTotal + laborTotal;
    const gst = subtotal * 0.18;
    const grandTotal = subtotal + gst;

    return { partsTotal, laborTotal, subtotal, gst, grandTotal };
  }, [formData.parts, formData.laborCharges]);

  // Handle input change
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  }, [errors]);

  // Handle array field changes
  const handleArrayChange = useCallback((field, index, value) => {
    setFormData((prev) => {
      const arr = [...prev[field]];
      arr[index] = value;
      return { ...prev, [field]: arr };
    });
  }, []);

  // Add array item
  const addArrayItem = useCallback((field, defaultValue = '') => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], defaultValue],
    }));
  }, []);

  // Remove array item
  const removeArrayItem = useCallback((field, index) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  }, []);

  // Handle part change
  const handlePartChange = useCallback((index, key, value) => {
    setFormData((prev) => {
      const parts = [...prev.parts];
      parts[index] = { ...parts[index], [key]: value };
      return { ...prev, parts };
    });
  }, []);

  // Add part
  const addPart = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      parts: [...prev.parts, { name: '', qty: 1, unitPrice: 0 }],
    }));
  }, []);

  // Remove part
  const removePart = useCallback((index) => {
    setFormData((prev) => ({
      ...prev,
      parts: prev.parts.filter((_, i) => i !== index),
    }));
  }, []);

  // Validate form
  const validate = useCallback(() => {
    const newErrors = {};
    if (!formData.customerName.trim()) newErrors.customerName = 'Customer name is required';
    if (!formData.customerPhone.trim()) newErrors.customerPhone = 'Phone is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Handle print
  const handlePrint = useCallback(() => {
    if (!validate()) return;

    const jobCardNumber = `JC-${Date.now()}`;
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Job Card - ${jobCardNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
          h1 { color: #570683; border-bottom: 2px solid #570683; padding-bottom: 10px; }
          .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
          .section { margin-bottom: 20px; padding: 15px; background: #f9f9f9; border-radius: 8px; }
          .section h3 { margin-top: 0; color: #333; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
          .field { margin-bottom: 8px; }
          .field label { font-weight: bold; display: block; color: #666; font-size: 12px; }
          .field span { font-size: 14px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background: #570683; color: white; }
          .total-row { font-weight: bold; background: #f0f0f0; }
          .grand-total { font-size: 18px; color: #570683; }
          @media print { button { display: none; } }
        </style>
      </head>
      <body>
        <h1>Go4Garage - Job Card</h1>
        <div class="header">
          <div><strong>Job Card #:</strong> ${jobCardNumber}</div>
          <div><strong>Date:</strong> ${new Date().toLocaleDateString('en-IN')}</div>
        </div>
        
        <div class="section">
          <h3>Customer Information</h3>
          <div class="grid">
            <div class="field"><label>Name</label><span>${formData.customerName}</span></div>
            <div class="field"><label>Phone</label><span>${formData.customerPhone}</span></div>
            <div class="field"><label>Email</label><span>${formData.customerEmail || 'N/A'}</span></div>
            <div class="field"><label>Address</label><span>${formData.customerAddress || 'N/A'}</span></div>
          </div>
        </div>

        <div class="section">
          <h3>Vehicle Information</h3>
          <div class="grid">
            <div class="field"><label>Make/Model</label><span>${activeVehicle?.make || 'N/A'} ${activeVehicle?.model || ''}</span></div>
            <div class="field"><label>Year</label><span>${activeVehicle?.year || 'N/A'}</span></div>
            <div class="field"><label>Registration</label><span>${activeVehicle?.registrationNumber || 'N/A'}</span></div>
            <div class="field"><label>Odometer</label><span>${activeVehicle?.mileage || activeVehicle?.odometer || 'N/A'} km</span></div>
          </div>
        </div>

        <div class="section">
          <h3>Job Details</h3>
          <div class="field"><label>Job Type</label><span>${JOB_TYPES.find(j => j.value === formData.jobType)?.label}</span></div>
          <div class="field">
            <label>Customer Complaints</label>
            <ul>${formData.complaints.filter(c => c).map(c => `<li>${c}</li>`).join('')}</ul>
          </div>
          <div class="field">
            <label>Work Done</label>
            <ul>${formData.workDone.filter(w => w).map(w => `<li>${w}</li>`).join('')}</ul>
          </div>
        </div>

        <div class="section">
          <h3>Parts & Labor</h3>
          <table>
            <thead>
              <tr><th>Part Name</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr>
            </thead>
            <tbody>
              ${formData.parts.filter(p => p.name).map(p => `
                <tr>
                  <td>${p.name}</td>
                  <td>${p.qty}</td>
                  <td>₹${p.unitPrice}</td>
                  <td>₹${p.qty * p.unitPrice}</td>
                </tr>
              `).join('')}
              <tr class="total-row"><td colspan="3">Parts Total</td><td>₹${calculations.partsTotal.toLocaleString()}</td></tr>
              <tr class="total-row"><td colspan="3">Labor Charges</td><td>₹${calculations.laborTotal.toLocaleString()}</td></tr>
              <tr class="total-row"><td colspan="3">Subtotal</td><td>₹${calculations.subtotal.toLocaleString()}</td></tr>
              <tr class="total-row"><td colspan="3">GST (18%)</td><td>₹${calculations.gst.toLocaleString()}</td></tr>
              <tr class="total-row grand-total"><td colspan="3">Grand Total</td><td>₹${calculations.grandTotal.toLocaleString()}</td></tr>
            </tbody>
          </table>
        </div>

        <div style="margin-top: 40px; display: flex; justify-content: space-between;">
          <div><p>____________________</p><p>Customer Signature</p></div>
          <div><p>____________________</p><p>Authorized Signature</p></div>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  }, [formData, activeVehicle, calculations, validate]);

  const inputClass = `w-full px-4 py-3 rounded-xl transition-all duration-200 bg-[var(--bg-card)] border text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-opacity-50`;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" data-testid="job-card-generator">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="flex min-h-full items-start justify-center p-4 pt-16">
        <div
          className="relative w-full max-w-3xl rounded-2xl p-6 animate-slide-up"
          style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-xl)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                Job Card Generator
              </h2>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                Create a printable job card for this service
              </p>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-[var(--bg-hover)]">
              <svg className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-6">
            {/* Customer Information */}
            <div>
              <h3 className="font-medium mb-3" style={{ color: 'var(--text-primary)' }}>Customer Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Name *</label>
                  <input
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleChange}
                    className={inputClass}
                    style={{ borderColor: errors.customerName ? '#dc2626' : 'var(--border)' }}
                    placeholder="Customer name"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Phone *</label>
                  <input
                    type="tel"
                    name="customerPhone"
                    value={formData.customerPhone}
                    onChange={handleChange}
                    className={inputClass}
                    style={{ borderColor: errors.customerPhone ? '#dc2626' : 'var(--border)' }}
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Email</label>
                  <input
                    type="email"
                    name="customerEmail"
                    value={formData.customerEmail}
                    onChange={handleChange}
                    className={inputClass}
                    style={{ borderColor: 'var(--border)' }}
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Address</label>
                  <input
                    type="text"
                    name="customerAddress"
                    value={formData.customerAddress}
                    onChange={handleChange}
                    className={inputClass}
                    style={{ borderColor: 'var(--border)' }}
                    placeholder="Address"
                  />
                </div>
              </div>
            </div>

            {/* Vehicle Info (Read-only) */}
            {activeVehicle && (
              <div
                className="p-4 rounded-xl"
                style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
              >
                <h3 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Vehicle</h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                  {activeVehicle.make} {activeVehicle.model} ({activeVehicle.year})
                  {activeVehicle.registrationNumber && ` • ${activeVehicle.registrationNumber}`}
                </p>
              </div>
            )}

            {/* Job Details */}
            <div>
              <h3 className="font-medium mb-3" style={{ color: 'var(--text-primary)' }}>Job Details</h3>
              <div className="mb-4">
                <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Job Type</label>
                <select
                  name="jobType"
                  value={formData.jobType}
                  onChange={handleChange}
                  className={inputClass}
                  style={{ borderColor: 'var(--border)' }}
                >
                  {JOB_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              {/* Complaints */}
              <div className="mb-4">
                <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Complaints</label>
                {formData.complaints.map((complaint, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={complaint}
                      onChange={(e) => handleArrayChange('complaints', index, e.target.value)}
                      className={inputClass}
                      style={{ borderColor: 'var(--border)' }}
                      placeholder="Customer complaint"
                    />
                    {formData.complaints.length > 1 && (
                      <button
                        onClick={() => removeArrayItem('complaints', index)}
                        className="p-2 rounded-xl hover:bg-red-50"
                        style={{ color: '#dc2626' }}
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => addArrayItem('complaints', '')}
                  className="text-sm flex items-center gap-1 mt-1"
                  style={{ color: 'var(--brand-primary)' }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
                  </svg>
                  Add complaint
                </button>
              </div>

              {/* Work Done */}
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Work Done</label>
                {formData.workDone.map((work, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={work}
                      onChange={(e) => handleArrayChange('workDone', index, e.target.value)}
                      className={inputClass}
                      style={{ borderColor: 'var(--border)' }}
                      placeholder="Work performed"
                    />
                    {formData.workDone.length > 1 && (
                      <button
                        onClick={() => removeArrayItem('workDone', index)}
                        className="p-2 rounded-xl hover:bg-red-50"
                        style={{ color: '#dc2626' }}
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => addArrayItem('workDone', '')}
                  className="text-sm flex items-center gap-1 mt-1"
                  style={{ color: 'var(--brand-primary)' }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
                  </svg>
                  Add work item
                </button>
              </div>
            </div>

            {/* Parts */}
            <div>
              <h3 className="font-medium mb-3" style={{ color: 'var(--text-primary)' }}>Parts Used</h3>
              {formData.parts.map((part, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={part.name}
                    onChange={(e) => handlePartChange(index, 'name', e.target.value)}
                    className={`${inputClass} flex-1`}
                    style={{ borderColor: 'var(--border)' }}
                    placeholder="Part name"
                  />
                  <input
                    type="number"
                    value={part.qty}
                    onChange={(e) => handlePartChange(index, 'qty', parseInt(e.target.value) || 0)}
                    className={inputClass}
                    style={{ borderColor: 'var(--border)', width: '80px' }}
                    min="1"
                    placeholder="Qty"
                  />
                  <input
                    type="number"
                    value={part.unitPrice}
                    onChange={(e) => handlePartChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                    className={inputClass}
                    style={{ borderColor: 'var(--border)', width: '120px' }}
                    min="0"
                    placeholder="Price"
                  />
                  {formData.parts.length > 1 && (
                    <button
                      onClick={() => removePart(index)}
                      className="p-2 rounded-xl hover:bg-red-50"
                      style={{ color: '#dc2626' }}
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addPart}
                className="text-sm flex items-center gap-1 mt-1"
                style={{ color: 'var(--brand-primary)' }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
                </svg>
                Add part
              </button>
            </div>

            {/* Labor Charges */}
            <div>
              <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Labor Charges (₹)</label>
              <input
                type="number"
                name="laborCharges"
                value={formData.laborCharges}
                onChange={handleChange}
                className={inputClass}
                style={{ borderColor: 'var(--border)' }}
                min="0"
                placeholder="0"
              />
            </div>

            {/* Totals */}
            <div
              className="p-4 rounded-xl space-y-2"
              style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
            >
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--text-secondary)' }}>Parts Total</span>
                <span style={{ color: 'var(--text-primary)' }}>₹{calculations.partsTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--text-secondary)' }}>Labor</span>
                <span style={{ color: 'var(--text-primary)' }}>₹{calculations.laborTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
                <span style={{ color: 'var(--text-primary)' }}>₹{calculations.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--text-secondary)' }}>GST (18%)</span>
                <span style={{ color: 'var(--text-primary)' }}>₹{calculations.gst.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Grand Total</span>
                <span className="font-semibold text-lg" style={{ color: 'var(--brand-primary)' }}>
                  ₹{calculations.grandTotal.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl font-medium"
              style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
            >
              Cancel
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 py-3 rounded-xl font-medium flex items-center justify-center gap-2"
              style={{ backgroundColor: 'var(--brand-primary)', color: 'white' }}
              data-testid="print-btn"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Job Card
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

JobCardGenerator.displayName = 'JobCardGenerator';

export default JobCardGenerator;
