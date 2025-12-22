# Visual ETL Designer

A comprehensive, enterprise-grade visual ETL designer built with React Flow and Material-UI.

## Features

- **Visual Workflow Designer** with drag-and-drop interface
- **Advanced ETL Capabilities** with multiple data sources
- **Data Quality & Monitoring** with real-time validation
- **Error Recovery & Resilience** with smart strategies
- **Performance Optimization** with automated analysis

## Components

- `ETLDesigner`: Main designer interface
- `ETLToolbox`: Draggable node palette
- `ETLNodeConfigPanel`: Node configuration panel

## Usage

```tsx
import { ETLDesignerWithProvider } from './components/etl/designer/ETLDesigner';

function MyETLWorkspace() {
  return <ETLDesignerWithProvider />;
}
