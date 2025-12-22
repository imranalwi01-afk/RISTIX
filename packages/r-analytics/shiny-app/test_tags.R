# Minimal test to isolate tags issue
library(shiny)
library(shinydashboard)
library(DT)
library(htmltools)

cat('All packages loaded\n')
cat('tags exists:', exists('tags'), '\n')

# Test basic tags usage
test_ui <- dashboardPage(
  title = "Test",
  dashboardHeader(
    title = "Test App"
  ),
  dashboardSidebar(),
  dashboardBody(
    tags$head(
      tags$style("body { background: red; }")
    )
  )
)

cat('UI created successfully\n')