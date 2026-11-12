# Funcionalidades

## Vista Proyectos: carrusel

- «Hablemos del proyecto» abre Gmail en una pestaña nueva con destinatario y asunto del proyecto predefinidos.

- region Componente Home | Seccion | Proyectos
- region Componente Home | Estilos | Carrusel de proyectos
- region Componente Home | Funcionalidad | Carrusel de proyectos
- Carrusel desplazable para Noduvia, Trazuvia y Ada, con descripciones y enlaces existentes. Sin JavaScript se muestran todas las tarjetas. Fondos SVG estáticos propios: agentes y fábrica de software, interfaces y diagramas de flujo, y circuitos con voz, respectivamente.

## Vista Home: presentacion principal

- Precarga de fuentes WOFF2 y revelado del subtítulo con recorte, sin medición de ancho ni cambios de layout por cada letra.

- Entrada original del nombre con desplazamiento, desenfoque y sombras, iniciada después de la introducción.

- region Vista Pagina Home: documento principal
- region Vista Pagina Home: malla gravitatoria de fondo
- region Vista Pagina Home: particulas de fondo
- region Vista Pagina Home: estelas de color de fondo
- region Vista Pagina Home: hero central con nombre y subtitulo
- region Componente Home | Seccion | Stack y herramientas
- region Vista Pagina Home: indicador de scroll
- region Estilos Pagina Home: base visual y layout
- region Estilos Pagina Home: malla gravitatoria de fondo
- region Estilos Pagina Home: particulas de fondo
- region Estilos Pagina Home: estelas de color de fondo
- region Estilos Pagina Home: hero central con nombre y subtitulo
- region Componente Home | Estilos | Stack y herramientas
- region Estilos Pagina Home: indicador de scroll
- region Estilos Pagina Home: adaptacion responsive
- region Logica Pagina Home: estado inicial de navegacion
- region Logica Pagina Home: malla gravitatoria reactiva
- region Logica Pagina Home: particulas de fondo aleatorias
- region Logica Pagina Home: scroll y transicion a pagina Sobre Mi

## Vista Sobre Mi: pagina personal independiente

- region Vista Pagina Sobre Mi: malla de fondo
- region Vista Pagina Sobre Mi: particulas de fondo
- region Vista Pagina Sobre Mi: contenido principal
- region Estilos Pagina Sobre Mi: base visual y layout
- region Estilos Pagina Sobre Mi: malla de fondo
- region Estilos Pagina Sobre Mi: particulas de fondo
- region Estilos Pagina Sobre Mi: contenido principal
- region Estilos Pagina Sobre Mi: adaptacion responsive
- region Logica Pagina Sobre Mi: entrada de pagina
- region Logica Pagina Sobre Mi: malla reactiva de fondo
- region Logica Pagina Sobre Mi: navegacion hacia Home por scroll

## Inicio de la web en Windows

- region Inicio web: abrir la pagina principal (`abrir-web.bat`)

## Vista Home: Sobre mí

- Retrato ligeramente vertical con doble borde e icono decorativo de imagen. La tira redundante de lenguajes se elimina de esta sección.

- Texto dentro de una ventana de interfaz con barra superior y trazos verde agua; retrato en un recuadro dentro del contenido, arriba a la izquierda (un cuarto del ancho), con texto a su derecha y debajo, y adaptación a móvil en `frontend/home/styles/sobre-mi.css`.

- region Componente Home | Seccion | Sobre mi
- region Componente Home | Estilos | Seccion Sobre mi
- region Componente Home | Estilos | Entrada independiente Sobre mi
- region Componente Home | Funcionalidad | Entrada independiente Sobre mi
- region Componente Home | Estilos | Estela de botones Sobre mi
- region Componente Home | Estilos | Movimiento reducido en Sobre mi
- region Componente Home | Funcionalidad | Animacion de secciones al hacer scroll

## Vista Home: fragmentos de código de fondo

- Escritura por letras, cambio de fragmento y fundido recuperados, con posiciones relativas sin medir el layout.

- region Componente Home | Codigo de Componente | Fragmentos de codigo de fondo
- region Componente Home | Estilos | Fragmentos de codigo de fondo
- region Componente Home | Funcionalidad | Escritura de codigo de fondo

## Vista Home: dibujos de fondo por sección

- Movimiento de luces, partículas e ilustraciones recuperado; canvas limitado a 1280 px y pausado solo al ocultar la pestaña o reducir movimiento.

- region Componente Home | Codigo de Componente | Atmosfera por seccion
- region Componente Home | Estilos | Atmosfera por seccion
- region Componente Home | Estilos | Ilustraciones de trazo por seccion
- El dibujo de Proyectos se reutiliza en las portadas de los iconos desde `frontend/home/assets/projects-background.svg`, con estilos en `frontend/shared/cyberpunk.css`.

## Vista Home: introducción de carga

- region Componente Home | Funcionalidad | Inicio de la introduccion
- region Componente Home | Codigo de Componente | Introduccion de carga
- region Componente Home | Estilos | Introduccion de carga
- region Componente Home | Funcionalidad | Introduccion de carga
- Pantalla de fondo liso con un único cursor parpadeante durante al menos 2 segundos, mientras se cargan la página, las fuentes y las imágenes de todas las secciones detrás. Se espera a la decodificación de las imágenes y las secciones se renderizan desde el inicio. El contenido aparece después; salida de seguridad a los 8 segundos y sin bloqueo si JavaScript está desactivado.
