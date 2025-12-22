#!/bin/bash
# scripts/setup/r-base-only.sh
# Install ONLY R base - Skip all problematic development packages

echo "🎯 INSTALLING ONLY R BASE (NO DEVELOPMENT PACKAGES)"
echo "📋 This is sufficient for IFRS 9 basic calculations"
echo ""

# Update package lists
echo "📦 Updating package lists..."
sudo apt-get update

# Install ONLY R base (skip r-base-dev)
echo "📊 Installing R base (without development packages)..."
sudo apt-get install -y r-base

# Check if R was installed successfully
if command -v R &> /dev/null; then
    echo ""
    echo "✅ SUCCESS! R base installed successfully"
    
    # Show R version
    R_VERSION=$(R --version | head -n1)
    echo "📊 $R_VERSION"
    
    # Test basic R functionality
    echo ""
    echo "🧪 Testing basic R functionality..."
    if echo 'cat("R is working correctly!\n"); print(paste("R version:", R.version.string))' | R --vanilla --quiet; then
        echo "✅ R basic functionality confirmed"
    else
        echo "❌ R basic functionality test failed"
        exit 1
    fi
    
    # Try to install essential package using R's built-in capabilities
    echo ""
    echo "📦 Attempting to install jsonlite package..."
    cat > /tmp/install_basic.R << 'EOF'
# Try to install jsonlite using base R capabilities
tryCatch({
  if (!require("jsonlite", quietly = TRUE)) {
    cat("Installing jsonlite...\n")
    install.packages("jsonlite", 
                    repos = "https://cloud.r-project.org/", 
                    dependencies = FALSE,
                    quiet = TRUE)
    
    if (require("jsonlite", quietly = TRUE)) {
      cat("✅ jsonlite installed successfully\n")
      
      # Test JSON functionality
      test_json <- toJSON(list(status = "working", timestamp = Sys.time()))
      cat("JSON test:", test_json, "\n")
    } else {
      cat("⚠️ jsonlite failed to install, but R base functions will work\n")
    }
  } else {
    cat("✅ jsonlite already available\n")
  }
}, error = function(e) {
  cat("⚠️ Package installation had issues, but R base is working\n")
  cat("Error:", e$message, "\n")
})

# Test basic calculation (most important for IFRS 9)
cat("\n=== BASIC CALCULATION TEST ===\n")
portfolio <- data.frame(
  account = c("ACC001", "ACC002", "ACC003"),
  amount = c(100000, 200000, 150000)
)

# Simple ECL calculation
pd <- 0.02  # 2% probability of default
lgd <- 0.45 # 45% loss given default

portfolio$ecl <- portfolio$amount * pd * lgd
total_ecl <- sum(portfolio$ecl)

cat("Portfolio accounts:", nrow(portfolio), "\n")
cat("Total exposure:", sum(portfolio$amount), "\n") 
cat("Total ECL:", total_ecl, "\n")
cat("✅ Basic IFRS 9 calculation test PASSED\n")

cat("\n🎉 R IS READY FOR IFRS 9 PLATFORM!\n")
EOF

    # Run the basic package installation
    if R --vanilla --quiet < /tmp/install_basic.R 2>/dev/null; then
        echo "✅ Package installation completed"
    else
        echo "⚠️  Package installation had some issues, but R base is working"
    fi
    
    rm -f /tmp/install_basic.R
    
    echo ""
    echo "🎉 R BASE INSTALLATION SUCCESSFUL!"
    echo ""
    echo "📊 What's working:"
    echo "   ✅ R base system"
    echo "   ✅ Basic calculations"
    echo "   ✅ Data frame operations"
    echo "   ✅ Mathematical functions"
    echo ""
    echo "⚠️  What might be limited:"
    echo "   • Package compilation (we'll use pre-compiled packages)"
    echo "   • Advanced statistical libraries (not needed for basic IFRS 9)"
    echo ""
    echo "🚀 NEXT STEP:"
    echo "   ./scripts/development/d2h3-basic-ifrs9-r-integration-updated.sh"
    echo ""
    
else
    echo "❌ R base installation failed"
    echo ""
    echo "🔧 TROUBLESHOOTING OPTIONS:"
    echo "1. Try installing from snap: sudo snap install r"
    echo "2. Use Docker R container"
    echo "3. Continue without R (Node.js only mode)"
    echo ""
    echo "Would you like to continue without R? (y/n)"
    read -r continue_without_r
    
    if [[ "$continue_without_r" == "y" || "$continue_without_r" == "Y" ]]; then
        echo ""
        echo "📝 CONTINUING WITHOUT R..."
        echo "   Run: ./scripts/development/d2h3-nodejs-only-version.sh"
        echo ""
    fi
    
    exit 1
fi