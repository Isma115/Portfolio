Para construir cualquier proyecto de software, aplicación o página web etc, para la base de código tienes que seguir una estructura de organización de código que se basa en la división por funcionalidades.

Así como estructura básica todo proyecto tendría que estar estructurado de la siguiente manera:

La división inicial se hace a través de distinguir backend y frontend.

En el backend se encuentra toda la lógica del negocio, la base de datos, las apis, etc.

En el frontend se encuentra toda la interfaz de usuario, la interactividad, etc.

En la carpeta raíz de cualquier proyecto debe estar el archivo README.md además de Agent.md que utilizamos y las dos carpetas frontend y backend

Proyecto/
    backend/
    frontend/
    README.md
    Agent.md

El backend normalmente utilizamos ORM por lo que habrá controladores, modelos y rutas. Carpetas para cada uno.

Para el FrontEnd podemos tener varias páginas en la web, como index, dashboard, etc. Por lo que habrá una carpeta para cada página y dentro de cada página tendremos los componentes, estilos, la lógica de la página, etc.

El objetivo principal es conseguir conocer dónde se ubica cada elemento atomizado del proyecto para así tener mayor conciencia de qué hace cada parte del mismo evitando que el tamaño de los ficheros de código crezcan enormemente y de forma descontrolada y al mismo tiempo evitar la sobremodularización innecesaria.

Como apoyo y visualización mediante herramientas externas, cada sección del código debe estar delimitado por bloques de comentarios de regiones: region y endregion con un título relevante que describa la sección, (endregion no debe contener información extra simplemente endregion) de manera que pueda ser fácilmente identificable.

La nomenclatura para nombrar las regiones es:

region Nombre de página o sección de la aplicación: Descripción de la funcionalidad

por ejemplo:

region Página Inicio: componente inicial
region Página Inicio: popup de iniciar sesión
region Página Inicio: popup de registrarse
region Página Inicio: Footer de la página

region Dashboard: componente principal
region Dashboard: barra de navegación superior
region Dashboard: barra lateral izquierda
region Dashboard: área de contenido principal
region Dashboard: footer


Por lo cual para todo además de estilos, código funcional, vistas, componentes, etc todo debe estar delimitado por bloques de comentarios de regiones.

Según si es backend, vistas, o estilos, eso se tiene que especificar en la región, por ejemplo:

region Estilos Página Inicio: estilos para el popup de iniciar sesión
region Estilos Página Inicio: estilos para el popup de registrarse
region Estilos Página Inicio: estilos para el footer de la página

region Lógica Página Inicio: componente inicial
region Lógica Página Inicio: popup de iniciar sesión
region Lógica Página Inicio: popup de registrarse
region Lógica Página Inicio: footer de la página

region Componentes Página Inicio: componente inicial
region Componentes Página Inicio: popup de iniciar sesión
region Componentes Página Inicio: popup de registrarse
region Componentes Página Inicio: footer de la página

o backend:

region Backend: controlador de usuarios
region Backend: modelo de usuarios
region Backend: ruta de usuarios


Como añadido para cada functionalidad o parte de la aplicación, quiero tener un markdown para cada functionalidad indicando la lista de regiones de código que participan en dicha funcionalidad. Solo un markdown llamado funcionalidades.md que contendrá el título de cada parte del proyecto y sus correspondientes regiones de código asignadas, pero para cada trozo funcional de la aplicación sin acaparar varias, de esta manera atomizar más y tener mayor control sobre el código. Por ejemplo: 

Vista de Página principal:
region Estilos Página Inicio: estilos para la página principal de inicio
region Componentes Página Inicio: componente principal de la página de inicio

Vista de Página principal iniciar sesión:
region Estilos Página Inicio: estilos para el popup de iniciar sesión
region Componentes Página Inicio: popup de iniciar sesión
region Lógica Página Inicio: popup de iniciar sesión

Eso para cada funcionalidad independiente del proyecto, de tal manera que podamos recoger con herramientas externas el código por regiones seleccionando la funcionalidad que queremos revisar o editar con esas herramientas externas sin recoger código innecesario

Apunte: Este proyecto no tiene backend, es una página web portfolio