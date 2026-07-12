import fs from 'fs';
import path from 'path';

const pagesDir = path.resolve('src/pages/es');
const pages = ['servicios.astro', 'contacto.astro', 'privacidad.astro', 'terminos.astro'];

const patches = {
  'servicios.astro': {
    title: 'Servicios de Retiro en Houston | ANSEB',
    desc: 'Retiro de muebles, electrodomésticos, basura de garaje, artículos no deseados, desechos de jardín y escombros ligeros en el área de Houston.'
  },
  'contacto.astro': {
    title: 'Estimado Gratis de Junk Removal en Houston | ANSEB',
    desc: 'Solicite un estimado gratis para retiro de muebles, basura y artículos no deseados en Houston. Llame, envíe fotos o complete el formulario.'
  },
  'privacidad.astro': {
    title: 'Política de Privacidad | ANSEB',
    desc: 'Política de privacidad de ANSEB Junk Removal en Houston.'
  },
  'terminos.astro': {
    title: 'Términos de Servicio | ANSEB',
    desc: 'Términos de servicio de ANSEB Junk Removal en Houston.'
  }
};

for (const page of pages) {
  const filePath = path.join(pagesDir, page);
  if (!fs.existsSync(filePath)) continue;

  let content = fs.readFileSync(filePath, 'utf-8');

  // Fix imports from '../' to '../../'
  content = content.replace(/from\s+['"]\.\.\/([^'"]+)['"]/g, "from '../../$1'");

  // Fix lang
  content = content.replace(/lang\s*=\s*['"]en['"]/g, "lang='es'");
  content = content.replace(/const lang = 'en';/g, "const lang = 'es';");

  // Fix title and description in the frontmatter if present
  if (patches[page]) {
    content = content.replace(/const title = [^;]+;/, `const title = "${patches[page].title}";`);
    content = content.replace(/const description = [^;]+;/, `const description = "${patches[page].desc}";`);
  }

  // Update contact.astro ID for the react form container
  if (page === 'contacto.astro') {
    content = content.replace(/estimate-form-container/g, 'estimate-form-container-es');
  }

  // Rewrite legal files to Spanish text if it's terms/privacy
  if (page === 'privacidad.astro') {
    content = content.replace(/<h1>.*<\/h1>/, '<h1>Política de Privacidad</h1>');
    content = content.replace(/Last updated: .*/, 'Última actualización: 11 de julio de 2026');
    content = content.replace(/<p>Your privacy is important to us.*/, '<p>Su privacidad es importante para nosotros. Esta política detalla la información que recopilamos: Nombre, Teléfono, Email, ZIP, Descripción del servicio y Fotografías. Usamos esta información únicamente para preparar estimados y contactar al cliente. No vendemos sus datos personales. Conservamos sus solicitudes de forma razonable. Para cualquier consulta, puede contactar al negocio directamente.</p>');
  }

  if (page === 'terminos.astro') {
    content = content.replace(/<h1>.*<\/h1>/, '<h1>Términos de Servicio</h1>');
    content = content.replace(/Last updated: .*/, 'Última actualización: 11 de julio de 2026');
    content = content.replace(/<p>By using our services.*/, '<p>Al utilizar nuestros servicios, usted acepta estos términos de servicio. Por favor, contáctenos si tiene preguntas.</p>');
  }

  fs.writeFileSync(filePath, content, 'utf-8');
}
console.log('Fixed Spanish pages!');
