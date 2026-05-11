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
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  AttachFile as AttachFileIcon,
  DataObject as DataObjectIcon,
  Download as DownloadIcon,
  ExpandMore as ExpandMoreIcon,
  Security as SecurityIcon,
  Analytics as AnalyticsIcon,
} from '@mui/icons-material';
import { ApprovalRequest, RequestRoutingMatch } from '../types';
import { ConsolidatedAssessmentApprovalContent } from './ConsolidatedAssessmentApprovalContent';

const DETAIL_CANDIDATE_VISIBLE_LIMIT = 24;
const REDACTED_KEYS = new Set(['password', 'token', 'accessToken', 'refreshToken', 'authorization', 'secret']);

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
                <Chip label={request.priority.toUpperCase()} color={getPriorityColor(request.priority) as any} size="small" sx={{ mt: 0.5 }} />
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
                  <Chip label={request.riskLevel.toUpperCase()} color={getPriorityColor(request.riskLevel) as any} size="small" sx={{ mt: 0.5 }} />
                </Grid>
              )}

              {/* SPECIALIZED CONTENT: INDIVIDUAL ASSESSMENT */}
              {(request.entityType === 'INDIVIDUAL_ASSESSMENT_CONSOLIDATED' || request.requestType === 'INDIVIDUAL_ASSESSMENT') && (
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
