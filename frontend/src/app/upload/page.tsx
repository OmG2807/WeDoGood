"use client";

import { useState, useCallback, useEffect } from "react";
import { Upload, FileUp, CheckCircle, AlertCircle, Loader2, X, Download, RefreshCw } from "lucide-react";
import { uploadCSV, getAllJobs, type JobStatus } from "@/lib/api";
import { getStatusColor } from "@/lib/utils";
import { useJobPolling } from "@/lib/hooks";

export default function BulkUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [recentJobs, setRecentJobs] = useState<JobStatus[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Use the job polling hook
  const { job: currentJob, setJob: setCurrentJob } = useJobPolling(currentJobId);

  // Fetch recent jobs on mount and when current job completes
  useEffect(() => {
    const fetchRecentJobs = async () => {
      try {
        const response = await getAllJobs();
        if (response.success && response.data) {
          setRecentJobs(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch recent jobs:", err);
      }
    };
    fetchRecentJobs();
  }, [currentJob?.status]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.name.endsWith(".csv")) {
      setFile(droppedFile);
      setError(null);
    } else {
      setError("Please upload a CSV file");
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile?.name.endsWith(".csv")) {
      setFile(selectedFile);
      setError(null);
    } else if (selectedFile) {
      setError("Please upload a CSV file");
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const response = await uploadCSV(file);
      
      if (response.success && response.data?.job_id) {
        setCurrentJobId(response.data.job_id);
        setFile(null);
      } else {
        setError(response.error || "Failed to upload file");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const downloadSampleCSV = () => {
    const csvContent = `ngo_id,month,people_helped,events_conducted,funds_utilized
NGO-001,2024-01,150,5,50000
NGO-002,2024-01,200,8,75000
NGO-003,2024-01,100,3,25000
NGO-001,2024-02,175,6,55000
NGO-002,2024-02,220,9,80000`;
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sample_reports.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const refreshJobs = async () => {
    const response = await getAllJobs();
    if (response.success && response.data) {
      setRecentJobs(response.data);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10 animate-fade-in">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--color-terracotta)]/10 mb-4">
          <Upload className="w-8 h-8 text-[var(--color-terracotta)]" />
        </div>
        <h1 className="font-['Playfair_Display'] text-4xl font-bold text-[var(--color-text-primary)] mb-3">
          Bulk Report Upload
        </h1>
        <p className="text-[var(--color-text-secondary)]">
          Upload a CSV file to submit multiple reports at once
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="space-y-6 animate-fade-in animate-delay-1">
          {/* Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById("file-input")?.click()}
            className={`upload-zone rounded-2xl p-8 text-center cursor-pointer ${isDragging ? "active" : ""} ${file ? "bg-[var(--color-sage)]/5 border-[var(--color-sage)]" : "bg-white"}`}
          >
            <input type="file" id="file-input" accept=".csv" onChange={handleFileSelect} className="hidden" />
            
            {file ? (
              <div className="space-y-3">
                <div className="w-14 h-14 rounded-xl bg-[var(--color-sage)]/10 flex items-center justify-center mx-auto">
                  <FileUp className="w-7 h-7 text-[var(--color-sage)]" />
                </div>
                <p className="font-semibold text-[var(--color-text-primary)]">{file.name}</p>
                <p className="text-sm text-[var(--color-text-muted)]">{(file.size / 1024).toFixed(1)} KB</p>
                <button
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  className="inline-flex items-center gap-1 text-sm text-[var(--color-error)] hover:underline"
                >
                  <X className="w-4 h-4" /> Remove file
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-14 h-14 rounded-xl bg-[var(--color-bg-secondary)] flex items-center justify-center mx-auto">
                  <Upload className="w-7 h-7 text-[var(--color-text-muted)]" />
                </div>
                <p className="font-semibold text-[var(--color-text-primary)]">Drop your CSV file here</p>
                <p className="text-sm text-[var(--color-text-muted)]">or click to browse</p>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--color-error)]/10 text-[var(--color-error)]">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="btn-primary w-full py-4 rounded-xl text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Uploading...</>
            ) : (
              <><FileUp className="w-5 h-5" /> Upload & Process</>
            )}
          </button>

          {/* Sample CSV Download */}
          <button
            onClick={downloadSampleCSV}
            className="w-full py-3 rounded-xl border-2 border-[var(--color-bg-accent)] text-[var(--color-text-secondary)] font-medium flex items-center justify-center gap-2 hover:border-[var(--color-sage)] hover:text-[var(--color-sage)] transition-colors"
          >
            <Download className="w-4 h-4" /> Download Sample CSV
          </button>

          {/* CSV Format Info */}
          <div className="p-4 bg-[var(--color-cream)] rounded-xl">
            <p className="text-sm font-semibold text-[var(--color-terracotta)] mb-2">CSV Format</p>
            <code className="text-xs text-[var(--color-text-secondary)] block bg-white p-3 rounded-lg overflow-x-auto">
              ngo_id,month,people_helped,events_conducted,funds_utilized
            </code>
          </div>
        </div>

        {/* Job Status Section */}
        <div className="space-y-6 animate-fade-in animate-delay-2">
          {/* Current Job Progress */}
          {currentJob && (
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-[var(--color-text-primary)]">Current Job</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(currentJob.status)}`}>
                  {currentJob.status.charAt(0).toUpperCase() + currentJob.status.slice(1)}
                </span>
              </div>

              <p className="text-sm text-[var(--color-text-muted)] mb-4">{currentJob.filename}</p>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-[var(--color-text-secondary)]">
                    Processed {currentJob.processed_rows} of {currentJob.total_rows} rows
                  </span>
                  <span className="font-semibold text-[var(--color-sage)]">{currentJob.progress}%</span>
                </div>
                <div className="h-3 bg-[var(--color-bg-secondary)] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      currentJob.status === "processing" ? "progress-bar-animated" : "bg-[var(--color-sage)]"
                    }`}
                    style={{ width: `${currentJob.progress}%` }}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[var(--color-success)]/10 rounded-lg p-3">
                  <p className="text-2xl font-bold text-[var(--color-success)]">{currentJob.successful_rows}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">Successful</p>
                </div>
                <div className="bg-[var(--color-error)]/10 rounded-lg p-3">
                  <p className="text-2xl font-bold text-[var(--color-error)]">{currentJob.failed_rows}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">Failed</p>
                </div>
              </div>

              {/* Errors */}
              {currentJob.errors?.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-semibold text-[var(--color-error)] mb-2">
                    Errors ({currentJob.errors.length})
                  </p>
                  <div className="max-h-32 overflow-y-auto space-y-2">
                    {currentJob.errors.slice(0, 5).map((err, idx) => (
                      <div key={idx} className="text-xs bg-[var(--color-error)]/5 text-[var(--color-error)] p-2 rounded">
                        Row {err.row}: {err.error}
                      </div>
                    ))}
                    {currentJob.errors.length > 5 && (
                      <p className="text-xs text-[var(--color-text-muted)]">+{currentJob.errors.length - 5} more errors</p>
                    )}
                  </div>
                </div>
              )}

              {/* Completion Status */}
              {currentJob.status === "completed" && (
                <div className="mt-4 flex items-center gap-2 text-[var(--color-success)]">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">Processing complete!</span>
                </div>
              )}
            </div>
          )}

          {/* Recent Jobs */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[var(--color-text-primary)]">Recent Jobs</h3>
              <button onClick={refreshJobs} className="text-[var(--color-text-muted)] hover:text-[var(--color-sage)] transition-colors">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {recentJobs.length === 0 ? (
              <p className="text-sm text-[var(--color-text-muted)] text-center py-4">
                No jobs yet. Upload a CSV to get started!
              </p>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {recentJobs.slice(0, 5).map((job) => (
                  <div
                    key={job.job_id}
                    onClick={() => { setCurrentJobId(job.job_id); setCurrentJob(job); }}
                    className="flex items-center justify-between p-3 bg-[var(--color-bg-secondary)] rounded-lg cursor-pointer hover:bg-[var(--color-bg-accent)] transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-[var(--color-text-primary)] truncate max-w-[150px]">
                        {job.filename}
                      </p>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        {job.successful_rows}/{job.total_rows} rows
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                      {job.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
