import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "react-hot-toast";
import { XMarkIcon, ArrowPathIcon, UserCircleIcon, CheckIcon } from "@heroicons/react/24/outline";
import ConfirmationDialog from './ConfirmationDialog'; // Assuming ConfirmationDialog is in the same directory or adjust path

const schema = yup.object().shape({
  name: yup.string().required("Name is required").min(2, "Name must be at least 2 characters"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().min(6, "Password must be at least 6 characters").transform((value) => value || undefined).optional(),
});

export default function EditMyAccountModal({ user, onClose, onSave }) {
  const [isSaving, setIsSaving] = useState(false);
  const [isConfirmSaveOpen, setIsConfirmSaveOpen] = useState(false);
  const [dataToSave, setDataToSave] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    if (user) {
      reset({ name: user.name, email: user.email, password: "" });
    }
  }, [user, reset]);

  const onSubmit = (data) => {
    // Instead of saving directly, we open the confirmation dialog
    setDataToSave(data);
    setIsConfirmSaveOpen(true);
  };
  
  const handleConfirmSave = async () => {
    if (!dataToSave) return;
    
    setIsSaving(true);
    setIsConfirmSaveOpen(false); // Close the dialog immediately
    
    try {
      const { password, ...rest } = dataToSave;
      const payload = password ? dataToSave : rest;
      
      await onSave(payload);
      toast.success("Account updated successfully!");
      onClose();
    } catch (err) {
      console.error("EditMyAccountModal error:", err.response?.data || err.message);
      toast.error(err?.response?.data?.message || "Failed to update account. Please try again.");
    } finally {
      setIsSaving(false);
      setDataToSave(null);
    }
  };

  if (!user) return null;

  return (
    <>
      <div className="fixed inset-0 modal-overlay flex justify-center items-center z-[1000] p-4 animate-fade-in" aria-modal="true" role="dialog" onClick={onClose}>
        <div className="relative bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg scale-95 animate-scale-up max-h-[95vh] flex flex-col" aria-labelledby="modal-title" onClick={(e) => e.stopPropagation()}>
          
          <div className="flex justify-between items-center pb-4 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center">
              <UserCircleIcon className="h-6 w-6 text-blue-600 mr-3" />
              <h3 id="modal-title" className="text-2xl font-bold text-gray-900">Edit My Account</h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
              aria-label="Close modal"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="flex-grow overflow-y-auto py-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  id="name"
                  type="text"
                  {...register("name")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Your Name"
                  aria-invalid={errors.name ? "true" : "false"}
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  id="email"
                  type="email"
                  {...register("email")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="your-email@example.com"
                  aria-invalid={errors.email ? "true" : "false"}
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">New Password (optional)</label>
                <input
                  id="password"
                  type="password"
                  {...register("password")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="••••••••"
                  aria-invalid={errors.password ? "true" : "false"}
                />
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
              </div>
            </form>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-gray-700 font-semibold bg-gray-200 rounded-lg shadow-sm hover:bg-gray-300 transition-colors duration-200"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit(onSubmit)}
              className="flex items-center px-6 py-2.5 text-white font-semibold bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 transition-colors duration-200"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckIcon className="h-5 w-5 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      {dataToSave && (
        <ConfirmationDialog
          isOpen={isConfirmSaveOpen}
          onClose={() => setIsConfirmSaveOpen(false)}
          onConfirm={handleConfirmSave}
          title="Confirm Account Changes"
          message="Are you sure you want to save these changes to your account?"
          confirmText="Save"
        />
      )}
    </>
  );
}