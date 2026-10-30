# Sección Sobre mí

La sección utiliza una cabecera editorial y una composición de fotografía a la izquierda y presentación a la derecha, inspirada en la referencia visual. La paleta combina acentos turquesa y azul eléctrico sobre un fondo oscuro, con superficies translúcidas de aspecto cristalino y sin contornos visibles. La fotografía es el recurso propio del portfolio. La presentación conserva información existente y muestra tecnologías ya presentes en la sección de stack, junto con enlaces internos a Proyectos y Tecnologías; no se inventan cifras de experiencia ni disponibilidad.

En móviles, los elementos se apilan y se adaptan al ancho disponible. La cabecera, la fotografía, el saludo, cada párrafo, la franja de tecnologías y cada botón entran de forma independiente cuando aparecen en pantalla; al salir de la sección quedan preparados para la siguiente visita. Con movimiento reducido o sin JavaScript se muestran directamente. El contenido está en la región `Componente Home | Seccion | Sobre mi` de `index.html`; los estilos específicos están en `styles/sobre-mi.css`.

Los botones muestran una estela azul oscuro de izquierda a derecha al pasar el cursor. En los botones también aparece al recibir foco de teclado; con movimiento reducido se muestra sin transición. Las etiquetas de tecnologías no tienen este efecto.

La franja de tecnologías combina las etiquetas existentes con otras documentadas en el currículum del proyecto. Se desplaza de forma continua y se pausa al situar el cursor o el foco sobre ella. La copia visual está oculta a lectores de pantalla. Con movimiento reducido, las tecnologías se muestran completas y sin animación.

La observación independiente se implementa en `scripts/sobre-mi.js` y la transición en la región `Componente Home | Estilos | Entrada independiente Sobre mi` de `styles/sobre-mi.css`. Los elementos con foco de teclado permanecen visibles.
