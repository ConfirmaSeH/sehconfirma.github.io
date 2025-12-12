// =======================================================
// ARCHIVO: js/app.js (VERSIÓN FINAL CON DEFER)
// =======================================================

// --- 1. CONFIGURACIÓN INICIAL DE SUPABASE (Tus claves) ---
// El navegador ejecutará esto después de cargar el SDK de Supabase gracias a 'defer'
const supabaseUrl = 'https://mmshquwpyxvebkwtrwdk.supabase.co'; 
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tc2hxdXdweXh2ZWJrd3Ryd2RrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0MTMzMTMsImV4cCI6MjA4MDQ4OTMxM30.ert569xsxnF8VkyfWU-IFNqKoeoMXKLiEkIKm9LLjGc';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);


// --- 2. SELECTORES DE ELEMENTOS HTML ---
const formularioMedicion = document.getElementById('formulario-medicion');
const datalistOpciones = document.getElementById('opciones-clientes'); 
const inputNombre = document.getElementById('nombre_establecimiento'); 
// ... (El resto de tus selectores van aquí) ...
const inputCuit = document.getElementById('cuit');
const inputRazonSocial = document.getElementById('razon_social');
const inputDireccion = document.getElementById('direccion');
const inputCodigoPostal = document.getElementById('codigo_postal');
const inputLocalidad = document.getElementById('localidad');
const inputProvincia = document.getElementById('provincia');
const inputIdEstablecimiento = document.getElementById('establecimiento_id_seleccionado'); 

// Selectores para datos dinámicos de medición
const inputFechaMedicion = document.getElementById('fecha_medicion'); 
const inputHoraInicio = document.getElementById('hora_inicio');       
const inputValorMedido = document.getElementById('valor_medido');     


// =================================================================
// FLUJO A.1: BÚSQUEDA Y RELLENADO DE OPCIONES (Desplegable)
// =================================================================

async function cargarOpcionesBusqueda() {
    const nombreBuscado = inputNombre.value.trim();
    
    if (nombreBuscado.length < 3) {
        datalistOpciones.innerHTML = '';
        return; 
    }

    const { data, error } = await supabase
        .from('establecimientos')
        .select('nombre') 
        .ilike('nombre', `%${nombreBuscado}%`) 
        .limit(10); 

    if (error) {
        console.error('Error al buscar opciones (Revisa RLS):', error);
        return;
    }

    datalistOpciones.innerHTML = '';
    data.forEach(establecimiento => {
        const option = document.createElement('option');
        option.value = establecimiento.nombre;
        datalistOpciones.appendChild(option);
    });
}


// =================================================================
// FLUJO A.2: AUTOCOMPLETAR DETALLES TRAS SELECCIÓN
// =================================================================

async function autocompletarDetalles() {
    const nombreSeleccionado = inputNombre.value.trim();

    // 1. Limpiar campos
    inputIdEstablecimiento.value = '';
    inputCuit.value = '';
    inputRazonSocial.value = '';
    inputDireccion.value = '';
    inputCodigoPostal.value = '';
    inputLocalidad.value = '';
    inputProvincia.value = '';

    if (!nombreSeleccionado) return;

    // 2. Buscar datos completos
    const { data, error } = await supabase
        .from('establecimientos')
        .select('id, cuit, razon_social, direccion, codigo_postal, localidad, provincia')
        .eq('nombre', nombreSeleccionado)
        .single(); 

    if (error || !data) {
        console.warn('Detalles no encontrados o error en la selección:', error);
        alert("Cliente no encontrado en la base de datos.");
        return;
    }

    // 3. Rellenar los campos estáticos
    inputIdEstablecimiento.value = data.id; 
    inputCuit.value = data.cuit;
    inputRazonSocial.value = data.razon_social;
    inputDireccion.value = data.direccion;
    inputCodigoPostal.value = data.codigo_postal; 
    inputLocalidad.value = data.localidad;       
    inputProvincia.value = data.provincia;       

    console.log(`Establecimiento ${data.nombre} cargado. ID: ${data.id}`);
}


// --- 3. EVENT LISTENERS ---
inputNombre.addEventListener('input', cargarOpcionesBusqueda);
inputNombre.addEventListener('change', autocompletarDetalles); 


// =================================================================
// FLUJO B: GUARDADO Y IMPRESIÓN DE LA MEDICIÓN
// =================================================================

formularioMedicion.addEventListener('submit', async (e) => {
    e.preventDefault(); 

    const idEstablecimiento = inputIdEstablecimiento.value;

    if (!idEstablecimiento) {
        alert("🛑 ¡Alto! Primero debe validar un 'Nombre de Establecimiento' seleccionándolo del desplegable.");
        return;
    }
    
    // 1. Capturamos los datos dinámicos
    const datosMedicion = {
        id_establecimiento: idEstablecimiento, 
        fecha_medicion: inputFechaMedicion.value, 
        hora_inicio: inputHoraInicio.value, 
        valor_medido: inputValorMedido.value, 
    };

    // 2. Realizamos la inserción
    const { error } = await supabase
        .from('mediciones')
        .insert([datosMedicion]);

    // 3. Manejo de la respuesta
    if (error) {
        console.error('Error al guardar:', error);
        alert('❌ Error al guardar el documento: ' + error.message);
    } else {
        alert('✅ Documento guardado con éxito!');
        window.print(); 
        formularioMedicion.reset();
    }
});