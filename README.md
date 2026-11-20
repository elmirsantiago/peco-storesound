# PECO STORESOUND — tienda full-stack

Proyecto Next.js (App Router) con **155 productos reales**, sus fotos originales, logo y banner. Incluye catálogo responsive, buscador, categorías, detalle, precios escalonados, carrito con total y pedido por WhatsApp, login y panel administrador para altas, bajas, edición y verificación de fotos.

## 1. Abrir y ejecutar

1. Extraer el ZIP del proyecto en tu computadora.
2. Abrir la carpeta `peco-storesound` con VS Code.
3. Abrir la terminal e instalar Node.js 20.9+ (recomendado 22 LTS).
4. Ejecutar:

```bash
npm install
npm run dev
```

5. Abrir `http://localhost:3000`.

**Importante:** la tienda se visualiza con los 155 productos incluidos aun sin configurar MongoDB. Para que las ediciones del panel se guarden es necesario configurar la base de datos.

## 2. MongoDB Atlas y el admin

1. Crear un proyecto y clúster MongoDB Atlas; habilitar el acceso de tu IP (y la red necesaria para Vercel) y un usuario de base de datos.
2. Copiar `.env.example` a `.env.local` y completar `MONGODB_URI` (con el nombre de base `pecostoresound`).
3. Completar `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `JWT_SECRET` (una cadena aleatoria de al menos 32 caracteres, **no publiques ninguna credencial**).
4. Importar los 155 productos:

```bash
npm run seed
```

5. Abrir `http://localhost:3000/admin` e iniciar sesión con las credenciales configuradas.
6. Editar productos, precios, fotos, categorías, stock opcional, visibilidad, etc. Para agregar desde la web, usá “Nuevo producto”.

El botón **Importar catálogo** del admin importa solo los productos faltantes y **no modifica** los ya editados. Si ejecutás la importación después de borrar un producto inicial, lo volverá a crear.

### Fotos por verificar

Las 155 imágenes están incluidas. Sin embargo, en **145 productos** WhatsApp puso varias imágenes con la misma marca de tiempo, por lo que se asignó una de las candidatas de forma provisional. **Antes de entregar la tienda**, entrá al admin → **Solo fotos pendientes** → seleccioná la imagen correcta entre las opciones → **Guardar cambios**. Las fotos ambiguas son provisionales: no se comprobó visualmente su correspondencia con los 145 artículos.

El sistema conserva las imágenes locales bajo `/public/productos` para que sigan visibles desde Vercel. Los archivos del ZIP de origen no deben subirse de nuevo.

### Subir nuevas imágenes

Por defecto el admin permite pegar una URL `https://...` o una ruta `/productos/nombre.jpeg` en el campo imagen. Si querés subir fotos nuevas desde el panel, configurá opcionalmente `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` y `CLOUDINARY_API_SECRET` para usar el botón **Subir imagen**. No uses imágenes pesadas de más de 5 MB.

## 3. Publicar en Vercel

1. Crear repositorio privado en GitHub (recomendado mientras se verifica el catálogo).
2. Subir el proyecto **sin** `.env.local`, `node_modules` ni `.next`.
3. Importar el repositorio en Vercel (Framework: Next.js).
4. En Vercel → Settings → Environment Variables, cargar `MONGODB_URI`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `JWT_SECRET`; si usás Cloudinary, agregar sus tres variables.
5. Deploy. Luego revisar la web desde celular y probar un pedido real dirigido al número `+54 9 341 201-3989` (tomado del banner) para comprobar que sea el contacto correcto.
6. Si cambiás variables de entorno, volver a desplegar.

## 4. Reglas del carrito y precios

- 1 a 4 unidades: precio `1`.
- 5 a 9: precio `5`.
- 10 a 19: precio `10`.
- 20 o más: precio `20`.
- Se calcula por **cantidad de cada producto**, no por unidades sumadas de productos distintos.
- El carrito se guarda en `localStorage` del navegador y se envía por WhatsApp. **No hay cobro online** ni cálculo de envío automático.
- El stock queda inicialmente en modo **consultar disponibilidad**, ya que no fue suministrado stock de cada artículo.

## 5. Qué queda por verificar antes de una entrega definitiva

- Revisar manualmente las 145 asociaciones de fotos ambiguas y confirmar sus datos.
- Corroborar los 155 nombres, las categorías automáticas y los precios con Rubén.
- Confirmar el número de WhatsApp e Instagram (`@peco_storesound`) del banner.
- Revisar funcionamiento de Vercel, MongoDB y credenciales del admin en producción.
- Corroborar que las promesas del banner sobre envíos y compra segura siguen siendo válidas.
- Confirmar costos y condiciones de envío; en la tienda se avisa que se confirman por WhatsApp.

## Archivos importantes

- `app/page.tsx`: inicio.
- `app/globals.css`: diseño.
- `components/`: componentes, filtros, carrito y detalle.
- `app/admin/page.tsx`: panel administrador.
- `data/products.json`: los 155 productos ya estructurados.
- `public/productos/`: las 155 fotos originales.
- `lib/db.ts`, `lib/store.ts`: modelo y conexión MongoDB.
- `app/api/`: endpoints de login, productos, importación y subida.

## Seguridad y alcance

Se utiliza cookie de sesión `httpOnly`, verificación JWT para operaciones de escritura, validación de precios y credenciales por variables de entorno. La conexión MongoDB es de servidor, nunca en el navegador. Para producción, conviene revisar políticas de respaldo, limitación de intentos de login y protección operacional adicional. No existe integración de cobros ni gestión de pedidos en servidor.
