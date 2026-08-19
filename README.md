# Herramientas de Marcas de Corte para Adobe Illustrator (.jsx)

Colección de scripts en **ExtendScript (JavaScript)** diseñados para automatizar la creación de marcas de corte, sangrados y puntos guía en Adobe Illustrator. Pensados para optimizar el flujo de trabajo en imprenta, cartelería, pegatinas y troquelados.

---

## 📄 Scripts incluidos

| Archivo | Descripción | Caso de uso principal |
| :--- | :--- | :--- |
| **`Marcas de corte_Mesa de Trabajo.jsx`** | Genera líneas de corte exteriores en las 4 esquinas de la mesa de trabajo activa o de todas las mesas del documento. | Tarjetas de visita, folletos, cartelería y documentos multipágina. |
| **`Marcas de corte_Forma.jsx`** | Analiza la geometría de la forma seleccionada. Coloca marcas rectas en vértices convexos (salientes) y puntos guía oscurecidos en vértices cóncavos (entradas). | Pegatinas, etiquetas con formas complejas, packaging y troquelados. |

---

## ✨ Características principales

* **Interfaz gráfica personalizada (ScriptUI):** Permite configurar longitud de marca, sangrado/offset, grosor de línea y tamaño del punto guía en milímetros y puntos.
* **Tinta de Registro:** Asignación automática del color de muestra `[Registration]` o `Registro` para asegurar que las marcas se impriman en todas las separaciones de color.
* **Organización por capas:** Crea automáticamente una capa dedicada llamada `Líneas de Corte` para mantener el diseño original intacto.

---

## 🛠️ Instalación

1. Descarga los archivos `.jsx` de este repositorio.
2. Copia los archivos dentro de la carpeta de scripts de tu instalación de Illustrator:

* **Windows:**  
  `C:\Program Files\Adobe\Adobe Illustrator [Versión]\Presets\[Idioma]\Scripts`

* **macOS:**  
  `/Applications/Adobe Illustrator [Versión]/Presets/[Idioma]/Scripts`

3. Reinicia Adobe Illustrator para que los scripts aparezcan integrados en el menú.

---

## 🚀 Cómo usar

1. Abre tu documento en Adobe Illustrator.
2. *(Solo para el script de formas)* Selecciona el objeto o trazado vectorial en el lienzo.
3. Ve al menú superior: **Archivo > Scripts > [Nombre del Script]** (o usa `Cmd + F12` en Mac / `Ctrl + F12` en Windows para ejecutarlo directamente).
4. Configura los parámetros en la ventana emergente y pulsa **Generar**.

---

## ⚖️ Licencia y Condiciones de Uso

Este proyecto está publicado bajo una **Licencia de Uso No Comercial**.

* **Uso permitido:** Gratuito y libre para uso personal, profesional de producción y modificación interna del código.
* **Uso prohibido:** Queda estrictamente prohibida la venta, comercialización directa o inclusión de estos scripts en paquetes de pago sin la autorización expresa del autor.
* **Exención de responsabilidad:** El software se entrega "TAL CUAL", sin garantías explícitas ni implícitas. El autor no se hace responsable de errores de impresión, fallos de troquelado o pérdidas de material derivados de su uso.
