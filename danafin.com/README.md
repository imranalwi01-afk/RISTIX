# 📁 SSL Certificate Directory - ristix.bdo-ki.com
# =============================================================================
# Indonesia Airawata Finance (IAF) - SSL Certificate Management
# =============================================================================
#
# This directory contains SSL certificates for the ristix.bdo-ki.com domain
# used by IAF production services on Alibaba Cloud ECS.
#
# 📋 Certificate Files Required:
# ┌─────────────────────────────────────────────────────────────┐
# │ ristix.bdo-ki.com.pem     - SSL Certificate (public key)          │
# │ ristix.bdo-ki.com.key     - SSL Private Key (encrypted)           │
# │ ca-bundle.crt       - Certificate Authority Bundle (optional)│
# └─────────────────────────────────────────────────────────────┘
#
# 🔐 Certificate Details:
# - Domain: *.ristix.bdo-ki.com (wildcard certificate)
# - Type: SSL/TLS Certificate
# - Issuer: Let's Encrypt / DigiCert / etc.
# - Purpose: Production HTTPS for IAF services
#
# 🚀 Services Using These Certificates:
# 1. https://ristix.bdo-ki.com (Frontend)
# 2. https://api-ristix.bdo-ki.com (Backend API)
# 3. https://analytics-ristix.bdo-ki.com (R Analytics Dashboard)
# 4. https://analytics-calc-ristix.bdo-ki.com (R Analytics API)
#
# 📂 Deployment Location on ECS Server:
# /root/projects/ifrs9-iaf/ristix.bdo-ki.com/
#
# ⚠️ SECURITY NOTES:
# - Private key must be kept secure and readable only by root
# - Certificate permissions: 644 (readable by all)
# - Private key permissions: 600 (readable by root only)
# - Regularly monitor certificate expiration dates
# - Renew certificates before expiration
#
# 🔄 Certificate Renewal:
# - Let's Encrypt: Certbot renewal process
# - Commercial CA: Reissue and replace before expiration
# - Test renewal process in staging environment first
#
# 📞 For certificate issues, contact:
# - SSL Certificate Provider
# - DevOps Team
# - Security Team
#
# =============================================================================
# Last Updated: $(date '+%Y-%m-%d %H:%M:%S')
# =============================================================================