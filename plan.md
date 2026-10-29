# Plan: código animado de fondo

## Objetivo

Mostrar fragmentos de código más largos y de varias líneas que se escriban letra a letra, se desplacen lentamente y se desvanezcan de forma gradual, con menor opacidad que ahora.

## Comportamiento previsto

- Sustituir las líneas actuales por varios fragmentos breves pero coherentes de lenguajes diferentes, conservando formato y saltos de línea.
- Mostrar cada fragmento progresivamente carácter por carácter, incluidos los saltos de línea, y mantenerlo visible un momento antes de que desaparezca gradualmente y comience un nuevo ciclo.
- Desplazar suavemente cada fragmento por el fondo durante el ciclo, con diferentes posiciones y tiempos, y reducir su opacidad respecto a la actual.
- Mantener el código detrás del contenido, sin interceptar clics y oculto a lectores de pantalla. Adaptar el tamaño y la posición a móvil.
- Con movimiento reducido, presentar los fragmentos completos y estáticos, sin escritura ni desplazamiento animados.

## Comprobación y documentación

- Verificar la escritura secuencial, los saltos de línea, el ciclo de desaparición y el movimiento reducido; comprobar los ejemplos y la sintaxis de JavaScript.
- Revisar la composición en escritorio y móvil con las herramientas disponibles y documentar la implementación en docs/.

## Criterios de aceptación

El fondo muestra código válido y multilínea en varios lenguajes, que se escribe carácter a carácter, se mueve y se desvanece progresivamente sin dificultar la lectura ni la interacción con la web.
