# Organización de Home

La página sigue siendo HTML estático y puede abrirse directamente desde el sistema de archivos. `index.html` contiene las secciones y carga los archivos en orden; no requiere compilación ni servidor.

- `home.css`: base visual y menú.
- `styles/secciones.css`: estilos generales y de las secciones.
- `styles/sobre-mi.css` y `styles/proyectos.css`: presentación de cada sección.
- `styles/fondo.css`: topografía, partículas, código y estelas.
- `styles/animaciones.css`: presentación, indicador y transiciones de secciones.
- `styles/adaptacion.css`: ajustes responsive y movimiento reducido.
- `home.js`: estado inicial, presentación y navegación.
- `scripts/fondo.js`: topografía, partículas, luz y estelas.
- `scripts/secciones.js`: entrada de secciones e indicador de scroll.
- `scripts/sobre-mi.js`: entrada independiente de los elementos de Sobre mí.
- `scripts/proyectos.js`: activación del carrusel de proyectos.
- `scripts/codigo-fondo.js`: escritura progresiva y fundido de fragmentos decorativos, posicionados sin medir geometría.
- `scripts/inicio.js` y `styles/inicio.css`: introducción con el fondo animado, zoom hacia afuera y cursor parpadeante antes de revelar el contenido.

Los archivos JavaScript se cargan como scripts clásicos; las secciones consultan directamente su propio DOM. El orden de las hojas conserva la cascada necesaria.

El canvas decorativo limita el ancho interno a 1280 px y usa 20 fps en móvil y 30 en escritorio. Las luces, partículas, ilustraciones y la escritura de código vuelven a animarse; al ocultar la pestaña se pausan y se respeta movimiento reducido. Las animaciones originales de la portada comienzan después de una introducción mínima de 1,25 segundos, sincronizada con la carga de página y fuentes, con salida de seguridad a los 8 segundos. Se mantienen la fuente WOFF2 precargada y el subtítulo sin mediciones de ancho.

Las pruebas de estos cambios se ejecutan con `node --test frontend/home/scripts/fondo.test.cjs frontend/home/scripts/codigo-fondo.test.cjs`.

La portada precarga las dos fuentes locales. Chakra Petch se sirve en WOFF2 (sin quitar caracteres) y bloquea brevemente el texto mientras carga para evitar mostrar otra tipografía. El subtítulo se revela con `clip-path`, sin medir `scrollWidth` ni animar su ancho.

Todas las secciones se renderizan desde el inicio, sin `content-visibility: auto`. Las imágenes se solicitan sin carga diferida y la introducción espera también a su decodificación, además de la página y las fuentes. Una imagen fallida no bloquea la entrada; se conserva la salida de seguridad de 8 segundos.

Temporalmente, las secciones y los elementos de Sobre mí se revelan una sola vez: dejan de observarse al aparecer y permanecen visibles al salir de pantalla.

La iluminación ambiental del fondo cambia con `body[data-section]`, igual que las estelas. Los dos colores del halo se interpolan en 900 ms y cambian directamente si se prefiere movimiento reducido.

El código decorativo del fondo está activo: `scripts/codigo-fondo.js` escribe y renueva los fragmentos de su capa.

El efecto de holograma está activo mediante `shared/hologram.js` y su observador de tarjetas.
