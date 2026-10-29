# Organización de Home

La página sigue siendo HTML estático y puede abrirse directamente desde el sistema de archivos. `index.html` contiene las secciones y carga los archivos en orden; no requiere compilación ni servidor.

- `home.css`: base visual y menú.
- `styles/secciones.css`: estilos de las secciones, incluida Sobre mí.
- `styles/fondo.css`: topografía, partículas, código y estelas.
- `styles/animaciones.css`: presentación, indicador y transiciones de secciones.
- `styles/adaptacion.css`: ajustes responsive, tarjetas de proyectos y movimiento reducido.
- `home.js`: estado inicial, presentación y navegación.
- `scripts/fondo.js`: topografía, partículas, luz y estelas.
- `scripts/secciones.js`: entrada de secciones, navegación a novedades e indicador de scroll.
- `scripts/codigo-fondo.js`: escritura progresiva de fragmentos decorativos.

Los archivos JavaScript se cargan como scripts clásicos; las secciones consultan directamente su propio DOM. El orden de las hojas conserva la cascada original.
