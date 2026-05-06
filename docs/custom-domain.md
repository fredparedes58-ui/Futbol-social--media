# Conectar dominio personalizado

Pasos (hay que hacerlos en el dashboard de Vercel — no los puedo automatizar por CLI sin que el DNS pase por tu lado).

## 1. Comprar / tener un dominio
Cualquier registrar (Namecheap, Google Domains, Cloudflare, etc.).

## 2. Agregarlo en Vercel
1. Abrir https://vercel.com/fred-paredes-projects/grada/settings/domains
2. Click **Add Domain** → escribir `tudominio.com`
3. Vercel te muestra los registros DNS que hay que configurar.

## 3. Configurar DNS en el registrar
Hay dos opciones:

### Opción A — delegar nameservers a Vercel (más simple)
En el registrar, cambiar los nameservers a:
```
ns1.vercel-dns.com
ns2.vercel-dns.com
```
Propagación: 15 min – 48 h.

### Opción B — apuntar solo los registros (más control)
Agregar estos registros en el DNS actual:
- **A** `@` → `76.76.21.21`
- **CNAME** `www` → `cname.vercel-dns.com`

## 4. Verificar
Volver a Vercel → el dominio pasa de **Invalid Configuration** a **Valid** cuando el DNS propaga.
Vercel emite automáticamente el certificado SSL (Let's Encrypt).

## 5. Actualizar manifest y meta tags
Si usás OG images, actualizar en `index.html`:
```html
<meta property="og:url" content="https://tudominio.com" />
<meta property="og:image" content="https://tudominio.com/api/og?type=team&name=..." />
```
