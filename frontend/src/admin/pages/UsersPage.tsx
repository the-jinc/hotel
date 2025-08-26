import { useEffect, useState } from "react";
import useUserStore from "../../store/userStore";
import EditUserModal from "../../components/EditUserModal";
import EditMyAccountModal from "../../components/EditMyAccountModal";
import CreateUserModal from "../../components/CreateUserModal";
import ConfirmationDialog from "../../components/ConfirmationDialog";
import { PencilIcon, TrashIcon, UserPlusIcon, Cog6ToothIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { ExclamationCircleIcon, ArrowPathIcon } from '@heroicons/react/24/solid';

export default function UsersPage() {
  const {
    users,
    fetchUsers,
    createUser,
    deleteUser,
    updateUser,
    updateCurrentUser,
    fetchCurrentUser,
    currentUser,
    loading,
    error,
    page,
    limit,
    total,
    setPage,
    setSearch,
  } = useUserStore();

  const [selectedUser, setSelectedUser] = useState(null);
  const [editMyAccountOpen, setEditMyAccountOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    fetchUsers();
    fetchCurrentUser();
  }, [page, searchInput]);

  const handleSave = async (formData) => {
    await updateUser(selectedUser.id, formData);
    setSelectedUser(null);
  };

  const handleMyAccountSave = async (formData) => {
    try {
      await updateCurrentUser(formData);
      setEditMyAccountOpen(false);
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const totalPages = Math.ceil(total / limit);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    setSearch(value);
    setPage(1);
  };

  const handleCreateUser = async (formData) => {
    await createUser(formData);
    setCreateModalOpen(false);
    fetchUsers();
  };

  const handleDelete = (user) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };
  
  const handleConfirmDelete = async () => {
    if (userToDelete) {
      await deleteUser(userToDelete.id);
      setUserToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 lg:p-10 min-h-screen">
      <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6 md:p-8">
        {/* Header and Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b pb-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-4 md:mb-0">User Management</h2>
          <div className="flex flex-col sm:flex-row flex-wrap gap-2 md:gap-4">
            <button
              onClick={() => setCreateModalOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2 sm:px-6 sm:py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-200"
            >
              <UserPlusIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Add User
            </button>
            <button
              onClick={() => setEditMyAccountOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2 sm:px-6 sm:py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg shadow-md hover:bg-gray-300 transition-colors duration-200"
            >
              <Cog6ToothIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Edit My Account
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="mb-6 sm:mb-8 relative max-w-lg">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchInput}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-200 text-sm sm:text-base"
          />
        </div>

        {/* State Indicators */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <ArrowPathIcon className="h-8 w-8 sm:h-10 sm:w-10 animate-spin text-blue-500" />
            <p className="mt-2 text-base sm:text-lg font-medium">Loading users...</p>
          </div>
        )}
        {error && (
          <div className="flex items-center p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg shadow-sm" role="alert">
            <ExclamationCircleIcon className="h-6 w-6 mr-3 flex-shrink-0" />
            <div>
              <p className="font-bold">Error fetching data</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* User Table */}
        {!loading && !error && (
          <div className="overflow-x-auto shadow-md rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 sm:px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 sm:px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3 sm:px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-4 py-3 sm:px-6 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.length > 0 ? (
                  users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-4 py-4 sm:px-6 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{u.name}</div>
                      </td>
                      <td className="px-4 py-4 sm:px-6 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{u.email}</div>
                      </td>
                      <td className="px-4 py-4 sm:px-6 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          u.role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-4 sm:px-6 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-1 sm:space-x-2">
                          <button
                            onClick={() => setSelectedUser(u)}
                            className="text-gray-500 hover:text-indigo-600 p-1 sm:p-2 rounded-full hover:bg-indigo-50 transition-colors duration-150"
                            title="Edit User"
                          >
                            <PencilIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(u)}
                            className="text-gray-500 hover:text-red-600 p-1 sm:p-2 rounded-full hover:bg-red-50 transition-colors duration-150"
                            title="Delete User"
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
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && total > limit && (
          <div className="flex flex-col md:flex-row items-center justify-between mt-6 sm:mt-8">
            <p className="text-sm text-gray-700 mb-2 md:mb-0">
              Showing <span className="font-semibold">{Math.min(total, (page - 1) * limit + 1)}</span> to{" "}
              <span className="font-semibold">{Math.min(total, page * limit)}</span> of{" "}
              <span className="font-semibold">{total}</span> results
            </p>
            <div className="flex space-x-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors duration-200"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors duration-200"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Modals */}
        {selectedUser && (
          <EditUserModal
            user={selectedUser}
            onClose={() => setSelectedUser(null)}
            onSave={handleSave}
          />
        )}
        {editMyAccountOpen && currentUser && (
          <EditMyAccountModal
            user={currentUser}
            onClose={() => setEditMyAccountOpen(false)}
            onSave={handleMyAccountSave}
          />
        )}
        {createModalOpen && (
          <CreateUserModal onClose={() => setCreateModalOpen(false)} onSave={handleCreateUser} />
        )}
        {userToDelete && (
          <ConfirmationDialog
            isOpen={isDeleteDialogOpen}
            onClose={() => setIsDeleteDialogOpen(false)}
            onConfirm={handleConfirmDelete}
            title="Delete User"
            message={`Are you sure you want to permanently delete the user "${userToDelete.name}"? This action cannot be undone.`}
            confirmText="Delete"
            isDestructive={true}
          />
        )}
      </div>
    </div>
  );
}
