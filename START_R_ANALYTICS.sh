#!/bin/bash

# Title: IFRS9 R ANALYTICS - LOCAL (PORT 4236)
echo "========================================================"
echo "   IFRS9 R ANALYTICS LOCAL RUNNER"
echo "========================================================"
echo ""
echo "This script runs the R Analytics module natively on macOS."
echo "Ensure you have R installed and added to your PATH."
echo ""

cd modelling || { echo "Error: 'modelling' directory not found. Exiting."; exit 1; }

# Check if R is installed
if ! command -v Rscript &> /dev/null
then
    echo "[WARNING] Rscript not found in system PATH. Attempting to locate..."
    
    # Common R installation paths on macOS
    R_BIN_PATHS=(
        "/Library/Frameworks/R.framework/Versions/Current/Resources/bin"
        "/usr/local/bin"
        "/opt/homebrew/bin" # For Homebrew installations
    )
    
    R_FOUND=false
    for r_path in "${R_BIN_PATHS[@]}"; do
        if [ -x "${r_path}/Rscript" ]; then
            echo "Found Rscript at: ${r_path}/Rscript"
            export PATH="${r_path}:${PATH}"
            R_FOUND=true
            break
        fi
    done

    if [ "$R_FOUND" = false ]; then
        echo "[ERROR] Rscript still not found!"
        echo "Please install R from https://cloud.r-project.org/"
        echo "Or manually add your R bin folder to the System PATH."
        echo "Example: /Library/Frameworks/R.framework/Versions/Current/Resources/bin"
        exit 1
    fi
fi

echo "[*] R Detected!"
echo "[*] Installing missing dependencies and starting App..."
echo "[*] Database Target: 10.8.0.2 (VPN Required)"
echo "[*] Port: 4236"
echo ""

Rscript run_local.R

echo "Script finished. Press any key to continue..."
read -n 1 -s
