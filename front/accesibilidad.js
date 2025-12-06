// SISTEMA DE ACCESIBILIDAD

// Mapeo de tamaños de fuente
const fontSizes = {
    small: 0.85,
    medium: 1,
    large: 1.25
};

// Mapeo de espaciados
const spacings = {
    narrow: 1.2,
    normal: 1.6,
    wide: 2
};

//  INICIALIZACIÓN 
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Iniciando sistema de accesibilidad...');
    initializeAccessibility();
    loadAccessibilityPreferences();
    console.log('✅ Sistema de accesibilidad cargado');
});

//  FUNCIONES DE INICIALIZACIÓN 
function initializeAccessibility() {
    //  TOGGLE DE TEMA 
    const themeToggle = document.getElementById('themeToggle');
    
    if (themeToggle) {
        themeToggle.addEventListener('change', function() {
            console.log('Toggle tema cambiado:', this.checked);
            if (this.checked) {
                setTheme('dark');
            } else {
                setTheme('light');
            }
        });
    } else {
        console.error('❌ No se encontró el elemento themeToggle');
    }
    
    // SELECT DE ESPACIADO 
    const spacingSelect = document.getElementById('spacingSelect');
    
    if (spacingSelect) {
        spacingSelect.addEventListener('change', function() {
            console.log('Espaciado cambiado a:', this.value);
            setSpacing(this.value);
        });
    } else {
        console.error('❌ No se encontró el elemento spacingSelect');
    }
    
    //  SELECT DE TAMAÑO DE FUENTE 
    const fontSizeSelect = document.getElementById('fontSizeSelect');
    
    if (fontSizeSelect) {
        fontSizeSelect.addEventListener('change', function() {
            console.log('Tamaño de fuente cambiado a:', this.value);
            setFontSize(this.value);
        });
    } else {
        console.error('❌ No se encontró el elemento fontSizeSelect');
    }
    
    //  BOTÓN DE RESET 
    const resetAllBtn = document.getElementById('resetAllAccessibility');
    
    if (resetAllBtn) {
        resetAllBtn.addEventListener('click', function() {
            console.log('🔄 Reseteando configuración de accesibilidad');
            resetAllAccessibilitySettings();
        });
    } else {
        console.error('❌ No se encontró el elemento resetAllAccessibility');
    }
}

//  FUNCIONES DE TEMA 
function setTheme(theme) {
    const body = document.body;
    const themeToggle = document.getElementById('themeToggle');
    
    console.log('Aplicando tema:', theme);
    
    if (theme === 'dark') {
        body.classList.add('dark-mode');
        if (themeToggle) themeToggle.checked = true;
    } else {
        body.classList.remove('dark-mode');
        if (themeToggle) themeToggle.checked = false;
    }
    
    // Guardar preferencia
    saveAccessibilityPreference('theme', theme);
    
    // Mostrar notificación
    showAccessibilityNotification(`${theme === 'dark' ? '🌙 Modo Oscuro' : '☀️ Modo Claro'} activado`);
}

//  FUNCIONES DE TAMAÑO DE FUENTE 
function setFontSize(size) {
    const fontScale = fontSizes[size];
    
    console.log(`Aplicando tamaño de fuente: ${size} (escala: ${fontScale})`);
    
    // Aplicar la escala a la raíz del documento
    document.documentElement.style.setProperty('--font-scale', fontScale);
    
    // Actualizar el select
    const fontSizeSelect = document.getElementById('fontSizeSelect');
    if (fontSizeSelect) {
        fontSizeSelect.value = size;
    }
    
    // Guardar preferencia
    saveAccessibilityPreference('fontSize', size);
    
    // Mostrar notificación
    const sizeNames = {
        small: 'Chico',
        medium: 'Mediano',
        large: 'Grande'
    };
    showAccessibilityNotification(`🔤 Tamaño de texto: ${sizeNames[size]}`);
}

// FUNCIONES DE ESPACIADO
function setSpacing(spacing) {
    const body = document.body;
    
    console.log('Aplicando espaciado:', spacing);
    
    // Remover todas las clases de espaciado
    body.classList.remove('narrow-spacing', 'wide-spacing');
    
    // Agregar la clase correspondiente
    if (spacing === 'narrow') {
        body.classList.add('narrow-spacing');
    } else if (spacing === 'wide') {
        body.classList.add('wide-spacing');
    }
    
    const lineHeight = spacings[spacing];
    document.documentElement.style.setProperty('--line-height', lineHeight);
    
    // Actualizar el select
    const spacingSelect = document.getElementById('spacingSelect');
    if (spacingSelect) {
        spacingSelect.value = spacing;
    }
    
    // Guardar preferencia
    saveAccessibilityPreference('spacing', spacing);
    
    // Mostrar notificación
    const spacingNames = {
        narrow: 'Estrecho',
        normal: 'Normal',
        wide: 'Amplio'
    };
    showAccessibilityNotification(`📏 Espaciado: ${spacingNames[spacing]}`);
}

// RESET GENERAL
function resetAllAccessibilitySettings() {
    console.log('🔄 Reseteando todas las configuraciones...');
    
    // Reset tema
    setTheme('light');
    
    // Reset tamaño de fuente
    setFontSize('medium');
    
    // Reset espaciado
    setSpacing('normal');
    
    // Limpiar localStorage
    localStorage.removeItem('accessibilityPreferences');
    
    // Mostrar notificación
    showAccessibilityNotification('✅ Todas las preferencias restablecidas');
}

// PERSISTENCIA EN LOCALSTORAGE
function saveAccessibilityPreference(key, value) {
    try {
        let preferences = JSON.parse(localStorage.getItem('accessibilityPreferences')) || {};
        preferences[key] = value;
        localStorage.setItem('accessibilityPreferences', JSON.stringify(preferences));
        console.log('💾 Preferencia guardada:', key, '=', value);
    } catch (error) {
        console.error('❌ Error al guardar preferencia:', error);
    }
}

function loadAccessibilityPreferences() {
    try {
        const preferences = JSON.parse(localStorage.getItem('accessibilityPreferences'));
        
        if (!preferences) {
            console.log('ℹ️ No hay preferencias guardadas, usando valores por defecto');
            return;
        }
        
        console.log('📂 Cargando preferencias:', preferences);
        
        // Cargar tema
        if (preferences.theme) {
            setTheme(preferences.theme);
        }
        
        // Cargar tamaño de fuente
        if (preferences.fontSize) {
            setFontSize(preferences.fontSize);
        }
        
        // Cargar espaciado
        if (preferences.spacing) {
            setSpacing(preferences.spacing);
        }
    } catch (error) {
        console.error('❌ Error al cargar preferencias:', error);
    }
}

// NOTIFICACIONES
function showAccessibilityNotification(message) {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = 'accessibility-notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        z-index: 9999;
        font-size: 14px;
        font-weight: bold;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Eliminar después de 2 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 2000);
}

// INTEGRACIÓN CON EL SISTEMA DE LOGIN
function onUserLogin() {
    loadAccessibilityPreferences();
    console.log('👤 Preferencias de accesibilidad cargadas para el usuario');
}

function saveUserAccessibilityPreferences(userName) {
    try {
        const preferences = localStorage.getItem('accessibilityPreferences');
        if (preferences) {
            localStorage.setItem(`accessibilityPreferences_${userName}`, preferences);
            console.log(`💾 Preferencias guardadas para ${userName}`);
        }
    } catch (error) {
        console.error('❌ Error al guardar preferencias de usuario:', error);
    }
}

function loadUserAccessibilityPreferences(userName) {
    try {
        const userPreferences = localStorage.getItem(`accessibilityPreferences_${userName}`);
        if (userPreferences) {
            localStorage.setItem('accessibilityPreferences', userPreferences);
            loadAccessibilityPreferences();
            console.log(`📂 Preferencias cargadas para ${userName}`);
        }
    } catch (error) {
        console.error('❌ Error al cargar preferencias de usuario:', error);
    }
}

// Exportar funciones
window.onUserLogin = onUserLogin;
window.saveUserAccessibilityPreferences = saveUserAccessibilityPreferences;
window.loadUserAccessibilityPreferences = loadUserAccessibilityPreferences;

console.log('✅ Sistema de accesibilidad inicializado');