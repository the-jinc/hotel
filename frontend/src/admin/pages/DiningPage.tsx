import { useEffect, useState } from "react";
import useDiningStore from "../../store/diningStore";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { ArrowPathIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';
import ConfirmationDialog from "../../components/ConfirmationDialog";
import DiningFormModal from "../../components/DiningFormModal";

export default function DiningsPage() {
  const {
    dinings,
    fetchDinings,
    createDining,
    updateDining,
    deleteDining,
    loading,
    error,
    total,
    page,
    limit,
    search,
    setPage,
    setSearch
  } = useDiningStore();

  const [selectedDining, setSelectedDining] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [diningToDelete, setDiningToDelete] = useState(null);

  useEffect(() => {
    fetchDinings();
  }, [fetchDinings, page, limit, search]);

  const handleCreate = async (diningData) => {
    try {
      await createDining(diningData);
      setIsFormModalOpen(false);
      fetchDinings();
    } catch (err) {
      console.error("Error creating dining:", err);
    }
  };

  const handleUpdate = async (id, diningData) => {
    try {
      await updateDining(id, diningData);
      setIsFormModalOpen(false);
      fetchDinings();
    } catch (err) {
      console.error("Error updating dining:", err);
    }
  };

  const handleDelete = (dining) => {
    setDiningToDelete(dining);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (diningToDelete) {
      try {
        await deleteDining(diningToDelete.id);
        fetchDinings();
      } catch (err) {
        console.error("Error deleting dining:", err);
      } finally {
        setIsDeleteDialogOpen(false);
        setDiningToDelete(null);
      }
    }
  };

  const handleOpenModal = (dining = null) => {
    setSelectedDining(dining);
    setIsFormModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsFormModalOpen(false);
    setSelectedDining(null);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 lg:p-10 min-h-screen">
      <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6 md:p-8">
        {/* Header and Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b pb-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-4 md:mb-0">
            Dining Management ({total} total)
          </h2>
          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="Search dinings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center justify-center px-4 py-2 sm:px-6 sm:py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-200"
            >
              <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Add Dining Option
            </button>
          </div>
        </div>

        {/* State Indicators */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <ArrowPathIcon className="h-8 w-8 sm:h-10 sm:w-10 animate-spin text-blue-500" />
            <p className="mt-2 text-base sm:text-lg font-medium">
              Loading dining options...
            </p>
          </div>
        )}

        {error && (
          <div className="flex items-center p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg shadow-sm mb-6" role="alert">
            <ExclamationCircleIcon className="h-6 w-6 mr-3 flex-shrink-0" />
            <div>
              <p className="font-bold">Error fetching data</p>
              <p className="text-sm">{error}</p>
              <button 
                onClick={fetchDinings}
                className="mt-2 text-sm font-medium text-red-600 hover:text-red-500 flex items-center"
              >
                <ArrowPathIcon className="h-4 w-4 mr-1" />
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Dining Table */}
        {!loading && !error && (
          <>
            <div className="overflow-x-auto shadow-md rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200 text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 sm:px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-4 py-3 sm:px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-4 py-3 sm:px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Images
                    </th>
                    <th className="px-4 py-3 sm:px-6 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dinings && dinings.length > 0 ? (
                    dinings.map((dining) => (
                      <tr key={dining.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-4 py-4 sm:px-6 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {dining.name}
                          </div>
                        </td>
                        <td className="px-4 py-4 sm:px-6">
                          <div className="text-sm text-gray-600 line-clamp-2 max-w-xs">
                            {dining.description}
                          </div>
                        </td>
                        <td className="px-4 py-4 sm:px-6 whitespace-nowrap">
                          <div className="flex space-x-1">
                            {dining.images?.slice(0, 3).map((image, index) => (
                              <img 
                                key={index} 
                                src={image} 
                                alt={`Dining ${index + 1}`} 
                                className="h-8 w-8 object-cover rounded"
                              />
                            ))}
                            {dining.images?.length > 3 && (
                              <span className="text-xs text-gray-500 self-center">
                                +{dining.images.length - 3} more
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 sm:px-6 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-1 sm:space-x-2">
                            <button
                              onClick={() => handleOpenModal(dining)}
                              className="text-gray-500 hover:text-indigo-600 p-1 sm:p-2 rounded-full hover:bg-indigo-50 transition-colors duration-150"
                              title="Edit Dining Option"
                            >
                              <PencilIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(dining)}
                              className="text-gray-500 hover:text-red-600 p-1 sm:p-2 rounded-full hover:bg-red-50 transition-colors duration-150"
                              title="Delete Dining Option"
                            >
                              <TrashIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-4 py-6 sm:px-6 text-center text-gray-500 italic">
                        No dining options found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {total > limit && (
              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border rounded-md disabled:opacity-50"
                >
                  Previous
                </button>
                <span>Page {page} of {Math.ceil(total / limit)}</span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= Math.ceil(total / limit)}
                  className="px-4 py-2 border rounded-md disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {/* Modals */}
        <DiningFormModal
          isOpen={isFormModalOpen}
          onClose={handleCloseModal}
          dining={selectedDining}
          onSubmit={selectedDining ? 
            (data) => handleUpdate(selectedDining.id, data) : 
            handleCreate}
        />

        <ConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleConfirmDelete}
          title="Delete Dining Option"
          message={`Are you sure you want to permanently delete the dining option "${diningToDelete?.name}"? This action cannot be undone.`}
          confirmText="Delete"
          isDestructive={true}
        />
      </div>
    </div>
  );
}