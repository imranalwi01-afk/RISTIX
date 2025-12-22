# =============================================================================
# HOME UI MODULE
# =============================================================================
# Extracted from: _analytics/_v15mod-base/modules/ui/home_ui.R (working version)
# Purpose: Home dashboard layout and IFRS 9 description
# Author: Original IFRS9 Analytics Team
# Date: Working modular architecture - NO AUTHENTICATION REQUIRED
# =============================================================================

#' Home UI Module
#' @description Creates the home dashboard with IFRS 9 description and welcome content
#' @return Shiny tabItem for home page
home_ui <- function() {
  tabItem(tabName = "home",
          tags$h2("IFRS 9", style = "font-size: 48px; font-weight: bold; color: #2e2e3a;"),
          tags$h3("Probability of Default (PD) Module", style = "font-size: 32px; font-weight: bold; color: #2e2e3a;"),
          tags$p("The Probability of Default (PD) module in this IFRS 9 Modelling Tools application is designed to assist financial institutions in calculating the likelihood of borrower default based on historical data, in an accurate, efficient, and compliant manner with IFRS 9 standards.", style = "font-size: 22px; color: #333333;"),

  )
}

# =============================================================================
# END OF HOME UI MODULE
# =============================================================================