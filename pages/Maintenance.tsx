





import React, { useState } from 'react';
import { Maintenance, Property, User, Permission, AuditLogEntry, Tenant } from '../types';
import Modal from '../components/Modal';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const MaintenanceForm: React.FC<{
    maintenance: Partial<Maintenance> | null;
    properties: Property[];
    users: User[];
    onSave: (maintenance: Maintenance) => void;
    onClose: () => void;
}> = ({ maintenance, properties, users, onSave, onClose }) => {
    const [formData, setFormData] = useState<Partial<Maintenance>>({
        propertyId: '', task: '', cost: 0, date: new Date().toISOString().split('T')[0], status: 'Pending', notes: '', assignedToUserId: '',
        ...maintenance
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'cost' ? Number(value) : value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };
    
    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.propertyId) newErrors.propertyId = "Property is required.";
        if (!formData.task?.trim()) newErrors.task = "Task description is required.";
        if ((formData.cost ?? 0) < 0) newErrors.cost = "Cost cannot be negative.";
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        onSave({ id: maintenance?.id || Date.now().toString(), ...formData } as Maintenance);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <select name="propertyId" value={formData.propertyId || ''} onChange={handleChange} className={`w-full bg-secondary p-2 rounded border ${errors.propertyId ? 'border-red-500' : 'border-border'}`} required>
                        <option value="">Select Property</option>
                        {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    {errors.propertyId && <p className="text-red-400 text-xs mt-1">{errors.propertyId}</p>}
                </div>
                <div>
                    <input name="task" value={formData.task || ''} onChange={handleChange} placeholder="Task Description" className={`w-full bg-secondary p-2 rounded border ${errors.task ? 'border-red-500' : 'border-border'}`} required />
                    {errors.task && <p className="text-red-400 text-xs mt-1">{errors.task}</p>}
                </div>
                <div>
                    <input type="number" name="cost" value={formData.cost || 0} onChange={handleChange} placeholder="Cost" className={`w-full bg-secondary p-2 rounded border ${errors.cost ? 'border-red-500' : 'border-border'}`} />
                    {errors.cost && <p className="text-red-400 text-xs mt-1">{errors.cost}</p>}
                </div>
                <input type="date" name="date" value={formData.date || ''} onChange={handleChange} className="w-full bg-secondary p-2 rounded border border-border" />
                <select name="status" value={formData.status || 'Pending'} onChange={handleChange} className="w-full bg-secondary p-2 rounded border border-border">
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                </select>
                <div className="md:col-span-2">
                    <select name="assignedToUserId" value={formData.assignedToUserId || ''} onChange={handleChange} className="w-full bg-secondary p-2 rounded border border-border">
                        <option value="">Assign to Staff (Optional)</option>
                        {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.username})</option>)}
                    </select>
                </div>
            </div>
            <textarea name="notes" value={formData.notes || ''} onChange={handleChange} placeholder="Notes" className="w-full bg-secondary p-2 rounded border border-border h-24"></textarea>
            <div className="flex justify-end space-x-2">
                <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">Cancel</button>
                <button type="submit" className="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded">Save Task</button>
            </div>
        </form>
    );
};

const MaintenanceDetailModal: React.FC<{
    task: Maintenance;
    propertyName: string;
    tenantName: string;
    onClose: () => void;
}> = ({ task, propertyName, tenantName, onClose }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const images = task.images || [];

    const goToNextImage = () => setCurrentImageIndex(prev => (prev + 1) % images.length);
    const goToPrevImage = () => setCurrentImageIndex(prev => (prev - 1 + images.length) % images.length);

    return (
        <div className="space-y-4">
            <div>
                <h3 className="font-bold text-lg">{task.task}</h3>
                <p className="text-sm text-text-secondary">
                    For <strong>{propertyName}</strong> (Tenant: {tenantName})
                </p>
            </div>
            {images.length > 0 ? (
                <div className="relative">
                    <div className="aspect-video bg-secondary rounded-lg flex items-center justify-center overflow-hidden">
                        <img src={images[currentImageIndex]} alt="Maintenance issue" className="max-h-80 w-auto object-contain" />
                    </div>
                    {images.length > 1 && (
                        <>
                            <button onClick={goToPrevImage} className="absolute top-1/2 left-2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white rounded-full p-2 focus:outline-none">&lt;</button>
                            <button onClick={goToNextImage} className="absolute top-1/2 right-2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white rounded-full p-2 focus:outline-none">&gt;</button>
                            <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">{currentImageIndex + 1} / {images.length}</div>
                        </>
                    )}
                </div>
            ) : <p className="text-sm italic text-text-secondary">No images were uploaded for this request.</p>}
            <div className="text-sm space-y-2 bg-secondary p-3 rounded">
                <p><strong>Status:</strong> {task.status}</p>
                <p><strong>Date Reported:</strong> {task.date}</p>
                <p><strong>Cost:</strong> ₦{task.cost.toLocaleString()}</p>
                {task.notes && <p><strong>Notes:</strong> {task.notes}</p>}
            </div>
            <div className="flex justify-end">
                <button onClick={onClose} className="bg-primary text-white font-bold py-2 px-4 rounded">Close</button>
            </div>
        </div>
    );
};

const MaintenancePage: React.FC<{
    maintenance: Maintenance[];
    properties: Property[];
    tenants: Tenant[];
    users: User[];
    setMaintenance: React.Dispatch<React.SetStateAction<Maintenance[]>>;
    currentUser: User;
    userHasPermission: (permission: Permission) => boolean;
    addAuditLog: (action: string, details: string, targetId?: string) => void;
}> = ({ maintenance, properties, tenants, users, setMaintenance, currentUser, userHasPermission, addAuditLog }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Maintenance | null>(null);
  const [chartView, setChartView] = useState<'property' | 'month'>('property');
  
  const canManage = userHasPermission(Permission.MANAGE_MAINTENANCE);
  const getPropertyName = (propertyId: string) => properties.find(p => p.id === propertyId)?.name || 'N/A';
  const getTenantName = (tenantId?: string) => tenantId ? tenants.find(t => t.id === tenantId)?.fullName : 'N/A';

  const handleSave = (task: Maintenance) => {
    const propertyName = getPropertyName(task.propertyId);
    if (selectedTask) {
      setMaintenance(maintenance.map(t => t.id === task.id ? task : t));
      addAuditLog('UPDATED_MAINTENANCE', `Updated maintenance task '${task.task}' for ${propertyName}`, task.id);
    } else {
      setMaintenance([...maintenance, task]);
      addAuditLog('CREATED_MAINTENANCE', `Created maintenance task '${task.task}' for ${propertyName}`, task.id);
    }
    setIsModalOpen(false);
    setSelectedTask(null);
  };
  
  const getUserName = (userId?: string) => userId ? users.find(u => u.id === userId)?.name : 'Unassigned';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-500/20 text-green-400';
      case 'In Progress': return 'bg-blue-500/20 text-blue-400';
      case 'Pending': return 'bg-yellow-500/20 text-yellow-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };
  
  const chartData = React.useMemo(() => {
    if (chartView === 'property') {
        const costsByProperty = maintenance.reduce((acc, task) => {
            const propertyName = getPropertyName(task.propertyId);
            acc[propertyName] = (acc[propertyName] || 0) + (task.cost || 0);
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(costsByProperty).map(([name, cost]) => ({ name, cost }));
    } else {
        const costsByMonth = maintenance.reduce((acc: Record<string, { cost: number; date: Date }>, task: Maintenance) => {
            const taskDate = new Date(task.date);
            // Use a consistent key like 'YYYY-MM' to avoid locale issues
            const key = `${taskDate.getFullYear()}-${String(taskDate.getMonth() + 1).padStart(2, '0')}`;
            if (!acc[key]) {
                acc[key] = { cost: 0, date: taskDate };
            }
            acc[key].cost += (task.cost || 0);
            return acc;
        }, {} as Record<string, { cost: number; date: Date }>);

        // Sort by date for chronological order then format for display
        return Object.values(costsByMonth)
            .sort((a, b) => a.date.getTime() - b.date.getTime())
            .map(entry => ({
                name: entry.date.toLocaleString('default', { month: 'short', year: 'numeric' }),
                cost: entry.cost
            }));
    }
  }, [maintenance, properties, chartView]);

  const handleViewDetails = (task: Maintenance) => {
      setSelectedTask(task);
      setIsDetailModalOpen(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Maintenance</h2>
        {canManage && (
            <button onClick={() => { setSelectedTask(null); setIsModalOpen(true); }} className="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded">
              Add Task
            </button>
        )}
      </div>

      <div className="bg-card p-6 rounded-lg shadow-lg mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">Maintenance Costs</h3>
             <div className="flex space-x-2">
                <button onClick={() => setChartView('property')} className={`px-3 py-1 text-sm rounded ${chartView === 'property' ? 'bg-primary text-white' : 'bg-secondary'}`}>By Property</button>
                <button onClick={() => setChartView('month')} className={`px-3 py-1 text-sm rounded ${chartView === 'month' ? 'bg-primary text-white' : 'bg-secondary'}`}>By Month</button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" tickFormatter={(value) => `₦${Number(value) / 1000}k`} />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} formatter={(value) => `₦${Number(value).toLocaleString()}`} />
              <Legend />
              <Bar dataKey="cost" fill="#4f46e5" name="Total Cost" />
            </BarChart>
          </ResponsiveContainer>
        </div>

      <div className="bg-card rounded-lg shadow-lg overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b border-border">
            <tr>
              <th className="p-4">Property</th>
              <th className="p-4">Task</th>
              <th className="p-4">Assigned To</th>
              <th className="p-4">Cost</th>
              <th className="p-4">Date</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {maintenance.map(task => (
              <tr key={task.id} className="border-b border-border/50 hover:bg-secondary">
                <td className="p-4">{getPropertyName(task.propertyId)}</td>
                <td className="p-4">{task.task}</td>
                <td className="p-4">{getUserName(task.assignedToUserId)}</td>
                <td className="p-4">₦{(task.cost || 0).toLocaleString()}</td>
                <td className="p-4">{task.date}</td>
                <td className="p-4"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>{task.status}</span></td>
                <td className="p-4 space-x-2">
                  <button onClick={() => handleViewDetails(task)} className="text-green-400 hover:text-green-300">Details</button>
                  {canManage && (
                      <button onClick={() => { setSelectedTask(task); setIsModalOpen(true); }} className="text-blue-400 hover:text-blue-300">Edit</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedTask ? 'Edit Maintenance Task' : 'Add Maintenance Task'}>
        <MaintenanceForm maintenance={selectedTask} properties={properties} users={users} onSave={handleSave} onClose={() => setIsModalOpen(false)} />
      </Modal>
      
      <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title="Maintenance Request Details">
        {selectedTask && (
            <MaintenanceDetailModal 
                task={selectedTask}
                propertyName={getPropertyName(selectedTask.propertyId)}
                tenantName={getTenantName(selectedTask.tenantId)}
                onClose={() => setIsDetailModalOpen(false)}
            />
        )}
      </Modal>
    </div>
  );
};

export default MaintenancePage;
