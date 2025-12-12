// =======================================================
// ARCHIVO: js/app.js
// =======================================================

// --- 1. CONFIGURACIÓN INICIAL DE SUPABASE ---
// La inclusión del script de Supabase se hace en el archivo gestion.html.

const supabaseUrl = 'https://mmshquwpyxvebkwtrwdk.supabase.co'; 
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tc2hxdXdweXh2ZWJrd3Ryd2RrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MTMzMTMsImV4cCI6MjA4MDQ4OTMxM30.ert569xsxnF8VkyfWU-IFNqKoeoMXKLiEkIKm9LLjGc';

// El resto del código está bien
const supabase = supabase.createClient(supabaseUrl, supabaseKey);


// --- 2. SELECTORES DE ELEMENTOS HTML (Ajuste 1: Consistencia en nombres) ---
// Asegúrate de usar los IDs del formulario que creamos en gestion.html.
const formularioMedicion = document.getElementById('formulario-medicion');
const inputNombre = document.getElementById('nombre_establecimiento'); // CRÍTICO: Cambio de nombre de variable (antes usabas 'nombreEstablecimientoInput')
const inputCuit = document.getElementById('cuit');
const inputRazonSocial = document.getElementById('razon_social');
const inputDireccion = document.getElementById('direccion');
const inputIdEstablecimiento = document.getElementById('establecimiento_id_seleccionado'); // CRÍTICO: Cambio de nombre de variable
// Agrega aquí selectores para los demás inputs dinámicos que usarás en la función de guardado
const inputFechaMedicion = document.getElementById('fecha_medicion');
const inputHoraInicio = document.getElementById('hora_inicio');
const inputValorMedido = document.getElementById('valor_medido');


// =================================================================
// FLUJO A: BÚSQUEDA Y AUTOCOMPLETADO
// =================================================================

/**
 * Función que busca el establecimiento en la base de datos y rellena los campos estáticos.
 */
async function buscarYAutocompletar() {
    // CRÍTICO: Usamos la variable local 'inputNombre' definida arriba
    const nombreBuscado = inputNombre.value.trim(); 

    if (nombreBuscado.length < 3) {
        return; 
    }

    // Limpiamos los campos antes de buscar
    inputIdEstablecimiento.value = '';
    inputCuit.value = '';
    inputRazonSocial.value = '';
    inputDireccion.value = '';

    // 2. Realizar la búsqueda en la tabla 'establecimientos'
    const { data, error } = await supabase
        .from('establecimientos')
        .select('id, cuit, razon_social, direccion')
        .eq('nombre', nombreBuscado) 
        .limit(1);

    if (error) {
        console.error('Error al buscar establecimiento:', error);
        alert('Error en la búsqueda del establecimiento.');
        return;
    }

    if (data.length > 0) {
        // 3. Si encuentra datos, rellenar los campos estáticos
        const establecimiento = data[0];
        
        inputIdEstablecimiento.value = establecimiento.id; // ¡GUARDA EL ID CLAVE!
        inputCuit.value = establecimiento.cuit;
        inputRazonSocial.value = establecimiento.razon_social;
        inputDireccion.value = establecimiento.direccion;
        
        console.log("Establecimiento encontrado y rellenado. ID:", establecimiento.id);
        // alert(`Establecimiento '${establecimiento.nombre}' cargado.`); // Opcional: Desactiva esta alerta si te resulta molesta
    } else {
        // Si no encuentra nada
        alert("Establecimiento no encontrado. Verifique el nombre.");
        inputIdEstablecimiento.value = '';
    }
}

// Escucha cuando el usuario deja de escribir en el campo "nombre de establecimiento"
inputNombre.addEventListener('blur', buscarYAutocompletar);


// =================================================================
// FLUJO B: GUARDADO Y IMPRESIÓN DE LA MEDICIÓN (Ajuste 2 y 3)
// =================================================================

formularioMedicion.addEventListener('submit', async (e) => {
    e.preventDefault(); 

    const idEstablecimiento = inputIdEstablecimiento.value;

    // Validación crítica: No guardar si no se ha encontrado el establecimiento
    if (!idEstablecimiento) {
        alert("🛑 ¡Alto! Primero debe ingresar y validar un 'Nombre de Establecimiento'.");
        return;
    }

    // 1. Capturamos los datos dinámicos del formulario
    const datosMedicion = {
        id_establecimiento: idEstablecimiento, 
        fecha_medicion: inputFechaMedicion.value, // Usamos la variable selectora
        hora_inicio: inputHoraInicio.value, // Usamos la variable selectora
        valor_medido: inputValorMedido.value, // Usamos la variable selectora
        // ... si tienes más campos, usa sus selectores aquí
    };

    // 2. Realizamos la inserción en la tabla 'mediciones'
    const { error } = await supabase
        .from('mediciones')
        .insert([datosMedicion]);

    // 3. Manejo de la respuesta
    if (error) {
        console.error('Error al guardar:', error);
        alert('❌ Error al guardar el documento: ' + error.message);
    } else {
        alert('✅ Documento guardado con éxito!');
        
        // --- AJUSTE 3: IMPRESIÓN AUTOMÁTICA ---
        // Esto llama al cuadro de impresión del navegador.
        window.print(); 

        // Limpia el formulario DESPUÉS de imprimir
        formularioMedicion.reset(); 
    }
});