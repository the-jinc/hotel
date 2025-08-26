import { useEffect, useState } from "react";
import useMeetingsEventsStore from "../../store/meetingAndEventsStore";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { ArrowPathIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';
import ConfirmationDialog from "../../components/ConfirmationDialog";
import MeetingsEventsFormModal from "../../components/MeetingsEventsFormModal";

export default function MeetingsAndEventsPage() {
  const {
    meetingsAndEvents,
    fetchMeetingsAndEvents,
    createMeetingsAndEvents,
    updateMeetingsAndEvents,
    deleteMeetingsAndEvents,
    meetingsAndEventsLoading: loading,
    meetingsAndEventsError: error,
  } = useMeetingsEventsStore();

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);

  useEffect(() => {
    fetchMeetingsAndEvents();
  }, [fetchMeetingsAndEvents]);

  const handleCreate = async (eventData) => {
    try {
      await createMeetingsAndEvents(eventData);
      setIsFormModalOpen(false);
      fetchMeetingsAndEvents();
    } catch (err) {
      console.error("Error creating event:", err);
    }
  };

  const handleUpdate = async (id, eventData) => {
    try {
      await updateMeetingsAndEvents(id, eventData);
      setIsFormModalOpen(false);
      fetchMeetingsAndEvents();
    } catch (err) {
      console.error("Error updating event:", err);
    }
  };

  const handleDelete = (event) => {
    setEventToDelete(event);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (eventToDelete) {
      try {
        await deleteMeetingsAndEvents(eventToDelete.id);
        fetchMeetingsAndEvents();
      } catch (err) {
        console.error("Error deleting event:", err);
      } finally {
        setIsDeleteDialogOpen(false);
        setEventToDelete(null);
      }
    }
  };

  const handleOpenModal = (event = null) => {
    setSelectedEvent(event);
    setIsFormModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsFormModalOpen(false);
    setSelectedEvent(null);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 lg:p-10 min-h-screen">
      <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6 md:p-8">
        {/* Header and Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b pb-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-4 md:mb-0">
            Meetings & Events Management
          </h2>
          <button
            onClick={() => handleOpenModal()}
            className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2 sm:px-6 sm:py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-200"
          >
            <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            Add Event
          </button>
        </div>

        {/* State Indicators */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <ArrowPathIcon className="h-8 w-8 sm:h-10 sm:w-10 animate-spin text-blue-500" />
            <p className="mt-2 text-base sm:text-lg font-medium">
              Loading events...
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
                onClick={fetchMeetingsAndEvents}
                className="mt-2 text-sm font-medium text-red-600 hover:text-red-500 flex items-center"
              >
                <ArrowPathIcon className="h-4 w-4 mr-1" />
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Events Table */}
        {!loading && !error && (
          <div className="overflow-x-auto shadow-md rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 sm:px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 sm:px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Capacity
                  </th>
                  <th className="px-4 py-3 sm:px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Event Type
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
                {meetingsAndEvents && meetingsAndEvents.length > 0 ? (
                  meetingsAndEvents.map((event) => (
                    <tr key={event.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-4 py-4 sm:px-6 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {event.name}
                        </div>
                      </td>
                      <td className="px-4 py-4 sm:px-6 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {event.capacity}
                        </div>
                      </td>
                      <td className="px-4 py-4 sm:px-6 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {event.eventType.replace('_', ' ')}
                        </div>
                      </td>
                      <td className="px-4 py-4 sm:px-6 whitespace-nowrap">
                        <div className="flex space-x-1">
                          {event.images?.slice(0, 3).map((image, index) => (
                            <img 
                              key={index} 
                              src={image} 
                              alt={`Event ${index + 1}`} 
                              className="h-8 w-8 object-cover rounded"
                            />
                          ))}
                          {event.images?.length > 3 && (
                            <span className="text-xs text-gray-500 self-center">
                              +{event.images.length - 3} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 sm:px-6 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-1 sm:space-x-2">
                          <button
                            onClick={() => handleOpenModal(event)}
                            className="text-gray-500 hover:text-indigo-600 p-1 sm:p-2 rounded-full hover:bg-indigo-50 transition-colors duration-150"
                            title="Edit Event"
                          >
                            <PencilIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(event)}
                            className="text-gray-500 hover:text-red-600 p-1 sm:p-2 rounded-full hover:bg-red-50 transition-colors duration-150"
                            title="Delete Event"
                          >
                            <TrashIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-4 py-6 sm:px-6 text-center text-gray-500 italic">
                      No meetings or events found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Modals */}
        <MeetingsEventsFormModal
          isOpen={isFormModalOpen}
          onClose={handleCloseModal}
          event={selectedEvent}
          onSubmit={selectedEvent ? 
            (data) => handleUpdate(selectedEvent.id, data) : 
            handleCreate}
        />

        <ConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleConfirmDelete}
          title="Delete Event"
          message={`Are you sure you want to permanently delete the event "${eventToDelete?.name}"? This action cannot be undone.`}
          confirmText="Delete"
          isDestructive={true}
        />
      </div>
    </div>
  );
}