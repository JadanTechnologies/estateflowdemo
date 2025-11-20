import React, { useState } from 'react';
import { User, Role, Department, Permission, UserStatus, AuditLogEntry } from '../types';
import Modal from '../components/Modal';
import ConfirmationModal from '../components/ConfirmationModal';
import UserForm from '../components/UserForm';
import ResetPasswordModal from '../components/ResetPasswordModal';

interface UsersProps {
    users: User[];
    setUsers: React.Dispatch<React.SetStateAction<User[]>>;
    roles: Role[];
    departments: Department[];
    currentUser: User;
    userHasPermission: (permission: Permission) => boolean;
    addAuditLog: (action: string, details: string, targetId?: string) => void;
}

const Users: React.FC<UsersProps> = ({ users, setUsers, roles, departments, currentUser, userHasPermission, addAuditLog }) => {
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<string | null>(null);
    const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
    
    const isSuperAdmin = roles.find(r => r.id === currentUser.roleId)?.name === 'Super Admin';
    const getRoleName = (roleId: string) => roles.find(r => r.id === roleId)?.name || 'N/A';
    const getDepartmentName = (departmentId?: string) => departmentId ? departments.find(d => d.id === departmentId)?.name : 'N/A';

    const getStatusColor = (status: UserStatus) => {
        switch (status) {
            case UserStatus.Active: return 'bg-green-500/20 text-green-400';
            case UserStatus.Suspended: return 'bg-yellow-500/20 text-yellow-400';
            case UserStatus.Banned: return 'bg-red-500/20 text-red-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    const handleSave = (user: User, password?: string) => {
        const isNewUser = !selectedUser;
        const userToSave: User = { ...user };

        if (password) {
            userToSave.password = password; // In a real app, this should be hashed
        } else if (isNewUser) {
             userToSave.password = 'password123'; // Default password for new users if not set
        }

        if (isNewUser) {
            setUsers(prev => [...prev, { ...userToSave, status: UserStatus.Active }]);
            addAuditLog('CREATED_USER', `Created new user: ${userToSave.username}`, userToSave.id);
        } else {
            setUsers(prev => prev.map(u => (u.id === user.id ? { ...u, ...userToSave } : u)));
            addAuditLog('UPDATED_USER', `Updated user details for: ${userToSave.username}`, userToSave.id);
        }
        
        setIsFormModalOpen(false);
        setSelectedUser(null);
    };
    
    const handleDeleteClick = (userId: string) => {
        const user = users.find(u => u.id === userId);
        if (user?.id === currentUser.id) {
            alert("You cannot delete yourself.");
            return;
        }
        const role = roles.find(r => r.id === user?.roleId);
        if (role?.name === 'Super Admin') {
            alert("The Super Admin user cannot be deleted.");
            return;
        }
        setUserToDelete(userId);
        setIsConfirmModalOpen(true);
    };

    const confirmDelete = () => {
        if (!userToDelete) return;
        const user = users.find(u => u.id === userToDelete);
        if (user) {
            addAuditLog('DELETED_USER', `Deleted user: ${user.username}`, user.id);
        }
        setUsers(prev => prev.filter(u => u.id !== userToDelete));
        setIsConfirmModalOpen(false);
        setUserToDelete(null);
    };

    const handleStatusChange = (userId: string, status: UserStatus) => {
        const user = users.find(u => u.id === userId);
        if (user) {
            addAuditLog('CHANGED_USER_STATUS', `Changed status of ${user.username} to ${status}`, user.id);
        }
        setUsers(prev => prev.map(u => (u.id === userId ? { ...u, status } : u)));
    };
    
    const handleResetPassword = (userId: string, newPassword: string) => {
        const user = users.find(u => u.id === userId);
        if (user) {
            addAuditLog('RESET_USER_PASSWORD', `Reset password for user: ${user.username}`, user.id);
        }
        setUsers(prev => prev.map(u => (u.id === userId ? { ...u, password: newPassword } : u)));
        setIsResetPasswordModalOpen(false);
        setSelectedUser(null);
    };

    const openFormModal = (user: User | null) => {
        setSelectedUser(user);
        setIsFormModalOpen(true);
    };
    
    const openResetPasswordModal = (user: User) => {
        setSelectedUser(user);
        setIsResetPasswordModalOpen(true);
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">User Management</h2>
                {isSuperAdmin && (
                    <button onClick={() => openFormModal(null)} className="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded">
                      Add User
                    </button>
                )}
            </div>

            <div className="bg-card rounded-lg shadow-lg overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="border-b border-border">
                        <tr>
                            <th className="p-4">Name</th>
                            <th className="p-4">Username</th>
                            <th className="p-4">Role</th>
                            <th className="p-4">Status</th>
                            {isSuperAdmin && <th className="p-4">Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => {
                            const role = roles.find(r => r.id === user.roleId);
                            const isTargetSuperAdmin = role?.name === 'Super Admin';
                            const isCurrentUser = user.id === currentUser.id;
                            const disableActions = isTargetSuperAdmin || isCurrentUser;

                            return (
                                <tr key={user.id} className="border-b border-border/50 hover:bg-secondary">
                                    <td className="p-4">{user.name}</td>
                                    <td className="p-4">{user.username}</td>
                                    <td className="p-4">{getRoleName(user.roleId)}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    {isSuperAdmin && (
                                        <td className="p-4 space-x-2 whitespace-nowrap">
                                            <button onClick={() => openFormModal(user)} className="text-blue-400 hover:text-blue-300">Edit</button>
                                            <button onClick={() => openResetPasswordModal(user)} className="text-yellow-400 hover:text-yellow-300">Reset Password</button>
                                            <button onClick={() => handleDeleteClick(user.id)} className="text-red-400 hover:text-red-300 disabled:text-gray-500 disabled:cursor-not-allowed" disabled={disableActions}>Delete</button>
                                            <select 
                                                value={user.status} 
                                                onChange={(e) => handleStatusChange(user.id, e.target.value as UserStatus)}
                                                className="bg-secondary p-1 rounded border border-border text-xs disabled:opacity-50"
                                                disabled={disableActions}
                                            >
                                                {Object.values(UserStatus).map(status => (
                                                    <option key={status} value={status}>{status}</option>
                                                ))}
                                            </select>
                                        </td>
                                    )}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title={selectedUser ? 'Edit User' : 'Add New User'}>
                <UserForm 
                    user={selectedUser} 
                    roles={roles}
                    departments={departments}
                    onSave={handleSave} 
                    onClose={() => setIsFormModalOpen(false)} 
                />
            </Modal>
            
            <ResetPasswordModal
                isOpen={isResetPasswordModalOpen}
                onClose={() => setIsResetPasswordModalOpen(false)}
                onSave={handleResetPassword}
                user={selectedUser}
            />

            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={confirmDelete}
                title="Confirm User Deletion"
                message="Are you sure you want to delete this user? This action cannot be undone."
            />
        </div>
    );
};

export default Users;