// Escucha cuando presionas cualquier tecla en el teclado
document.addEventListener('keydown', function(event) {
    // Si presionas la tecla "1"
    if (event.key === '1') {
        window.location.href = 'desarrollo.html'; // Cambia por el nombre de tu primer HTML
    }
    
    // Si presionas la tecla "2"
    if (event.key === '2') {
        window.location.href = 'juegoLudico.html'; // Cambia por el nombre de tu segundo HTML
    }
});