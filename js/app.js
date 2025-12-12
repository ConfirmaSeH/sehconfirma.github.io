// =======================================================
// ARCHIVO: js/app.js (VERSIÓN CORREGIDA)
// =======================================================

// --- 1. CONFIGURACIÓN INICIAL DE SUPABASE ---
const supabaseUrl = 'https://mmshquwpyxvebkwtrwdk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tc2hxdXdweXh2ZWJrd3Ryd2RrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0MTMzMTMsImV4cCI6MjA4MDQ4OTMxM30.ert569xsxnF8VkyfWU-IFNqKoeoMXKLiEkIKm9LLjGc';

// 🔥 CORRECCIÓN Principal → evitar conflicto del nombre "supabase"
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);


// --- 2. SELECTORES DE ELEMENTOS HTML ---
const formularioMedicion = document.getElementById('formulario-medicion');
const datalistOpciones = document.getElementById('opciones-clientes'); 
const inputNombre = document.getElementById('nombre_establecimiento');

const inputCuit = document.getElementById('cuit');
const inputRazonSocial = document.getElementById('razon_social');
const inputDireccion = document.getElementById('direccion');
const inputCodigoPostal = document.getElementById('codigo_postal');
const inputLocalidad = document.getElementById('localidad');
const inputProvincia = document.getElementById('provincia');
const inputIdEstablecimiento = document.getElementById('establecimiento_id_seleccionado');

// Datos dinámicos
const inputFechaMedicion = document.getElementById('fecha_medicion');
const inputHoraInicio = document.getElementById('hora_inicio');
const inputValorMedido = document.getElementById('valor_medido');


// =================================================================
// FLUJO A.1: BÚSQUEDA EN SUPABASE PARA AUTOCOMPLETADO
// =================================================================

async function cargarOpcionesBusqueda() {
    const nombreBuscado = inputNombre.value.trim();
    
    if (nombreBuscado.length < 3) {
        datalistOpciones.innerHTML = '';
        return;
    }

    const { data, error } = await supabaseClient
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

    // Limpiar campos
    inputIdEstablecimiento.value = '';
    inputCuit.value = '';
    inputRazonSocial.value = '';
    inputDireccion.value = '';
    inputCodigoPostal.value = '';
    inputLocalidad.value = '';
    inputProvincia.value = '';

    if (!nombreSeleccionado) return;

    const { data, error } = await supabaseClient
        .from('establecimientos')
        .select('id, cuit, razon_social, direccion, codigo_postal, localidad, provincia')
        .eq('nombre', nombreSeleccionado)
        .single();

    if (error || !data) {
        console.warn('Detalles no encontrados:', error);
        alert("Cliente no encontrado en la base de datos.");
        return;
    }

    // Relleno de campos
    inputIdEstablecimiento.value = data.id;
    inputCuit.value = data.cuit;
    inputRazonSocial.value = data.razon_social;
    inputDireccion.value = data.direccion;
    inputCodigoPostal.value = data.codigo_postal;
    inputLocalidad.value = data.localidad;
    inputProvincia.value = data.provincia;

    console.log(`Establecimiento cargado: ID ${data.id}`);
}


// --- LISTENERS ---
inputNombre.addEventListener('input', cargarOpcionesBusqueda);
inputNombre.addEventListener('change', autocompletarDetalles);


// =================================================================
// FLUJO B: GUARDADO DE LA MEDICIÓN EN SUPABASE
// =================================================================

formularioMedicion.addEventListener('submit', async (e) => {
    e.preventDefault();

    const idEstablecimiento = inputIdEstablecimiento.value;

    if (!idEstablecimiento) {
        alert("🛑 Primero seleccione correctamente un establecimiento de la lista.");
        return;
    }

    const datosMedicion = {
        id_establecimiento: idEstablecimiento,
        fecha_medicion: inputFechaMedicion.value,
        hora_inicio: inputHoraInicio.value,
        valor_medido: inputValorMedido.value,
    };

    const { error } = await supabaseClient
        .from('mediciones')
        .insert([datosMedicion]);

    if (error) {
        console.error('Error al guardar:', error);
        alert('❌ Error al guardar el documento: ' + error.message);
    } else {
        alert('✅ Documento guardado con éxito!');
        window.print();
        formularioMedicion.reset();
    }
});
