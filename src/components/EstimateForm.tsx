import React, { useState } from 'react';

interface Props {
  lang?: 'en' | 'es';
}

export default function EstimateForm({ lang = 'en' }: Props) {
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Photo states
  const [photos, setPhotos] = useState<(File | null)[]>([null]);
  
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
      services: [
        "Furniture Removal", "Appliance Removal", "Garage Cleanout", 
        "House Cleanout", "Apartment Cleanout", "Yard Waste Removal", 
        "Construction Debris", "Commercial Junk Removal", "Other"
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
      services: [
        "Retiro de Muebles", "Retiro de Electrodomésticos", "Limpieza de Garaje", 
        "Limpieza de Casa", "Limpieza de Apartamento", "Desechos de Jardín", 
        "Escombros de Construcción", "Retiro Comercial", "Otro"
      ]
    }
  };

  const t = dict[lang];

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (e.target.files && e.target.files.length > 0) {
      const newPhotos = [...photos];
      newPhotos[index] = e.target.files[0];
      setPhotos(newPhotos);
    }
  };

  const handleAddPhotoSlot = () => {
    if (photos.length < 3) {
      setPhotos([...photos, null]);
    } else {
      alert(t.addMorePhotosLimit);
      window.location.href = "mailto:info@ansebjunk.com?subject=Additional%20Photos%20for%20Estimate";
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    const form = e.currentTarget;
    const formData = new FormData(form);

    // Append photos manually if needed, but since we have inputs in the form, 
    // FormData should already pick them up if they have correct 'name' attributes.
    // However, to be safe, let's explicitly add the state files:
    photos.forEach((photo, index) => {
      if (photo) {
        formData.append(`photo${index}`, photo);
      }
    });

    try {
      // Call the PHP script we created in public/api/submit.php
      const response = await fetch('/api/submit.php', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setSubmitted(true);
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
      <div className="card text-center" style={{ padding: '3rem' }}>
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

      {errorMsg && (
        <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' }}>
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} data-cta="estimate-form">
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
            {t.services.map((svc, i) => (
              <option key={i} value={svc}>{svc}</option>
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
              />
            </div>
          ))}

          {/* Show the Add Photo button if the last slot is filled */}
          {(photos[photos.length - 1] !== null) && (
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
