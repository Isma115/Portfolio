# Fondo de Home

La página contiene 7 símbolos decorativos ocultos a los lectores de pantalla. `scripts/fondo.js` distribuye sus posiciones y contenido aleatoriamente, asigna tamaños de 9 a 22 píxeles y vuelve a aleatorizarlos al repetirse su animación.

La capa de código contiene tres bloques que seleccionan entre ocho fragmentos multilínea coherentes de JavaScript, Python, SQL, TypeScript, CSS, Rust y shell. `scripts/codigo-fondo.js` elige el fragmento y su posición dentro de la pantalla al iniciar cada bloque y al reiniciar su ciclo, evitando repetir inmediatamente el fragmento anterior. Al cambiar el tamaño de la ventana, ajusta de nuevo las posiciones.

Cada bloque se escribe carácter a carácter cada 75 ms, permanece 2,5 segundos y se desvanece durante 3 segundos antes de cambiar. `styles/fondo.css` desplaza suavemente los bloques, mantiene su opacidad baja y deja espacio para el movimiento dentro de la pantalla. La capa es decorativa, queda detrás del contenido, no intercepta clics y está oculta a los lectores de pantalla. Sin JavaScript permanece oculta; con movimiento reducido muestra fragmentos completos y estáticos sin ciclos, incluso cuando la preferencia cambia durante la visita.

Las estelas eligen entre combinaciones azules, verdes, cálidas y violetas con la misma probabilidad, evitando repetir la anterior. La luz principal también puede adoptar tonos cálidos, verdes, azules o violetas; las partículas combinan cian, ámbar y verde.
