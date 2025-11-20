
import React, { useState, useEffect } from 'react';
import { User, Role, Department } from '../types';

interface UserFormProps {
    user: Partial<User> | null;
    roles: Role[];
    departments: Department[];
    onSave: (user: User, password?: string) => void;
    onClose: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ user, roles, departments, onSave, onClose }) => {
    const [formData, setFormData] = useState<Partial<User>>(user || {
        name: '', username: '', roleId: '', departmentId: ''
    });
    const [password, setPassword] = useState('');
    const [showDepartment, setShowDepartment] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        const selectedRole = roles.find(r => r.id === formData.roleId);
        setShowDepartment(selectedRole?.name === 'Property Manager' || selectedRole?.name === 'Agent');
    }, [formData.roleId, roles]);

    const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const roleId = e.target.value;
        const selectedRole = roles.find(r => r.id === roleId);
        const shouldShowDepartment = selectedRole?.name === 'Property Manager' || selectedRole?.name === 'Agent';
        
        setShowDepartment(shouldShowDepartment);
        setFormData(prev => ({ 
            ...prev, 
            roleId, 
            departmentId: shouldShowDepartment ? prev.departmentId : undefined 
        }));
        if (errors.roleId) setErrors(prev => ({ ...prev, roleId: '', departmentId: '' }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.name?.trim()) newErrors.name = "Full Name is required.";
        if (!formData.username?.trim()) newErrors.username = "Username is required.";
        if (!user && !password.trim()) newErrors.password = "Password is required for new users.";
        if (password.trim() && password.length < 6) newErrors.password = "Password must be at least 6 characters.";
        if (!formData.roleId) newErrors.roleId = "Role is required.";
        
        const selectedRole = roles.find(r => r.id === formData.roleId);
        if ((selectedRole?.name === 'Property Manager' || selectedRole?.name === 'Agent') && !formData.departmentId) {
            newErrors.departmentId = "Department is required for this role.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        
        const finalPassword = password.trim() === '' ? undefined : password.trim();
        onSave({ id: user?.id || Date.now().toString(), ...formData } as User, finalPassword);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="text-sm text-text-secondary mb-1 block">Full Name</label>
                    <input name="name" value={formData.name || ''} onChange={handleChange} placeholder="Full Name" className={`w-full bg-secondary p-2 rounded border ${errors.name ? 'border-red-500' : 'border-border'}`} required />
                    {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                </div>
                <div>
                    <label className="text-sm text-text-secondary mb-1 block">Username</label>
                    <input name="username" value={formData.username || ''} onChange={handleChange} placeholder="Username" className={`w-full bg-secondary p-2 rounded border ${errors.username ? 'border-red-500' : 'border-border'}`} required />
                    {errors.username && <p className="text-red-400 text-xs mt-1">{errors.username}</p>}
                </div>
                <div>
                    <label className="text-sm text-text-secondary mb-1 block">{user ? "New Password (optional)" : "Password"}</label>
                    <input type="password" name="password" value={password} onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors(p => ({...p, password: ''}))}} placeholder={user ? "New Password (optional)" : "Password"} className={`w-full bg-secondary p-2 rounded border ${errors.password ? 'border-red-500' : 'border-border'}`} required={!user} />
                    {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
                </div>
                 <div>
                    <label className="text-sm text-text-secondary mb-1 block">Role</label>
                    <select name="roleId" value={formData.roleId || ''} onChange={handleRoleChange} className={`w-full bg-secondary p-2 rounded border ${errors.roleId ? 'border-red-500' : 'border-border'}`} required>
                        <option value="">Select Role</option>
                        {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                    {errors.roleId && <p className="text-red-400 text-xs mt-1">{errors.roleId}</p>}
                </div>
                {showDepartment && (
                     <div>
                        <label className="text-sm text-text-secondary mb-1 block">Department</label>
                        <select name="departmentId" value={formData.departmentId || ''} onChange={handleChange} className={`w-full bg-secondary p-2 rounded border ${errors.departmentId ? 'border-red-500' : 'border-border'}`} required>
                            <option value="">Select Department</option>
                            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                        {errors.departmentId && <p className="text-red-400 text-xs mt-1">{errors.departmentId}</p>}
                    </div>
                )}
            </div>
            <div className="flex justify-end space-x-2 pt-4">
                <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">Cancel</button>
                <button type="submit" className="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded">Save User</button>
            </div>
        </form>
    );
};

export default UserForm;
