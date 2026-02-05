// packages/frontend/src/utils/asyncExportUtils.ts
'use client';

/**
 * Async Export Utilities for Large Datasets
 * Handles exports >50k rows with progress tracking and email notification
 */

export interface AsyncExportJob {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number; // 0-100
  totalRows: number;
  processedRows: number;
  startedAt: string;
  completedAt?: string;
  downloadUrl?: string;
  error?: string;
}

export interface AsyncExportOptions {
  reportName: string;
  format: 'xlsx' | 'csv';
  filters: Record<string, any>;
  totalRows: number;
  userEmail: string;
  onProgress?: (progress: number) => void;
}

class AsyncExportManager {
  private jobs: Map<string, AsyncExportJob> = new Map();
  private readonly SYNC_LIMIT = 50000;

  /**
   * Check if export should be async based on row count
   */
  shouldUseAsync(rowCount: number): boolean {
    return rowCount > this.SYNC_LIMIT;
  }

  /**
   * Create async export job
   */
  async createJob(options: AsyncExportOptions): Promise<AsyncExportJob> {
    const jobId = `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const job: AsyncExportJob = {
      jobId,
      status: 'pending',
      progress: 0,
      totalRows: options.totalRows,
      processedRows: 0,
      startedAt: new Date().toISOString()
    };

    this.jobs.set(jobId, job);

    // Start processing in background
    this.processJob(jobId, options);

    return job;
  }

  /**
   * Process export job
   */
  private async processJob(jobId: string, options: AsyncExportOptions) {
    const job = this.jobs.get(jobId);
    if (!job) return;

    try {
      job.status = 'processing';
      this.jobs.set(jobId, job);

      // Simulate processing (in real implementation, call backend API)
      // Backend would handle chunked export and file generation
      
      // Mock processing with progress updates
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        job.progress = i;
        job.processedRows = Math.floor((i / 100) * options.totalRows);
        this.jobs.set(jobId, job);
        
        if (options.onProgress) {
          options.onProgress(i);
        }
      }

      // Mark as completed
      job.status = 'completed';
      job.progress = 100;
      job.processedRows = options.totalRows;
      job.completedAt = new Date().toISOString();
      job.downloadUrl = `/api/exports/${jobId}/download`; // Mock URL
      this.jobs.set(jobId, job);

      // Send email notification (mock)
      await this.sendEmailNotification(options.userEmail, job);

    } catch (error) {
      job.status = 'failed';
      job.error = error instanceof Error ? error.message : 'Export failed';
      this.jobs.set(jobId, job);
    }
  }

  /**
   * Get job status
   */
  getJobStatus(jobId: string): AsyncExportJob | undefined {
    return this.jobs.get(jobId);
  }

  /**
   * Send email notification (mock)
   */
  private async sendEmailNotification(email: string, job: AsyncExportJob): Promise<void> {
    console.log(`📧 Email notification sent to ${email}`);
    console.log(`Export job ${job.jobId} completed. Download: ${job.downloadUrl}`);
    
    // In real implementation, call backend API:
    // await apiClient.post('/api/notifications/send-export-email', {
    //   email,
    //   jobId: job.jobId,
    //   downloadUrl: job.downloadUrl
    // });
  }

  /**
   * Download completed export
   */
  async downloadExport(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    
    if (!job) {
      throw new Error('Job not found');
    }

    if (job.status !== 'completed') {
      throw new Error('Export not yet completed');
    }

    if (!job.downloadUrl) {
      throw new Error('Download URL not available');
    }

    // In real implementation, fetch from backend
    // window.open(job.downloadUrl, '_blank');
    console.log(`Downloading export from ${job.downloadUrl}`);
  }

  /**
   * Cancel export job
   */
  async cancelJob(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    
    if (!job) {
      throw new Error('Job not found');
    }

    if (job.status === 'completed') {
      throw new Error('Cannot cancel completed job');
    }

    job.status = 'failed';
    job.error = 'Cancelled by user';
    this.jobs.set(jobId, job);
  }

  /**
   * Clean up old jobs (>24 hours)
   */
  cleanupOldJobs(): void {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    this.jobs.forEach((job, jobId) => {
      const startedAt = new Date(job.startedAt);
      if (startedAt < oneDayAgo) {
        this.jobs.delete(jobId);
      }
    });
  }
}

// Singleton instance
export const asyncExportManager = new AsyncExportManager();

/**
 * Hook-friendly wrapper
 */
export const useAsyncExport = () => {
  const createExport = async (options: AsyncExportOptions) => {
    if (asyncExportManager.shouldUseAsync(options.totalRows)) {
      return await asyncExportManager.createJob(options);
    } else {
      throw new Error('Row count below async threshold. Use sync export.');
    }
  };

  const getStatus = (jobId: string) => {
    return asyncExportManager.getJobStatus(jobId);
  };

  const downloadExport = (jobId: string) => {
    return asyncExportManager.downloadExport(jobId);
  };

  const cancelExport = (jobId: string) => {
    return asyncExportManager.cancelJob(jobId);
  };

  return {
    createExport,
    getStatus,
    downloadExport,
    cancelExport,
    shouldUseAsync: (rowCount: number) => asyncExportManager.shouldUseAsync(rowCount)
  };
};
