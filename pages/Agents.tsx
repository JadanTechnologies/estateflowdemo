

import React, { useState, useMemo } from 'react';
import { Agent, Department, Property, Tenant, Payment, User, Permission, Role, CommissionPayment, PaymentType, AuditLogEntry } from '../types';
import Modal from '../components/Modal';
import ConfirmationModal from '../components/ConfirmationModal';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import PayCommissionModal from '../components/PayCommissionModal';


const AgentForm: React.FC<{
    agent: Partial<Agent> | null;
    departments: Department[];
    onSave: (agent: Agent) => void;
    onClose: () => void;
}> = ({ agent, departments, onSave, onClose }) => {
    const [formData, setFormData] = useState<Partial<Agent>>(agent || {
        name: '', phone: '', email: '', departmentId: '', commissionRate: 0
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'commissionRate' ? Number(value) : value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };
    
    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.name?.trim()) newErrors.name = "Full Name is required.";
        if (!formData.email?.trim()) {
            newErrors.email = "Email is required.";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Email address is invalid.";
        }
        if (!formData.departmentId) newErrors.departmentId = "Department is required.";
        if ((formData.commissionRate ?? 0) < 0) newErrors.commissionRate = "Commission rate cannot be negative.";


        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        onSave({ id: agent?.id || Date.now().toString(), ...formData } as Agent);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <input name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" className={`w-full bg-secondary p-2 rounded border ${errors.name ? 'border-red-500' : 'border-border'}`} required />
                    {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                </div>
                <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone" className="w-full bg-secondary p-2 rounded border border-border" />
                <div>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" className={`w-full bg-secondary p-2 rounded border ${errors.email ? 'border-red-500' : 'border-border'}`} required />
                    {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                </div>
                <div>
                    <select name="departmentId" value={formData.departmentId} onChange={handleChange} className={`w-full bg-secondary p-2 rounded border ${errors.departmentId ? 'border-red-500' : 'border-border'}`} required>
                        <option value="">Select Department</option>
                        {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                    {errors.departmentId && <p className="text-red-400 text-xs mt-1">{errors.departmentId}</p>}
                </div>
                 <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Commission Rate (%)</label>
                    <input type="number" name="commissionRate" value={formData.commissionRate || 0} onChange={handleChange} placeholder="Commission Rate (%)" className={`w-full bg-secondary p-2 rounded border ${errors.commissionRate ? 'border-red-500' : 'border-border'}`} step="0.1" min="0" />
                    {errors.commissionRate && <p className="text-red-400 text-xs mt-1">{errors.commissionRate}</p>}
                </div>
            </div>
            <div className="flex justify-end space-x-2">
                <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">Cancel</button>
                <button type="submit" className="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded">Save Agent</button>
            </div>
        </form>
    );
};

const AgentDetailModal: React.FC<{
    agent: Agent;
    properties: Property[];
    tenants: Tenant[];
    payments: Payment[];
    commissionPayments: CommissionPayment[];
    departmentName: string;
    onClose: () => void;
}> = ({ agent, properties, tenants, payments, commissionPayments, departmentName, onClose }) => {
    const formatCurrency = (amount: number) => `₦${amount.toLocaleString()}`;

    const agentProperties = useMemo(() => properties.filter(p => p.agentId === agent.id), [properties, agent.id]);
    const agentTenants = useMemo(() => tenants.filter(t => agentProperties.some(p => p.id === t.propertyId)), [tenants, agentProperties]);
    const totalRentCollected = useMemo(() => payments.filter(p => agentProperties.some(prop => prop.id === p.propertyId)).reduce((sum, p) => sum + p.amountPaid, 0), [payments, agentProperties]);
    
    return (
        <div className="space-y-6">
             <div className="flex items-center space-x-4 border-b border-border pb-4">
                <img src={`https://i.pravatar.cc/150?u=${agent.id}`} alt={agent.name} className="w-24 h-24 rounded-full border-4 border-primary" />
                <div>
                    <h2 className="text-2xl font-bold">{agent.name}</h2>
                    <p className="text-text-secondary">{departmentName} Department</p>
                    <p className="text-sm text-text-secondary">{agent.email} | {agent.phone}</p>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-bold mb-3">Performance Overview</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
                    <div className="bg-secondary p-4 rounded-lg">
                        <p className="text-2xl font-bold">{agentProperties.length}</p>
                        <p className="text-sm text-text-secondary">Properties Assigned</p>
                    </div>
                     <div className="bg-secondary p-4 rounded-lg">
                        <p className="text-2xl font-bold">{agentTenants.length}</p>
                        <p className="text-sm text-text-secondary">Tenants Managed</p>
                    </div>
                     <div className="bg-secondary p-4 rounded-lg">
                        <p className="text-2xl font-bold">{formatCurrency(totalRentCollected)}</p>
                        <p className="text-sm text-text-secondary">Total Rent Collected</p>
                    </div>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-bold mb-3">Commission Payment History</h3>
                <div className="overflow-y-auto max-h-48 bg-secondary rounded-lg">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-card sticky top-0">
                            <tr>
                                <th className="p-2">Payment Date</th>
                                <th className="p-2">Period Covered</th>
                                <th className="p-2 text-right">Amount Paid</th>
                                <th className="p-2">Notes</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {commissionPayments.filter(p => p.agentId === agent.id).map(payment => (
                                <tr key={payment.id}>
                                    <td className="p-2">{payment.paymentDate}</td>
                                    <td className="p-2">{payment.periodStartDate} to {payment.periodEndDate}</td>
                                    <td className="p-2 text-right">{formatCurrency(payment.amount)}</td>
                                    <td className="p-2 text-xs italic">{payment.notes}</td>
                                </tr>
                            ))}
                            {commissionPayments.filter(p => p.agentId === agent.id).length === 0 && (
                                <tr><td colSpan={4} className="p-4 text-center text-text-secondary">No commission payments found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-bold mb-3">Assigned Properties</h3>
                 <div className="overflow-y-auto max-h-48 bg-secondary rounded-lg">
                     <table className="w-full text-left text-sm">
                         <thead className="bg-card sticky top-0">
                            <tr>
                                <th className="p-2">Property Name</th>
                                <th className="p-2">Status</th>
                                <th className="p-2 text-right">Rent</th>
                            </tr>
                         </thead>
                          <tbody className="divide-y divide-border/50">
                            {agentProperties.map(prop => (
                                <tr key={prop.id}>
                                    <td className="p-2">{prop.name}</td>
                                    <td className="p-2">{prop.status}</td>
                                    <td className="p-2 text-right">{formatCurrency(prop.rentAmount)}</td>
                                </tr>
                            ))}
                            {agentProperties.length === 0 && (
                                <tr><td colSpan={3} className="p-4 text-center text-text-secondary">No properties assigned.</td></tr>
                            )}
                         </tbody>
                     </table>
                 </div>
            </div>
             <div className="flex justify-end pt-2">
                <button type="button" onClick={onClose} className="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded">Close</button>
            </div>
        </div>
    );
};


const Agents: React.FC<{
    agents: Agent[];
    properties: Property[];
    tenants: Tenant[];
    payments: Payment[];
    departments: Department[];
    commissionPayments: CommissionPayment[];
    setAgents: React.Dispatch<React.SetStateAction<Agent[]>>;
    setCommissionPayments: React.Dispatch<React.SetStateAction<CommissionPayment[]>>;
    currentUser: User;
    roles: Role[];
    userHasPermission: (permission: Permission) => boolean;
    addAuditLog: (action: string, details: string, targetId?: string) => void;
}> = ({ agents, properties, tenants, payments, departments, commissionPayments, setAgents, setCommissionPayments, currentUser, roles, userHasPermission, addAuditLog }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isPayCommissionModalOpen, setIsPayCommissionModalOpen] = useState(false);
  const [agentForCommission, setAgentForCommission] = useState<Agent | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  
  const canManage = userHasPermission(Permission.MANAGE_AGENTS);
  const canManageCommissions = userHasPermission(Permission.MANAGE_COMMISSIONS);
  
  const getDepartmentName = (departmentId: string) => departments.find(d => d.id === departmentId)?.name || 'N/A';
  
  const filteredAgents = useMemo(() => {
    if (!searchQuery) {
        return agents;
    }
    const lowercasedQuery = searchQuery.toLowerCase();
    return agents.filter(agent =>
        agent.name.toLowerCase().includes(lowercasedQuery) ||
        agent.email.toLowerCase().includes(lowercasedQuery)
    );
  }, [agents, searchQuery]);

  const availableMonths = useMemo(() => {
    const monthSet = new Set<string>();
    payments.forEach(p => monthSet.add(p.date.substring(0, 7)));
    tenants.forEach(t => monthSet.add(t.rentDueDate.substring(0, 7)));
    return Array.from(monthSet).sort().reverse();
  }, [payments, tenants]);


  const handleSave = (agent: Agent) => {
    if (selectedAgent) {
      setAgents(prev => prev.map(a => a.id === agent.id ? agent : a));
      addAuditLog('UPDATED_AGENT', `Updated agent: ${agent.name}`, agent.id);
    } else {
      setAgents(prev => [...prev, agent]);
      addAuditLog('CREATED_AGENT', `Created agent: ${agent.name}`, agent.id);
    }
    setIsModalOpen(false);
    setSelectedAgent(null);
  };

  const handleDeleteClick = (agentId: string) => {
    setAgentToDelete(agentId);
    setIsConfirmModalOpen(true);
  };

  const confirmDeleteAgent = () => {
    if (!agentToDelete) return;
    const agent = agents.find(a => a.id === agentToDelete);
    if(agent) {
        addAuditLog('DELETED_AGENT', `Deleted agent: ${agent.name}`, agent.id);
    }
    setAgents(prev => prev.filter(a => a.id !== agentToDelete));
    setIsConfirmModalOpen(false);
    setAgentToDelete(null);
  };
  
  const handleViewDetails = (agent: Agent) => {
    setSelectedAgent(agent);
    setIsDetailModalOpen(true);
  };
  
  const handlePayCommissionClick = (agent: Agent) => {
    setAgentForCommission(agent);
    setIsPayCommissionModalOpen(true);
  };

  const handleSaveCommissionPayment = (payment: CommissionPayment) => {
      setCommissionPayments(prev => [payment, ...prev]);
      const agentName = agents.find(a => a.id === payment.agentId)?.name || 'Unknown Agent';
      addAuditLog('PAID_COMMISSION', `Paid commission of ₦${payment.amount.toLocaleString()} to ${agentName}`, payment.id);
      setIsPayCommissionModalOpen(false);
  };
  
  const getAgentPerformanceData = (agentId: string) => {
     const agentProperties = properties.filter(p => p.agentId === agentId);
     const tenantsManaged = tenants.filter(t => agentProperties.some(p => p.id === t.propertyId)).length;
     const totalCollected = payments.filter(p => p.paymentType === PaymentType.Rent && agentProperties.some(prop => prop.id === p.propertyId)).reduce((sum, p) => sum + p.amountPaid, 0);
     const totalExpected = agentProperties.reduce((sum, p) => sum + p.rentAmount, 0);
     return { tenantsManaged, totalCollected, totalExpected };
  }

  const lifetimePerformanceChartData = filteredAgents.map(agent => ({
      name: agent.name,
      Collected: getAgentPerformanceData(agent.id).totalCollected,
  }));

  const monthlyPerformanceData = useMemo(() => {
    return filteredAgents.map(agent => {
        const agentProperties = properties.filter(p => p.agentId === agent.id);
        const agentPropertyIds = new Set(agentProperties.map(p => p.id));
        
        const monthlyCollected = payments.filter(p => 
            p.paymentType === PaymentType.Rent &&
            agentPropertyIds.has(p.propertyId) &&
            p.date.startsWith(selectedMonth)
        ).reduce((sum, p) => sum + p.amountPaid, 0);
        
        const monthlyExpected = tenants.filter(t => 
            agentPropertyIds.has(t.propertyId) &&
            t.rentDueDate.startsWith(selectedMonth)
        ).reduce((sum, t) => {
            const prop = properties.find(p => p.id === t.propertyId);
            return sum + (prop?.rentAmount || 0);
        }, 0);

        return {
            name: agent.name,
            Collected: monthlyCollected,
            Expected: monthlyExpected,
        };
    });
  }, [filteredAgents, properties, payments, tenants, selectedMonth]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Agents</h2>
        {canManage && (
            <button onClick={() => { setSelectedAgent(null); setIsModalOpen(true); }} className="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded">
              Add Agent
            </button>
        )}
      </div>

      <div className="mb-6">
        <input
            type="text"
            placeholder="Search agents by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full max-w-lg bg-secondary p-2 rounded border border-border focus:ring-2 focus:ring-primary focus:outline-none"
        />
      </div>
      
      <div className="bg-card p-6 rounded-lg shadow-lg mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">Monthly Agent Performance</h3>
             <select
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
                className="bg-secondary p-2 rounded border border-border focus:ring-2 focus:ring-primary focus:outline-none"
             >
                {availableMonths.map(month => <option key={month} value={month}>{new Date(month + '-02').toLocaleString('default', { month: 'long', year: 'numeric' })}</option>)}
             </select>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" tickFormatter={(value) => `₦${Number(value) / 1000}k`} />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} formatter={(value: number) => `₦${value.toLocaleString()}`} />
              <Legend />
              <Bar dataKey="Collected" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Expected" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

      <div className="bg-card p-6 rounded-lg shadow-lg mb-6">
          <h3 className="font-bold text-lg mb-4">Lifetime Agent Collection Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={lifetimePerformanceChartData}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" tickFormatter={(value) => `₦${Number(value) / 1000}k`} />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} formatter={(value: number) => `₦${value.toLocaleString()}`} />
              <Legend />
              <Bar dataKey="Collected" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

      <div className="bg-card rounded-lg shadow-lg overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b border-border">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Department</th>
              <th className="p-4">Tenants Managed</th>
              <th className="p-4">Total Collected (Rent)</th>
              <th className="p-4">Commission Rate</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAgents.map(agent => {
              const { tenantsManaged, totalCollected } = getAgentPerformanceData(agent.id);
              return (
                <tr key={agent.id} className="border-b border-border/50 hover:bg-secondary">
                  <td className="p-4">{agent.name}</td>
                  <td className="p-4">{getDepartmentName(agent.departmentId)}</td>
                  <td className="p-4">{tenantsManaged}</td>
                  <td className="p-4">₦{totalCollected.toLocaleString()}</td>
                   <td className="p-4">{agent.commissionRate ?? 0}%</td>
                  <td className="p-4 space-x-2 whitespace-nowrap">
                    <button onClick={() => handleViewDetails(agent)} className="text-green-400 hover:text-green-300">View</button>
                    {canManage && (
                      <>
                        <button onClick={() => { setSelectedAgent(agent); setIsModalOpen(true); }} className="text-blue-400 hover:text-blue-300">Edit</button>
                        <button onClick={() => handleDeleteClick(agent.id)} className="text-red-400 hover:text-red-300">Delete</button>
                      </>
                    )}
                    {canManageCommissions && (
                        <button onClick={() => handlePayCommissionClick(agent)} className="text-emerald-400 hover:text-emerald-300">Pay Commission</button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedAgent ? 'Edit Agent' : 'Add New Agent'}>
        <AgentForm agent={selectedAgent} departments={departments} onSave={handleSave} onClose={() => setIsModalOpen(false)} />
      </Modal>
      
      <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title={`Agent Details: ${selectedAgent?.name}`}>
        {selectedAgent && (
          <AgentDetailModal
            agent={selectedAgent}
            properties={properties}
            tenants={tenants}
            payments={payments}
            commissionPayments={commissionPayments}
            departmentName={getDepartmentName(selectedAgent.departmentId)}
            onClose={() => setIsDetailModalOpen(false)}
          />
        )}
      </Modal>

      <PayCommissionModal
        isOpen={isPayCommissionModalOpen}
        onClose={() => setIsPayCommissionModalOpen(false)}
        agent={agentForCommission}
        properties={properties}
        payments={payments}
        onSave={handleSaveCommissionPayment}
      />

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmDeleteAgent}
        title="Confirm Agent Deletion"
        message="Are you sure you want to delete this agent? This action cannot be undone."
      />
    </div>
  );
};

export default Agents;