#!/bin/bash
# Integrate Four-Eyes Approval System with Existing Backend

echo "🔗 Integrating Four-Eyes Approval System..."

echo ""
echo "📝 To integrate the approval system, add the following to your main routes file:"
echo ""
echo "// Add this import to your routes/index.ts:"
echo "import approvalRoutes from './approval.routes';"
echo ""
echo "// Add this route registration:"
echo "app.use('/api/approval', approvalRoutes);"
echo ""

echo "🧪 Test the new approval endpoints:"
echo "- POST /api/approval/requests          - Create approval request"
echo "- GET  /api/approval/requests/:id      - Get approval request"
echo "- POST /api/approval/requests/:id/approve - Approve request"
echo "- POST /api/approval/requests/:id/reject  - Reject request"
echo "- GET  /api/approval/pending/:approverId  - Get pending approvals"
echo "- GET  /api/approval/health             - Health check"
echo ""

echo "✅ Four-Eyes Approval System integration guidance provided!"
