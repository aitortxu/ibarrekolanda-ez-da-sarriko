// ── Language switcher ──────────────────────────────────────────
const html = document.documentElement;

function setLang(lang) {
  html.classList.remove('lang-es', 'lang-eu');
  html.classList.add('lang-' + lang);
  html.lang = lang === 'eu' ? 'eu' : 'es';
  localStorage.setItem('lang', lang);
  updatePlaceholders(lang);
}

document.getElementById('langToggle').addEventListener('click', e => {
  e.preventDefault();
  setLang('eu');
});

document.getElementById('langToggle2').addEventListener('click', e => {
  e.preventDefault();
  setLang('es');
});

// Persist placeholder text per language
function updatePlaceholders(lang) {
  document.querySelectorAll('[data-placeholder-es]').forEach(el => {
    el.placeholder = el.getAttribute('data-placeholder-' + lang) || el.getAttribute('data-placeholder-es');
  });
}

// Init on load
const savedLang = localStorage.getItem('lang') || 'es';
setLang(savedLang);

// ── Lightbox ──────────────────────────────────────────────────
function openLightbox(item) {
  const img = item.querySelector('img');
  const caption = item.querySelector('.gallery-caption');
  document.getElementById('lightboxImg').src = img.src;
  document.getElementById('lightboxImg').alt = img.alt;
  document.getElementById('lightboxCaption').textContent = caption ? caption.textContent.trim() : '';
  document.getElementById('lightbox').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeLightbox();
});

// ── Submit to Formspree + Ayuntamiento ───────────────────────
const FORMSPREE = 'https://formspree.io/f/xeerrdkp';
const AYTO_POST = 'https://www.bilbao.eus/cs/Bilbaonet/jsp/Formularios/BIO_TuAyuntaTeEscucha.jsp?language=es';
const AYTO_MSG_ES = 'Solicito que la estación de metro "Sarriko" pase a denominarse "Ibarrekolanda", que es el nombre histórico del barrio al que da servicio. El parque Sarriko es solo una parte del barrio; utilizar su nombre para toda la estación borra la identidad histórica de Ibarrekolanda, documentada desde el siglo XVIII. Exijo que Metro Bilbao y el Ayuntamiento corrijan este error.';
const AYTO_MSG_EU = '"Sarriko" metro geltokia "Ibarrekolanda" izena har dezan eskatzen dut, hori baita zerbitzatzen duen auzoaren izen historikoa. Sarriko parkea auzoaren zati bat besterik ez da; bere izena geltoki osorako erabiltzeak Ibarrekolandaren XVIII. mendetik dokumentatutako identitate historikoa ezabatzen du. Metro Bilbaok eta Udalak akats hau zuzendu dezatela exijitzen dut.';

async function submitSupport(e) {
  e.preventDefault();
  const lang = localStorage.getItem('lang') || 'es';
  const email = document.getElementById('email').value.trim();
  const name = document.getElementById('name').value.trim() || 'Ciudadano/a';
  const btn = document.getElementById('submitBtn');
  const feedback = document.getElementById('copyFeedback');

  btn.disabled = true;
  feedback.textContent = lang === 'eu' ? 'Bidaltzen…' : 'Enviando…';

  // Build Ayuntamiento multipart form
  const aytoData = new FormData();
  aytoData.append('Eleccion', 'Sugerencia');
  aytoData.append('strTitulo', 'Ibarrekolanda ez da Sarriko');
  aytoData.append('strConsulta', lang === 'eu' ? AYTO_MSG_EU : AYTO_MSG_ES);
  aytoData.append('strNombre', name);
  aytoData.append('strApellidos', '');
  aytoData.append('strTipoDoc', '-1');
  aytoData.append('strDni', '');
  aytoData.append('strSexo', '3');
  aytoData.append('strEdad', '');
  aytoData.append('strMunicipio', '');
  aytoData.append('strCp', '');
  aytoData.append('strCalle', '');
  aytoData.append('strNumero', '');
  aytoData.append('strTfno', '');
  aytoData.append('strEmail', email);
  aytoData.append('chekProteccion', '1');
  aytoData.append('language', 'es');
  aytoData.append('cid', '3009223414');
  aytoData.append('c', 'BIO_Formulario_FA');
  aytoData.append('pageid', '3009011008');
  aytoData.append('site', 'Bilbaonet');
  aytoData.append('sitepfx', 'BIO_');
  aytoData.append('formularioCaducado', 'no');
  aytoData.append('tituloFormulario', 'Tu Ayuntamiento te escucha');
  aytoData.append('mail1', 'registro@bilbao.eus');
  aytoData.append('textoIndiqueMunicipio', 'Indique su municipio');
  aytoData.append('_charset_', 'UTF-8');

  // Build Formspree data
  const formspreeData = new FormData();
  formspreeData.append('email', email);
  formspreeData.append('name', name);
  formspreeData.append('_subject', 'Apoyo: Ibarrekolanda ez da Sarriko');

  try {
    await Promise.all([
      fetch(AYTO_POST, { method: 'POST', body: aytoData, mode: 'no-cors' }),
      fetch(FORMSPREE, { method: 'POST', body: formspreeData, headers: { 'Accept': 'application/json' } })
    ]);
    feedback.textContent = lang === 'eu'
      ? '✓ Bidalita! Zure sugestioa Bilboko Udalera iritsi da.'
      : '✓ ¡Enviado! Tu sugerencia ha llegado al Ayuntamiento de Bilbao.';
    document.getElementById('supportForm').reset();
  } catch {
    feedback.textContent = lang === 'eu'
      ? 'Errore bat gertatu da. Saiatu berriro.'
      : 'Ha ocurrido un error. Inténtalo de nuevo.';
    btn.disabled = false;
  }
}
