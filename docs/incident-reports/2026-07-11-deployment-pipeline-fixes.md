# 2026-07-11: Deployment Pipeline Fixes, Runner Mismatch & VPN Tunnels

## Summary
The automatic deployment pipeline (`Docker Develop Publish`) was stuck in the "Queued" state, the deployed application lacked database credentials causing "Invalid credentials" during login, and local backend connection to the VPN database timed out.

## Root Cause
1. **GitHub Runner Mismatch**: `docker-publish-dev.yml` used `runs-on: [self-hosted, ristix]`, but the runner on the server was tagged with `iaf-prod` instead of `ristix`.
2. **Missing Server `.env` File**: The workflow tried to copy `/home/admin/RISTIX/.env`, but the actual server configuration file was located at `/home/admin/RISTIX/ops/dev/.env`. This resulted in the containers starting with empty environment variables, causing database login failures.
3. **PowerShell Encoding Corruption**: While attempting to trigger a rebuild by appending a space to `package.json` using PowerShell (`echo " " >> package.json`), PowerShell automatically used UTF-16LE encoding. This corrupted the `package.json` file, causing `pnpm install` in the CI pipeline to fail with a JSON parsing error (`Unexpected non-whitespace character after JSON`).
4. **VPN Database Timeout**: The local development backend could not connect to `172.25.0.25:5432` via VPN proxy because the VPN interface firewall blocked port 5432.

## Impact
- Automatic deployments were stuck.
- Built images lacked necessary environment configurations, rendering the application unusable.
- Local development environment crashed (`ECONNREFUSED` and `CONNECT_TIMEOUT`).
- CI pipeline failed completely due to corrupted JSON files.

## Fix
1. Updated `docker-publish-dev.yml` to target the `iaf-prod` label instead of `ristix`.
2. Corrected the `.env` copy path in the workflow to `/home/admin/RISTIX/ops/dev/.env`.
3. Reverted the corrupted `package.json` files to their clean UTF-8 states via `git checkout`.
4. Triggered a manual rebuild by pushing benign `trigger.txt` files to avoid parsing issues.
5. Replaced the `vpn-proxy.js` solution with a direct SSH Tunnel (`ssh -L 5432:localhost:5432 admin@172.25.0.25`) to securely bypass the server firewall.

## Prevention
1. **Runner Labels**: Always verify exact runner tags/labels in GitHub Settings. Do not assume the runner hostname acts as a label.
2. **PowerShell Caveats**: Agents must NEVER use `echo "text" >> file` in PowerShell, as it creates UTF-16LE corruption. To touch files or trigger builds, use `New-Item` to create empty `.txt` files or `git commit --allow-empty`.
3. **Local Database Connections**: Always rely on SSH tunneling (`ssh -L 5432:localhost:5432`) rather than node-based proxies when connecting to remote databases behind restrictive firewalls.
