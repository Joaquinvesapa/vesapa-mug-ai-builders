# PRD-001: Festival Social Grid — grillas personales y grupales para festivales de música

## Contexto y Problema

Quienes asisten a un festival reciben un line-up extenso, distribuido entre días, horarios y escenarios. Decidir qué artistas ver, detectar superposiciones y coordinar el recorrido con amigos suele requerir capturas de pantalla, mensajes dispersos y planillas que quedan desactualizadas.

El MVP centraliza la programación oficial de distintos festivales y permite que cada persona elija uno y arme una grilla independiente. Los usuarios pueden reunirse en grupos privados asociados a un festival para consultar automáticamente qué integrantes eligieron cada artista, reconocer coincidencias y tomar decisiones fuera de la plataforma sin perder la preferencia individual de cada miembro. Durante cada festival, la grilla identifica qué shows están en vivo según la hora actual. Además, cada usuario puede descargar como imagen su grilla personal o una versión grupal para usarla como fondo de pantalla o compartirla.

**Personas principales**

- **Asistente:** explora el line-up, consulta información de los shows, arma su grilla personal y la descarga como imagen.
- **Integrante de un grupo:** compara su selección con la de sus amigos, busca coincidencias y exporta una grilla grupal.
- **Desarrollador administrador:** accede mediante una cuenta administrativa separada, crea festivales, carga o extrae programaciones, revisa borradores y publica actualizaciones.

**Decisiones del MVP**

- Se ofrece un catálogo con varios festivales publicados en fechas diferentes.
- Cada grilla personal y cada grupo pertenecen a un único festival.
- El panel administrativo es exclusivo del desarrollador y utiliza una cuenta separada del acceso de usuarios.
- La programación puede cargarse manualmente por día, importarse por CSV o extraerse parcialmente desde una imagen.
- Toda extracción desde imagen queda como borrador revisable; ningún dato extraído se publica automáticamente.
- La publicación se realiza por festival completo.
- Un festival publicado puede editarse: los cambios se preparan como borrador y reemplazan la versión visible únicamente al volver a publicar.
- El acceso se realiza con Google o mediante un código nuevo, temporal y de un solo uso enviado por email.
- Cada usuario tiene un nombre de usuario único, buscable y modificable.
- La selección personal es binaria: el usuario quiere asistir o no seleccionó al artista.
- La vista grupal se calcula automáticamente; no existe una grilla grupal editable ni una votación formal.
- Durante el festival, la aplicación muestra estados horarios dentro de la grilla, sin enviar notificaciones del navegador.
- La grilla personal se descarga en dos formatos PNG predefinidos: fondo vertical para celular e imagen estándar para compartir.
- Al exportar una grilla grupal, el usuario decide si muestra las cantidades de coincidencias o también los nombres de los integrantes.
- Todo el contenido requiere autenticación. No existen perfiles, grillas ni enlaces públicos.

## Objetivos

- Permitir que un usuario autenticado encuentre un artista y lo agregue a su grilla en menos de 60 segundos desde que ingresa al festival.
- Lograr que al menos el 70% de los usuarios que seleccionen un artista completen una grilla con tres o más shows.
- Permitir que un grupo identifique, sin coordinación manual externa, cuántos miembros quieren asistir a cada show y quiénes son.
- Detectar todas las superposiciones horarias presentes en la grilla personal según los horarios oficiales publicados.
- Mostrar correctamente qué shows seleccionados están en vivo durante el festival según la hora actual y la zona horaria oficial.
- Permitir descargar una representación legible de la grilla personal o grupal en menos de 30 segundos.
- Mantener una versión publicada y consistente de cada festival, administrada mediante carga manual, CSV o extracción revisada desde una imagen.
- Permitir que el desarrollador cree, complete, publique y actualice festivales sin modificar directamente la base de datos.

## Requerimientos Funcionales

- **RF-01 — Autenticación:** El sistema debe permitir que una persona cree una cuenta, inicie sesión y cierre sesión mediante Google o mediante un código de seis dígitos enviado por email.
- **RF-02 — Código por email:** El sistema debe generar un código nuevo, temporal y de un solo uso en cada intento de acceso por email; si el email no está registrado, la primera verificación válida debe crear la cuenta.
- **RF-03 — Perfil:** El sistema debe solicitar un nombre de usuario único al completar el primer acceso y permitir que cada usuario consulte y edite posteriormente su nombre de usuario y avatar.
- **RF-04 — Nombre de usuario:** El sistema debe exigir que el nombre de usuario sea único, permitir buscar usuarios por ese nombre y validar su disponibilidad antes de guardar un cambio.
- **RF-05 — Acceso administrativo:** El sistema debe ofrecer un acceso administrativo separado del acceso de usuarios y permitir ingresar únicamente a la cuenta administrativa provisionada para el desarrollador.
- **RF-06 — Gestión de festivales:** El sistema debe permitir que el administrador cree y edite festivales con nombre, descripción, imagen, ubicación, fecha inicial, fecha final y zona horaria.
- **RF-07 — Exploración del line-up:** El sistema debe mostrar la programación publicada del festival elegido y permitir buscar por artista y filtrar por día y escenario.
- **RF-08 — Información del show:** El sistema debe mostrar para cada show el artista, su descripción, el día, el escenario y las horas de inicio y finalización.
- **RF-09 — Grilla personal:** El sistema debe permitir que un usuario agregue o quite shows de su grilla personal desde el line-up o desde el detalle del show.
- **RF-10 — Orden de la grilla:** El sistema debe ordenar la grilla personal cronológicamente y agruparla por día.
- **RF-11 — Conflictos horarios:** El sistema debe advertir cuando dos o más shows seleccionados se superponen, sin impedir que el usuario conserve ambas selecciones.
- **RF-12 — Creación de grupos:** El sistema debe permitir que un usuario cree, dentro del festival elegido, un grupo privado con nombre y se convierta en su propietario.
- **RF-13 — Invitaciones:** El sistema debe permitir que el propietario invite a usuarios registrados mediante email o nombre de usuario y que cada invitado acepte o rechace la invitación.
- **RF-14 — Gestión de miembros:** El sistema debe permitir que un miembro abandone un grupo y que el propietario elimine miembros o transfiera la propiedad antes de abandonarlo.
- **RF-15 — Coincidencias grupales:** El sistema debe calcular y mostrar, para cada show, cuántos miembros del grupo lo seleccionaron y sus nombres de usuario.
- **RF-16 — Vista grupal:** El sistema debe permitir ordenar la programación grupal por horario o cantidad de interesados y filtrar los shows sin coincidencias.
- **RF-17 — Actualización grupal:** El sistema debe reflejar en la vista grupal los cambios realizados en las grillas personales de sus miembros.
- **RF-18 — Estado temporal:** El sistema debe clasificar cada show seleccionado como “próximo”, “en vivo” o “finalizado” comparando la hora actual del dispositivo, convertida a la zona horaria oficial del festival, con sus horas de inicio y finalización.
- **RF-19 — Actualización temporal:** El sistema debe actualizar automáticamente los estados temporales mientras la grilla permanezca abierta.
- **RF-20 — Exportación personal:** El sistema debe generar una imagen PNG que contenga únicamente los shows seleccionados por el usuario, agrupados por día y ordenados cronológicamente.
- **RF-21 — Formatos personales:** El sistema debe ofrecer la exportación personal en formato vertical para fondo de celular de 1080 × 1920 px y en formato estándar para compartir de 1080 × 1350 px.
- **RF-22 — Exportación grupal:** El sistema debe generar, a partir de los shows seleccionados por el usuario, una imagen PNG que incluya la cantidad de miembros del grupo coincidentes por show.
- **RF-23 — Identidad en exportación:** El sistema debe permitir que el usuario decida, en cada exportación grupal, si la imagen incluye también los nombres de usuario de los miembros coincidentes.
- **RF-24 — Privacidad:** El sistema debe restringir perfiles, grillas, grupos e invitaciones a usuarios autenticados y autorizados, y debe impedir que una cuenta de usuario acceda al panel administrativo.
- **RF-25 — Catálogo de festivales:** El sistema debe mostrar a los usuarios todos los festivales publicados y permitir elegir uno para consultar su programación.
- **RF-26 — Alcance por festival:** El sistema debe mantener separadas las grillas personales, los grupos, las invitaciones y las coincidencias de cada festival.
- **RF-27 — Carga manual por día:** El sistema debe permitir que el administrador agregue un día al borrador de un festival y complete sus escenarios, horarios y artistas manualmente.
- **RF-28 — Importación CSV:** El sistema debe permitir que el administrador importe al borrador un CSV con artistas, descripción, día, escenario, hora de inicio y hora de finalización.
- **RF-29 — Extracción desde imagen:** El sistema debe permitir que el administrador cargue una imagen de la programación de un día para extraer parcialmente artistas, escenarios y horarios mediante OCR o IA.
- **RF-30 — Revisión de extracción:** El sistema debe guardar el resultado de la extracción como borrador, asociarlo al día elegido, señalar campos faltantes o inciertos y permitir corregir, completar o descartar cada fila antes de validarla.
- **RF-31 — Publicación completa:** El sistema debe validar el borrador completo y requerir confirmación administrativa antes de publicar o reemplazar de manera atómica la programación visible de un festival.
- **RF-32 — Edición posterior:** El sistema debe permitir editar un festival publicado mediante un nuevo borrador basado en su versión vigente, sin alterar la versión visible hasta que el administrador vuelva a publicarlo.

## Requerimientos No Funcionales

- **RNF-01 — Rendimiento:** El 95% de las consultas del line-up, la grilla personal y la vista grupal debe responder en menos de 2 segundos con hasta 10.000 usuarios registrados y 200 miembros por grupo.
- **RNF-02 — Actualización grupal:** Los cambios de una grilla personal deben verse reflejados en la vista grupal en menos de 5 segundos p95.
- **RNF-03 — Disponibilidad:** La aplicación debe alcanzar una disponibilidad mensual mínima del 99,5%, excluyendo mantenimientos anunciados.
- **RNF-04 — Seguridad de acceso:** Toda comunicación debe utilizar TLS 1.2 o superior. Cada código de acceso debe vencer a los 10 minutos, ser invalidado tras su primer uso exitoso y admitir como máximo cinco intentos fallidos.
- **RNF-05 — Prevención de abuso:** El sistema debe permitir como máximo cinco solicitudes de código por email cada 15 minutos y no debe revelar si una dirección ya está registrada.
- **RNF-06 — Autorización:** El 100% de los endpoints que exponen perfiles, grillas, grupos o exportaciones debe validar autenticación y pertenencia o invitación aplicable del usuario.
- **RNF-07 — Identidad:** Los nombres de usuario deben tener entre 3 y 30 caracteres y su unicidad debe evaluarse sin distinguir mayúsculas de minúsculas.
- **RNF-08 — Accesibilidad:** Los flujos principales deben cumplir WCAG 2.1 nivel AA y poder operarse mediante teclado.
- **RNF-09 — Compatibilidad:** La interfaz debe ser responsive entre 360 px y 1.440 px y soportar las dos versiones estables más recientes de Chrome, Safari, Firefox y Edge.
- **RNF-10 — Integridad de importación:** Una importación con filas inválidas no debe modificar la programación publicada y debe informar el 100% de las filas rechazadas con su causa.
- **RNF-11 — Actualización temporal:** Mientras la grilla esté abierta, los estados “próximo”, “en vivo” y “finalizado” deben actualizarse dentro de los 60 segundos posteriores a un cambio de estado horario.
- **RNF-12 — Generación de imágenes:** El 95% de las exportaciones debe producir un PNG descargable en menos de 5 segundos y respetar exactamente las dimensiones elegidas.
- **RNF-13 — Privacidad de exportación:** Las imágenes generadas no deben quedar accesibles mediante una URL pública y deben contener nombres de otros miembros únicamente cuando el usuario elija esa opción.
- **RNF-14 — Observabilidad:** Los accesos y cambios administrativos, junto con los errores de autenticación, importación, extracción, exportación y autorización, deben generar eventos auditables con fecha, operación y actor, sin registrar credenciales, códigos, tokens ni datos sensibles de sesión.
- **RNF-15 — Aislamiento administrativo:** El 100% de las rutas y operaciones administrativas debe rechazar cuentas de usuario normales, incluso si conocen la URL del panel.
- **RNF-16 — Integridad de borradores:** Ninguna carga manual, importación CSV, extracción desde imagen o edición posterior debe modificar una versión publicada antes de una confirmación explícita de publicación.
- **RNF-17 — Publicación atómica:** Una publicación debe dejar visible la nueva versión completa del festival o conservar íntegramente la versión anterior; nunca debe exponer una mezcla parcial de ambas.
- **RNF-18 — Imágenes de origen:** La extracción debe aceptar archivos JPEG o PNG de hasta 15 MB, conservar la imagen vinculada al borrador y marcar como no verificado todo dato propuesto automáticamente.

## Criterios de Aceptación

- **AC-01 (RF-01):** Dada una persona con una cuenta de Google válida, cuando autoriza el acceso, entonces el sistema crea o recupera su cuenta y le permite ingresar al contenido privado.
- **AC-02 (RF-01, RF-02):** Dado un email no registrado, cuando la persona solicita un código e ingresa correctamente los seis dígitos vigentes, entonces el sistema crea su cuenta e inicia la sesión.
- **AC-03 (RF-02):** Dado un email registrado, cuando su titular solicita volver a ingresar, entonces recibe un código distinto al anterior; tras usarlo correctamente una vez, ese código no puede reutilizarse.
- **AC-04 (RF-02):** Dado un código vencido, incorrecto o con cinco intentos fallidos, cuando una persona intenta validarlo, entonces el acceso es rechazado sin indicar si el email está registrado.
- **AC-05 (RF-03):** Dada una persona que completa su primer acceso, cuando elige un nombre de usuario disponible, entonces puede ingresar a la aplicación; una vez dentro, puede cambiar ese nombre o su avatar y el nuevo perfil aparece en su cuenta y en sus grupos.
- **AC-06 (RF-04):** Dado un nombre de usuario ya ocupado con cualquier combinación de mayúsculas y minúsculas, cuando otro usuario intenta guardarlo, entonces el sistema rechaza el cambio; si está disponible, permite guardarlo y encontrarlo mediante búsqueda.
- **AC-07 (RF-05):** Dada la cuenta administrativa provisionada, cuando presenta sus credenciales válidas en el acceso administrativo, entonces puede ingresar al panel; una cuenta de usuario normal es rechazada aunque tenga una sesión válida.
- **AC-08 (RF-06):** Dado el panel administrativo, cuando el administrador crea un festival con todos los datos requeridos, entonces se guarda como borrador y todavía no aparece en el catálogo disponible para los usuarios autenticados.
- **AC-09 (RF-06):** Dado un festival existente, cuando el administrador modifica sus datos generales, entonces los cambios quedan asociados a su borrador y respetan el rango de fechas y la zona horaria configurados.
- **AC-10 (RF-07):** Dada una programación publicada, cuando un usuario busca un artista o combina filtros de día y escenario, entonces solo aparecen los shows que cumplen todos los criterios activos.
- **AC-11 (RF-08):** Dado un show publicado, cuando un usuario abre su detalle, entonces ve artista, descripción, día, escenario, inicio y finalización.
- **AC-12 (RF-09):** Dado un show no seleccionado, cuando el usuario lo agrega, entonces aparece en su grilla; cuando lo quita, deja de aparecer sin afectar las grillas de otros usuarios.
- **AC-13 (RF-10):** Dada una grilla con shows de distintos días y horarios, cuando el usuario la consulta, entonces aparecen agrupados por día y ordenados por hora de inicio ascendente.
- **AC-14 (RF-11):** Dados dos shows seleccionados cuyos intervalos horarios se superponen, cuando el usuario consulta o modifica su grilla, entonces ambos se conservan y se muestra una advertencia que identifica el conflicto.
- **AC-15 (RF-12):** Dado un usuario autenticado, cuando crea un grupo con un nombre válido, entonces el grupo queda disponible y el creador figura como propietario y miembro.
- **AC-16 (RF-13):** Dado un grupo y un usuario registrado que todavía no es miembro, cuando el propietario lo encuentra por email o nombre de usuario y envía la invitación, entonces el destinatario puede aceptarla para ingresar o rechazarla sin ingresar.
- **AC-17 (RF-14):** Dado un grupo con varios miembros, cuando el propietario elimina a uno, entonces ese usuario pierde inmediatamente el acceso; si el propietario desea abandonar el grupo, debe transferir antes la propiedad.
- **AC-18 (RF-15):** Dado un grupo cuyos miembros seleccionaron un show, cuando un miembro consulta la vista grupal, entonces ve el total correcto y los nombres de usuario de todos los interesados.
- **AC-19 (RF-16):** Dada una vista grupal, cuando un miembro ordena por cantidad de interesados o activa el filtro de coincidencias, entonces el resultado respeta el orden elegido y oculta los shows seleccionados por menos de dos miembros.
- **AC-20 (RF-17):** Dado un miembro que agrega o quita un show, cuando otro miembro consulta o actualiza la vista grupal, entonces el conteo y la lista de interesados reflejan el cambio dentro del límite definido en RNF-02.
- **AC-21 (RF-18):** Dado un show seleccionado, cuando la hora del dispositivo convertida a la zona del festival es anterior al inicio, está dentro del intervalo de inicio y finalización, o es posterior a la finalización, entonces el show aparece respectivamente como “próximo”, “en vivo” o “finalizado”.
- **AC-22 (RF-19):** Dada una grilla abierta durante el inicio o la finalización de un show, cuando transcurre como máximo un minuto desde ese límite horario, entonces el estado visible se actualiza sin recargar la página.
- **AC-23 (RF-20, RF-21):** Dada una grilla personal con shows seleccionados, cuando el usuario elige uno de los formatos predefinidos, entonces descarga en menos de 5 segundos p95 un PNG con solo esos shows, agrupados por día, ordenados por horario y con las dimensiones elegidas.
- **AC-24 (RF-22):** Dados un usuario y uno de sus grupos, cuando solicita una exportación grupal, entonces el PNG contiene solo los shows elegidos por ese usuario y la cantidad correcta de miembros coincidentes en cada uno.
- **AC-25 (RF-23):** Dada una exportación grupal, cuando el usuario elige incluir nombres, entonces el PNG muestra los nombres de usuario coincidentes; cuando elige solo cantidades, ningún nombre de otro miembro aparece en la imagen.
- **AC-26 (RF-24):** Dado un usuario no autenticado, ajeno a un grupo o sin privilegios administrativos, cuando intenta acceder directamente a un perfil, grilla, grupo, exportación o panel que no le corresponde, entonces el sistema deniega el acceso sin exponer sus datos.
- **AC-27 (RF-25):** Dados varios festivales publicados, cuando un usuario abre el catálogo y elige uno, entonces consulta únicamente la programación vigente de ese festival.
- **AC-28 (RF-26):** Dado un usuario con grillas o grupos en dos festivales, cuando cambia de festival, entonces solo ve las selecciones, grupos, invitaciones y coincidencias correspondientes al festival elegido.
- **AC-29 (RF-27):** Dado el borrador de un festival, cuando el administrador agrega un día, crea sus escenarios y carga artistas con horarios válidos, entonces los shows quedan disponibles para revisión sin modificar la versión publicada.
- **AC-30 (RF-28):** Dado un CSV con todas las columnas requeridas, cuando el administrador lo importa, entonces las filas válidas se preparan en el borrador; si existe una fila inválida, se informa su fila, campo y causa sin modificar la versión publicada.
- **AC-31 (RF-29):** Dado un archivo JPEG o PNG válido y un día elegido, cuando el administrador solicita la extracción, entonces el sistema propone los artistas, escenarios y horarios que pudo reconocer y conserva la imagen como referencia del borrador.
- **AC-32 (RF-30):** Dado un resultado extraído, cuando un dato falta o presenta incertidumbre, entonces queda señalado como no verificado y el administrador puede corregirlo, completarlo o descartar su fila antes de validarla.
- **AC-33 (RF-31):** Dado un borrador válido y completo, cuando el administrador confirma su publicación, entonces el catálogo muestra la nueva versión completa; si la publicación falla, la versión anterior permanece visible sin cambios parciales.
- **AC-34 (RF-32):** Dado un festival ya publicado, cuando el administrador comienza a editarlo, entonces obtiene un borrador basado en la versión vigente y los usuarios continúan viendo esa versión hasta que el administrador confirma una nueva publicación.

## Fuera de Alcance

- Alta pública de festivales por organizadores, promotores u otros usuarios.
- Múltiples administradores, roles administrativos delegables o permisos administrativos por festival.
- Publicación automática de datos extraídos desde imágenes sin revisión humana.
- Compra, reventa, validación o almacenamiento de entradas.
- Integración en tiempo real con APIs, sitios o redes sociales del festival.
- Recomendaciones personalizadas, rankings automáticos o sugerencias basadas en gustos.
- Mensajería, chat, comentarios, publicaciones, reacciones o feed social.
- Votaciones grupales, aprobación de una grilla común o resolución automática de conflictos.
- Estados de preferencia como “quizá”, niveles de prioridad o ranking de artistas.
- Perfiles públicos, enlaces públicos o acceso anónimo a grillas y grupos.
- Notificaciones push, notificaciones del navegador, emails recordatorios o alertas fuera de la grilla abierta.
- Modo offline, mapas del predio, geolocalización o rutas entre escenarios.
- Sincronización con calendarios externos.
- Aplicaciones móviles nativas.

## Riesgos y Dependencias

- **Riesgo:** La programación cargada manualmente, importada o extraída contiene horarios o escenarios incorrectos → **mitigación:** validar el esquema completo, mostrar un borrador revisable y exigir confirmación administrativa antes de publicar.
- **Riesgo:** Una actualización del festival invalida selecciones existentes → **mitigación:** relacionar las selecciones con identificadores estables, informar shows eliminados o modificados y no reasignar selecciones automáticamente.
- **Riesgo:** Los grupos grandes vuelven difícil interpretar las coincidencias → **mitigación:** mostrar conteos primero, revelar nombres bajo demanda y permitir ordenar y filtrar.
- **Riesgo:** Se expone información privada por URLs predecibles o controles incompletos → **mitigación:** aplicar autorización del lado del servidor en cada recurso y cubrir accesos cruzados con pruebas automatizadas.
- **Riesgo:** La selección binaria no representa dudas o prioridades → **mitigación:** medir solicitudes y uso antes de incorporar estados adicionales después del MVP.
- **Riesgo:** Un reloj incorrecto en el dispositivo muestra estados temporales equivocados → **mitigación:** presentar la zona horaria del festival, detectar diferencias significativas con la hora del servidor y advertir al usuario.
- **Riesgo:** Los códigos por email se solicitan de manera abusiva o son interceptados → **mitigación:** aplicar vencimiento, uso único, límites de intentos y solicitudes, y monitoreo de eventos anómalos.
- **Riesgo:** Una grilla extensa pierde legibilidad al adaptarse a dimensiones fijas → **mitigación:** definir límites visuales, ajustar tipografía y dividir el contenido por día cuando no entre en una única composición legible.
- **Riesgo:** Un usuario comparte fuera de la aplicación una exportación que contiene nombres de terceros → **mitigación:** usar cantidades por defecto, requerir una elección explícita para incluir nombres y mostrar una advertencia previa a la descarga.
- **Riesgo:** OCR o IA interpreta incorrectamente texto, escenarios u horarios de una imagen → **mitigación:** mantener el resultado como no verificado, señalar incertidumbres, conservar la imagen original y exigir revisión humana.
- **Riesgo:** La única cuenta administrativa queda bloqueada o comprometida → **mitigación:** establecer un procedimiento seguro de recuperación, proteger las credenciales fuera de la aplicación y auditar todos los accesos y cambios.
- **Riesgo:** Una edición posterior rompe selecciones de usuarios asociadas a shows publicados → **mitigación:** usar identificadores estables, mostrar el impacto antes de republicar y preservar o invalidar selecciones de forma explícita.
- **Dependencia:** El organizador o administrador debe proveer información confiable mediante carga manual, CSV o imágenes de programación.
- **Dependencia:** Debe definirse una zona horaria única para el festival; todas las fechas y horas se almacenan y presentan con esa referencia.
- **Dependencia:** Google OAuth y el proveedor de envío de emails transaccionales deben cumplir los requisitos de privacidad, seguridad y disponibilidad del producto.
- **Dependencia:** El almacenamiento de avatares debe cumplir los requisitos de privacidad y disponibilidad del producto.
- **Dependencia:** El motor de generación de imágenes debe renderizar tipografías y composiciones de manera consistente en los formatos PNG definidos.
- **Dependencia:** El servicio de OCR o IA debe aceptar las imágenes previstas y devolver datos con suficiente estructura para construir un borrador revisable.
- **Dependencia:** Debe existir almacenamiento privado para imágenes de origen y borradores administrativos.
- **Dependencia:** El formato CSV, los límites de archivo, las reglas de identificadores estables y la estrategia de versionado deben documentarse antes de implementar la administración.
