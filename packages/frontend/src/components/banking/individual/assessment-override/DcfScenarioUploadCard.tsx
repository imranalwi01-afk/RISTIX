'use client';

import React from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Typography
} from '@mui/material';
import { DcfScenarioRow, ParsedDcfRow } from './types';
import { DcfScenarioConfigurator } from './DcfScenarioConfigurator';
import { DcfUploadPreviewPanel } from './DcfUploadPreviewPanel';

interface DcfScenarioUploadCardProps {
  selectedScenario: string;
  scenarioOptions: any[];
  onSelectedScenarioChange: (value: string) => void;
  scenarioCount: number;
  onScenarioCountChange: (value: number) => void;
  onShowScenario: () => void;
  scenarioRows: DcfScenarioRow[];
  onUpdateScenarioRow: (id: string, field: keyof DcfScenarioRow, value: string | number) => void;
  onDeleteScenarioRow: (id: string) => void;
  onAddScenarioRow: () => void;
  onSaveScenarioDraft: () => void;
  onDcfFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDownloadTemplate: () => void;
  selectedDcfFile: File | null;
  parsedDcfRows: ParsedDcfRow[];
  onSubmitDcf: () => void | Promise<void | boolean>;
  onCancelDcf: () => void;
  uploadingDcf: boolean;
  reviewSlot?: React.ReactNode;
}

const DCF_WIZARD_STEPS = ['Scenario', 'Upload DCF', 'Review Result'];

export function DcfScenarioUploadCard({
  selectedScenario,
  scenarioOptions,
  onSelectedScenarioChange,
  scenarioCount,
  onScenarioCountChange,
  onShowScenario,
  scenarioRows,
  onUpdateScenarioRow,
  onDeleteScenarioRow,
  onAddScenarioRow,
  onSaveScenarioDraft,
  onDcfFileChange,
  onDownloadTemplate,
  selectedDcfFile,
  parsedDcfRows,
  onSubmitDcf,
  onCancelDcf,
  uploadingDcf,
  reviewSlot
}: DcfScenarioUploadCardProps) {
  const [activeStep, setActiveStep] = React.useState(0);

  const canContinueFromScenario = Boolean(selectedScenario) && scenarioRows.length > 0;
  const canContinue = activeStep === 0 ? canContinueFromScenario : !uploadingDcf;

  const goBack = () => setActiveStep((current) => Math.max(0, current - 1));
  const goNext = () => setActiveStep((current) => Math.min(DCF_WIZARD_STEPS.length - 1, current + 1));
  const handleSubmitDcf = async () => {
    const result = await onSubmitDcf();
    if (result !== false) {
      setActiveStep(2);
    }
  };

  const renderStepContent = () => {
    if (activeStep === 0) {
      return (
        <DcfScenarioConfigurator
          selectedScenario={selectedScenario}
          scenarioOptions={scenarioOptions}
          onSelectedScenarioChange={onSelectedScenarioChange}
          scenarioCount={scenarioCount}
          onScenarioCountChange={onScenarioCountChange}
          onShowScenario={onShowScenario}
          scenarioRows={scenarioRows}
          onUpdateScenarioRow={onUpdateScenarioRow}
          onDeleteScenarioRow={onDeleteScenarioRow}
          onAddScenarioRow={onAddScenarioRow}
          onSaveScenarioDraft={onSaveScenarioDraft}
        />
      );
    }

    if (activeStep === 1) {
      return (
        <DcfUploadPreviewPanel
          onDcfFileChange={onDcfFileChange}
          onDownloadTemplate={onDownloadTemplate}
          selectedDcfFile={selectedDcfFile}
          parsedDcfRows={parsedDcfRows}
          onSubmitDcf={handleSubmitDcf}
          onCancelDcf={onCancelDcf}
          uploadingDcf={uploadingDcf}
        />
      );
    }

    return reviewSlot ?? (
      <Alert severity="info">
        Submit DCF first to generate the legacy IA header and detail cash flow rows for review.
      </Alert>
    );
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" sx={{ mb: 2 }}>
          DCF Scenario & Upload
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
          {DCF_WIZARD_STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Stack spacing={3}>
          <Box>{renderStepContent()}</Box>
          <Stack direction="row" justifyContent="space-between" spacing={2}>
            <Button variant="outlined" onClick={goBack} disabled={activeStep === 0}>
              Back
            </Button>
            <Button
              variant="contained"
              onClick={goNext}
              disabled={activeStep === DCF_WIZARD_STEPS.length - 1 || !canContinue}
            >
              Next
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
