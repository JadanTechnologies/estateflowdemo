import React, { useState } from 'react';
import { User } from '../types';
import Modal from './Modal';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userId: string, newPassword: string) => void;
  user: User | null;
}

const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({ isOpen, onClose, onSave, user }) => {
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen || !user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    setError('');
    onSave(user.id, newPassword);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Reset Password for ${user.name}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-text-secondary mb-1">
            New Password
          </label>
          <input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              if (error) setError('');
            }}
            className={`w-full bg-secondary p-2 rounded border ${error ? 'border-red-500' : 'border-border'}`}
            autoFocus
          />
          {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
        </div>
        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded"
          >
            Save New Password
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ResetPasswordModal;