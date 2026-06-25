# Organigrama Unlimitech Cloud

## Visión General

**Misión (VFP General):** Crear valor para las empresas y personas ayudándoles a aprovechar la tecnología para expandirse.

**Socios:** Manuel Lara, Juan Carlos Lozano

**Junta Directiva:** Grupo colegiado que toma decisiones según las directrices de la junta de socios/accionistas. Ejerce la administración ejecutando las políticas diseñadas por la asamblea de socios.

---

## Diagrama General — Nivel Ejecutivo y Divisiones

```mermaid
graph TD
    SOCIOS["🏛️ Socios<br/>Manuel Lara, Juan Carlos Lozano"]
    CEO["👑 Chief Executive Officer<br/>Catherine Quiñonez"]
    EVP["⭐ Executive Vice President<br/>Oscar Avila"]
    CPO["🏭 Chief Production Officer"]
    CAO["📋 Chief Administrative Officer"]

    SOCIOS --> CEO
    CEO --> EVP
    CEO --> CAO
    CEO --> CPO

    CAO --> DIV1["División 1<br/>Talento Humano"]
    CAO --> DIV2["División 2<br/>Diseminación"]
    CAO --> DIV3["División 3<br/>Finanzas"]

    CPO --> DIV4["División 4<br/>Infraestructura"]
    CPO --> DIV5["División 5<br/>Calidad"]
    CPO --> DIV6["División 6<br/>Relaciones Públicas"]

    CEO --> DIV7["División 7<br/>Ejecutiva"]

    style CEO fill:#FFD700,stroke:#333
    style SOCIOS fill:#E8E8E8,stroke:#333
    style DIV1 fill:#87CEEB,stroke:#333
    style DIV2 fill:#98FB98,stroke:#333
    style DIV3 fill:#DDA0DD,stroke:#333
    style DIV4 fill:#FFA07A,stroke:#333
    style DIV5 fill:#F0E68C,stroke:#333
    style DIV6 fill:#ADD8E6,stroke:#333
    style DIV7 fill:#FFB6C1,stroke:#333
```

---

## División 7 | Ejecutiva

**VFP:** Unlimitech Cloud solvente, viable y en constante expansión.

**Función:** Supervisa, gestiona y coordina todos los aspectos de la organización para que se expanda, sea viable económicamente y fiel a los objetivos.

```mermaid
graph TD
    DIV7["División 7 | Ejecutiva"]

    D19["Depto 19 | Oficina del CEO<br/>Catherine Lara<br/><i>Chief Executive Officer</i>"]
    D20["Depto 20 | Oficina de Asuntos Especiales<br/><i>Chief Special Officer</i>"]
    D21["Depto 21 | Oficina del Fundador<br/>Manuel Lara<br/><i>Founder & Solutions Architect</i>"]

    S19_1["Sección 19.1<br/>Executive Vice President<br/>Oscar Avila"]

    DIV7 --> D19
    DIV7 --> D20
    DIV7 --> D21
    D19 --> S19_1

    style DIV7 fill:#FFB6C1,stroke:#333
```

### Departamento 19 — Oficina del CEO
| Campo | Detalle |
|-------|---------|
| **Titular** | Catherine Lara |
| **Cargo** | Chief Executive Officer |
| **Función** | Concibe y emite la planificación estratégica, asegurándose de su ejecución. Es responsable general de la condición de todo Unlimitech Cloud y lleva a cabo la coordinación global. Mediante el uso de la estructura ejecutiva, mantiene a Unlimitech Cloud solvente, viable, produciendo y expandiéndose. |
| **VFP** | Coordinación eficaz para expansión y viabilidad organizacional que dan lugar a obtener los logros y una rápida expansión |

### Departamento 20 — Oficina de Asuntos Especiales
| Campo | Detalle |
|-------|---------|
| **Titular** | (Vacante) |
| **Cargo** | Chief Special Officer |
| **Función** | Se relaciona con los clientes y vela por el cumplimiento normativo y legal, buscando mantener la estabilidad, la reputación de la empresa y su buen nombre. Se ocupa del entorno corporativo, manteniendo relaciones con organismos gubernamentales y encargándose de asuntos legales. |
| **VFP** | Cumplimiento normativo y estabilidad reputacional de la empresa |

### Departamento 21 — Oficina del Fundador
| Campo | Detalle |
|-------|---------|
| **Titular** | Manuel Lara |
| **Cargo** | Founder and Solutions Architect |
| **Función** | Desarrolla planes de negocio que definen los objetivos de la empresa. Diseña y desarrolla el producto y los servicios principales. Es la fuente de la visión, metas, propósitos y principios. Formula las políticas para garantizar el éxito de la compañía. |
| **VFP** | Visión de mercado y mejora continua en productos y servicios |

---

## División 1 | Talento Humano

**VFP:** Unlimitech Cloud establecida, con staff contratado, asignado, entrenado en el Hat, productivo y ético.

**Manager:** Carmenza Trejos (Human Talent Manager)

**Función:** Contrata y forma personal y se asegura de que las líneas de comunicación se mantengan operativas internamente y con el público, mientras mantienen los estándares de ética y producción.

```mermaid
graph TD
    DIV1["División 1 | Talento Humano<br/>Carmenza Trejos"]

    D1["Depto 1 | Encaminamiento y Personal<br/><i>Director of Routing and Staffing</i>"]
    D2["Depto 2 | Comunicaciones<br/><i>Communications Director</i>"]
    D3["Depto 3 | Inspecciones e Informes<br/><i>Director of Inspections and Reports</i>"]

    DIV1 --> D1
    DIV1 --> D2
    DIV1 --> D3

    D1 --> S1_1["Sección 1.1<br/>Definición y Selección de Candidatos<br/><i>Org Board Officer</i>"]
    D1 --> S1_2["Sección 1.2<br/>Contratación y Orientación"]
    D1 --> S1_3["Sección 1.3<br/>Supervisión de Cumplimiento y Entrenamiento"]

    D2 --> S2_1["Sección 2.1<br/>Implementación de Protocolos Seguros"]
    D2 --> S2_2["Sección 2.2<br/>Capacitación en Sistemas de Comunicación"]
    D2 --> S2_3["Sección 2.3<br/>Monitoreo y Optimización del Flujo de Información"]

    D3 --> S3_1["Sección 3.1<br/>Gestión de Indicadores"]
    D3 --> S3_2["Sección 3.2<br/>Ética<br/>Vanesa Mora"]
    D3 --> S3_3["Sección 3.3<br/>Informes"]

    style DIV1 fill:#87CEEB,stroke:#333
```

### Departamento 1 — Encaminamiento y Personal
| Campo | Detalle |
|-------|---------|
| **Cargo** | Director of Routing and Staffing |
| **Función** | Contrata al personal adecuado, lo asigna de manera óptima, y se asegura de que todo el personal reciba formación. Reconoce, establece y mantiene flujos de trabajo para que las personas y los materiales se desplacen ágil y fluidamente. |
| **VFP** | Personal competente y flujos de trabajo optimizados |

### Departamento 2 — Comunicaciones
| Campo | Detalle |
|-------|---------|
| **Cargo** | Communications Director |
| **Función** | Establece y mantiene sistemas para asegurar que toda comunicación, tanto interna como externa, se maneje de forma segura, ágil y fluida. |
| **VFP** | Comunicación interna y externa segura, fluida y rápida |

### Departamento 3 — Inspecciones e Informes
| Campo | Detalle |
|-------|---------|
| **Cargo** | Director of Inspections and Reports |
| **Función** | Hace posible que la dirección perciba y actúe de manera informada mediante la recopilación constante de datos y la elaboración precisa de gráficos de indicadores. Inspecciona la organización y detecta cualquier factor que pueda obstaculizar la producción y expansión. Mantiene un alto estándar de conducta ética y profesional. |
| **VFP** | Conducta alta de ética y altos niveles de productividad |
| **Personal** | Vanesa Mora (Ética) |

---

## División 2 | Diseminación

**VFP:** Suficiente volumen de ventas para garantizar que el ingreso sea mayor que el gasto, más las reservas.

**Manager:** Dissemination Manager (vacante)

**Función:** Hace que los servicios de Unlimitech Cloud se conozcan y se demanden de forma generalizada, creando un elevado volumen de clientes que los adquieren.

```mermaid
graph TD
    DIV2["División 2 | Diseminación<br/><i>Dissemination Manager</i>"]

    D4["Depto 4 | Promoción y Marketing<br/><i>Director of Promotion and Marketing</i>"]
    D5["Depto 5 | Publicaciones<br/><i>Director of Publications</i>"]
    D6["Depto 6 | Ventas<br/><i>Sales Director</i>"]

    DIV2 --> D4
    DIV2 --> D5
    DIV2 --> D6

    D4 --> S4_1["Sección 4.1<br/>Investigación de Públicos"]
    D4 --> S4_2["Sección 4.2<br/>Estrategias de Contenido"]
    D4 --> S4_3["Sección 4.3<br/>Ejecución de Campañas"]

    D5 --> S5_1["Sección 5.1<br/>Marketing y Creación de Publicaciones"]
    D5 --> S5_2["Sección 5.2<br/>Distribución"]
    D5 --> S5_3["Sección 5.3<br/>Optimización de Entrega y Satisfacción"]

    D6 --> S6_1["Sección 6.1 | Ventas<br/>Natalia Rocha<br/><i>Sales Representative #1</i>"]
    D6 --> S6_2["Sección 6.2<br/>Archivo Central"]
    D6 --> S6_3["Sección 6.3"]

    style DIV2 fill:#98FB98,stroke:#333
```

### Departamento 4 — Promoción y Marketing
| Campo | Detalle |
|-------|---------|
| **Cargo** | Director of Promotion and Marketing |
| **Función** | Genera una gran demanda orientando a los posibles clientes sobre los productos y servicios a través de promoción informativa, basada en encuestas precisas y campañas de marketing (mailings, boletines, revistas, sitios web, redes sociales). |
| **VFP** | Demanda activa y en gran volumen mediante campañas de marketing efectivas |

### Departamento 5 — Publicaciones
| Campo | Detalle |
|-------|---------|
| **Cargo** | Director of Publications |
| **Función** | Crea, vende y entrega con rapidez las publicaciones de la organización, transmitiendo al público las comprensiones alcanzadas por la empresa, fomentando el deseo y la demanda de los objetivos y servicios. |
| **VFP** | Publicaciones que crean una alta demanda por los servicios |

### Departamento 6 — Ventas
| Campo | Detalle |
|-------|---------|
| **Cargo** | Sales Director |
| **Función** | Realiza introducción a los posibles clientes que ya han expresado interés, para clasificarlos y calificarlos. Mantiene actualizados los archivos y la base de datos de todas las personas que alguna vez han adquirido algo de la empresa, para que se les puedan promover más servicios. |
| **VFP** | Clientes satisfechos y comprometidos, con ventas recurrentes y fidelizadas |
| **Personal** | Natalia Rocha (Sales Representative #1) |

---

## División 3 | Finanzas

**VFP:** Activos y reservas preservados y valiosos.

**Manager:** Finance Manager (vacante)

**Función:** Mantiene la gobernanza financiera adecuada, proporcionando a Unlimitech Cloud el cuerpo físico y los medios necesarios para producir sus productos, entregar sus servicios, permanecer solvente y alcanzar sus objetivos.

```mermaid
graph TD
    DIV3["División 3 | Finanzas<br/><i>Finance Manager</i>"]

    D7["Depto 7 | Ingreso<br/><i>Income Director</i>"]
    D8["Depto 8 | Pagos<br/><i>Director of Payments</i>"]
    D9["Depto 9 | Registros, Activos y Materiales<br/><i>Director of Registration, Assets and Materials</i>"]

    DIV3 --> D7
    DIV3 --> D8
    DIV3 --> D9

    D7 --> S7_1["Sección 7.1<br/>Gestión de Recaudación de Fondos"]
    D7 --> S7_2["Sección 7.2<br/>Registro y Control de Ingresos"]
    D7 --> S7_3["Sección 7.3<br/>Recuperación de Adeudos Pendientes"]

    D8 --> S8_1["Sección 8.1<br/>Gestión para Pagos"]
    D8 --> S8_2["Sección 8.2<br/>Desembolsos"]
    D8 --> S8_3["Sección 8.3<br/>Registro y Control de Pagos"]

    D9 --> S9_1["Sección 9.1<br/>Contabilidad"]
    D9 --> S9_2["Sección 9.2<br/>Supervisión y Preservación de Activos"]
    D9 --> S9_3["Sección 9.3<br/>Generación de Informes y Auditorías"]

    style DIV3 fill:#DDA0DD,stroke:#333
```

### Departamento 7 — Ingreso
| Campo | Detalle |
|-------|---------|
| **Cargo** | Income Director |
| **Función** | Gestiona los fondos entrantes, asegurándose de que se recauden y registren de manera adecuada y segura. Mantiene al día los registros de las cuentas de los clientes y recauda todos los adeudos pendientes. |
| **VFP** | Fondos gestionados con precisión y registros actualizados |

### Departamento 8 — Pagos
| Campo | Detalle |
|-------|---------|
| **Cargo** | Director of Payments |
| **Función** | Realiza los ajustes necesarios para desembolsar fondos destinados a adquisiciones y al pago de todas las facturas recibidas, así como al staff, garantizando que las obligaciones financieras se cumplan y que las demás divisiones dispongan de los recursos necesarios. |
| **VFP** | Pagos y recursos asegurados para continuidad operativa |

### Departamento 9 — Registros, Activos y Materiales
| Campo | Detalle |
|-------|---------|
| **Cargo** | Director of Registration, Assets and Materials |
| **Función** | Se asegura de la preservación del cuerpo físico de la empresa y mantiene registros precisos de todas las transacciones financieras, incluyendo contabilidad, auditorías y elaboración de informes financieros. |
| **VFP** | Activos preservados y registros financieros precisos |

---

## División 4 | Infraestructura (Producción)

**VFP:** Gran cantidad de servicios entregados a los consumidores con la puntualidad, el costo y la calidad prometidos.

**Manager:** Moises Gonzalez (Technical Architect Manager)

**Función:** Entrega e intercambia de manera eficiente y sin demoras los servicios de Unlimitech Cloud para sus usuarios y clientes.

```mermaid
graph TD
    DIV4["División 4 | Infraestructura<br/>Moises Gonzalez<br/><i>Technical Architect Manager</i>"]

    D10["Depto 10 | Planeación<br/><i>Planning Director</i>"]
    D11["Depto 11 | Servicios en la Nube<br/><i>Cloud Services Director</i>"]
    D12["Depto 12 | Desarrollo de Software<br/><i>Software Development Director</i>"]

    DIV4 --> D10
    DIV4 --> D11
    DIV4 --> D12

    style DIV4 fill:#FFA07A,stroke:#333
```

### Departamento 10 — Planeación

**Función:** Analiza y establece soluciones viables que permiten la entrega de servicios de manera ordenada y predecible, manteniendo los estándares de calidad. Es responsable de la completitud y la calidad de los proyectos.

**VFP:** Soluciones completas y de alta calidad para cierres de negocio efectivos. Servicios de alta calidad desarrollados, entregados con rapidez y con los más altos estándares de calidad.

```mermaid
graph TD
    D10["Depto 10 | Planeación<br/><i>Planning Director</i>"]

    S10_1["Sección 10.1<br/>Estimation"]
    S10_2["Sección 10.2<br/>Consulting"]
    S10_3["Sección 10.3<br/>Delivery and Quality Assurance<br/><i>Coordinator</i>"]

    D10 --> S10_1
    D10 --> S10_2
    D10 --> S10_3

    S10_3 --> U10_3_1["Unidad 10.3.1 | Website Factory<br/><i>Lead Project Manager</i><br/>Joel Castro (PM #1)"]
    S10_3 --> U10_3_2["Unidad 10.3.2 | Remote Teams<br/><i>Main Technical Leader</i><br/>Orlando Bohorquez (TL #1)"]
    S10_3 --> U10_3_3["Unidad 10.3.3 | Remote Teams<br/><i>Main Technical Leader</i><br/>Juan Maldonado (TL #2)"]
    S10_3 --> U10_3_4["Unidad 10.3.4 | Oficina Central<br/><i>Main Technical Leader</i><br/>Julian Castaño (TL #3)"]

    style D10 fill:#FFA07A,stroke:#333
```

### Departamento 11 — Servicios en la Nube

**Función:** Asegura que los servicios de infraestructura ofrecidos por la empresa se entreguen de manera estándar y funcional durante todo el ciclo de vida del servicio, además de proporcionar el soporte necesario que los clientes requieren.

**VFP:** Servicios de infraestructura eficientes y estables con constante soporte de calidad y rapidez para clientes.

```mermaid
graph TD
    D11["Depto 11 | Servicios en la Nube<br/><i>Cloud Services Director</i>"]

    S11_1["Sección 11.1<br/>Google Workspace Services<br/><i>Lead Google Workspace Specialist</i>"]
    S11_2["Sección 11.2<br/>AWS Infrastructure Services<br/><i>Lead AWS Developer</i>"]
    S11_3["Sección 11.3<br/>WordPress Hosting Services<br/><i>Lead Hosting Manager</i>"]

    D11 --> S11_1
    D11 --> S11_2
    D11 --> S11_3

    style D11 fill:#FFA07A,stroke:#333
```

### Departamento 12 — Desarrollo de Software

**Función:** Produce el desarrollo de software de manera eficiente, cumpliendo con la planificación establecida por el Departamento de Planeación para la ejecución de soluciones, y entrega los proyectos con rapidez, alta calidad y en gran cantidad.

**VFP:** Software eficiente y de alta calidad desarrollado con rapidez.

```mermaid
graph TD
    D12["Depto 12 | Desarrollo de Software<br/><i>Software Development Director</i>"]

    S12_1["Sección 12.1 | Web Design Team<br/><i>Lead UI/UX Designer</i><br/>Wenser Olmos"]
    S12_2["Sección 12.2 | Website Building Team<br/><i>Lead Website Builder</i>"]
    S12_3["Sección 12.3 | Frontend Team<br/><i>Lead Frontend Developer</i>"]
    S12_4["Sección 12.4 | Fullstack Team<br/><i>Lead Fullstack Developer</i>"]
    S12_5["Sección 12.5 | QA Team<br/><i>Lead Tester</i>"]

    D12 --> S12_1
    D12 --> S12_2
    D12 --> S12_3
    D12 --> S12_4
    D12 --> S12_5

    S12_3 --> FE1["Frontend Developer #1<br/>Camilo Perez"]
    S12_3 --> FE2["Frontend Developer #2<br/>Andres Alizo"]

    S12_4 --> FS1["Fullstack Developer #1<br/>Kevin Gutierrez"]
    S12_4 --> FS2["Fullstack Developer #2<br/>Lautaro Garcia"]
    S12_4 --> FS3["Fullstack Developer #3<br/>Gabriel Hernandez"]
    S12_4 --> FS4["Fullstack Developer #4<br/>Stiven Colorado"]

    S12_5 --> QA1["QA Analyst #1<br/>Jair Zea"]
    S12_5 --> QA2["QA<br/>Jhoann Acosta"]

    style D12 fill:#FFA07A,stroke:#333
```

#### Equipo de Desarrollo — Roles y funciones

| Sección | Función | Personal |
|---------|---------|----------|
| **12.1 Web Design** | Diseño UI/UX | Wenser Olmos (Lead) |
| **12.2 Website Building** | Construcción de sitios web. Coordinación Cliente-Equipo de Desarrollo para entrega oportuna cumpliendo objetivos y alcances. Producto: Sitios web entregados de forma estándar, profesional y en los tiempos estimados. | Lead Website Builder |
| **12.3 Frontend** | Desarrollo del lado del cliente | Camilo Perez, Andres Alizo |
| **12.4 Fullstack** | Capacidad de trabajar en todos los aspectos de desarrollo de software, tanto front-end como back-end. Puede contribuir en todas las etapas del ciclo de vida de desarrollo, desde el diseño e implementación hasta el despliegue y mantenimiento. Producto: Alta calidad de elementos fullstack garantizando una calidad muy alta en los proyectos para el cliente. | Kevin Gutierrez, Lautaro Garcia, Gabriel Hernandez, Stiven Colorado |
| **12.5 QA** | Aseguramiento de calidad del software | Jair Zea, Jhoann Acosta |

---

## División 5 | Calidad

**VFP:** 1. Staff bien formado que es eficaz y eficiente, entregando productos finales valiosos en sus puestos. 2. Unlimitech Cloud corregida y sus servicios y productos de alta calidad, muy por encima del promedio del mercado.

**Manager:** Quality Manager (vacante)

**Función:** Asegura que todos los servicios y los sistemas organizativos de Unlimitech Cloud sean de la más alta calidad y trabaja constantemente para mejorarlos.

```mermaid
graph TD
    DIV5["División 5 | Calidad<br/><i>Quality Manager</i>"]

    D13["Depto 13 | Exámenes<br/><i>Director of Examinations</i>"]
    D14["Depto 14 | Revisión<br/><i>Review Director</i>"]
    D15["Depto 15 | Certificaciones y Premios<br/><i>Director of Certifications and Awards</i>"]

    DIV5 --> D13
    DIV5 --> D14
    DIV5 --> D15

    D13 --> S13_1["Sección 13.1<br/>Evaluación de Calidad"]
    D13 --> S13_2["Sección 13.2<br/>Proceso de Revisión o Corrección"]
    D13 --> S13_3["Sección 13.3<br/>Certificación de Conformidad"]

    D14 --> S14_1["Sección 14.1<br/>Revisión y Análisis de Causas"]
    D14 --> S14_2["Sección 14.2<br/>Aplicación de Correcciones"]
    D14 --> S14_3["Sección 14.3<br/>Supervisión y Capacitación del Staff<br/>Laura Corredor"]

    D15 --> S15_1["Sección 15.1<br/>Certificación de Productos y Servicios"]
    D15 --> S15_2["Sección 15.2<br/>Reconocimiento de Desempeño"]
    D15 --> S15_3["Sección 15.3<br/>Documentación y Comunicación de Premios"]

    style DIV5 fill:#F0E68C,stroke:#333
```

### Departamento 13 — Exámenes
| Campo | Detalle |
|-------|---------|
| **Cargo** | Director of Examinations |
| **Función** | Evalúa el resultado de la producción en términos de calidad, validez y precisión de los servicios, y los remite a revisión o certificación. Asegura que todo el producto cumpla con los estándares de calidad. |
| **VFP** | Servicios entregados cumpliendo con los estándares de calidad |

### Departamento 14 — Revisión
| Campo | Detalle |
|-------|---------|
| **Cargo** | Review Director |
| **Función** | Revisa los productos, servicios, personal y procesos organizativos para identificar las causas subyacentes de cualquier nivel de calidad inferior al estándar, implementando correcciones necesarias. Supervisa al personal asegurándose de que estén completamente capacitados. |
| **VFP** | Servicios, procesos y personal corregidos asegurando el más alto estándar de calidad |
| **Personal** | Laura Corredor (Staff Supervision and Training Officer) |

### Departamento 15 — Certificaciones y Premios
| Campo | Detalle |
|-------|---------|
| **Cargo** | Director of Certifications and Awards |
| **Función** | Certifica aquellos productos que se consideran de excelente calidad basándose en los resultados de la inspección y el examen. También certifica y premia a aquellas personas, unidades y canales organizativos cuya demostración de competencia merece reconocimiento. |
| **VFP** | Certificación de productos y reconocimiento a la excelencia interna y externa |

---

## División 6 | Relaciones Públicas

**VFP:** 1. Una base de clientes interesados y florecientes que demandan más productos y servicios. 2. Clientes satisfechos que nos recomiendan a otros y comparten sus buenas experiencias ampliamente.

**Manager:** Public Relations Manager (vacante)

**Función:** Mantiene el punto de contacto entre el público en general y Unlimitech Cloud. A través de campañas de información y relaciones públicas, introduce a nuevos clientes y prospectos, generando un interés creciente en la empresa dentro de la comunidad.

```mermaid
graph TD
    DIV6["División 6 | Relaciones Públicas<br/><i>Public Relations Manager</i>"]

    D16["Depto 16 | Información al Público<br/><i>Director of Public Information</i>"]
    D17["Depto 17 | Servicios al Público<br/><i>Director of Public Services</i>"]
    D18["Depto 18 | Éxito<br/><i>Director of Success</i>"]

    DIV6 --> D16
    DIV6 --> D17
    DIV6 --> D18

    D16 --> S16_1["Sección 16.1<br/>Planificación de Campañas de RRPP"]
    D16 --> S16_2["Sección 16.2<br/>Colaboración Estratégica"]
    D16 --> S16_3["Sección 16.3<br/>Gestión de Imagen y Reputación"]

    D17 --> S17_1["Sección 17.1 | Atención y Contacto Inicial<br/><i>Coordinador de entrega de sitios web</i>"]
    D17 --> S17_2["Sección 17.2<br/>Entrega de Servicios de Calidad"]
    D17 --> S17_3["Sección 17.3<br/>Expansión de Canales"]

    D18 --> S18_1["Sección 18.1<br/>Recopilación de Historias de Éxito<br/><i>Jefe de historias de éxito</i>"]
    D18 --> S18_2["Sección 18.2<br/>Difusión de Logros"]
    D18 --> S18_3["Sección 18.3<br/>Referido"]

    style DIV6 fill:#ADD8E6,stroke:#333
```

### Departamento 16 — Información al Público
| Campo | Detalle |
|-------|---------|
| **Cargo** | Director of Public Information |
| **Función** | Asegura que la imagen de la organización, sus líneas y su personal sean excelentes, logrando la aceptación del público. Da a conocer la empresa a nuevos clientes potenciales a través de campañas de relaciones públicas bien planificadas. Trabaja con grupos afines para crear un clima operativo sostenible. |
| **VFP** | Imagen sólida y buena reputación mediante campañas efectivas |

### Departamento 17 — Servicios al Público
| Campo | Detalle |
|-------|---------|
| **Cargo** | Director of Public Services |
| **Función** | Se asegura de la participación del público en los servicios introductorios de la empresa y los proporciona a la nueva clientela. A través de una entrega de calidad, incentiva a los nuevos clientes a participar en otros servicios de mayor alcance. Establece canales productivos de distribución externa. |
| **VFP** | Servicios introductorios de calidad que inspiran participación futura |

### Departamento 18 — Éxito
| Campo | Detalle |
|-------|---------|
| **Cargo** | Director of Success |
| **Función** | Recopila y comunica de manera generalizada los éxitos de las actividades y productos de la organización. Ejerce influencia sobre el área de impacto de la organización, animando a los clientes existentes a hablar sobre el buen trabajo y los servicios de la empresa. |
| **VFP** | Difusión de logros que refuerzan la influencia y buena reputación |

---

## Directorio de Personal Actual

```mermaid
graph LR
    subgraph "División 7 — Ejecutiva"
        ML["Manuel Lara<br/>Founder & Solutions Architect"]
        CL["Catherine Lara<br/>CEO"]
        OA["Oscar Avila<br/>EVP"]
    end

    subgraph "División 1 — Talento Humano"
        CT["Carmenza Trejos<br/>Human Talent Manager"]
        VM["Vanesa Mora<br/>Ética"]
    end

    subgraph "División 2 — Diseminación"
        NR["Natalia Rocha<br/>Sales Representative #1"]
    end

    subgraph "División 4 — Infraestructura"
        MG["Moises Gonzalez<br/>Technical Architect Manager"]
        JC["Joel Castro<br/>Project Manager #1"]
        OB["Orlando Bohorquez<br/>Technical Leader #1"]
        JM["Juan Maldonado<br/>Technical Leader #2"]
        JCast["Julian Castaño<br/>Technical Leader #3"]
        WO["Wenser Olmos<br/>Lead UI/UX Designer"]
        CP["Camilo Perez<br/>Frontend Developer #1"]
        AA["Andres Alizo<br/>Frontend Developer #2"]
        KG["Kevin Gutierrez<br/>Fullstack Developer #1"]
        LG["Lautaro Garcia<br/>Fullstack Developer #2"]
        GH["Gabriel Hernandez<br/>Fullstack Developer #3"]
        SC["Stiven Colorado<br/>Fullstack Developer #4"]
        JZ["Jair Zea<br/>QA Analyst #1"]
        JA["Jhoann Acosta<br/>QA"]
    end

    subgraph "División 5 — Calidad"
        LC["Laura Corredor<br/>Staff Supervision & Training"]
    end
```

---

## Resumen Numérico de la Estructura

| Nivel | Cantidad | Descripción |
|-------|----------|-------------|
| **Socios** | 2 | Manuel Lara, Juan Carlos Lozano |
| **CEO** | 1 | Catherine Quiñonez |
| **C-Level** | 3 | CAO, CPO, CEO |
| **Divisiones** | 7 | Talento Humano, Diseminación, Finanzas, Infraestructura, Calidad, Relaciones Públicas, Ejecutiva |
| **Departamentos** | 21 | Numerados del 1 al 21 |
| **Secciones** | ~57 | 3 por departamento (promedio) |
| **Unidades** | 4 | Dentro de Sección 10.3 (Delivery & QA) |

---

## Flujo de Producción — Cómo se distribuyen las dos líneas de mando

```mermaid
graph TB
    CEO["CEO<br/>Catherine Quiñonez"]

    subgraph "Línea Administrativa (CAO)"
        direction TB
        DIV1["Div 1: Talento Humano<br/>(Personas + Comunicación + Ética)"]
        DIV2["Div 2: Diseminación<br/>(Marketing + Ventas + Publicaciones)"]
        DIV3["Div 3: Finanzas<br/>(Ingreso + Pagos + Activos)"]
    end

    subgraph "Línea de Producción (CPO)"
        direction TB
        DIV4["Div 4: Infraestructura<br/>(Planeación + Cloud + Software Dev)"]
        DIV5["Div 5: Calidad<br/>(Exámenes + Revisión + Certificaciones)"]
        DIV6["Div 6: Relaciones Públicas<br/>(Info Pública + Servicios + Éxito)"]
    end

    subgraph "Línea Ejecutiva (CEO directo)"
        direction TB
        DIV7["Div 7: Ejecutiva<br/>(CEO Office + Asuntos Especiales + Fundador)"]
    end

    CEO --> DIV1
    CEO --> DIV2
    CEO --> DIV3
    CEO --> DIV4
    CEO --> DIV5
    CEO --> DIV6
    CEO --> DIV7
```

---

## Glosario

| Término | Significado |
|---------|-------------|
| **VFP** | Valuable Final Product — Producto Final Valioso. Es el resultado medible y valioso que se espera de cada posición, departamento o división. |
| **Hat** | Referencia al concepto de "sombrero" o rol funcional que se asigna a un puesto, con funciones y responsabilidades específicas. |
| **División** | Nivel organizacional principal. Cada división agrupa departamentos relacionados bajo un propósito macro. |
| **Departamento** | Nivel medio dentro de una división. Agrupa secciones temáticas. |
| **Sección** | Nivel operativo dentro de un departamento. Ejecuta funciones específicas. |
| **Unidad** | Nivel más granular, dentro de una sección. Solo existe en el Depto 10 (Delivery & QA). |
| **CAO** | Chief Administrative Officer — Línea administrativa (Div 1, 2, 3) |
| **CPO** | Chief Production Officer — Línea de producción (Div 4, 5, 6) |


---

## Lista de Cargos

| # | Cargo | División | Departamento | Sección/Unidad | Estado |
|---|-------|----------|--------------|----------------|--------|
| 1 | Chief Executive Officer (CEO) | Ejecutiva | — | — | ✅ Ocupado |
| 2 | Executive Vice President (EVP) | Ejecutiva | Depto 19 (Sección 19.1) | — | ✅ Ocupado |
| 3 | Founder and Solutions Architect | Ejecutiva | Depto 21 | — | ✅ Ocupado |
| 4 | Chief Special Officer | Ejecutiva | Depto 20 | — | ⬜ Vacante |
| 5 | Chief Administrative Officer (CAO) | — | — | — | ⬜ Vacante |
| 6 | Chief Production Officer (CPO) | — | — | — | ⬜ Vacante |
| 7 | Human Talent Manager | Div 1 — Talento Humano | — | — | ✅ Ocupado |
| 8 | Director of Routing and Staffing | Div 1 — Talento Humano | Depto 1 | — | ⬜ Vacante |
| 9 | Org Board Officer | Div 1 — Talento Humano | Depto 1 | Sección 1.1 | ⬜ Vacante |
| 10 | Communications Director | Div 1 — Talento Humano | Depto 2 | — | ⬜ Vacante |
| 11 | Director of Inspections and Reports | Div 1 — Talento Humano | Depto 3 | — | ⬜ Vacante |
| 12 | Ética (Officer) | Div 1 — Talento Humano | Depto 3 | Sección 3.2 | ✅ Ocupado |
| 13 | Dissemination Manager | Div 2 — Diseminación | — | — | ⬜ Vacante |
| 14 | Director of Promotion and Marketing | Div 2 — Diseminación | Depto 4 | — | ⬜ Vacante |
| 15 | Director of Publications | Div 2 — Diseminación | Depto 5 | — | ⬜ Vacante |
| 16 | Sales Director | Div 2 — Diseminación | Depto 6 | — | ⬜ Vacante |
| 17 | Sales Representative #1 | Div 2 — Diseminación | Depto 6 | Sección 6.1 | ✅ Ocupado |
| 18 | Finance Manager | Div 3 — Finanzas | — | — | ⬜ Vacante |
| 19 | Income Director | Div 3 — Finanzas | Depto 7 | — | ⬜ Vacante |
| 20 | Director of Payments | Div 3 — Finanzas | Depto 8 | — | ⬜ Vacante |
| 21 | Director of Registration, Assets and Materials | Div 3 — Finanzas | Depto 9 | — | ⬜ Vacante |
| 22 | Technical Architect Manager | Div 4 — Infraestructura | — | — | ✅ Ocupado |
| 23 | Planning Director | Div 4 — Infraestructura | Depto 10 | — | ⬜ Vacante |
| 24 | Delivery and Quality Assurance Coordinator | Div 4 — Infraestructura | Depto 10 | Sección 10.3 | ⬜ Vacante |
| 25 | Lead Project Manager | Div 4 — Infraestructura | Depto 10 | Unidad 10.3.1 | ⬜ Vacante |
| 26 | Project Manager #1 | Div 4 — Infraestructura | Depto 10 | Unidad 10.3.1 | ✅ Ocupado |
| 27 | Main Technical Leader (Remote Teams #1) | Div 4 — Infraestructura | Depto 10 | Unidad 10.3.2 | ⬜ Vacante |
| 28 | Technical Leader #1 | Div 4 — Infraestructura | Depto 10 | Unidad 10.3.2 | ✅ Ocupado |
| 29 | Main Technical Leader (Remote Teams #2) | Div 4 — Infraestructura | Depto 10 | Unidad 10.3.3 | ⬜ Vacante |
| 30 | Technical Leader #2 | Div 4 — Infraestructura | Depto 10 | Unidad 10.3.3 | ✅ Ocupado |
| 31 | Main Technical Leader (Oficina Central) | Div 4 — Infraestructura | Depto 10 | Unidad 10.3.4 | ⬜ Vacante |
| 32 | Technical Leader #3 | Div 4 — Infraestructura | Depto 10 | Unidad 10.3.4 | ✅ Ocupado |
| 33 | Cloud Services Director | Div 4 — Infraestructura | Depto 11 | — | ⬜ Vacante |
| 34 | Lead Google Workspace Specialist | Div 4 — Infraestructura | Depto 11 | Sección 11.1 | ⬜ Vacante |
| 35 | Lead AWS Developer | Div 4 — Infraestructura | Depto 11 | Sección 11.2 | ⬜ Vacante |
| 36 | Lead Hosting Manager | Div 4 — Infraestructura | Depto 11 | Sección 11.3 | ⬜ Vacante |
| 37 | Software Development Director | Div 4 — Infraestructura | Depto 12 | — | ⬜ Vacante |
| 38 | Lead UI/UX Designer | Div 4 — Infraestructura | Depto 12 | Sección 12.1 | ✅ Ocupado |
| 39 | Lead Website Builder | Div 4 — Infraestructura | Depto 12 | Sección 12.2 | ⬜ Vacante |
| 40 | Lead Frontend Developer | Div 4 — Infraestructura | Depto 12 | Sección 12.3 | ⬜ Vacante |
| 41 | Frontend Developer #1 | Div 4 — Infraestructura | Depto 12 | Sección 12.3 | ✅ Ocupado |
| 42 | Frontend Developer #2 | Div 4 — Infraestructura | Depto 12 | Sección 12.3 | ✅ Ocupado |
| 43 | Lead Fullstack Developer | Div 4 — Infraestructura | Depto 12 | Sección 12.4 | ⬜ Vacante |
| 44 | Fullstack Developer #1 | Div 4 — Infraestructura | Depto 12 | Sección 12.4 | ✅ Ocupado |
| 45 | Fullstack Developer #2 | Div 4 — Infraestructura | Depto 12 | Sección 12.4 | ✅ Ocupado |
| 46 | Fullstack Developer #3 | Div 4 — Infraestructura | Depto 12 | Sección 12.4 | ✅ Ocupado |
| 47 | Fullstack Developer #4 | Div 4 — Infraestructura | Depto 12 | Sección 12.4 | ✅ Ocupado |
| 48 | Lead Tester | Div 4 — Infraestructura | Depto 12 | Sección 12.5 | ⬜ Vacante |
| 49 | QA Analyst #1 | Div 4 — Infraestructura | Depto 12 | Sección 12.5 | ✅ Ocupado |
| 50 | QA | Div 4 — Infraestructura | Depto 12 | Sección 12.5 | ✅ Ocupado |
| 51 | Quality Manager | Div 5 — Calidad | — | — | ⬜ Vacante |
| 52 | Director of Examinations | Div 5 — Calidad | Depto 13 | — | ⬜ Vacante |
| 53 | Review Director | Div 5 — Calidad | Depto 14 | — | ⬜ Vacante |
| 54 | Staff Supervision and Training Officer | Div 5 — Calidad | Depto 14 | Sección 14.3 | ✅ Ocupado |
| 55 | Director of Certifications and Awards | Div 5 — Calidad | Depto 15 | — | ⬜ Vacante |
| 56 | Public Relations Manager | Div 6 — Relaciones Públicas | — | — | ⬜ Vacante |
| 57 | Director of Public Information | Div 6 — Relaciones Públicas | Depto 16 | — | ⬜ Vacante |
| 58 | Director of Public Services | Div 6 — Relaciones Públicas | Depto 17 | — | ⬜ Vacante |
| 59 | Coordinador de entrega de sitios web | Div 6 — Relaciones Públicas | Depto 17 | Sección 17.1 | ⬜ Vacante |
| 60 | Director of Success | Div 6 — Relaciones Públicas | Depto 18 | — | ⬜ Vacante |
| 61 | Jefe de historias de éxito | Div 6 — Relaciones Públicas | Depto 18 | Sección 18.1 | ⬜ Vacante |

**Resumen:** 61 cargos identificados — 21 ocupados, 40 vacantes.

---

## Lista de Empleados

| # | Nombre | Cargo | División | Departamento | Sección/Unidad |
|---|--------|-------|----------|--------------|----------------|
| 1 | Catherine Quiñonez (Catherine Lara) | Chief Executive Officer | Div 7 — Ejecutiva | Depto 19 | — |
| 2 | Oscar Avila | Executive Vice President | Div 7 — Ejecutiva | Depto 19 | Sección 19.1 |
| 3 | Manuel Lara | Founder and Solutions Architect | Div 7 — Ejecutiva | Depto 21 | — |
| 4 | Carmenza Trejos | Human Talent Manager | Div 1 — Talento Humano | — | — |
| 5 | Vanesa Mora | Ética (Officer) | Div 1 — Talento Humano | Depto 3 | Sección 3.2 |
| 6 | Natalia Rocha | Sales Representative #1 | Div 2 — Diseminación | Depto 6 | Sección 6.1 |
| 7 | Moises Gonzalez | Technical Architect Manager | Div 4 — Infraestructura | — | — |
| 8 | Joel Castro | Project Manager #1 | Div 4 — Infraestructura | Depto 10 | Unidad 10.3.1 (Website Factory) |
| 9 | Orlando Bohorquez | Technical Leader #1 | Div 4 — Infraestructura | Depto 10 | Unidad 10.3.2 (Remote Teams) |
| 10 | Juan Maldonado | Technical Leader #2 | Div 4 — Infraestructura | Depto 10 | Unidad 10.3.3 (Remote Teams) |
| 11 | Julian Castaño | Technical Leader #3 | Div 4 — Infraestructura | Depto 10 | Unidad 10.3.4 (Oficina Central) |
| 12 | Wenser Olmos | Lead UI/UX Designer | Div 4 — Infraestructura | Depto 12 | Sección 12.1 (Web Design) |
| 13 | Camilo Perez | Frontend Developer #1 | Div 4 — Infraestructura | Depto 12 | Sección 12.3 (Frontend) |
| 14 | Andres Alizo | Frontend Developer #2 | Div 4 — Infraestructura | Depto 12 | Sección 12.3 (Frontend) |
| 15 | Kevin Gutierrez | Fullstack Developer #1 | Div 4 — Infraestructura | Depto 12 | Sección 12.4 (Fullstack) |
| 16 | Lautaro Garcia | Fullstack Developer #2 | Div 4 — Infraestructura | Depto 12 | Sección 12.4 (Fullstack) |
| 17 | Gabriel Hernandez | Fullstack Developer #3 | Div 4 — Infraestructura | Depto 12 | Sección 12.4 (Fullstack) |
| 18 | Stiven Colorado | Fullstack Developer #4 | Div 4 — Infraestructura | Depto 12 | Sección 12.4 (Fullstack) |
| 19 | Jair Zea | QA Analyst #1 | Div 4 — Infraestructura | Depto 12 | Sección 12.5 (QA) |
| 20 | Jhoann Acosta | QA | Div 4 — Infraestructura | Depto 12 | Sección 12.5 (QA) |
| 21 | Laura Corredor | Staff Supervision and Training Officer | Div 5 — Calidad | Depto 14 | Sección 14.3 |

**Total empleados activos:** 21

### Distribución por División

| División | Empleados | % del Total |
|----------|-----------|-------------|
| Div 7 — Ejecutiva | 3 | 14% |
| Div 1 — Talento Humano | 2 | 10% |
| Div 2 — Diseminación | 1 | 5% |
| Div 3 — Finanzas | 0 | 0% |
| Div 4 — Infraestructura | 14 | 67% |
| Div 5 — Calidad | 1 | 5% |
| Div 6 — Relaciones Públicas | 0 | 0% |
| **Total** | **21** | **100%** |
