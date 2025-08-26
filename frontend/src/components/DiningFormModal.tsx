import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "react-hot-toast";
import { XMarkIcon, ArrowPathIcon, PlusCircleIcon, PencilSquareIcon, CheckIcon } from "@heroicons/react/24/outline";
import ImageUploader from "./ImageUploader";
import ConfirmationDialog from './ConfirmationDialog';

const schema = yup.object().shape({
  name: yup.string().required("Dining name is required").min(3, "Name must be at least 3 characters"),
  description: yup.string().required("Description is required").min(10, "Description must be at least 10 characters"),
});

export default function DiningFormModal({ isOpen, dining, onClose, onSubmit }) {
  // Only render if isOpen is true
  if (!isOpen) return null;

  const isEdit = !!dining;
  const [imageFiles, setImageFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [formDataToSubmit, setFormDataToSubmit] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    if (dining) {
      reset({
        name: dining.name,
        description: dining.description,
      });
      setImageFiles(dining.images || []);
    } else {
      reset({
        name: "",
        description: "",
      });
      setImageFiles([]);
    }
  }, [dining, reset, isOpen]); // Added isOpen to dependency array

  const handleFormSubmit = (data) => {
    if (imageFiles.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }
    
    setFormDataToSubmit(data);
    if (isEdit) {
      setIsConfirmOpen(true);
    } else {
      handleConfirmSubmit();
    }
  };

  const handleConfirmSubmit = async () => {
    if (!formDataToSubmit) return;
    
    setIsConfirmOpen(false);
    setIsSubmitting(true);
    
    try {
      const diningData = {
        ...formDataToSubmit,
        images: [],
      };

      // Process images (keep existing URLs or upload new files)
      const processedImages = await Promise.all(
        imageFiles.map(async (file) => {
          if (typeof file === 'string') return file;
          return await uploadImage(file);
        })
      );
      
      diningData.images = processedImages;

      await onSubmit(diningData);
      toast.success(`Dining option ${isEdit ? 'updated' : 'created'} successfully!`);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Something went wrong! Please try again.");
    } finally {
      setIsSubmitting(false);
      setFormDataToSubmit(null);
    }
  };

  // Mock image upload function - replace with your actual implementation
  const uploadImage = async (file) => {
    return URL.createObjectURL(file); // Just for demo
  };

  return (
    <>
      <div 
        className="fixed inset-0 modal-overlay flex justify-center items-center z-[1000] p-4 animate-fade-in"
         aria-modal="true" 
        role="dialog"
        onClick={onClose}
      >
        <div 
          className="relative bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg max-h-[95vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal header with close button */}
          <div className="flex justify-between items-center pb-4 border-b border-gray-200">
            <div className="flex items-center">
              {isEdit ? (
                <PencilSquareIcon className="h-6 w-6 text-blue-600 mr-3" />
              ) : (
                <PlusCircleIcon className="h-6 w-6 text-green-600 mr-3" />
              )}
              <h3 className="text-2xl font-bold text-gray-900">
                {isEdit ? "Edit Dining Option" : "Create New Dining Option"}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
              aria-label="Close modal"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Modal content */}
          <div className="flex-grow overflow-y-auto py-6">
            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
              {/* Form fields remain the same */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Dining Name</label>
                <input
                  id="name"
                  type="text"
                  {...register("name")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. Main Restaurant, Poolside Bar"
                  aria-invalid={errors.name ? "true" : "false"}
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  id="description"
                  {...register("description")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe the dining experience..."
                  rows="4"
                  aria-invalid={errors.description ? "true" : "false"}
                />
                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
              </div>
              
              <ImageUploader 
                onFileSelect={setImageFiles} 
                initialImages={dining?.images}
                label="Dining Images"
                multiple={true}
              />

              {/* Image Previews */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Selected Images</label>
                <div className="flex flex-wrap gap-3">
                  {imageFiles.map((file, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={typeof file === 'string' ? file : URL.createObjectURL(file)}
                        alt={`Dining preview ${index + 1}`}
                        className="h-24 w-24 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => setImageFiles(prev => prev.filter((_, i) => i !== index))}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Remove image"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                {imageFiles.length === 0 && (
                  <p className="text-sm text-gray-500">No images selected yet</p>
                )}
              </div>
            </form>
          </div>

          {/* Modal footer */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-gray-700 font-semibold bg-gray-200 rounded-lg shadow-sm hover:bg-gray-300 transition-colors duration-200"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit(handleFormSubmit)}
              className="flex items-center px-6 py-2.5 text-white font-semibold bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 transition-colors duration-200"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckIcon className="h-5 w-5 mr-2" />
                  {isEdit ? "Update Dining" : "Create Dining"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Confirmation dialog for edits */}
      {isEdit && (
        <ConfirmationDialog
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={handleConfirmSubmit}
          title={"Confirm Dining Update"}
          message={"Are you sure you want to save the changes for this dining option?"}
          confirmText={"Update"}
        />
      )}
    </>
  );
}