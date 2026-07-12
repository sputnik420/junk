import React, { useState, useRef } from 'react';

interface Props {
  lang?: 'en' | 'es';
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_TOTAL_SIZE = 12 * 1024 * 1024; // 12MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function EstimateForm({ lang = 'en' }: Props) {
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [photos, setPhotos] = useState<(File | null)[]>([null]);
  
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const dict = {
    en: {
      title: "Get a Free Estimate",
      subtitle: "Tell us what you need removed. For the fastest estimate, send photos.",
      name: "Full Name",
      phone: "Phone Number",
      email: "Email Address (Optional)",
      zip: "ZIP Code",
      serviceType: "Service Type",
      date: "Preferred Pickup Date",
      desc: "Description",
      consent: "I agree to be contacted by ANSEB Junk Removal about my estimate request.",
      submit: "Get My Free Estimate",
      loading: "Sending request...",
      success: "Thank you. Your request has been received. ANSEB Junk Removal will contact you soon.",
      error: "There was an error sending your request. Please try again or call us.",
      photoLabel: "Upload Photo",
      addPhoto: "+ Add Another Photo",
      addMorePhotosLimit: "You can upload up to 3 photos here. If you have more, please email them to us directly after submitting this form.",
      invalidFileType: "Only JPEG, PNG and WebP images are allowed.",
      fileTooLarge: "Each image must be under 5MB.",
      totalTooLarge: "Total size of all images cannot exceed 12MB.",
      invalidZip: "Please enter a valid 5-digit or 9-digit US ZIP Code.",
      invalidPhone: "Please enter a valid phone number.",
      invalidDate: "Date cannot be in the past.",
      services: [
        { id: "furniture-removal", label: "Furniture Removal" },
        { id: "appliance-removal", label: "Appliance Removal" },
        { id: "garage-cleanout", label: "Garage Cleanout" },
        { id: "house-cleanout", label: "House Cleanout" },
        { id: "apartment-cleanout", label: "Apartment Cleanout" },
        { id: "yard-waste", label: "Yard Waste Removal" },
        { id: "construction-debris", label: "Construction Debris" },
        { id: "commercial-junk", label: "Commercial Junk Removal" },
        { id: "other", label: "Other" }
      ]
    },
    es: {
      title: "Pida un Estimado Gratis",
      subtitle: "Díganos qué necesita retirar. Para un estimado más rápido, envíe fotos.",
      name: "Nombre Completo",
      phone: "Número de Teléfono",
      email: "Correo Electrónico (Opcional)",
      zip: "Código Postal",
      serviceType: "Tipo de Servicio",
      date: "Fecha Preferida",
      desc: "Descripción",
      consent: "Acepto ser contactado por ANSEB Junk Removal sobre mi solicitud de estimado.",
      submit: "Obtener mi Estimado Gratis",
      loading: "Enviando solicitud...",
      success: "Gracias. Hemos recibido su solicitud. ANSEB Junk Removal se pondrá en contacto pronto.",
      error: "Hubo un error al enviar su solicitud. Por favor intente de nuevo o llámenos.",
      photoLabel: "Subir Foto",
      addPhoto: "+ Añadir Otra Foto",
      addMorePhotosLimit: "Puedes subir hasta 3 fotos aquí. Si tienes más, por favor envíanoslas directamente por correo después de enviar este formulario.",
      invalidFileType: "Solo se permiten imágenes JPEG, PNG y WebP.",
      fileTooLarge: "Cada imagen debe pesar menos de 5MB.",
      totalTooLarge: "El peso total de las imágenes no puede superar los 12MB.",
      invalidZip: "Por favor, introduzca un Código Postal de EE.UU. válido de 5 o 9 dígitos.",
      invalidPhone: "Por favor, introduzca un número de teléfono válido.",
      invalidDate: "La fecha no puede estar en el pasado.",
      services: [
        { id: "furniture-removal", label: "Retiro de Muebles" },
        { id: "appliance-removal", label: "Retiro de Electrodomésticos" },
        { id: "garage-cleanout", label: "Limpieza de Garaje" },
        { id: "house-cleanout", label: "Limpieza de Casa" },
        { id: "apartment-cleanout", label: "Limpieza de Apartamento" },
        { id: "yard-waste", label: "Desechos de Jardín" },
        { id: "construction-debris", label: "Escombros de Construcción" },
        { id: "commercial-junk", label: "Retiro Comercial" },
        { id: "other", label: "Otro" }
      ]
    }
  };

  const t = dict[lang];

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    setErrorMsg('');
    const file = e.target.files?.[0];
    if (file) {
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        setErrorMsg(t.invalidFileType);
        e.target.value = '';
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setErrorMsg(t.fileTooLarge);
        e.target.value = '';
        return;
      }

      const newPhotos = [...photos];
      newPhotos[index] = file;

      // Check total size
      const totalSize = newPhotos.reduce((acc, curr) => acc + (curr ? curr.size : 0), 0);
      if (totalSize > MAX_TOTAL_SIZE) {
        setErrorMsg(t.totalTooLarge);
        e.target.value = '';
        return;
      }

      setPhotos(newPhotos);
    } else {
      const newPhotos = [...photos];
      newPhotos[index] = null;
      setPhotos(newPhotos);
    }
  };

  const handleAddPhotoSlot = () => {
    if (photos.length < 3) {
      setPhotos([...photos, null]);
    } else {
      setErrorMsg(t.addMorePhotosLimit);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;

    setErrorMsg('');
    const form = e.currentTarget;
    const formData = new FormData(form);

    // Validate ZIP
    const zipStr = formData.get('zip') as string;
    if (!/^\d{5}(-\d{4})?$/.test(zipStr)) {
      setErrorMsg(t.invalidZip);
      return;
    }

    // Validate Phone (basic length check, allow chars like () - +)
    const phoneStr = formData.get('phone') as string;
    const digitsOnly = phoneStr.replace(/\D/g, '');
    if (digitsOnly.length < 10) {
      setErrorMsg(t.invalidPhone);
      return;
    }

    // Validate Date
    const dateStr = formData.get('date') as string;
    if (dateStr) {
      const selectedDate = new Date(dateStr);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        setErrorMsg(t.invalidDate);
        return;
      }
    }

    setIsLoading(true);

    photos.forEach((photo, index) => {
      if (photo) {
        formData.append(`photo${index}`, photo);
      }
    });
    
    // Add explicitly language
    formData.append('lang', lang);

    try {
      const response = await fetch('/api/submit.php', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSubmitted(true);
        form.reset();
        setPhotos([null]);
      } else {
        setErrorMsg(result.message || t.error);
      }
    } catch (err) {
      setErrorMsg(t.error);
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="card text-center" style={{ padding: '3rem' }} aria-live="polite" role="status">
        <div style={{ color: 'var(--color-primary-green)', fontSize: '4rem', marginBottom: '1rem' }}>✓</div>
        <h3>{t.success}</h3>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="text-center mb-4">
        <h2>{t.title}</h2>
        <p>{t.subtitle}</p>
      </div>

      <div aria-live="polite" role="alert">
        {errorMsg && (
          <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' }}>
            {errorMsg}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} data-cta="estimate-form" noValidate>
        {/* Anti-Spam Honeypot */}
        <div style={{ display: 'none' }} aria-hidden="true">
          <label htmlFor="website_url">Leave this field empty</label>
          <input type="text" id="website_url" name="website_url" tabIndex={-1} autoComplete="off" />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="name">{t.name} *</label>
          <input className="form-input" type="text" id="name" name="name" required />
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="phone">{t.phone} *</label>
            <input className="form-input" type="tel" id="phone" name="phone" required />
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="email">{t.email}</label>
            <input className="form-input" type="email" id="email" name="email" />
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="zip">{t.zip} *</label>
            <input className="form-input" type="text" id="zip" name="zip" required />
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="date">{t.date}</label>
            <input className="form-input" type="date" id="date" name="date" />
          </div>
        </div>
        
        <div className="form-group">
          <label className="form-label" htmlFor="serviceType">{t.serviceType} *</label>
          <select className="form-select" id="serviceType" name="serviceType" required defaultValue="">
            <option value="" disabled>---</option>
            {t.services.map((svc) => (
              <option key={svc.id} value={svc.id}>{svc.label}</option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label className="form-label" htmlFor="desc">{t.desc} *</label>
          <textarea className="form-textarea" id="desc" name="desc" rows={4} required></textarea>
        </div>

        {/* Dynamic Photo Upload Section */}
        <div className="form-group" style={{ backgroundColor: 'rgba(0,0,0,0.03)', padding: '1rem', borderRadius: '4px' }}>
          <label className="form-label">{t.photoLabel} (Max 5MB)</label>
          
          {photos.map((photo, index) => (
            <div key={index} style={{ marginBottom: '1rem' }}>
              <input 
                type="file" 
                accept="image/png, image/jpeg, image/webp" 
                onChange={(e) => handlePhotoChange(e, index)}
                className="form-input"
                style={{ padding: '0.5rem' }}
                ref={(el) => { fileInputRefs.current[index] = el; }}
              />
            </div>
          ))}

          {(photos[photos.length - 1] !== null && photos.length < 3) && (
            <button 
              type="button" 
              onClick={handleAddPhotoSlot}
              style={{
                background: 'none',
                border: '1px dashed var(--color-medium-gray)',
                color: 'var(--color-primary-green)',
                padding: '0.5rem 1rem',
                cursor: 'pointer',
                borderRadius: '4px',
                fontWeight: 'bold',
                width: '100%'
              }}
            >
              {t.addPhoto}
            </button>
          )}
        </div>
        
        <div className="form-group" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
          <input type="checkbox" id="consent" name="consent" required style={{ marginTop: '0.25rem' }} />
          <label htmlFor="consent" style={{ fontSize: '0.9rem', color: 'var(--color-soft-black)' }}>
            {t.consent} *
          </label>
        </div>
        
        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={isLoading}>
          {isLoading ? t.loading : t.submit}
        </button>
      </form>
    </div>
  );
}
