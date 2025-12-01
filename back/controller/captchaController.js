// controller/captchaController.js

const activeCaptchas = {};
const CAPTCHA_EXPIRY = 5 * 60 * 1000; // 5 minutos

// Base de datos de imágenes por categoría
const imageDatabase = {
  gato: [
    'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=200&h=200&fit=crop'
  ],
  perro: [
    'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1552053831-71594a27632d?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=200&h=200&fit=crop'
  ],
  carro: [
    'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=200&h=200&fit=crop'
  ],
  flor: [
    'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1464639351491-a172c2aa2911?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1477554193778-9562c28588c0?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=200&h=200&fit=crop'
  ]
};

function generateCaptchaId() {
  return `captcha_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function cleanExpiredCaptchas() {
  const now = Date.now();
  Object.keys(activeCaptchas).forEach(id => {
    if (activeCaptchas[id].expires < now) {
      delete activeCaptchas[id];
    }
  });
}

/**
 * Genera un CAPTCHA visual de selección de imágenes
 */
export const generateCaptcha = (req, res) => {
  try {
    cleanExpiredCaptchas();

    // Selecciona categoría objetivo aleatoria
    const categories = Object.keys(imageDatabase);
    const targetCategory = categories[Math.floor(Math.random() * categories.length)];
    
    // Obtiene imágenes de la categoría objetivo (2 imágenes)
    const targetImages = imageDatabase[targetCategory];
    const selectedTargets = [];
    const targetIndices = new Set();
    
    while (selectedTargets.length < 2) {
      const idx = Math.floor(Math.random() * targetImages.length);
      if (!targetIndices.has(idx)) {
        selectedTargets.push(targetImages[idx]);
        targetIndices.add(idx);
      }
    }
    
    // Obtiene imágenes de otras categorías (4 imágenes)
    const otherImages = [];
    const otherCategories = categories.filter(cat => cat !== targetCategory);
    
    while (otherImages.length < 4) {
      const randomCat = otherCategories[Math.floor(Math.random() * otherCategories.length)];
      const randomImg = imageDatabase[randomCat][Math.floor(Math.random() * imageDatabase[randomCat].length)];
      if (!otherImages.includes(randomImg)) {
        otherImages.push(randomImg);
      }
    }
    
    // Combina y mezcla todas las imágenes
    const allImages = [...selectedTargets, ...otherImages];
    
    // Mezcla las imágenes (algoritmo Fisher-Yates)
    for (let i = allImages.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allImages[i], allImages[j]] = [allImages[j], allImages[i]];
    }
    
    // Encuentra los índices correctos después de mezclar
    const correctIndices = [];
    selectedTargets.forEach(targetImg => {
      const index = allImages.indexOf(targetImg);
      if (index !== -1) correctIndices.push(index);
    });
    
    const captchaId = generateCaptchaId();
    
    // Guarda la respuesta correcta
    activeCaptchas[captchaId] = {
      correctIndices: correctIndices.sort((a, b) => a - b),
      expires: Date.now() + CAPTCHA_EXPIRY
    };

    const categoryNames = {
      gato: 'gatos',
      perro: 'perros',
      carro: 'carros',
      flor: 'flores'
    };

    console.log(`[CAPTCHA] Generado: ${captchaId} | Categoría: ${targetCategory} | Índices correctos: ${correctIndices}`);

    return res.status(200).json({
      success: true,
      captchaId: captchaId,
      question: `Selecciona todas las imágenes que contengan ${categoryNames[targetCategory]}`,
      images: allImages,
      gridSize: 6,
      expiresIn: CAPTCHA_EXPIRY
    });

  } catch (error) {
    console.error('[CAPTCHA ERROR]', error);
    return res.status(500).json({
      success: false,
      error: 'Error al generar CAPTCHA',
      details: error.message
    });
  }
};

/**
 * Valida la respuesta del CAPTCHA visual
 */
export const validateCaptcha = (captchaId, userAnswer) => {
  if (!captchaId || !userAnswer || !Array.isArray(userAnswer)) {
    console.log('[CAPTCHA] Validación fallida: faltan parámetros o formato incorrecto');
    return false;
  }

  const captcha = activeCaptchas[captchaId];
  
  if (!captcha) {
    console.log('[CAPTCHA] Validación fallida: CAPTCHA no encontrado o expirado');
    return false;
  }

  if (captcha.expires < Date.now()) {
    console.log('[CAPTCHA] Validación fallida: CAPTCHA expirado');
    delete activeCaptchas[captchaId];
    return false;
  }

  // Ordena ambos arrays para comparar
  const userSorted = [...userAnswer].sort((a, b) => a - b);
  const correctSorted = [...captcha.correctIndices].sort((a, b) => a - b);
  
  // Compara si son exactamente iguales
  const isValid = JSON.stringify(userSorted) === JSON.stringify(correctSorted);
  
  console.log(`[CAPTCHA] Validación: ${isValid ? 'ÉXITO' : 'FALLO'}`);
  console.log(`[CAPTCHA] Respuesta usuario: [${userSorted}] | Correcta: [${correctSorted}]`);

  // Elimina el CAPTCHA después de usarlo (one-time use)
  delete activeCaptchas[captchaId];

  return isValid;
};

export const getActiveCaptchas = (req, res) => {
  cleanExpiredCaptchas();
  return res.json({
    success: true,
    active: Object.keys(activeCaptchas).length,
    captchas: activeCaptchas
  });
};