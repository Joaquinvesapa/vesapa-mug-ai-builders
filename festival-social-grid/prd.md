# PRD-001: Festival Social Grid — MVP de grillas personales y grupales

## Contexto y Problema

Un line-up extenso, con días, horarios y escenarios simultáneos, obliga a asistentes a alternar entre capturas, mensajes y planillas. Esto dificulta descubrir artistas, mantener una agenda propia consistente y reconocer qué shows interesan al grupo.

El MVP concentra esos flujos en una sola aplicación autenticada. No intenta operar festivales ni administrar contenidos desde una interfaz: asume que el equipo de desarrollo ya aprovisionó datos oficiales y vigentes para el festival del despliegue.

### Resumen del producto

Festival Social Grid es un MVP autenticado para consultar el line-up de un único festival de música de Argentina, planificar una agenda personal y coordinar coincidencias con grupos privados. Cada despliegue representa exactamente un festival: sus metadatos se configuran por desarrollo y su programación se incorpora mediante un importador o *seed* CSV versionado ejecutado por desarrollo. Ese aprovisionamiento es operativo y no forma parte de la experiencia de usuarios.

Tras iniciar sesión, cada persona puede explorar shows, seleccionar cuáles ver, advertir superposiciones, ver su estado temporal y comparar automáticamente las selecciones con amistades. Las grillas personales y grupales se pueden exportar en PNG para compartir o usar como fondo de pantalla.

### Personas

- **Asistente:** inicia sesión, consulta el line-up, revisa el detalle de un show, arma su grilla y la exporta.
- **Integrante de grupo:** comparte un grupo privado, consulta coincidencias de selección y exporta una vista grupal.
- **Propietario de grupo:** crea un grupo privado, invita usuarios y administra sus miembros dentro del límite establecido.
- **Desarrollador de despliegue:** configura los metadatos del único festival e importa o siembra el line-up versionado; no es una persona usuaria del producto ni dispone de un panel.

### Decisiones de producto

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

## Requerimientos Funcionales

- **RF-01 — Festival aprovisionado:** El despliegue debe exponer exactamente un festival de Argentina.
- **RF-02 — Metadatos del festival:** Los metadatos del festival deben provenir de configuración de desarrollo.
- **RF-03 — Line-up aprovisionado:** El line-up debe provenir de un importador o *seed* CSV a base de datos, versionado y ejecutado por desarrollo.
- **RF-04 — Acceso con Google:** El sistema debe permitir iniciar sesión mediante Google.
- **RF-05 — Acceso por email:** El sistema debe permitir iniciar sesión mediante un código de seis dígitos nuevo, temporal y de un solo uso enviado por email.
- **RF-06 — Cierre de sesión:** El sistema debe permitir cerrar sesión.
- **RF-07 — Alta por email:** La primera verificación válida de un email no registrado debe crear la cuenta.
- **RF-08 — Nombre de usuario inicial:** Al completar el primer acceso, el sistema debe solicitar un nombre de usuario único de entre 3 y 30 caracteres.
- **RF-09 — Unicidad del nombre:** El sistema debe evaluar la unicidad del nombre de usuario sin distinguir mayúsculas de minúsculas.
- **RF-10 — Perfil propio:** Cada persona debe poder leer y modificar únicamente su perfil completo, incluidos su nombre de usuario y avatar.
- **RF-11 — Descubrimiento de usuarios:** Los usuarios autenticados deben poder buscar usuarios registrados por nombre de usuario para cursar invitaciones.
- **RF-12 — Datos de búsqueda:** La búsqueda de usuarios debe exponer solo nombre de usuario y avatar, no el perfil completo de otra persona.
- **RF-13 — Exploración del line-up:** El sistema debe mostrar a personas autenticadas el line-up del festival aprovisionado.
- **RF-14 — Filtros del line-up:** El sistema debe permitir filtrar shows por día y escenario.
- **RF-15 — Detalle del show:** El sistema debe mostrar a personas autenticadas, para cada show, su artista, descripción, día, escenario y horas de inicio y finalización.
- **RF-16 — Selección personal:** El sistema debe permitir que una persona autenticada agregue shows a su grilla personal desde el line-up o el detalle del show.
- **RF-17 — Retiro de selecciones:** El sistema debe permitir que una persona autenticada quite shows de su grilla personal desde el line-up o el detalle del show.
- **RF-18 — Grilla personal por día:** El sistema debe agrupar los shows seleccionados por día.
- **RF-19 — Advertencias de superposición:** El sistema debe advertir los intervalos superpuestos entre dos o más shows seleccionados sin impedir que la persona conserve las selecciones.
- **RF-20 — Creación de grupos:** El sistema debe permitir que una persona autenticada cree un grupo privado con nombre y se convierta en su propietario y miembro.
- **RF-21 — Límite de miembros:** Un grupo debe admitir como máximo 15 miembros en total, incluido el propietario.
- **RF-22 — Invitaciones:** El propietario debe poder invitar a un usuario registrado por email o nombre de usuario.
- **RF-23 — Aceptación de invitaciones:** La persona invitada debe poder aceptar la invitación.
- **RF-24 — Rechazo de invitaciones:** La persona invitada debe poder rechazar la invitación.
- **RF-25 — Salida de miembros:** Un miembro debe poder abandonar un grupo.
- **RF-26 — Eliminación de miembros:** El propietario debe poder eliminar miembros del grupo.
- **RF-27 — Transferencia de propiedad:** El propietario debe poder transferir la propiedad antes de abandonar el grupo.
- **RF-28 — Conteo de selecciones:** Para cada show, el sistema debe calcular la cantidad de miembros del grupo que lo seleccionaron.
- **RF-29 — Nombres de selecciones:** Para cada show seleccionado por al menos dos miembros del mismo grupo, el sistema debe mostrar los nombres de usuario de quienes lo seleccionaron solo a miembros autorizados de ese grupo; si lo seleccionó menos de dos miembros de ese grupo, no debe mostrar esos nombres.
- **RF-30 — Coincidencia grupal:** El sistema debe marcar un show como coincidencia grupal solo si fue seleccionado por al menos dos miembros.
- **RF-31 — Orden de la vista grupal:** La vista grupal debe permitir ordenar por horario o por cantidad de personas interesadas.
- **RF-32 — Filtro de coincidencias:** Al activar el filtro de coincidencias, la vista grupal debe ocultar todo show seleccionado por menos de dos miembros.
- **RF-33 — Actualización de la vista grupal:** Al consultar o actualizar la vista grupal, sus conteos y, cuando corresponda según RF-29, sus nombres deben reflejar las selecciones personales vigentes de los miembros autorizados.
- **RF-34 — Estado temporal:** Para cada show seleccionado, el sistema debe mostrar “próximo” cuando el instante actual es anterior al inicio, “en vivo” cuando es mayor o igual al inicio y estrictamente anterior al final, o “finalizado” cuando es mayor o igual al final. La comparación debe usar el instante UTC autoritativo entregado por el servidor, convertido a `America/Argentina/Buenos_Aires`.
- **RF-35 — Actualización temporal abierta:** Mientras una grilla permanezca abierta, el sistema debe actualizar los estados temporales sin requerir recarga manual dentro de los 60 segundos posteriores a cada límite de inicio o finalización.
- **RF-36 — Exportación personal:** El sistema debe generar una imagen PNG de la grilla personal con solo los shows seleccionados, agrupados por día.
- **RF-37 — Exportación grupal:** El sistema debe generar una imagen PNG grupal a partir de los shows seleccionados por la persona solicitante.
- **RF-38 — Conteos en PNG grupal:** El PNG grupal debe agregar para cada show el conteo de miembros del grupo que también lo seleccionaron.
- **RF-39 — Nombres en PNG grupal:** El PNG grupal debe ofrecer una opción explícita para incluir los nombres de usuario de los miembros de ese grupo que seleccionaron cada show solo cuando al menos dos miembros del mismo grupo seleccionaron ese show; con menos de dos, no debe mostrar nombres aunque se elija la opción.
- **RF-40 — Formatos de exportación:** Las exportaciones personal y grupal deben ofrecer los formatos PNG de 1080 × 1920 px y 1080 × 1350 px.
- **RF-41 — Autenticación del contenido:** El sistema debe requerir autenticación para todo el contenido, incluidos el line-up y el detalle de shows.
- **RF-42 — Autorización de recursos privados:** El sistema debe proteger las grillas personales, grupos, invitaciones y exportaciones para que solo usuarios autorizados accedan a esos recursos.

## Requerimientos No Funcionales

- **RNF-01 — Rendimiento de consultas:** La referencia es un ejecutor Linux de CI con 2 vCPU y 4 GB de RAM, con la aplicación y la base de datos de prueba en el mismo ejecutor. El *fixture* contiene exactamente 150 shows y un grupo de exactamente 15 miembros, con 30 shows seleccionados por miembro. Después de 30 solicitudes de calentamiento por cada operación medida, se ejecutan 300 solicitudes medidas: exactamente 100 de line-up, 100 de grilla personal y 100 de vista grupal, impulsadas por exactamente 10 usuarios autenticados concurrentes. En la frontera de la API, el p95 se calcula por separado para cada operación y cada uno debe ser inferior a 2 segundos.
- **RNF-02 — Actualización temporal:** Con una grilla abierta, la transición de estado temporal de cada show debe ser visible dentro de los 60 segundos posteriores a su límite horario, usando el instante UTC autoritativo del servidor y `America/Argentina/Buenos_Aires`.
- **RNF-03 — Generación de PNG:** En el mismo ejecutor Linux de CI con 2 vCPU y 4 GB de RAM, con la aplicación y la base de datos de prueba en el mismo ejecutor, se usa el *fixture* de RNF-01. La persona solicitante tiene exactamente 30 shows seleccionados en 3 días del festival. Después de 5 exportaciones de calentamiento para cada combinación de personal o grupal y 1080 × 1920 px o 1080 × 1350 px, se ejecutan 100 exportaciones medidas: exactamente 25 por cada una de las cuatro combinaciones, impulsadas por exactamente 2 usuarios autenticados concurrentes. En la frontera de la API, el p95 del conjunto de exportaciones medidas debe ser inferior a 5 segundos y cada PNG debe tener exactamente las dimensiones seleccionadas.
- **RNF-04 — Privacidad verificable:** Las pruebas automatizadas deben comprobar cero exposiciones de contenido a personas no autenticadas y cero exposiciones de recursos privados a personas ajenas al grupo o destinatarias de otra invitación, incluso al intentar leer, modificar o exportar; ninguna URL de exportación debe ser accesible sin autorización.
- **RNF-05 — Integridad del aprovisionamiento:** El proceso CSV versionado debe validar los campos requeridos de cada show antes de cargarlo. Ante datos inválidos, debe rechazar la carga con cero line-ups parcialmente aprovisionados.
- **RNF-06 — Seguridad de acceso:** Toda comunicación debe usar TLS 1.2 o superior. Cada código de email debe vencer después de 10 minutos, quedar inválido tras su primer uso exitoso y permitir como máximo cinco intentos fallidos de verificación.
- **RNF-07 — Límite de solicitudes:** El sistema debe permitir como máximo cinco solicitudes de código por email en 15 minutos.
- **RNF-08 — Prevención de enumeración:** Las solicitudes de código y sus respuestas deben presentar cero diferencias observables atribuibles al estado de registro del email.

## Criterios de Aceptación

- **AC-01 (RF-01, RF-02, RF-03):** Dado un despliegue con metadatos configurados para un festival argentino y un CSV versionado válido, cuando desarrollo ejecuta el importador o *seed*, entonces queda disponible exactamente ese festival con su line-up.
- **AC-29 (RF-01):** Dado el festival aprovisionado, cuando una persona consulta la interfaz, entonces no encuentra elección ni gestión de otro festival.
- **AC-02 (RF-03, RNF-05):** Dado un CSV con un campo requerido inválido, cuando desarrollo ejecuta el importador o *seed*, entonces el proceso rechaza la carga con cero line-ups parcialmente aprovisionados.
- **AC-03 (RF-04):** Dada una persona sin sesión con una cuenta de Google válida, cuando autoriza el acceso, entonces el sistema crea o recupera su cuenta y le permite iniciar sesión.
- **AC-30 (RF-06):** Dada una persona con sesión, cuando cierra sesión, entonces deja de acceder al contenido autenticado.
- **AC-04 (RF-05, RF-07):** Dado un email no registrado, cuando la persona solicita un código nuevo de seis dígitos e ingresa correctamente el código temporal vigente, entonces el sistema crea su cuenta e inicia la sesión.
- **AC-05 (RF-05):** Dado un email registrado, cuando su titular solicita volver a ingresar, entonces recibe un código nuevo distinto al anterior.
- **AC-31 (RF-05, RNF-06):** Dado un código usado correctamente una vez, cuando se intenta reutilizarlo, entonces el sistema rechaza el acceso.
- **AC-32 (RF-05, RNF-06):** Dado un código vencido después de 10 minutos, cuando se intenta verificarlo, entonces el sistema rechaza el acceso.
- **AC-33 (RF-05, RNF-06):** Dado un código que acumuló cinco intentos fallidos, cuando se intenta verificarlo, entonces el sistema rechaza el acceso.
- **AC-06 (RF-08):** Dada una persona que completa su primer acceso, cuando elige un nombre de usuario disponible de entre 3 y 30 caracteres, entonces puede ingresar a la aplicación.
- **AC-34 (RF-10):** Dada una persona autenticada, cuando modifica su nombre de usuario o avatar, entonces el cambio queda en su perfil completo.
- **AC-35 (RF-09):** Dado un nombre de usuario existente, cuando otra persona intenta guardarlo con cualquier combinación de mayúsculas y minúsculas, entonces el sistema rechaza el cambio.
- **AC-36 (RF-08):** Dado un nombre de usuario fuera del rango de 3 a 30 caracteres, cuando una persona intenta guardarlo, entonces el sistema rechaza el cambio.
- **AC-37 (RF-11, RF-12):** Dado un usuario autenticado, cuando busca usuarios registrados por nombre de usuario, entonces puede seleccionar para una invitación un resultado que expone solo nombre de usuario y avatar.
- **AC-07 (RF-10, RF-42, RNF-04):** Dada una persona autenticada, cuando intenta leer o modificar el perfil completo de otra cuenta, entonces el sistema deniega la operación; solo la propietaria puede leer o modificar su perfil completo.
- **AC-08 (RNF-08):** Dados un email registrado y uno no registrado, cuando se solicitan códigos, entonces las solicitudes y respuestas no revelan si un email está registrado.
- **AC-38 (RNF-07):** Dadas cinco solicitudes de código para el mismo email dentro de 15 minutos, cuando se intenta una sexta, entonces el sistema la rechaza.
- **AC-09 (RF-13, RF-14, RNF-01):** Dada una persona autenticada y el line-up aprovisionado, cuando lo consulta combinando filtros de día y escenario, entonces ve solo los shows que cumplen todos los criterios activos y la consulta responde dentro de las condiciones definidas en RNF-01.
- **AC-10 (RF-15):** Dada una persona autenticada y un show del line-up, cuando abre su detalle, entonces ve artista, descripción, día, escenario, inicio y finalización.
- **AC-11 (RF-16):** Dado un show no seleccionado y una persona autenticada, cuando lo agrega desde el line-up o el detalle, entonces aparece en su grilla.
- **AC-39 (RF-17):** Dado un show seleccionado, cuando su propietaria lo quita desde el line-up o el detalle, entonces deja de aparecer en su grilla sin afectar las selecciones de otras personas.
- **AC-12 (RF-18, RNF-01):** Dada una grilla personal con shows de distintos días y horarios, cuando su propietaria la consulta, entonces los shows aparecen agrupados por día dentro de las condiciones definidas en RNF-01.
- **AC-13 (RF-19):** Dados dos shows seleccionados cuyos intervalos se superponen, cuando la persona consulta o modifica su grilla, entonces ambos se conservan y el sistema muestra una advertencia que identifica el conflicto.
- **AC-14 (RF-20):** Dada una persona autenticada, cuando crea un grupo privado con nombre, entonces figura como propietaria y miembro.
- **AC-40 (RF-21):** Dado un grupo con 15 miembros incluido el propietario, cuando otra persona intenta aceptar una invitación, entonces el sistema rechaza la incorporación.
- **AC-15 (RF-22):** Dado un grupo y un usuario registrado que todavía no es miembro, cuando el propietario lo invita por email o nombre de usuario, entonces el destinatario recibe la invitación.
- **AC-41 (RF-23):** Dada una invitación recibida, cuando su destinatario la acepta, entonces ingresa al grupo.
- **AC-42 (RF-24):** Dada una invitación recibida, cuando su destinatario la rechaza, entonces no ingresa al grupo.
- **AC-16 (RF-25):** Dado un miembro ordinario de un grupo, cuando decide abandonarlo, entonces deja de ser miembro y pierde el acceso al grupo.
- **AC-17 (RF-26):** Dado un grupo con varios miembros, cuando el propietario elimina a uno, entonces esa persona pierde el acceso al grupo.
- **AC-43 (RF-27):** Dado un grupo con varios miembros cuyo propietario todavía no transfirió la propiedad, cuando intenta abandonarlo, entonces el sistema rechaza la salida.
- **AC-51 (RF-27):** Dado un grupo con varios miembros, cuando su propietario transfiere la propiedad a otro miembro, entonces ese miembro figura como nuevo propietario.
- **AC-18 (RF-28):** Dado un grupo cuyos miembros seleccionaron un show, cuando un miembro autorizado consulta la vista grupal, entonces ve el conteo correcto de quienes lo eligieron.
- **AC-44 (RF-29):** Dado un show seleccionado por al menos dos miembros del mismo grupo, cuando un miembro autorizado de ese grupo consulta la vista grupal, entonces ve los nombres de usuario de esos miembros que eligieron ese show.
- **AC-52 (RF-29):** Dado un show seleccionado por menos de dos miembros del mismo grupo, cuando un miembro autorizado de ese grupo consulta la vista grupal, entonces no ve nombres de usuario de quienes eligieron ese show.
- **AC-45 (RF-30):** Dado un show seleccionado por miembros del grupo, cuando un miembro autorizado consulta la vista grupal, entonces el show se marca como coincidencia solo si el conteo es de al menos dos.
- **AC-19 (RF-31):** Dada una vista grupal, cuando un miembro ordena por horario o cantidad de personas interesadas, entonces el resultado respeta el orden elegido.
- **AC-46 (RF-32):** Dada una vista grupal, cuando un miembro activa el filtro de coincidencias, entonces se ocultan todos los shows seleccionados por menos de dos miembros.
- **AC-20 (RF-33, RNF-01):** Dado que un miembro agrega o quita un show, cuando otro miembro autorizado consulta o actualiza la vista grupal, entonces el conteo y, solo si al menos dos miembros del mismo grupo seleccionaron ese show, sus nombres reflejan las selecciones vigentes dentro de las condiciones definidas en RNF-01.
- **AC-21 (RF-34):** Dado un show seleccionado y el instante UTC autoritativo del servidor convertido a `America/Argentina/Buenos_Aires`, cuando el instante es anterior al inicio, entonces el show aparece como “próximo”.
- **AC-47 (RF-34):** Dado un show seleccionado y el instante UTC autoritativo del servidor convertido a `America/Argentina/Buenos_Aires`, cuando el instante es mayor o igual al inicio y estrictamente anterior al final, entonces el show aparece como “en vivo”.
- **AC-48 (RF-34):** Dado un show seleccionado y el instante UTC autoritativo del servidor convertido a `America/Argentina/Buenos_Aires`, cuando el instante es mayor o igual al final, entonces el show aparece como “finalizado”.
- **AC-22 (RF-35, RNF-02):** Dada una grilla abierta durante el inicio o la finalización de un show, cuando transcurren hasta 60 segundos desde ese límite, entonces el estado visible se actualiza sin recargar y sin depender de la hora del dispositivo ni de la zona horaria local del servidor.
- **AC-23 (RF-36, RF-40, RNF-03):** Dada una grilla personal con shows seleccionados, cuando su propietaria elige 1080 × 1920 px o 1080 × 1350 px, entonces descarga un PNG con solo esos shows, agrupados por día, con las dimensiones exactas elegidas y dentro de las condiciones definidas en RNF-03.
- **AC-24 (RF-37, RF-40, RNF-03):** Dado un miembro autorizado y uno de sus grupos, cuando solicita una exportación grupal en cualquiera de los formatos, entonces descarga un PNG que contiene solo los shows que esa persona seleccionó, con las dimensiones exactas elegidas y dentro de las condiciones definidas en RNF-03.
- **AC-49 (RF-38):** Dado un PNG grupal con shows seleccionados por quien lo solicita, cuando se genera la exportación, entonces cada show incluye el conteo correcto de miembros del grupo que también lo seleccionaron.
- **AC-25 (RF-39):** Dada una exportación grupal solicitada por un miembro autorizado de ese grupo, cuando elige explícitamente incluir nombres, entonces el PNG muestra los nombres de usuario de quienes seleccionaron cada show solo si al menos dos miembros de ese mismo grupo seleccionaron ese show; para shows seleccionados por menos de dos miembros del grupo, no muestra nombres.
- **AC-50 (RF-39):** Dada una exportación grupal, cuando la persona elige solo conteos, entonces el PNG no muestra nombres de otros miembros, cualquiera sea la cantidad de miembros que seleccionaron cada show.
- **AC-26 (RF-41, RF-42, RNF-04):** Dada una persona no autenticada, cuando intenta acceder al line-up, al detalle de un show, a una grilla, un grupo, una invitación o una exportación, entonces el sistema deniega la operación sin exponer contenido ni publicar una URL de exportación accesible sin autorización.
- **AC-27 (RF-42, RNF-04):** Dada una persona autenticada ajena a un grupo o destinataria de otra invitación, cuando intenta leer, modificar o exportar recursos privados que no le corresponden, entonces el sistema deniega la operación sin exponer sus datos.
- **AC-28 (RNF-06):** Dada cualquier comunicación entre cliente y sistema, cuando se realiza una solicitud o respuesta, entonces usa TLS 1.2 o superior.

## Fuera de Alcance

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

## Riesgos y Dependencias

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
