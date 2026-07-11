# Domain tetap: ifrs9pro (Cloudflare Named Tunnel)

Tujuan: aplikasi bisa diakses dari luar dengan hostname tetap, contoh:

- `https://ifrs9pro.<domain-anda>`

## 1) Buat Tunnel di Cloudflare

- Cloudflare Zero Trust → Networks → Tunnels → Create tunnel
- Nama tunnel: `ifrs9pro` (bebas, tapi ini paling konsisten)

## 2) Tambahkan Public Hostname

Di tunnel `ifrs9pro` → Public Hostname:

- Subdomain: `ifrs9pro`
- Domain: pilih domain yang kamu miliki di Cloudflare (mis. `ifrspro.id` / `ristix.bdo-ki.com` / dst.)
- Service type: `HTTP`
- URL: `http://frontend-dev:4231`

Catatan: kalau akses backend langsung dari browser perlu dibuka juga, idealnya frontend akan proxy `/api/*` dan `/socket.io/*` ke backend, jadi public hostname cukup arahkan ke frontend saja.

## 3) Siapkan token tunnel di lokal (JANGAN di-commit)

- Di Cloudflare tunnel `ifrs9pro` → Configure → Install connector → Copy token
- Copy file ini:
  - `ops/local/cloudflared.env.example` → `ops/local/cloudflared.env`
- Isi:
  - `CLOUDFLARED_TUNNEL_TOKEN=...`

## 4) Jalankan container tunnel

```bash
docker compose -f ops/local/docker-compose.yml --profile public-domain up -d cloudflared-frontend-named
docker logs --tail 100 ifrs9-cloudflared-frontend-named
```

## 5) Akses dari luar

- Buka `https://ifrs9pro.<domain-anda>`

## Troubleshooting

- Jika muncul 1033 / unreachable:
  - pastikan tunnel container running: `docker ps | findstr cloudflared`
  - cek log: `docker logs --tail 200 ifrs9-cloudflared-frontend-named`
  - pastikan domainnya sudah ada di Cloudflare DNS (biasanya dibuat otomatis oleh Public Hostname).

