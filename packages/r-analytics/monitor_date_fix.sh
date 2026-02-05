#!/bin/bash

# =============================================================================
# MONITOR DATE FIX
# =============================================================================
# Purpose: Monitor logs for date update debugging

echo "🔍 Monitoring R Analytics logs for date input updates..."
echo "=================================================="
echo ""
echo "📋 Steps to test:"
echo "1. Go to: https://ifrs9-iaf-analytics.ifrspro.id"
echo "2. Data tab → Load dependent data → Submit"
echo "3. Independent Variable tab → Load data → Submit"
echo "4. Click Join button"
echo "5. Check Model tab > Input section for date updates"
echo ""
echo "🎯 Expected behavior:"
echo "  - Tanggal Awal Insample = First date from data"
echo "  - Tanggal Akhir Insample = Middle date from data"
echo "  - Tanggal Akhir Outsample = Last date from data"
echo ""
echo "📝 Watching logs (Ctrl+C to stop):"
echo ""

# Monitor logs for relevant messages
tail -f /home/doppelgaenger/ifrspro/ifrs9-iaf/packages/r-analytics/logs/iaf-analytics.log | grep --color=always -E "(DEBUG.*MAIN_SERVER|DEBUG.*DATA_SERVER|tanggal|Tanggal|train_start|train_split|test_end|datagabung)"