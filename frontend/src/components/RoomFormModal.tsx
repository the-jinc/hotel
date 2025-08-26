import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "react-hot-toast";
import useRoomStore from "../store/roomStore";
import ImageUploader from "./ImageUploader";
import { XMarkIcon, ArrowPathIcon, PlusCircleIcon, PencilSquareIcon, CheckIcon } from "@heroicons/react/24/outline";
import ConfirmationDialog from './ConfirmationDialog';

const schema = yup.object().shape({
  type: yup.string().required("Room type is required").min(3, "Type must be at least 3 characters"),
  price: yup.number().required("Price is required").min(0.01, "Price must be greater than 0"),
  quantity: yup.number().required("Quantity is required").integer().min(1, "Quantity must be at least 1"),
  description: yup.string().required("Description is required").min(10, "Description must be at least 10 characters"),
});

export default function RoomFormModal({ room, onClose }) {
  const isEdit = !!room;
  const { createRoom, updateRoom } = useRoomStore();
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
      type: "",
      price: "",
      description: "",
      quantity: "",
    },
  });

  useEffect(() => {
    if (room) {
      reset({
        type: room.type,
        price: room.price,
        quantity: room.quantity,
        description: room.description,
      });
      setImageFiles(room.images || []);
    }
  }, [room, reset]);

  const onSubmit = (data) => {
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
      const roomData = {
        ...formDataToSubmit,
        price: parseFloat(formDataToSubmit.price),
        quantity: parseInt(formDataToSubmit.quantity),
        images: [],
      };

      // Upload new images and keep existing URLs
      const processedImages = await Promise.all(
        imageFiles.map(async (file) => {
          if (typeof file === 'string') {
            return file; // Keep existing URLs
          }
          return await uploadImage(file); // Upload new files
        })
      );
      
      roomData.images = processedImages;

      if (isEdit) {
        await updateRoom(room.id, roomData);
        toast.success("Room updated successfully!");
      } else {
        await createRoom(roomData);
        toast.success("Room created successfully!");
      }

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
    // In a real app, you would upload to Cloudinary, S3, etc.
    return URL.createObjectURL(file); // Just for demo
  };

  return (
    <>
      <div className="fixed inset-0 modal-overlay flex justify-center items-center z-[1000] p-4 animate-fade-in" aria-modal="true" role="dialog" onClick={onClose}>
        <div className="relative bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg scale-95 animate-scale-up max-h-[95vh] flex flex-col" aria-labelledby="modal-title" onClick={(e) => e.stopPropagation()}>
          
          <div className="flex justify-between items-center pb-4 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center">
              {isEdit ? (
                <PencilSquareIcon className="h-6 w-6 text-blue-600 mr-3" />
              ) : (
                <PlusCircleIcon className="h-6 w-6 text-green-600 mr-3" />
              )}
              <h3 id="modal-title" className="text-2xl font-bold text-gray-900">
                {isEdit ? "Edit Room" : "Create New Room"}
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

          <div className="flex-grow overflow-y-auto py-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Room Type</label>
                <input
                  id="type"
                  type="text"
                  {...register("type")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. Single, Deluxe, Suite"
                  aria-invalid={errors.type ? "true" : "false"}
                />
                {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>}
              </div>

              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Price per night ($)</label>
                <input
                  id="price"
                  type="number"
                  step="0.01"
                  {...register("price")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. 99.99"
                  aria-invalid={errors.price ? "true" : "false"}
                />
                {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>}
              </div>

              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">Available Quantity</label>
                <input
                  id="quantity"
                  type="number"
                  {...register("quantity")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. 5"
                  aria-invalid={errors.quantity ? "true" : "false"}
                />
                {errors.quantity && <p className="mt-1 text-sm text-red-600">{errors.quantity.message}</p>}
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  id="description"
                  {...register("description")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe the room's features and amenities..."
                  rows="4"
                  aria-invalid={errors.description ? "true" : "false"}
                />
                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
              </div>
              
              <ImageUploader 
                onFileSelect={setImageFiles} 
                initialImages={room?.images}
                label="Room Images"
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
                        alt={`Room preview ${index + 1}`}
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

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 flex-shrink-0">
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
              onClick={handleSubmit(onSubmit)}
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
                  {isEdit ? "Update Room" : "Create Room"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {isEdit && (
        <ConfirmationDialog
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={handleConfirmSubmit}
          title={"Confirm Room Update"}
          message={"Are you sure you want to save the changes for this room?"}
          confirmText={"Update"}
        />
      )}
    </>
  );
}