#!/usr/bin/env bash
###############################################################################
#  deploy_prerender.sh
#  Instala y configura Prerender.io (open-source) + actualiza nginx
#  Probado en Ubuntu 22.04 / Debian 12
#  Ejecutar como root o con sudo
###############################################################################
set -euo pipefail

DOMAIN="comercializadoramorenosantos.com"
NGINX_CONF="/etc/nginx/sites-available/${DOMAIN}"
NGINX_LINK="/etc/nginx/sites-enabled/${DOMAIN}"
PRERENDER_PORT=3000
WEB_ROOT="/var/www/html"

echo "══════════════════════════════════════════════════"
echo "  Instalando Prerender.io SEO para ${DOMAIN}"
echo "══════════════════════════════════════════════════"

# ── 1. Dependencias ────────────────────────────────────────────────────────
echo "[1/6] Actualizando paquetes e instalando dependencias..."
apt-get update -qq
apt-get install -y -qq docker.io docker-compose nginx certbot python3-certbot-nginx curl

systemctl enable --now docker

# ── 2. Contenedor Prerender.io ────────────────────────────────────────────
echo "[2/6] Levantando contenedor prerender/prerender..."

# Detener instancia previa si existe
docker rm -f prerender 2>/dev/null || true

docker run -d \
    --name prerender \
    --restart unless-stopped \
    -p ${PRERENDER_PORT}:3000 \
    -e PAGE_DONE_CHECK_INTERVAL=50 \
    -e WAIT_AFTER_LAST_REQUEST=500 \
    -e FOLLOW_REDIRECTS=true \
    -e MAX_CONCURRENT_REQUESTS=10 \
    prerender/prerender

echo "    ✓ Prerender corriendo en puerto ${PRERENDER_PORT}"

# Esperar a que prerender arranque
sleep 3

# ── 3. Verificar prerender ────────────────────────────────────────────────
echo "[3/6] Verificando servicio prerender..."
if curl -s "http://localhost:${PRERENDER_PORT}/https://${DOMAIN}" | grep -q "<html"; then
    echo "    ✓ Prerender responde correctamente"
else
    echo "    ⚠ Prerender no responde aún — puede tardar 10-20 seg la primera vez"
fi

# ── 4. Build del frontend React ───────────────────────────────────────────
echo "[4/6] Copiando build de React al web root..."
# Asume que el build ya fue generado con 'npm run build' y está en dist/
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIST="${SCRIPT_DIR}/../frontend/frontend/dist"

if [ -d "${FRONTEND_DIST}" ]; then
    mkdir -p "${WEB_ROOT}"
    cp -r "${FRONTEND_DIST}/." "${WEB_ROOT}/"
    echo "    ✓ Build copiado a ${WEB_ROOT}"
else
    echo "    ⚠ No se encontró ${FRONTEND_DIST} — copia manualmente el build"
fi

# ── 5. nginx ──────────────────────────────────────────────────────────────
echo "[5/6] Configurando nginx..."

cp "${SCRIPT_DIR}/nginx/nginx.conf" "${NGINX_CONF}"

# Deshabilitar default site si existe
rm -f /etc/nginx/sites-enabled/default

# Habilitar el nuestro
ln -sf "${NGINX_CONF}" "${NGINX_LINK}"

# Probar configuración antes de recargar
nginx -t
systemctl reload nginx
echo "    ✓ nginx configurado y recargado"

# ── 6. SSL con Let's Encrypt ──────────────────────────────────────────────
echo "[6/6] Verificando certificado SSL..."

CERT_PATH="/etc/letsencrypt/live/${DOMAIN}/fullchain.pem"
if [ -f "${CERT_PATH}" ]; then
    echo "    ✓ Certificado ya existe en ${CERT_PATH}"
else
    echo "    Solicitando certificado para ${DOMAIN} y www.${DOMAIN}..."
    certbot --nginx \
        -d "${DOMAIN}" \
        -d "www.${DOMAIN}" \
        --non-interactive \
        --agree-tos \
        --email tecnologo.alexis96@gmail.com \
        --redirect
    echo "    ✓ SSL configurado"
fi

# ── Resumen ────────────────────────────────────────────────────────────────
echo ""
echo "══════════════════════════════════════════════════"
echo "  ✅ Despliegue completo"
echo ""
echo "  Servicio             Puerto"
echo "  ─────────────────────────────────────"
echo "  FastAPI backend      8000"
echo "  Prerender.io         ${PRERENDER_PORT}"
echo "  nginx (HTTP)         80  → redirect 443"
echo "  nginx (HTTPS)        443"
echo ""
echo "  Prueba bot:"
echo "  curl -A 'Googlebot' https://${DOMAIN}/"
echo ""
echo "  Prueba sitemap:"
echo "  curl https://${DOMAIN}/sitemap.xml | head -30"
echo "══════════════════════════════════════════════════"
