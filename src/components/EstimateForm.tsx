import React, { useState } from 'react';

interface Props {
  lang?: 'en' | 'es';
}

export default function EstimateForm({ lang = 'en' }: Props) {
  const [submitted, setSubmitted] = useState(false);

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
      success: "Thank you. Your request has been received. ANSEB Junk Removal will contact you soon.",
      photoNote: "Photo upload coming soon. For now, please text photos directly to our number for the fastest estimate.",
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
      success: "Gracias. Hemos recibido su solicitud. ANSEB Junk Removal se pondrá en contacto pronto.",
      photoNote: "La subida de fotos estará disponible pronto. Por ahora, envíe fotos por texto a nuestro número para un estimado rápido.",
      services: [
        "Retiro de Muebles", "Retiro de Electrodomésticos", "Limpieza de Garaje", 
        "Limpieza de Casa", "Limpieza de Apartamento", "Desechos de Jardín", 
        "Escombros de Construcción", "Retiro Comercial", "Otro"
      ]
    }
  };

  const t = dict[lang];

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Placeholder for real form submission logic (webhook, email, etc.)
    setSubmitted(true);
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
        <p style={{ fontSize: '0.9rem', color: 'var(--color-medium-gray)', marginTop: '0.5rem' }}>
          <i>{t.photoNote}</i>
        </p>
      </div>

      <form onSubmit={handleSubmit} data-cta="estimate-form">
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
        
        <div className="form-group" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
          <input type="checkbox" id="consent" name="consent" required style={{ marginTop: '0.25rem' }} />
          <label htmlFor="consent" style={{ fontSize: '0.9rem', color: 'var(--color-soft-black)' }}>
            {t.consent} *
          </label>
        </div>
        
        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
          {t.submit}
        </button>
      </form>
    </div>
  );
}
