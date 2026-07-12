import React, { useState, useRef, useEffect, useId } from 'react';

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
  const [formStartedAt, setFormStartedAt] = useState('');
  const errorRef = useRef<HTMLDivElement | null>(null);
  const formId = useId();
  
  useEffect(() => {
    setFormStartedAt(Math.floor(Date.now() / 1000).toString());
  }, []);

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
      invalidPhone: "Please enter a valid phone number (at least 10 digits).",
      invalidDate: "Date cannot be in the past.",
      requiredName: "Please provide your full name.",
      invalidEmail: "Please provide a valid email address.",
      requiredService: "Please select a service type.",
      requiredDescription: "Please describe what you need removed.",
      requiredConsent: "You must agree to be contacted.",
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
      invalidPhone: "Por favor, introduzca un número de teléfono válido (mínimo 10 dígitos).",
      invalidDate: "La fecha no puede estar en el pasado.",
      requiredName: "Por favor, proporcione su nombre completo.",
      invalidEmail: "Por favor, proporcione un correo electrónico válido.",
      requiredService: "Por favor, seleccione un tipo de servicio.",
      requiredDescription: "Por favor, describa lo que necesita retirar.",
      requiredConsent: "Debe aceptar ser contactado.",
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

  const displayError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => {
      errorRef.current?.focus();
    }, 50);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    setErrorMsg('');
    const file = e.target.files?.[0];
    if (file) {
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        displayError(t.invalidFileType);
        e.target.value = '';
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        displayError(t.fileTooLarge);
        e.target.value = '';
        return;
      }

      const newPhotos = [...photos];
      newPhotos[index] = file;

      const totalSize = newPhotos.reduce((acc, curr) => acc + (curr ? curr.size : 0), 0);
      if (totalSize > MAX_TOTAL_SIZE) {
        displayError(t.totalTooLarge);
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
      displayError(t.addMorePhotosLimit);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;

    setErrorMsg('');
    const form = e.currentTarget;
    const formData = new FormData(form);

    const nameStr = (formData.get('name') as string || '').trim();
    if (nameStr.length < 2) {
      return displayError(t.requiredName);
    }

    const phoneStr = (formData.get('phone') as string || '').trim();
    const digitsOnly = phoneStr.replace(/\D/g, '');
    if (digitsOnly.length < 10) {
      return displayError(t.invalidPhone);
    }

    const emailStr = (formData.get('email') as string || '').trim();
    if (emailStr && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr)) {
      return displayError(t.invalidEmail);
    }

    const zipStr = (formData.get('zip') as string || '').trim();
    if (!/^\d{5}(-\d{4})?$/.test(zipStr)) {
      return displayError(t.invalidZip);
    }

    const serviceStr = formData.get('serviceType') as string;
    if (!serviceStr) {
      return displayError(t.requiredService);
    }

    const descStr = (formData.get('desc') as string || '').trim();
    if (descStr.length < 5) {
      return displayError(t.requiredDescription);
    }

    const consentVal = formData.get('consent');
    if (!consentVal) {
      return displayError(t.requiredConsent);
    }

    const dateStr = formData.get('date') as string;
    if (dateStr) {
      const todayLocal = new Date();
      const year = todayLocal.getFullYear();
      const month = String(todayLocal.getMonth() + 1).padStart(2, '0');
      const day = String(todayLocal.getDate()).padStart(2, '0');
      const todayString = `${year}-${month}-${day}`;

      if (dateStr < todayString) {
        return displayError(t.invalidDate);
      }
    }

    setIsLoading(true);

    photos.forEach((photo, index) => {
      if (photo) {
        formData.append(`photo${index}`, photo);
      }
    });
    
    formData.append('lang', lang);

    try {
      const response = await fetch('/api/submit.php', {
        method: 'POST',
        body: formData,
      });

      let result;
      try {
        result = await response.json();
      } catch (err) {
        throw new Error('Invalid JSON from server');
      }

      if (response.ok && result.success) {
        setSubmitted(true);
        form.reset();
        setPhotos([null]);
      } else {
        displayError(result.message || t.error);
      }
    } catch (err) {
      displayError(t.error);
    } finally {
      setIsLoading(false);
    }
  };

  const todayLocal = new Date();
  const todayString = `${todayLocal.getFullYear()}-${String(todayLocal.getMonth() + 1).padStart(2, '0')}-${String(todayLocal.getDate()).padStart(2, '0')}`;

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

      <div 
        ref={errorRef}
        tabIndex={-1} 
        role="alert" 
        aria-live="assertive"
        style={{ outline: 'none' }}
      >
        {errorMsg && (
          <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' }}>
            {errorMsg}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} data-cta="estimate-form" noValidate>
        {/* Anti-Spam Honeypot & Timestamp */}
        <div style={{ display: 'none' }} aria-hidden="true">
          <label htmlFor={`${formId}-website_url`}>Leave this field empty</label>
          <input type="text" id={`${formId}-website_url`} name="website_url" tabIndex={-1} autoComplete="off" />
          <input type="hidden" name="form_started_at" value={formStartedAt} />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor={`${formId}-name`}>{t.name} *</label>
          <input className="form-input" type="text" id={`${formId}-name`} name="name" required autoComplete="name" />
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor={`${formId}-phone`}>{t.phone} *</label>
            <input className="form-input" type="tel" id={`${formId}-phone`} name="phone" required autoComplete="tel" inputMode="tel" />
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor={`${formId}-email`}>{t.email}</label>
            <input className="form-input" type="email" id={`${formId}-email`} name="email" autoComplete="email" inputMode="email" />
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor={`${formId}-zip`}>{t.zip} *</label>
            <input className="form-input" type="text" id={`${formId}-zip`} name="zip" required inputMode="numeric" />
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor={`${formId}-date`}>{t.date}</label>
            <input className="form-input" type="date" id={`${formId}-date`} name="date" min={todayString} />
          </div>
        </div>
        
        <div className="form-group">
          <label className="form-label" htmlFor={`${formId}-serviceType`}>{t.serviceType} *</label>
          <select className="form-select" id={`${formId}-serviceType`} name="serviceType" required defaultValue="">
            <option value="" disabled>---</option>
            {t.services.map((svc) => (
              <option key={svc.id} value={svc.id}>{svc.label}</option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label className="form-label" htmlFor={`${formId}-desc`}>{t.desc} *</label>
          <textarea className="form-textarea" id={`${formId}-desc`} name="desc" rows={4} required></textarea>
        </div>

        {/* Dynamic Photo Upload Section */}
        <div className="form-group" style={{ backgroundColor: 'rgba(0,0,0,0.03)', padding: '1rem', borderRadius: '4px' }}>
          <label className="form-label">{t.photoLabel} (Max 5MB)</label>
          
          {photos.map((_, index) => (
            <div key={index} style={{ marginBottom: '1rem' }}>
              <input 
                type="file" 
                accept="image/png, image/jpeg, image/webp" 
                onChange={(e) => handlePhotoChange(e, index)}
                className="form-input"
                style={{ padding: '0.5rem' }}
                ref={(el) => { fileInputRefs.current[index] = el; }}
                aria-label={t.photoLabel}
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
          <input type="checkbox" id={`${formId}-consent`} name="consent" required style={{ marginTop: '0.25rem' }} />
          <label htmlFor={`${formId}-consent`} style={{ fontSize: '0.9rem', color: 'var(--color-soft-black)' }}>
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
