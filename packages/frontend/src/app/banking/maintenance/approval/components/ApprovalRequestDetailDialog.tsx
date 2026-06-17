'use client';

import React, { memo } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  AttachFile as AttachFileIcon,
  CheckCircle as CheckCircleIcon,
  DataObject as DataObjectIcon,
  Download as DownloadIcon,
  ExpandMore as ExpandMoreIcon,
  Security as SecurityIcon,
  Analytics as AnalyticsIcon,
} from '@mui/icons-material';
import { ApprovalRequest, RequestRoutingMatch } from '../types';
import { ConsolidatedAssessmentApprovalContent } from './ConsolidatedAssessmentApprovalContent';
import { RAnalyticsComprehensiveDetail } from './RAnalyticsComprehensiveDetail';
import { useCurrencyDisplay } from '@/providers/CurrencyDisplayProvider';

const DETAIL_CANDIDATE_VISIBLE_LIMIT = 24;
const REDACTED_KEYS = new Set(['password', 'token', 'accessToken', 'refreshToken', 'authorization', 'secret']);
const enterpriseTableSx = {
  tableLayout: 'fixed',
  '& .MuiTableCell-head': {
    bgcolor: '#f8fafc',
    color: 'text.secondary',
    fontSize: '0.72rem',
    fontWeight: 800,
    letterSpacing: 0,
    textTransform: 'uppercase',
    borderBottom: '1px solid',
    borderColor: 'divider',
    py: 1,
  },
  '& .MuiTableCell-body': {
    py: 0.85,
    borderColor: 'divider',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
} as const;

type GenericAttachment = {
  label: string;
  fileName: string;
  mimeType?: string;
  base64?: string;
  url?: string;
};

function toPlainRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function sanitizePayload(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sanitizePayload);
  }

  const record = toPlainRecord(value);
  if (!record) return value;

  return Object.fromEntries(
    Object.entries(record).map(([key, child]) => {
      if (REDACTED_KEYS.has(key)) return [key, '[redacted]'];
      return [key, sanitizePayload(child)];
    })
  );
}

function findGenericAttachments(value: unknown, path = 'requestData'): GenericAttachment[] {
  const record = toPlainRecord(value);
  if (!record) {
    if (Array.isArray(value)) {
      return value.flatMap((entry, index) => findGenericAttachments(entry, `${path}[${index}]`));
    }
    return [];
  }

  const fileName = [record.fileName, record.filename, record.name, record.originalName]
    .find((candidate) => typeof candidate === 'string' && candidate.trim().length > 0) as string | undefined;
  const base64 = [record.base64, record.fileBase64, record.contentBase64, record.content, record.data]
    .find((candidate) => typeof candidate === 'string' && candidate.trim().length > 0) as string | undefined;
  const url = [record.url, record.fileUrl, record.downloadUrl]
    .find((candidate) => typeof candidate === 'string' && candidate.trim().length > 0) as string | undefined;
  const mimeType = [record.mimeType, record.contentType]
    .find((candidate) => typeof candidate === 'string' && candidate.trim().length > 0) as string | undefined;

  const current = fileName && (base64 || url)
    ? [{ label: path, fileName, base64, url, mimeType }]
    : [];

  const nested = Object.entries(record).flatMap(([key, child]) => findGenericAttachments(child, `${path}.${key}`));
  return [...current, ...nested];
}

function downloadAttachment(attachment: GenericAttachment) {
  if (attachment.url) {
    window.open(attachment.url, '_blank', 'noopener,noreferrer');
    return;
  }

  if (!attachment.base64) return;

  const cleanBase64 = attachment.base64.includes(',')
    ? attachment.base64.split(',').pop() || ''
    : attachment.base64;
  const byteCharacters = atob(cleanBase64);
  const byteNumbers = Array.from(byteCharacters, (char) => char.charCodeAt(0));
  const blob = new Blob([new Uint8Array(byteNumbers)], { type: attachment.mimeType || 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = attachment.fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

function getPendingConfigurationData(request?: ApprovalRequest): Record<string, unknown> | null {
  const requestData = toPlainRecord(request?.requestData);
  const nestedData = toPlainRecord(requestData?.data);
  return nestedData || requestData;
}

function getPendingRuleRows(data: Record<string, unknown> | null): Array<Record<string, unknown>> {
  const directRules = data?.rules;
  const directDetails = data?.details;
  if (Array.isArray(directRules)) return directRules.filter((row): row is Record<string, unknown> => Boolean(toPlainRecord(row)));
  if (Array.isArray(directDetails)) return directDetails.filter((row): row is Record<string, unknown> => Boolean(toPlainRecord(row)));
  if (data && ['table_name', 'column_name', 'operator'].some((key) => key in data)) return [data];
  return [];
}

function isConfigApprovalRequest(request?: ApprovalRequest): boolean {
  const type = String(request?.entityType || request?.requestType || '').toLowerCase();
  return ['segmentation', 'rule_base_setting', 'rule-base-setting', 'rule_base', 'rule-base'].includes(type);
}

interface ApprovalRequestDetailDialogProps {
  open: boolean;
  request?: ApprovalRequest;
  routingLoading: boolean;
  routingMatch: RequestRoutingMatch | null;
  expandedCandidateLevels: Record<string, boolean>;
  onExpandedCandidateLevelsChange: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  onClose: () => void;
  onOpenRolePermission: (request: ApprovalRequest) => void;
  isRolePermissionRequest: (request: ApprovalRequest) => boolean;
  formatDate: (value: string) => string;
  getStatusColor: (status: string) => string;
  getPriorityColor: (priority: string) => string;
  isOverdue: (date?: string) => boolean;
}

function isIndividualAssessmentCheckerPreviewRequest(request?: ApprovalRequest): boolean {
  if (!request) return false;
  const entityType = String(request.entityType || '').toLowerCase();
  const requestType = String(request.requestType || '').toLowerCase();
  const payloadEntityType = String((request.requestData as any)?.entityType || '').toLowerCase();
  const sourceApi = String((request.requestData as any)?.sourceApi || '').toLowerCase();

  return entityType === 'individual_assessment_consolidated'
    || requestType === 'individual_assessment'
    || entityType === 'individual_impairment_v2'
    || requestType === 'individual_impairment_v2'
    || payloadEntityType === 'individual_impairment_v2'
    || payloadEntityType === 'individual_assessment_consolidated'
    || sourceApi.includes('individual-impairment');
}

function IndividualImpairmentCheckerReviewPreview({ request }: { request: ApprovalRequest }) {
  const { formatMoney } = useCurrencyDisplay();
  const payload = (request.requestData as any) || {};
  const data = (payload.data || payload) as Record<string, any>;
  const stagedOverride = (data.stagedOverride || {}) as Record<string, any>;
  const stagedDCF = (data.stagedDCF || {}) as Record<string, any>;
  const results = (stagedDCF.results || data.results || {}) as Record<string, any>;
  const summaryStatus = String(request.status || 'pending').toUpperCase();
  const dcfRows = Array.isArray(stagedDCF.cashflows) ? stagedDCF.cashflows : [];
  const accountNumber = String(data.accountNumber || data.account_number || request.entityId || '-');
  const cifName = String(data.customerName || data.customer_name || data.cifName || '-');
  const cifNumber = String(data.cifNumber || data.cif_number || '-');
  const overrideStage = stagedOverride.overrideStage ?? data.overrideStage ?? '-';
  const impairedFlag = stagedOverride.impairedFlag ?? data.impairedFlag ?? '-';
  const justification = stagedOverride.justification ?? data.justification ?? 'No adjustment justification provided';
  const supportingDocument = stagedOverride.supportingDocument ?? data.supportingDocument ?? '';
  const dcfFileName = stagedDCF.fileName ?? data.fileName ?? '';
  const dcfScenario = stagedDCF?.assumptions?.scenarioType || data?.assumptions?.scenarioType || '-';
  const dcfDownloadApi = String(payload.sourceApi || '/api/v2/individual-impairment');
  const summaryOutstanding = results?.outstanding ?? data?.outstanding ?? data?.outstandingBalance ?? null;
  const calcOutstandingEad = results?.eadAmt ?? results?.outstandingBalance ?? data?.outstanding ?? null;
  const calcPvDcf = results?.presentValue ?? results?.pvDcfAmt ?? null;
  const calcEclIa = results?.eclIaAmt ?? results?.recommendedProvision ?? null;
  const calcDiscountRate = Number(results?.assumptions?.effectiveInterestRate ?? results?.assumptions?.discountRate ?? data?.effInterestRate ?? 0);

  return (
    <Box sx={{ mt: 2, p: 2, border: '1px solid', borderColor: 'success.light', borderRadius: 2, bgcolor: alpha('#2e7d32', 0.03) }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <CheckCircleIcon color="success" />
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Checker Review - Account {accountNumber}
        </Typography>
      </Box>

      <Box sx={{ p: 2, borderRadius: 2, mb: 2, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 3 }}>
            <Typography variant="subtitle2" color="text.secondary">Customer</Typography>
            <Typography variant="body1" sx={{ fontWeight: 700 }}>{cifName}</Typography>
            <Typography variant="body2" color="text.secondary">CIF: {cifNumber}</Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">Status</Typography>
            <Tooltip title={request.status === 'pending' ? 'Menunggu persetujuan' : request.status === 'approved' ? 'Disetujui oleh semua approver' : request.status === 'rejected' ? 'Ditolak oleh approver' : request.status === 'cancelled' ? 'Dibatalkan' : request.status}>
              <Chip label={summaryStatus} size="small" color={request.status === 'pending' ? 'warning' : 'default'} sx={{ mt: 0.5 }} />
            </Tooltip>
          </Grid>
          <Grid size={{ xs: 12, md: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">Stage</Typography>
            <Chip label={`Stage ${overrideStage}`} size="small" variant="outlined" sx={{ mt: 0.5 }} />
          </Grid>
          <Grid size={{ xs: 12, md: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">DPD</Typography>
            <Typography variant="body1" sx={{ fontWeight: 700 }}>{data.dpd ?? 0} days</Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <Typography variant="subtitle2" color="text.secondary">Outstanding</Typography>
            <Typography variant="body1" sx={{ fontWeight: 700, color: 'primary.main' }}>
              {formatMoney(summaryOutstanding, 'IDR')}
            </Typography>
          </Grid>
        </Grid>
      </Box>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ p: 2, borderRadius: 2, height: '100%', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Adjustment</Typography>
            <Divider sx={{ mb: 1.5 }} />
            <Typography variant="caption" color="text.secondary">Justification</Typography>
            <Typography variant="body2" sx={{ fontStyle: 'italic', bgcolor: 'grey.100', p: 1, borderRadius: 1, mb: 1.5 }}>
              "{justification}"
            </Typography>
            <Typography variant="caption" color="text.secondary">Impaired Flag</Typography>
            <Typography variant="body2" sx={{ mb: 1.5 }}>{impairedFlag || '-'}</Typography>
            <Typography variant="caption" color="text.secondary">Override Stage</Typography>
            <Typography variant="body2" sx={{ mb: 1.5 }}>{overrideStage}</Typography>
            <Divider sx={{ my: 1 }} />
            <Typography variant="body2" color="text.secondary">
              {supportingDocument ? `Attachment: ${supportingDocument}` : 'No adjustment file'}
            </Typography>
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ p: 2, borderRadius: 2, height: '100%', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>DCF Analysis</Typography>
            <Divider sx={{ mb: 1.5 }} />
            <Typography variant="caption" color="text.secondary">Uploaded File</Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>{dcfFileName || 'Historical Report Data'}</Typography>
            {dcfFileName && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<DownloadIcon />}
                onClick={() => window.open(`${dcfDownloadApi}/overrides/documents/${encodeURIComponent(dcfFileName)}`, '_blank', 'noopener,noreferrer')}
                sx={{ mb: 1.5 }}
              >
                Download DCF File
              </Button>
            )}
            <Divider sx={{ my: 1 }} />
            <Typography variant="caption" color="text.secondary">Cashflow Periods</Typography>
            <Typography variant="body1">{dcfRows.length} rows</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>Scenario</Typography>
            <Typography variant="body1">{String(dcfScenario || '-')}</Typography>
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ p: 2, borderRadius: 2, mt: 2, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Calculation Results</Typography>
        <Divider sx={{ mb: 1.5 }} />
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 3 }}>
            <Typography variant="caption" color="text.secondary">Outstanding / EAD</Typography>
            <Typography variant="body1" sx={{ fontWeight: 700 }}>
              {formatMoney(calcOutstandingEad, 'IDR')}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <Typography variant="caption" color="text.secondary">PV DCF Amount</Typography>
            <Typography variant="body1" sx={{ fontWeight: 700 }}>
              {formatMoney(calcPvDcf, 'IDR')}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <Typography variant="caption" color="text.secondary">ECL IA Amount</Typography>
            <Typography variant="body1" sx={{ fontWeight: 700, color: 'error.main' }}>
              {formatMoney(calcEclIa, 'IDR')}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <Typography variant="caption" color="text.secondary">Discount Rate</Typography>
            <Typography variant="body1" sx={{ fontWeight: 700 }}>
              {calcDiscountRate.toFixed(2)}%
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export const ApprovalRequestDetailDialog = memo(function ApprovalRequestDetailDialog({
  open,
  request,
  routingLoading,
  routingMatch,
  expandedCandidateLevels,
  onExpandedCandidateLevelsChange,
  onClose,
  onOpenRolePermission,
  isRolePermissionRequest,
  formatDate,
  getStatusColor,
  getPriorityColor,
  isOverdue,
}: ApprovalRequestDetailDialogProps) {
  const theme = useTheme();
  const sanitizedRequestData = request?.requestData ? sanitizePayload(request.requestData) : null;
  const genericAttachments = request?.requestData ? findGenericAttachments(request.requestData) : [];
  const pendingConfigData = getPendingConfigurationData(request);
  const pendingRuleRows = getPendingRuleRows(pendingConfigData);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Approval Request Details</DialogTitle>
      <DialogContent>
        {request && (
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid size={12}>
                <Typography variant="h6">{request.requestTitle}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {request.description}
                </Typography>
              </Grid>
              <Grid size={6}>
                <Typography variant="subtitle2">Request Type:</Typography>
                <Typography variant="body2">{request.requestTypeLabel || request.requestType.replace(/_/g, ' ').toUpperCase()}</Typography>
              </Grid>
              {request.requestData?.sourceApi && (
                <Grid size={6}>
                  <Typography variant="subtitle2">Source API:</Typography>
                  <Typography variant="body2">{request.requestData.sourceApi}</Typography>
                </Grid>
              )}
              {request.requestData?.apiVersion && (
                <Grid size={6}>
                  <Typography variant="subtitle2">API Version:</Typography>
                  <Chip label={String(request.requestData.apiVersion).toUpperCase()} size="small" variant="outlined" sx={{ mt: 0.5 }} />
                </Grid>
              )}
              <Grid size={6}>
                <Typography variant="subtitle2">Requested By:</Typography>
                <Typography variant="body2">{request.requestedByName}</Typography>
              </Grid>
              <Grid size={6}>
                <Typography variant="subtitle2">Status:</Typography>
                <Chip label={request.status.replace('_', ' ').toUpperCase()} color={getStatusColor(request.status) as any} size="small" sx={{ mt: 0.5 }} />
              </Grid>
              <Grid size={6}>
                <Typography variant="subtitle2">Priority:</Typography>
                <Tooltip title={request.priority === 'low' ? 'Low — SLA 24 jam, cukup 1 approval' : request.priority === 'medium' ? 'Medium — SLA 8 jam, cukup 1 approval' : request.priority === 'high' ? 'High — SLA 4 jam, butuh 2 approval' : request.priority === 'critical' ? 'Critical — SLA 2 jam, butuh 2 approval' : request.priority}>
                  <Chip label={request.priority.toUpperCase()} color={getPriorityColor(request.priority) as any} size="small" sx={{ mt: 0.5 }} />
                </Tooltip>
              </Grid>
              <Grid size={6}>
                <Typography variant="subtitle2">Progress:</Typography>
                <Typography variant="body2">
                  {request.approvalsReceived} / {request.approvalsRequired} approvals
                </Typography>
              </Grid>
              {request.dueDate && (
                <Grid size={6}>
                  <Typography variant="subtitle2">Due Date:</Typography>
                  <Typography variant="body2" color={isOverdue(request.dueDate) ? 'error' : 'inherit'}>
                    {formatDate(request.dueDate)}
                    {isOverdue(request.dueDate) && ' (Overdue)'}
                  </Typography>
                </Grid>
              )}
              {request.bankingType && (
                <Grid size={6}>
                  <Typography variant="subtitle2">Banking Type:</Typography>
                  <Typography variant="body2">{request.bankingType.toUpperCase()}</Typography>
                </Grid>
              )}
              {request.riskLevel && (
                <Grid size={6}>
                  <Typography variant="subtitle2">Risk Level:</Typography>
                  <Tooltip title={`Risk level: ${request.riskLevel}`}>
                    <Chip label={request.riskLevel.toUpperCase()} color={getPriorityColor(request.riskLevel) as any} size="small" sx={{ mt: 0.5 }} />
                  </Tooltip>
                </Grid>
              )}

              {isConfigApprovalRequest(request) && pendingConfigData && (
                <Grid size={12}>
                  <Box sx={{ mt: 1.5, p: 2, border: '1px solid', borderColor: 'primary.light', borderRadius: 1, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                      Pending Configuration Change
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 1.5, mb: pendingRuleRows.length ? 2 : 0 }}>
                      {[
                        ['Operation', toPlainRecord(request?.requestData)?.operation],
                        ['Group/Rule', pendingConfigData.group_segment || pendingConfigData.rule_name],
                        ['Segment/Type', pendingConfigData.segment || pendingConfigData.rule_type],
                        ['Target', [pendingConfigData.updated_table || pendingConfigData.table_name, pendingConfigData.updated_column || pendingConfigData.column_name].filter(Boolean).join('.')],
                        ['Value', pendingConfigData.value || pendingConfigData.value1],
                        ['Sequence', pendingConfigData.seq],
                        ['Active', typeof pendingConfigData.active_flag === 'boolean' ? (pendingConfigData.active_flag ? 'Yes' : 'No') : undefined],
                      ].filter(([, value]) => value !== undefined && value !== '').map(([label, value]) => (
                        <Box key={String(label)}>
                          <Typography variant="caption" color="text.secondary">{String(label)}</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, wordBreak: 'break-word' }}>{String(value)}</Typography>
                        </Box>
                      ))}
                    </Box>
                    {pendingRuleRows.length > 0 && (
                      <TableContainer sx={{ maxHeight: 280, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                        <Table stickyHeader size="small" sx={enterpriseTableSx}>
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ width: 86 }}>Group</TableCell>
                              <TableCell sx={{ width: 72 }}>Seq</TableCell>
                              <TableCell sx={{ width: 180 }}>Table</TableCell>
                              <TableCell sx={{ width: 170 }}>Column</TableCell>
                              <TableCell sx={{ width: 110 }}>Data Type</TableCell>
                              <TableCell sx={{ width: 100 }}>Operator</TableCell>
                              <TableCell sx={{ width: 150 }}>Value 1</TableCell>
                              <TableCell sx={{ width: 150 }}>Value 2</TableCell>
                              <TableCell sx={{ width: 100 }}>Logic</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {pendingRuleRows.map((row, index) => (
                              <TableRow key={index} hover>
                                <TableCell>{String(row.query_group || '-')}</TableCell>
                                <TableCell>{String(row.seq || '-')}</TableCell>
                                <TableCell sx={{ fontFamily: 'monospace' }}>{String(row.table_name || '-')}</TableCell>
                                <TableCell sx={{ fontFamily: 'monospace' }}>{String(row.column_name || '-')}</TableCell>
                                <TableCell>{String(row.data_type || '-')}</TableCell>
                                <TableCell>{String(row.operator || '-')}</TableCell>
                                <TableCell sx={{ fontFamily: 'monospace' }}>{String(row.value1 || '-')}</TableCell>
                                <TableCell sx={{ fontFamily: 'monospace' }}>{String(row.value2 || '-')}</TableCell>
                                <TableCell>{String(row.condition || '-')}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </Box>
                </Grid>
              )}

              {/* SPECIALIZED CONTENT: INDIVIDUAL ASSESSMENT */}
              {isIndividualAssessmentCheckerPreviewRequest(request) && (
                <Grid size={12}>
                  <IndividualImpairmentCheckerReviewPreview request={request} />
                </Grid>
              )}
              {(String(request.entityType || '').toLowerCase() === 'individual_assessment_consolidated' || String(request.requestType || '').toLowerCase() === 'individual_assessment') && !isIndividualAssessmentCheckerPreviewRequest(request) && (
                <Grid size={12}>
                  <Box sx={{ mt: 2, p: 2, border: '1px solid', borderColor: 'primary.light', borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.01) }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <AnalyticsIcon color="primary" />
                      <Typography variant="h6" color="primary.main" sx={{ fontWeight: 700 }}>
                        Assessment Audit Details
                      </Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <ConsolidatedAssessmentApprovalContent 
                      data={request.requestData} 
                      formatDate={formatDate} 
                    />
                  </Box>
                </Grid>
              )}

              {/* SPECIALIZED CONTENT: R ANALYTICS */}
              {String(request.entityType || request.requestType || '').toLowerCase() === 'r_analytics_comprehensive' && (
                <Grid size={12}>
                  <RAnalyticsComprehensiveDetail data={request.requestData} />
                </Grid>
              )}

              {sanitizedRequestData && (
                <Grid size={12}>
                  <Accordion variant="outlined" disableGutters sx={{ mt: 1 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <DataObjectIcon fontSize="small" color="primary" />
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          Request Payload
                        </Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      {genericAttachments.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" sx={{ mb: 1 }}>
                            Attachments
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {genericAttachments.map((attachment, index) => (
                              <Button
                                key={`${attachment.label}-${attachment.fileName}-${index}`}
                                size="small"
                                variant="outlined"
                                startIcon={<AttachFileIcon />}
                                endIcon={<DownloadIcon />}
                                onClick={() => downloadAttachment(attachment)}
                              >
                                {attachment.fileName}
                              </Button>
                            ))}
                          </Box>
                        </Box>
                      )}
                      <Box
                        component="pre"
                        sx={{
                          m: 0,
                          p: 1.5,
                          maxHeight: 360,
                          overflow: 'auto',
                          borderRadius: 1,
                          bgcolor: 'grey.50',
                          border: '1px solid',
                          borderColor: 'divider',
                          fontSize: 12,
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                        }}
                      >
                        {JSON.stringify(sanitizedRequestData, null, 2)}
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                </Grid>
              )}
              <Grid size={12}>
                <Box sx={{ pt: 1.5 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    Who Can Approve This Request
                  </Typography>
                  {routingLoading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={18} />
                      <Typography variant="body2" color="text.secondary">
                        Loading routing candidates...
                      </Typography>
                    </Box>
                  ) : !routingMatch?.entityType ? (
                    <Alert severity="info">
                      Entity type is not available in this request, so approver routing cannot be resolved.
                    </Alert>
                  ) : !routingMatch?.routing ? (
                    <Alert severity="warning">
                      No routing matrix found for entity <strong>{routingMatch.entityType}</strong>.
                    </Alert>
                  ) : (
                    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1.5 }}>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center', mb: 1 }}>
                        <Chip
                          size="small"
                          label={routingMatch.routing.matrixName}
                          color={routingMatch.routing.isActive ? 'success' : 'default'}
                          variant="outlined"
                        />
                        <Chip size="small" variant="outlined" label={`Entity: ${routingMatch.routing.entityType}`} />
                        <Chip size="small" variant="outlined" label={`Ops: ${routingMatch.routing.operationType}`} />
                        {routingMatch.operation && (
                          <Chip
                            size="small"
                            label={`Request op: ${routingMatch.operation}`}
                            color={routingMatch.operationMatched ? 'success' : 'warning'}
                            variant="outlined"
                          />
                        )}
                      </Box>

                      {!routingMatch.operationMatched && routingMatch.operation && (
                        <Alert severity="info" sx={{ mb: 1 }}>
                          Exact operation routing was not found for <strong>{routingMatch.operation}</strong>. Showing closest entity-level routing instead.
                        </Alert>
                      )}

                      {routingMatch.routing.levels.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">
                          No approval levels configured.
                        </Typography>
                      ) : (
                        [...routingMatch.routing.levels]
                          .sort((a, b) => a.level - b.level)
                          .map((level) => {
                            const levelKey = [
                              request.id || 'request',
                              routingMatch.routing?.matrixId || routingMatch.routing?.entityType,
                              level.level,
                            ].join(':');
                            const expanded = Boolean(expandedCandidateLevels[levelKey]);
                            const visibleCandidates = expanded
                              ? level.candidates
                              : level.candidates.slice(0, DETAIL_CANDIDATE_VISIBLE_LIMIT);
                            const hiddenCount = Math.max(level.candidates.length - DETAIL_CANDIDATE_VISIBLE_LIMIT, 0);

                            return (
                              <Box
                                key={`${routingMatch.routing?.matrixId || routingMatch.routing?.entityType}-detail-${level.level}`}
                                sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1.25, mb: 1 }}
                              >
                                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                                  L{level.level} {level.name} | Needed: {level.requiredCount}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Required Roles: {(level.requiredRoleCodes || []).join(', ') || '-'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" display="block">
                                  Required Permissions: {(level.requiredPermissionCodes || []).join(', ') || '-'}
                                </Typography>
                                <Typography variant="body2" sx={{ mt: 0.5, mb: 0.75 }}>
                                  Candidate Approvers: <strong>{level.candidateCount}</strong>
                                </Typography>
                                {level.candidates.length === 0 ? (
                                  <Typography variant="caption" color="error">
                                    No eligible approvers found for this level.
                                  </Typography>
                                ) : (
                                  <>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                      {visibleCandidates.map((candidate) => (
                                        <Tooltip
                                          key={`detail-${level.level}-${candidate.userId}`}
                                          title={[
                                            candidate.email,
                                            candidate.department ? `Dept: ${candidate.department}` : null,
                                            candidate.position ? `Position: ${candidate.position}` : null,
                                            candidate.roleCodes?.length ? `Roles: ${candidate.roleCodes.join(', ')}` : null,
                                          ].filter(Boolean).join(' | ')}
                                        >
                                          <Chip size="small" label={candidate.fullName} />
                                        </Tooltip>
                                      ))}
                                      {!expanded && hiddenCount > 0 && <Chip size="small" variant="outlined" label={`+${hiddenCount} more`} />}
                                    </Box>
                                    {hiddenCount > 0 && (
                                      <Box sx={{ mt: 0.75 }}>
                                        <Button
                                          size="small"
                                          variant="text"
                                          onClick={() => {
                                            onExpandedCandidateLevelsChange((prev) => ({
                                              ...prev,
                                              [levelKey]: !expanded,
                                            }));
                                          }}
                                        >
                                          {expanded ? 'Show less' : `Show all ${level.candidates.length} candidates`}
                                        </Button>
                                      </Box>
                                    )}
                                  </>
                                )}
                              </Box>
                            );
                          })
                      )}
                    </Box>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        {request && isRolePermissionRequest(request) && (
          <Button color="secondary" startIcon={<SecurityIcon />} onClick={() => onOpenRolePermission(request)}>
            Open in RBAC
          </Button>
        )}
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
});
