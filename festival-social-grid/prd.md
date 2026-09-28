# PRD-001: Festival Social Grid — MVP de grillas personales y grupales

## Resumen del producto

Festival Social Grid es un MVP autenticado para consultar el line-up de un único festival de música de Argentina, planificar una agenda personal y coordinar coincidencias con grupos privados. Cada despliegue representa exactamente un festival: sus metadatos se configuran por desarrollo y su programación se incorpora mediante un importador o *seed* CSV versionado ejecutado por desarrollo. Ese aprovisionamiento es operativo y no forma parte de la experiencia de usuarios.

Tras iniciar sesión, cada persona puede explorar shows, seleccionar cuáles ver, advertir superposiciones, ver su estado temporal y comparar automáticamente las selecciones con amistades. Las grillas personales y grupales se pueden exportar en PNG para compartir o usar como fondo de pantalla.

## Contexto y problema

Un line-up extenso, con días, horarios y escenarios simultáneos, obliga a asistentes a alternar entre capturas, mensajes y planillas. Esto dificulta descubrir artistas, mantener una agenda propia consistente y reconocer qué shows interesan al grupo.

El MVP concentra esos flujos en una sola aplicación autenticada. No intenta operar festivales ni administrar contenidos desde una interfaz: asume que el equipo de desarrollo ya aprovisionó datos oficiales y vigentes para el festival del despliegue.

## Personas

- **Asistente:** inicia sesión, consulta el line-up, revisa el detalle de un show, arma su grilla y la exporta.
- **Integrante de grupo:** comparte un grupo privado, consulta coincidencias de selección y exporta una vista grupal.
- **Propietario de grupo:** crea un grupo privado, invita usuarios y administra sus miembros dentro del límite establecido.
- **Desarrollador de despliegue:** configura los metadatos del único festival e importa o siembra el line-up versionado; no es una persona usuaria del producto ni dispone de un panel.

## Decisiones de producto

| Tema | Decisión |
|---|---|
| Festival | Cada despliegue contiene exactamente un festival ubicado en Argentina. No hay catálogo ni selector de festivales. |
| Datos del festival | Desarrollo provee los metadatos por configuración y carga el line-up con un proceso CSV a base de datos versionado, ejecutado por desarrollo. |
| Aprovisionamiento | La configuración y el importador o *seed* son operaciones técnicas; no existe carga, edición ni publicación de datos desde la interfaz. |
| Identidad | Todo el contenido requiere autenticación. Google o un código de email temporal permiten el acceso; el perfil completo es privado de su propietario. El descubrimiento para invitaciones expone solo nombre de usuario y avatar. |
| Selección | La selección personal es binaria: un usuario selecciona un show o no lo selecciona. |
| Grupos | Los grupos son privados y admiten como máximo 15 miembros en total, incluido su propietario. |
| Coincidencia | Una coincidencia grupal existe solo cuando al menos dos miembros seleccionaron el mismo show. |
| Tiempo | El servidor entrega el instante UTC autoritativo; la aplicación lo convierte y compara con la zona IANA fija `America/Argentina/Buenos_Aires`. No usa la hora del dispositivo ni la zona horaria local del servidor. |
| Exportación | Se mantienen exportaciones PNG personales y grupales en dos formatos fijos. La exportación grupal parte de los shows seleccionados por quien la solicita, incorpora los conteos del grupo y puede incluir nombres de usuario. |

## Objetivos

- Permitir que una persona autenticada encuentre shows del line-up y construya una agenda personal ordenada.
- Hacer visibles las superposiciones entre shows seleccionados sin impedir la elección de la persona.
- Permitir que los miembros de un grupo privado identifiquen de forma automática los shows elegidos por al menos dos integrantes.
- Mostrar estados temporales correctos para los shows de una agenda abierta usando una referencia horaria autoritativa.
- Permitir compartir una representación legible de la grilla personal o grupal mediante PNG.

## Requerimientos funcionales

- **RF-01 — Festival aprovisionado:** El despliegue debe exponer exactamente un festival de Argentina. Sus metadatos deben provenir de configuración de desarrollo y su line-up de un importador o *seed* CSV a base de datos, versionado y ejecutado por desarrollo.
- **RF-02 — Autenticación:** El sistema debe permitir iniciar sesión mediante Google o mediante un código de seis dígitos nuevo, temporal y de un solo uso enviado por email, y debe permitir cerrar sesión. Si el email no está registrado, su primera verificación válida debe crear la cuenta.
- **RF-03 — Perfil y descubrimiento de usuarios:** Al completar el primer acceso, el sistema debe solicitar un nombre de usuario único de entre 3 y 30 caracteres. Cada persona debe poder leer y modificar únicamente su perfil completo, incluidos su nombre de usuario y avatar; la unicidad del nombre debe evaluarse sin distinguir mayúsculas de minúsculas. Los usuarios autenticados deben poder buscar usuarios registrados por nombre de usuario para cursar invitaciones; esa búsqueda solo expone nombre de usuario y avatar, no el perfil completo de otra persona.
- **RF-04 — Exploración del line-up:** El sistema debe mostrar a personas autenticadas el line-up del festival aprovisionado y permitir buscar por artista y filtrar por día y escenario.
- **RF-05 — Detalle del show:** El sistema debe mostrar a personas autenticadas, para cada show, su artista, descripción, día, escenario y horas de inicio y finalización.
- **RF-06 — Selección personal:** El sistema debe permitir que una persona autenticada agregue o quite shows de su grilla personal desde el line-up o el detalle del show.
- **RF-07 — Orden de la grilla personal:** El sistema debe agrupar los shows seleccionados por día y ordenarlos cronológicamente por hora de inicio.
- **RF-08 — Advertencias de superposición:** El sistema debe advertir los intervalos superpuestos entre dos o más shows seleccionados sin impedir que la persona conserve las selecciones.
- **RF-09 — Creación de grupos:** El sistema debe permitir que una persona autenticada cree un grupo privado con nombre y se convierta en su propietario y miembro. Un grupo no puede superar los 15 miembros en total, incluido el propietario.
- **RF-10 — Invitaciones:** El propietario debe poder invitar a un usuario registrado por email o nombre de usuario; la persona invitada debe poder aceptar o rechazar la invitación.
- **RF-11 — Gestión de miembros:** Un miembro debe poder abandonar un grupo. El propietario debe poder eliminar miembros o transferir la propiedad antes de abandonarlo, respetando siempre el límite de 15 miembros.
- **RF-12 — Coincidencias automáticas:** Para cada show, el sistema debe calcular para los miembros del grupo la cantidad de selecciones y los nombres de usuario de quienes lo seleccionaron. Un show es una coincidencia grupal solo si fue seleccionado por al menos dos miembros.
- **RF-13 — Vista y filtro de coincidencias:** La vista grupal debe permitir ordenar por horario o por cantidad de personas interesadas. Al activar el filtro de coincidencias, debe ocultar todo show seleccionado por menos de dos miembros.
- **RF-14 — Actualización de la vista grupal:** Al consultar o actualizar la vista grupal, sus conteos y nombres deben reflejar las selecciones personales vigentes de los miembros autorizados.
- **RF-15 — Estado temporal:** Para cada show seleccionado, el sistema debe mostrar “próximo” cuando el instante actual es anterior al inicio, “en vivo” cuando es mayor o igual al inicio y estrictamente anterior al final, o “finalizado” cuando es mayor o igual al final. La comparación debe usar el instante UTC autoritativo entregado por el servidor, convertido a `America/Argentina/Buenos_Aires`.
- **RF-16 — Actualización temporal abierta:** Mientras una grilla permanezca abierta, el sistema debe actualizar los estados temporales sin requerir recarga manual dentro de los 60 segundos posteriores a cada límite de inicio o finalización.
- **RF-17 — Exportación personal:** El sistema debe generar una imagen PNG de la grilla personal con solo los shows seleccionados, agrupados por día y ordenados cronológicamente.
- **RF-18 — Exportación grupal:** El sistema debe generar, a partir de los shows seleccionados por la persona solicitante, una imagen PNG que agregue para cada show el conteo de miembros del grupo que también lo seleccionaron y una opción explícita para incluir sus nombres de usuario.
- **RF-19 — Formatos de exportación:** Las exportaciones personal y grupal deben ofrecer los formatos PNG de 1080 × 1920 px y 1080 × 1350 px.
- **RF-20 — Autorización y privacidad:** Todo el contenido, incluidos el line-up y el detalle de shows, requiere autenticación. El sistema debe proteger las grillas personales, grupos, invitaciones y exportaciones para que solo usuarios autorizados accedan a esos recursos.

## Requerimientos no funcionales

- **RNF-01 — Rendimiento de consultas:** La referencia es un ejecutor Linux de CI con 2 vCPU y 4 GB de RAM, con la aplicación y la base de datos de prueba en el mismo ejecutor. El *fixture* contiene exactamente 150 shows y un grupo de exactamente 15 miembros, con 30 shows seleccionados por miembro. Después de 30 solicitudes de calentamiento por cada operación medida, se ejecutan 300 solicitudes medidas: exactamente 100 de line-up, 100 de grilla personal y 100 de vista grupal, impulsadas por exactamente 10 usuarios autenticados concurrentes. En la frontera de la API, el p95 se calcula por separado para cada operación y cada uno debe ser inferior a 2 segundos.
- **RNF-02 — Actualización temporal:** Con una grilla abierta, la transición de estado temporal de cada show debe ser visible dentro de los 60 segundos posteriores a su límite horario, usando el instante UTC autoritativo del servidor y `America/Argentina/Buenos_Aires`.
- **RNF-03 — Generación de PNG:** En el mismo ejecutor Linux de CI con 2 vCPU y 4 GB de RAM, con la aplicación y la base de datos de prueba en el mismo ejecutor, se usa el *fixture* de RNF-01. La persona solicitante tiene exactamente 30 shows seleccionados en 3 días del festival. Después de 5 exportaciones de calentamiento para cada combinación de personal o grupal y 1080 × 1920 px o 1080 × 1350 px, se ejecutan 100 exportaciones medidas: exactamente 25 por cada una de las cuatro combinaciones, impulsadas por exactamente 2 usuarios autenticados concurrentes. En la frontera de la API, el p95 del conjunto de exportaciones medidas debe ser inferior a 5 segundos y cada PNG debe tener exactamente las dimensiones seleccionadas.
- **RNF-04 — Privacidad verificable:** Las pruebas automatizadas deben comprobar que una persona no autenticada no puede acceder a contenido alguno y que una persona ajena a un grupo o destinataria de otra invitación no puede leer, modificar ni exportar recursos privados que no le corresponden; las exportaciones no deben publicarse mediante URL accesibles sin autorización.
- **RNF-05 — Integridad del aprovisionamiento:** El proceso CSV versionado debe validar los campos requeridos de cada show antes de cargarlo y rechazar datos inválidos sin dejar un line-up parcialmente aprovisionado.
- **RNF-06 — Seguridad de acceso:** Toda comunicación debe usar TLS 1.2 o superior. Cada código de email debe vencer después de 10 minutos, quedar inválido tras su primer uso exitoso y permitir como máximo cinco intentos fallidos de verificación.
- **RNF-07 — Prevención de abuso y enumeración:** El sistema debe permitir como máximo cinco solicitudes de código por email en 15 minutos. Las solicitudes y sus respuestas no deben revelar si un email está registrado.

## Criterios de aceptación y trazabilidad

- **AC-01 (RF-01, RNF-05):** Dado un despliegue configurado para un festival argentino y un CSV versionado válido, cuando desarrollo ejecuta el importador o *seed*, entonces queda disponible exactamente ese festival con su line-up; la interfaz no ofrece elección ni gestión de otro festival.
- **AC-02 (RF-01, RNF-05):** Dado un CSV con un campo requerido inválido, cuando desarrollo ejecuta el importador o *seed*, entonces el proceso rechaza la carga y no deja un line-up parcialmente aprovisionado.
- **AC-03 (RF-02):** Dada una persona sin sesión con una cuenta de Google válida, cuando autoriza el acceso, entonces el sistema crea o recupera su cuenta y le permite iniciar sesión; cuando cierra sesión, deja de acceder al contenido autenticado.
- **AC-04 (RF-02):** Dado un email no registrado, cuando la persona solicita un código nuevo de seis dígitos e ingresa correctamente el código temporal vigente, entonces el sistema crea su cuenta e inicia la sesión.
- **AC-05 (RF-02, RNF-06):** Dado un email registrado, cuando su titular solicita volver a ingresar, entonces recibe un código distinto al anterior; tras usarlo correctamente una vez, ese código no puede reutilizarse. Dado un código vencido después de 10 minutos o que acumuló cinco intentos fallidos, cuando una persona intenta verificarlo, entonces el sistema rechaza el acceso.
- **AC-06 (RF-03):** Dada una persona que completa su primer acceso, cuando elige un nombre de usuario disponible de entre 3 y 30 caracteres, entonces puede ingresar a la aplicación; posteriormente puede modificar su nombre de usuario o avatar. Si otra persona intenta guardar el mismo nombre con cualquier combinación de mayúsculas y minúsculas, o un nombre fuera de ese rango, el sistema rechaza el cambio. Dado un usuario autenticado, cuando busca usuarios registrados por nombre de usuario, entonces puede seleccionar para una invitación un resultado que expone solo nombre de usuario y avatar.
- **AC-07 (RF-03, RF-20, RNF-04):** Dada una persona autenticada, cuando intenta leer o modificar el perfil completo de otra cuenta, entonces el sistema deniega la operación; solo la propietaria puede leer o modificar su perfil completo.
- **AC-08 (RF-02, RNF-07):** Dados un email registrado y uno no registrado, cuando se solicitan códigos, entonces las solicitudes y respuestas no revelan si un email está registrado. Cuando se intenta una sexta solicitud para el mismo email dentro de 15 minutos, entonces el sistema la rechaza.
- **AC-09 (RF-04, RNF-01):** Dada una persona autenticada y el line-up aprovisionado, cuando busca un artista o combina filtros de día y escenario, entonces ve solo los shows que cumplen todos los criterios activos y la consulta responde dentro de las condiciones definidas en RNF-01.
- **AC-10 (RF-05):** Dada una persona autenticada y un show del line-up, cuando abre su detalle, entonces ve artista, descripción, día, escenario, inicio y finalización.
- **AC-11 (RF-06):** Dado un show no seleccionado y una persona autenticada, cuando lo agrega a su grilla, entonces aparece en ella; cuando lo quita, deja de aparecer sin afectar las selecciones de otras personas.
- **AC-12 (RF-07, RNF-01):** Dada una grilla personal con shows de distintos días y horarios, cuando su propietaria la consulta, entonces los shows aparecen agrupados por día y ordenados por hora de inicio ascendente, dentro de las condiciones definidas en RNF-01.
- **AC-13 (RF-08):** Dados dos shows seleccionados cuyos intervalos se superponen, cuando la persona consulta o modifica su grilla, entonces ambos se conservan y el sistema muestra una advertencia que identifica el conflicto.
- **AC-14 (RF-09):** Dada una persona autenticada, cuando crea un grupo con nombre válido, entonces figura como propietaria y miembro; al intentar aceptar una invitación que llevaría el total a más de 15 miembros, incluido el propietario, el sistema rechaza la incorporación.
- **AC-15 (RF-10):** Dado un grupo y un usuario registrado que todavía no es miembro, cuando el propietario lo invita por email o nombre de usuario, entonces el destinatario puede aceptar para ingresar o rechazar sin ingresar.
- **AC-16 (RF-11):** Dado un miembro ordinario de un grupo, cuando decide abandonarlo, entonces deja de ser miembro y pierde el acceso al grupo.
- **AC-17 (RF-11):** Dado un grupo con varios miembros, cuando el propietario elimina a uno, entonces esa persona pierde el acceso al grupo; si el propietario desea abandonarlo, debe transferir antes la propiedad.
- **AC-18 (RF-12):** Dado un grupo cuyos miembros seleccionaron un show, cuando un miembro autorizado consulta la vista grupal, entonces ve el conteo correcto y los nombres de usuario de quienes lo eligieron; el show se marca como coincidencia solo si el conteo es de al menos dos.
- **AC-19 (RF-13):** Dada una vista grupal, cuando un miembro ordena por horario o cantidad de personas interesadas, entonces el resultado respeta el orden elegido; cuando activa el filtro de coincidencias, se ocultan todos los shows seleccionados por menos de dos miembros.
- **AC-20 (RF-14, RNF-01):** Dado que un miembro agrega o quita un show, cuando otro miembro autorizado consulta o actualiza la vista grupal, entonces el conteo y los nombres reflejan las selecciones vigentes dentro de las condiciones definidas en RNF-01.
- **AC-21 (RF-15):** Dado un show seleccionado y el instante UTC autoritativo del servidor convertido a `America/Argentina/Buenos_Aires`, cuando el instante es anterior al inicio, es mayor o igual al inicio y estrictamente anterior al final, o es mayor o igual al final, entonces el show aparece respectivamente como “próximo”, “en vivo” o “finalizado”.
- **AC-22 (RF-16, RNF-02):** Dada una grilla abierta durante el inicio o la finalización de un show, cuando transcurren hasta 60 segundos desde ese límite, entonces el estado visible se actualiza sin recargar y sin depender de la hora del dispositivo ni de la zona horaria local del servidor.
- **AC-23 (RF-17, RF-19, RNF-03):** Dada una grilla personal con shows seleccionados, cuando su propietaria elige 1080 × 1920 px o 1080 × 1350 px, entonces descarga un PNG con solo esos shows, agrupados por día, ordenados por horario, con las dimensiones exactas elegidas y dentro de las condiciones definidas en RNF-03.
- **AC-24 (RF-18, RF-19, RNF-03):** Dado un miembro autorizado y uno de sus grupos, cuando solicita una exportación grupal en cualquiera de los formatos, entonces descarga un PNG que contiene solo los shows que esa persona seleccionó y el conteo correcto de miembros del grupo que también seleccionaron cada show, con las dimensiones exactas elegidas y dentro de las condiciones definidas en RNF-03.
- **AC-25 (RF-18):** Dada una exportación grupal, cuando la persona elige incluir nombres, entonces el PNG muestra los nombres de usuario de los miembros coincidentes; cuando elige solo conteos, no muestra nombres de otros miembros.
- **AC-26 (RF-20, RNF-04):** Dada una persona no autenticada, cuando intenta acceder al line-up, al detalle de un show, a una grilla, un grupo, una invitación o una exportación, entonces el sistema deniega la operación sin exponer contenido ni publicar una URL de exportación accesible sin autorización.
- **AC-27 (RF-20, RNF-04):** Dada una persona autenticada ajena a un grupo o destinataria de otra invitación, cuando intenta leer, modificar o exportar recursos privados que no le corresponden, entonces el sistema deniega la operación sin exponer sus datos.
- **AC-28 (RNF-06):** Dada cualquier comunicación entre cliente y sistema, cuando se realiza una solicitud o respuesta, entonces usa TLS 1.2 o superior.

## Fuera de alcance

- Herramientas administrativas, panel administrativo y cuentas administrativas dentro del producto.
- CRUD de festivales, catálogo de festivales o elección simultánea entre múltiples festivales.
- Festivales fuera de Argentina.
- Carga manual de shows, interfaz de carga CSV, edición de CSV desde la aplicación o cualquier ingreso de line-up por usuarios.
- OCR, IA o extracción de programación a partir de imágenes.
- Borradores, flujos de revisión o publicación y versionado de festivales o line-ups visibles.
- Analítica de producto, métricas de adopción, telemetría de comportamiento o recomendaciones basadas en uso.
- Compra, reventa, validación o almacenamiento de entradas.
- Mensajería, chat, comentarios, publicaciones, reacciones o feed social.
- Votaciones grupales, una grilla grupal editable o resolución automática de superposiciones.
- Estados de preferencia como “quizá”, prioridades o rankings de artistas.
- Perfiles o enlaces expuestos sin autenticación, acceso anónimo a recursos privados o notificaciones fuera de una grilla abierta.
- Modo sin conexión, mapas del predio, geolocalización, rutas entre escenarios, calendarios externos o aplicaciones móviles nativas.

## Riesgos y dependencias

| Tipo | Descripción | Mitigación o condición |
|---|---|---|
| Riesgo | El CSV provisto para el aprovisionamiento puede contener horarios, escenarios o artistas erróneos. | Validar el esquema antes de la carga y mantener el archivo versionado para revisión técnica. |
| Riesgo | Un cambio operativo del line-up puede volver inconsistentes selecciones existentes. | Usar identificadores estables, evaluar el impacto durante el importador o *seed* y no reasignar selecciones automáticamente. |
| Riesgo | La privacidad puede vulnerarse mediante accesos directos a recursos de otro usuario. | Aplicar autorización del lado del servidor y cubrir accesos cruzados con pruebas automatizadas. |
| Riesgo | Incluir nombres de terceros en un PNG facilita que se compartan fuera del grupo. | Ofrecer conteos sin nombres como opción y requerir una elección explícita para incluirlos. |
| Riesgo | Una grilla extensa puede perder legibilidad en tamaños PNG fijos. | Definir composición, tipografía y reglas de corte verificables para ambos formatos. |
| Riesgo | Un reloj de cliente o una zona local incorrecta puede inducir estados temporales erróneos. | Usar exclusivamente el instante UTC entregado por el servidor y la zona fija `America/Argentina/Buenos_Aires`. |
| Dependencia | Desarrollo debe definir y mantener la configuración de metadatos del festival argentino único. | La configuración debe estar disponible antes del despliegue. |
| Dependencia | Desarrollo debe disponer de un CSV versionado y de un proceso de importación o *seed* a base de datos. | El proceso debe ejecutarse como parte del aprovisionamiento, fuera de la interfaz de usuario. |
| Dependencia | Se requieren Google OAuth y un proveedor de email transaccional para las cuentas autenticadas. | Deben permitir el acceso por Google o por código temporal de seis dígitos, y asociar la identidad a un nombre de usuario único. |
| Dependencia | El servidor debe entregar un instante UTC confiable. | La interfaz debe recibirlo para evaluar los estados con `America/Argentina/Buenos_Aires`. |
| Dependencia | El motor de generación de imágenes debe renderizar PNG de manera consistente. | Debe soportar exactamente 1080 × 1920 px y 1080 × 1350 px dentro del objetivo de RNF-03. |
