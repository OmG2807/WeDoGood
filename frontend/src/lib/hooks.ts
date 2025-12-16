"use client";

import { useState, useEffect, useCallback } from "react";
import { getJobStatus, type JobStatus } from "./api";

/**
 * Hook for polling job status
 */
export function useJobPolling(jobId: string | null, interval: number = 1000) {
  const [job, setJob] = useState<JobStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) {
      setJob(null);
      return;
    }

    // Initial fetch
    const fetchStatus = async () => {
      try {
        const response = await getJobStatus(jobId);
        if (response.success && response.data) {
          setJob(response.data);
        }
      } catch (err) {
        setError("Failed to fetch job status");
      }
    };

    fetchStatus();

    // Set up polling if job is not complete
    const pollInterval = setInterval(async () => {
      try {
        const response = await getJobStatus(jobId);
        if (response.success && response.data) {
          setJob(response.data);
          
          // Stop polling if job is complete
          if (response.data.status === "completed" || response.data.status === "failed") {
            clearInterval(pollInterval);
          }
        }
      } catch (err) {
        console.error("Failed to fetch job status:", err);
      }
    }, interval);

    return () => clearInterval(pollInterval);
  }, [jobId, interval]);

  return { job, error, setJob };
}

/**
 * Hook for form state management
 */
export function useFormState<T extends Record<string, string>>(initialState: T) {
  const [formData, setFormData] = useState<T>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData(initialState);
    setSubmitStatus({ type: null, message: "" });
  }, [initialState]);

  const setSuccess = useCallback((message: string) => {
    setSubmitStatus({ type: "success", message });
  }, []);

  const setError = useCallback((message: string) => {
    setSubmitStatus({ type: "error", message });
  }, []);

  return {
    formData,
    setFormData,
    isSubmitting,
    setIsSubmitting,
    submitStatus,
    handleChange,
    resetForm,
    setSuccess,
    setError,
  };
}

/**
 * Hook for async data fetching
 */
export function useFetch<T>(
  fetchFn: () => Promise<{ success: boolean; data?: T; error?: string }>,
  deps: React.DependencyList = []
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetchFn();
      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError(response.error || "Failed to fetch data");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [fetchFn]);

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps]);

  return { data, isLoading, error, refetch, setData };
}

