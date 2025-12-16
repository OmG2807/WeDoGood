"use client";

import { FileText, Send, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { submitReport } from "@/lib/api";
import { getMonthOptions } from "@/lib/utils";
import { useFormState } from "@/lib/hooks";

const initialFormState = {
  ngo_id: "",
  month: "",
  people_helped: "",
  events_conducted: "",
  funds_utilized: "",
};

export default function SubmitReportPage() {
  const {
    formData,
    setFormData,
    isSubmitting,
    setIsSubmitting,
    submitStatus,
    handleChange,
    resetForm,
    setSuccess,
    setError,
  } = useFormState(initialFormState);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await submitReport({
        ngo_id: formData.ngo_id,
        month: formData.month,
        people_helped: parseInt(formData.people_helped) || 0,
        events_conducted: parseInt(formData.events_conducted) || 0,
        funds_utilized: parseFloat(formData.funds_utilized) || 0,
      });

      if (response.success) {
        setSuccess("Report submitted successfully! Thank you for your contribution.");
        resetForm();
      } else {
        setError(response.error || "Failed to submit report. Please try again.");
      }
    } catch (error) {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10 animate-fade-in">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--color-sage)]/10 mb-4">
          <FileText className="w-8 h-8 text-[var(--color-sage)]" />
        </div>
        <h1 className="font-['Playfair_Display'] text-4xl font-bold text-[var(--color-text-primary)] mb-3">
          Submit Monthly Report
        </h1>
        <p className="text-[var(--color-text-secondary)]">
          Share your NGO&apos;s impact data for the selected month
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl shadow-sm p-8 animate-fade-in animate-delay-1">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* NGO ID */}
          <div>
            <label htmlFor="ngo_id" className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2">
              NGO ID <span className="text-[var(--color-error)]">*</span>
            </label>
            <input
              type="text"
              id="ngo_id"
              name="ngo_id"
              value={formData.ngo_id}
              onChange={handleChange}
              placeholder="e.g., NGO-001 or your registered ID"
              required
              className="input-field w-full px-4 py-3 rounded-xl bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]"
            />
          </div>

          {/* Month */}
          <div>
            <label htmlFor="month" className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2">
              Reporting Month <span className="text-[var(--color-error)]">*</span>
            </label>
            <select
              id="month"
              name="month"
              value={formData.month}
              onChange={(e) => setFormData((prev) => ({ ...prev, month: e.target.value }))}
              required
              className="input-field w-full px-4 py-3 rounded-xl bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] cursor-pointer"
            >
              <option value="">Select a month</option>
              {getMonthOptions().map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="people_helped" className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2">
                People Helped <span className="text-[var(--color-error)]">*</span>
              </label>
              <input
                type="number"
                id="people_helped"
                name="people_helped"
                value={formData.people_helped}
                onChange={handleChange}
                placeholder="0"
                min="0"
                required
                className="input-field w-full px-4 py-3 rounded-xl bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]"
              />
            </div>

            <div>
              <label htmlFor="events_conducted" className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2">
                Events <span className="text-[var(--color-error)]">*</span>
              </label>
              <input
                type="number"
                id="events_conducted"
                name="events_conducted"
                value={formData.events_conducted}
                onChange={handleChange}
                placeholder="0"
                min="0"
                required
                className="input-field w-full px-4 py-3 rounded-xl bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]"
              />
            </div>

            <div>
              <label htmlFor="funds_utilized" className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2">
                Funds (₹) <span className="text-[var(--color-error)]">*</span>
              </label>
              <input
                type="number"
                id="funds_utilized"
                name="funds_utilized"
                value={formData.funds_utilized}
                onChange={handleChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
                className="input-field w-full px-4 py-3 rounded-xl bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]"
              />
            </div>
          </div>

          {/* Status Message */}
          {submitStatus.type && (
            <div className={`flex items-center gap-3 p-4 rounded-xl ${
              submitStatus.type === "success" 
                ? "bg-[var(--color-success)]/10 text-[var(--color-success)]" 
                : "bg-[var(--color-error)]/10 text-[var(--color-error)]"
            }`}>
              {submitStatus.type === "success" ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <p className="text-sm font-medium">{submitStatus.message}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full py-4 rounded-xl text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Submit Report
              </>
            )}
          </button>
        </form>
      </div>

      {/* Help Text */}
      <div className="mt-6 p-4 bg-[var(--color-cream)] rounded-xl animate-fade-in animate-delay-2">
        <p className="text-sm text-[var(--color-terracotta)]">
          <strong>Note:</strong> If you submit a report for the same NGO and month twice, 
          the newer values will replace the previous ones.
        </p>
      </div>
    </div>
  );
}
