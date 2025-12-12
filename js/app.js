// =======================================================
// ARCHIVO: js/app.js
// =======================================================

// --- 1. CONFIGURACIÓN INICIAL DE SUPABASE (Tus claves) ---
const supabaseUrl = 'https://mmshquwpyxvebkwtrwdk.supabase.co'; 
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tc2hxdXdweXh2ZWJrd3Ryd2RrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0MTMzMTMsImV4cCI6MjA4MDQ4OTMxM30.ert569xsxnF8VkyfWU-IFNqKoeoMXKLiEkIKm9LLjGc';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);


// --- 2. SELECTORES DE ELEMENTOS HTML ---
const formularioMedicion = document.getElementById('formulario-medicion');
const datalistOpciones = document.getElementById('opciones-clientes'); // Nuevo selector: el desplegable
const inputNombre = document.getElementById('nombre_establecimiento'); 
const inputCuit = document.getElementById('cuit');
const inputRazonSocial = document.getElementById('razon_social');
const inputDireccion = document.getElementById('direccion');
const inputIdEstablecimiento = document.getElementById('establecimiento_id_seleccionado'); 
// ... otros inputs dinámicos (fecha, hora, etc.)

let clienteSeleccionado = null; // Variable para almacenar el ID después de la selección


// =================================================================
// FLUJO A.1: BÚSQUEDA Y RELLENADO DE OPCIONES (Desplegable)
// =================================================================

/**
 * Función que busca coincidencias parciales y rellena el desplegable.
 */
async function cargarOpcionesBusqueda() {
    const nombreBuscado = inputNombre.value.trim();
    
    // Buscar solo si el texto tiene al menos 3 caracteres
    if (nombreBuscado.length < 3) {
        datalistOpciones.innerHTML = ''; // Limpiar opciones si el texto es muy corto
        return; 
    }

    // Usamos 'ilike' para buscar coincidencias parciales (case-insensitive LIKE)
    const { data, error } = await supabase
        .from('establecimientos')
        .select('nombre') 
        .ilike('nombre', `%${nombreBuscado}%`) // Busca 'nombre' que contenga el texto
        .limit(10); // Limitar resultados a 10

    if (error) {
        console.error('Error al buscar opciones:', error);
        return;
    }

    // Llenar el <datalist> con las opciones
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

/**
 * Función que se ejecuta cuando el usuario selecciona un nombre del desplegable.
 */
async function autocompletarDetalles() {
    const nombreSeleccionado = inputNombre.value.trim();

    // 1. Limpiar campos
    inputIdEstablecimiento.value = '';
    inputCuit.value = '';
    inputRazonSocial.value = '';
    inputDireccion.value = '';

    if (!nombreSeleccionado) return;

    // 2. Buscar por coincidencia exacta (solo el nombre seleccionado)
    const { data, error } = await supabase
        .from('establecimientos')
        .select('id, cuit, razon_social, direccion')
        .eq('nombre', nombreSeleccionado)
        .single(); // Pedimos un solo resultado

    if (error || !data) {
        console.warn('Detalles no encontrados o error en la selección:', error);
        alert("Cliente no encontrado en la base de datos.");
        return;
    }

    // 3. Rellenar los campos estáticos
    inputIdEstablecimiento.value = data.id; // ¡CRÍTICO: Guarda el ID!
    inputCuit.value = data.cuit;
    inputRazonSocial.value = data.razon_social;
    inputDireccion.value = data.direccion;

    alert(`Establecimiento '${data.nombre}' cargado. Listo para registrar medición.`);
}


// --- 3. EVENT LISTENERS ACTUALIZADOS ---

// Escucha cada vez que se escribe para recargar las opciones del desplegable
inputNombre.addEventListener('input', cargarOpcionesBusqueda);

// Escucha cuando el valor del input cambia (generalmente al seleccionar del datalist)
inputNombre.addEventListener('change', autocompletarDetalles); 


// =================================================================
// FLUJO B: GUARDADO DE LA MEDICIÓN (El resto del código se mantiene)
// =================================================================

// ... (El código de formularioMedicion.addEventListener('submit', ...) va aquí) ...

formularioMedicion.addEventListener('submit', async (e) => {
    e.preventDefault(); 

    const idEstablecimiento = inputIdEstablecimiento.value;

    if (!idEstablecimiento) {
        alert("🛑 ¡Alto! Primero debe ingresar y validar un 'Nombre de Establecimiento' seleccionándolo del desplegable.");
        return;
    }
    
    // Capturamos los datos dinámicos del formulario
    const datosMedicion = {
        id_establecimiento: idEstablecimiento, 
        fecha_medicion: document.getElementById('fecha_medicion').value, 
        hora_inicio: document.getElementById('hora_inicio').value, 
        valor_medido: document.getElementById('valor_medido').value, 
        // Agrega aquí todas las demás columnas de tu tabla 'mediciones'
    };

    // Realizamos la inserción
    const { error } = await supabase
        .from('mediciones')
        .insert([datosMedicion]);

    // Manejo de la respuesta
    if (error) {
        console.error('Error al guardar:', error);
        alert('❌ Error al guardar el documento: ' + error.message);
    } else {
        alert('✅ Documento guardado con éxito!');
        window.print(); // Imprimir
        formularioMedicion.reset(); // Limpia todos los campos
    }
});