import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Property, Payment, Agent, Tenant, Department, PropertyStatus, PaymentType, User, Role, PaymentStatus, Maintenance, CommissionPayment } from '../types';
import DashboardCard from '../components/DashboardCard';
import { ICONS } from '../constants';
import Modal from '../components/Modal';

const formatCurrency = (amount: number) => `₦${amount.toLocaleString()}`;

// A modal to display lists of tenants for the clickable dashboard cards
interface TenantListModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    tenantsWithDetails: Array<Tenant & { propertyName: string; amountInfo: string }>;
}

const TenantListModal: React.FC<TenantListModalProps> = ({ isOpen, onClose, title, tenantsWithDetails }) => (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
        <div className="overflow-x-auto">
            {tenantsWithDetails.length > 0 ? (
                <table className="w-full text-left">
                    <thead className="border-b border-border">
                        <tr>
                            <th className="p-3">Tenant Name</th>
                            <th className="p-3">Property</th>
                            <th className="p-3">Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tenantsWithDetails.map(tenant => (
                            <tr key={tenant.id} className="border-b border-border/50 hover:bg-secondary">
                                <td className="p-3">{tenant.fullName}</td>
                                <td className="p-3">{tenant.propertyName}</td>
                                <td className="p-3">{tenant.amountInfo}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p className="text-center text-text-secondary py-4">No tenants match this category.</p>
            )}
        </div>
    </Modal>
);

// A modal to display lists of properties
interface PropertyListModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    propertiesWithDetails: Array<Property & { departmentName: string }>;
}

const PropertyListModal: React.FC<PropertyListModalProps> = ({ isOpen, onClose, title, propertiesWithDetails }) => (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
        <div className="overflow-x-auto">
            {propertiesWithDetails.length > 0 ? (
                <table className="w-full text-left">
                    <thead className="border-b border-border">
                        <tr>
                            <th className="p-3">Property Name</th>
                            <th className="p-3">Department</th>
                            <th className="p-3">Status</th>
                            <th className="p-3 text-right">Rent</th>
                        </tr>
                    </thead>
                    <tbody>
                        {propertiesWithDetails.map(property => (
                            <tr key={property.id} className="border-b border-border/50 hover:bg-secondary">
                                <td className="p-3">{property.name}</td>
                                <td className="p-3">{property.departmentName}</td>
                                <td className="p-3">{property.status}</td>
                                <td className="p-3 text-right">{formatCurrency(property.rentAmount)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p className="text-center text-text-secondary py-4">No properties match this category.</p>
            )}
        </div>
    </Modal>
);

// A modal to display lists of agents
interface AgentListModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    agentsWithDetails: Array<Agent & { departmentName: string }>;
}

const AgentListModal: React.FC<AgentListModalProps> = ({ isOpen, onClose, title, agentsWithDetails }) => (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
        <div className="overflow-x-auto">
            {agentsWithDetails.length > 0 ? (
                <table className="w-full text-left">
                    <thead className="border-b border-border">
                        <tr>
                            <th className="p-3">Agent Name</th>
                            <th className="p-3">Email</th>
                            <th className="p-3">Department</th>
                        </tr>
                    </thead>
                    <tbody>
                        {agentsWithDetails.map(agent => (
                            <tr key={agent.id} className="border-b border-border/50 hover:bg-secondary">
                                <td className="p-3">{agent.name}</td>
                                <td className="p-3">{agent.email}</td>
                                <td className="p-3">{agent.departmentName}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p className="text-center text-text-secondary py-4">No agents found.</p>
            )}
        </div>
    </Modal>
);

// A modal to display lists of maintenance records
interface MaintenanceListModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    maintenanceWithDetails: Array<Maintenance & { propertyName: string }>;
}

const MaintenanceListModal: React.FC<MaintenanceListModalProps> = ({ isOpen, onClose, title, maintenanceWithDetails }) => (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
        <div className="overflow-x-auto">
            {maintenanceWithDetails.length > 0 ? (
                <table className="w-full text-left">
                    <thead className="border-b border-border">
                        <tr>
                            <th className="p-3">Property</th>
                            <th className="p-3">Task</th>
                            <th className="p-3 text-right">Cost</th>
                            <th className="p-3">Date</th>
                            <th className="p-3">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {maintenanceWithDetails.map(task => (
                            <tr key={task.id} className="border-b border-border/50 hover:bg-secondary">
                                <td className="p-3">{task.propertyName}</td>
                                <td className="p-3">{task.task}</td>
                                <td className="p-3 text-right">{formatCurrency(task.cost)}</td>
                                <td className="p-3">{task.date}</td>
                                <td className="p-3">{task.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p className="text-center text-text-secondary py-4">No maintenance records found.</p>
            )}
        </div>
    </Modal>
);

// A modal to display commission payments
interface CommissionListModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    commissionPaymentsWithDetails: Array<CommissionPayment & { agentName: string }>;
}

const CommissionListModal: React.FC<CommissionListModalProps> = ({ isOpen, onClose, title, commissionPaymentsWithDetails }) => (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
        <div className="overflow-x-auto">
            {commissionPaymentsWithDetails.length > 0 ? (
                <table className="w-full text-left">
                    <thead className="border-b border-border">
                        <tr>
                            <th className="p-3">Agent Name</th>
                            <th className="p-3 text-right">Amount</th>
                            <th className="p-3">Payment Date</th>
                            <th className="p-3">Period</th>
                        </tr>
                    </thead>
                    <tbody>
                        {commissionPaymentsWithDetails.map(payment => (
                            <tr key={payment.id} className="border-b border-border/50 hover:bg-secondary">
                                <td className="p-3">{payment.agentName}</td>
                                <td className="p-3 text-right">{formatCurrency(payment.amount)}</td>
                                <td className="p-3">{payment.paymentDate}</td>
                                <td className="p-3">{payment.periodStartDate} to {payment.periodEndDate}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p className="text-center text-text-secondary py-4">No commission payments found.</p>
            )}
        </div>
    </Modal>
);

interface DashboardProps {
  properties: Property[];
  payments: Payment[];
  agents: Agent[];
  tenants: Tenant[];
  departments: Department[];
  currentUser: User;
  roles: Role[];
  maintenance: Maintenance[];
  commissionPayments: CommissionPayment[];
}

const Dashboard: React.FC<DashboardProps> = ({ properties, payments, agents, tenants, departments, currentUser, roles, maintenance, commissionPayments }) => {
  const [isTenantModalOpen, setIsTenantModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<{ title: string; tenants: any[] }>({ title: '', tenants: [] });
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [propertyModalContent, setPropertyModalContent] = useState<{ title: string; properties: any[] }>({ title: '', properties: [] });
  const [isExpiringLeasesModalOpen, setIsExpiringLeasesModalOpen] = useState(false);
  const [expiringLeasesModalContent, setExpiringLeasesModalContent] = useState<{ title: string; tenants: any[] }>({ title: '', tenants: [] });

  const [isCommissionModalOpen, setIsCommissionModalOpen] = useState(false);
  const [commissionModalContent, setCommissionModalContent] = useState<{ title: string; payments: any[] }>({ title: '', payments: [] });

  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [maintenanceModalContent, setMaintenanceModalContent] = useState<{ title: string; tasks: any[] }>({ title: '', tasks: [] });

  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
  const [agentModalContent, setAgentModalContent] = useState<{ title: string; agents: any[] }>({ title: '', agents: [] });


  const approvedPayments = useMemo(() => payments.filter(p => p.paymentStatus === PaymentStatus.Paid || p.paymentStatus === PaymentStatus.Deposit), [payments]);

  const tenantAnalytics = useMemo(() => {
    let paidTenants: Tenant[] = [];
    let unpaidTenants: (Tenant & { rentDue: number; depositDue: number })[] = [];
    let totalUnpaidRent = 0;
    let totalUnpaidDeposit = 0;

    tenants.forEach(tenant => {
        const property = properties.find(p => p.id === tenant.propertyId);
        if(!property) return;
        
        const rentPaid = approvedPayments
            .filter(p => p.tenantId === tenant.id && p.paymentType === PaymentType.Rent)
            .reduce((sum, p) => sum + p.amountPaid, 0);
        
        const depositPaid = approvedPayments
            .filter(p => p.tenantId === tenant.id && p.paymentType === PaymentType.Deposit)
            .reduce((sum, p) => sum + p.amountPaid, 0);
            
        const rentDue = property.rentAmount - rentPaid;
        const depositDue = property.depositAmount - depositPaid;

        if (rentDue > 0) totalUnpaidRent += rentDue;
        if (depositDue > 0) totalUnpaidDeposit += depositDue;

        if (rentDue <= 0 && depositDue <= 0) {
            paidTenants.push(tenant);
        } else {
            unpaidTenants.push({ ...tenant, rentDue, depositDue });
        }
    });
    
    return { paidTenants, unpaidTenants, totalUnpaidRent, totalUnpaidDeposit };
  }, [tenants, properties, approvedPayments]);

  const expiringLeases = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return tenants.filter(tenant => {
        const leaseEndDate = new Date(tenant.leaseEndDate);
        leaseEndDate.setHours(0, 0, 0, 0);
        const timeDiff = leaseEndDate.getTime() - today.getTime();
        const daysUntilExpiry = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        return daysUntilExpiry >= 0 && daysUntilExpiry <= 30;
    });
  }, [tenants]);

  const getPropertyName = (propertyId: string) => properties.find(p => p.id === propertyId)?.name || 'N/A';
  const getDepartmentName = (departmentId: string) => departments.find(d => d.id === departmentId)?.name || 'N/A';

  const kpis = useMemo(() => {
    const totalProperties = properties.length;
    const totalPaymentsReceived = approvedPayments.reduce((sum, p) => sum + p.amountPaid, 0);
    const totalDeposits = approvedPayments
        .filter(p => p.paymentType === PaymentType.Deposit)
        .reduce((sum, p) => sum + p.amountPaid, 0);
    const totalUnpaid = tenantAnalytics.totalUnpaidRent + tenantAnalytics.totalUnpaidDeposit;
    const totalVacant = properties.filter(p => p.status === PropertyStatus.Vacant).length;
    const totalOccupied = properties.filter(p => p.status === PropertyStatus.Occupied).length;
    const totalAmountExpected = properties.reduce((sum, p) => sum + p.rentAmount, 0);
    const totalCommissionPaid = commissionPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalMaintenanceCost = maintenance.reduce((sum, m) => sum + m.cost, 0);
    const totalAgents = agents.length;
    const totalTenants = tenants.length;
    
    return {
        totalProperties,
        totalPaymentsReceived,
        totalDeposits,
        totalUnpaid,
        totalVacant,
        totalOccupied,
        totalAmountExpected,
        totalCommissionPaid,
        totalMaintenanceCost,
        totalAgents,
        totalTenants,
    };
  }, [properties, approvedPayments, tenantAnalytics, commissionPayments, maintenance, agents, tenants]);

  const occupancyData = useMemo(() => [
    { name: 'Occupied', value: kpis.totalOccupied, color: '#4f46e5' },
    { name: 'Vacant', value: kpis.totalVacant, color: '#10b981' },
    { name: 'Maintenance', value: properties.filter(p => p.status === PropertyStatus.UnderMaintenance).length, color: '#f59e0b' },
  ], [properties, kpis.totalOccupied, kpis.totalVacant]);

  const paymentTrendsData = useMemo(() => {
    const monthlyPayments: { [key: string]: number } = {}; // key is 'YYYY-MM'
    approvedPayments.forEach(p => {
        const d = new Date(p.date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        monthlyPayments[key] = (monthlyPayments[key] || 0) + p.amountPaid;
    });

    const last6Months = [...Array(6)].map((_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        return {
            key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
            name: d.toLocaleString('default', { month: 'short', year: 'numeric' })
        };
    }).reverse();

    return last6Months.map(monthInfo => ({
        name: monthInfo.name,
        Amount: monthlyPayments[monthInfo.key] || 0,
    }));
  }, [approvedPayments]);
  
  const unpaidByDeptData = useMemo(() => {
    const data = departments.map(dept => {
        const deptUnpaid = tenantAnalytics.unpaidTenants
            .filter(t => {
                const prop = properties.find(p => p.id === t.propertyId);
                return prop && prop.departmentId === dept.id;
            })
            .reduce((sum, t) => sum + t.rentDue + t.depositDue, 0);
        return { name: dept.name, Unpaid: deptUnpaid };
    }).filter(d => d.Unpaid > 0);
    return data;
  }, [departments, properties, tenantAnalytics.unpaidTenants]);

  const getAgentPerformanceData = (agentId: string) => {
    const agentProperties = properties.filter(p => p.agentId === agentId);
    const tenantsManaged = tenants.filter(t => agentProperties.some(p => p.id === t.propertyId)).length;
    const rentCollected = approvedPayments
        .filter(p => agentProperties.some(prop => prop.id === p.propertyId))
        .reduce((sum, p) => sum + p.amountPaid, 0);
    const agent = agents.find(a => a.id === agentId);
    const commission = agent?.commissionRate ? (rentCollected * agent.commissionRate) / 100 : 0;
    return { tenantsManaged, rentCollected, commission };
  };

  const topAgents = useMemo(() => agents.map(agent => ({
      ...agent,
      ...getAgentPerformanceData(agent.id),
  })).sort((a, b) => b.rentCollected - a.rentCollected).slice(0, 5), [agents, properties, tenants, approvedPayments]);

  const handleShowUnpaidTenants = () => {
    const tenantsWithDetails = tenantAnalytics.unpaidTenants.map(t => ({
      ...t,
      propertyName: getPropertyName(t.propertyId),
      amountInfo: `Rent: ${formatCurrency(t.rentDue)}, Deposit: ${formatCurrency(t.depositDue)}`,
    }));
    setModalContent({ title: 'Tenants with Unpaid Balances', tenants: tenantsWithDetails });
    setIsTenantModalOpen(true);
  };
  
  const handleShowVacantProperties = () => {
    const vacantProps = properties
      .filter(p => p.status === PropertyStatus.Vacant)
      .map(p => ({ ...p, departmentName: getDepartmentName(p.departmentId) }));
    setPropertyModalContent({ title: 'Vacant Properties', properties: vacantProps });
    setIsPropertyModalOpen(true);
  };

  const handleShowOccupiedProperties = () => {
    const occupiedProps = properties
      .filter(p => p.status === PropertyStatus.Occupied)
      .map(p => ({ ...p, departmentName: getDepartmentName(p.departmentId) }));
    setPropertyModalContent({ title: 'Occupied Properties', properties: occupiedProps });
    setIsPropertyModalOpen(true);
  };

  const handleShowExpiringLeases = () => {
    const tenantsWithDetails = expiringLeases.map(t => {
        const leaseEndDate = new Date(t.leaseEndDate);
        const today = new Date();
        today.setHours(0,0,0,0);
        const timeDiff = leaseEndDate.getTime() - today.getTime();
        const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        return {
          ...t,
          propertyName: getPropertyName(t.propertyId),
          amountInfo: `Expires in ${daysLeft} days on ${t.leaseEndDate}`,
        }
    }).sort((a,b) => new Date(a.leaseEndDate).getTime() - new Date(b.leaseEndDate).getTime());
    
    setExpiringLeasesModalContent({ title: 'Leases Expiring in Next 30 Days', tenants: tenantsWithDetails });
    setIsExpiringLeasesModalOpen(true);
  };

  const handleShowTotalAgents = () => {
    const agentsWithDetails = agents.map(agent => ({
        ...agent,
        departmentName: getDepartmentName(agent.departmentId)
    }));
    setAgentModalContent({ title: 'All Agents', agents: agentsWithDetails });
    setIsAgentModalOpen(true);
  };

  const handleShowMaintenance = () => {
      const maintenanceWithDetails = maintenance.map(task => ({
          ...task,
          propertyName: getPropertyName(task.propertyId)
      }));
      setMaintenanceModalContent({ title: 'All Maintenance Records', tasks: maintenanceWithDetails });
      setIsMaintenanceModalOpen(true);
  };

  const handleShowCommission = () => {
      const commissionWithDetails = commissionPayments.map(payment => ({
          ...payment,
          agentName: agents.find(a => a.id === payment.agentId)?.name || 'N/A'
      }));
      setCommissionModalContent({ title: 'All Commission Payments', payments: commissionWithDetails });
      setIsCommissionModalOpen(true);
  };

  const handleShowTotalTenants = () => {
    const tenantsWithDetails = tenants.map(t => ({
      ...t,
      propertyName: getPropertyName(t.propertyId),
      amountInfo: `Lease ends: ${t.leaseEndDate}`,
    }));
    setModalContent({ title: 'All Tenants', tenants: tenantsWithDetails });
    setIsTenantModalOpen(true);
  };


  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard title="Total Properties" value={kpis.totalProperties} icon={ICONS.properties} colorClass="bg-blue-500" />
        <DashboardCard title="Total Tenants" value={kpis.totalTenants} icon={ICONS.tenants} colorClass="bg-fuchsia-500" onClick={handleShowTotalTenants} />
        <DashboardCard title="Payments Received" value={formatCurrency(kpis.totalPaymentsReceived)} icon={ICONS.payments} colorClass="bg-green-500" />
        <DashboardCard title="Leases Expiring Soon" value={expiringLeases.length} subValue="(Next 30 Days)" icon={React.cloneElement(ICONS.payments, { className: "h-6 w-6 text-white"})} colorClass="bg-orange-500" onClick={handleShowExpiringLeases} />
        <DashboardCard title="Total Unpaid Rent" value={formatCurrency(kpis.totalUnpaid)} icon={ICONS.tenants} colorClass="bg-red-500" onClick={handleShowUnpaidTenants} />
        <DashboardCard title="Vacant Properties" value={kpis.totalVacant} icon={ICONS.properties} colorClass="bg-teal-500" onClick={handleShowVacantProperties} />
        <DashboardCard title="Occupied Properties" value={kpis.totalOccupied} icon={ICONS.properties} colorClass="bg-purple-500" onClick={handleShowOccupiedProperties} />
        <DashboardCard title="Total Deposits" value={formatCurrency(kpis.totalDeposits)} icon={ICONS.payments} colorClass="bg-indigo-500" />
        <DashboardCard title="Expected Rent (All)" value={formatCurrency(kpis.totalAmountExpected)} icon={ICONS.payments} colorClass="bg-yellow-500" />
        <DashboardCard title="Total Agents" value={kpis.totalAgents} icon={ICONS.agents} colorClass="bg-cyan-500" onClick={handleShowTotalAgents} />
        <DashboardCard title="Total Maintenance" value={formatCurrency(kpis.totalMaintenanceCost)} icon={ICONS.maintenance} colorClass="bg-pink-500" onClick={handleShowMaintenance} />
        <DashboardCard title="Commissions Paid" value={formatCurrency(kpis.totalCommissionPaid)} icon={ICONS.payments} colorClass="bg-lime-500" onClick={handleShowCommission} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-card p-4 rounded-lg shadow-lg">
          <h3 className="font-bold mb-4">Payment Trends (Last 6 Months)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={paymentTrendsData}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" tickFormatter={(value) => `₦${Number(value) / 1000}k`} />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} formatter={(value: number) => `₦${value.toLocaleString()}`} />
              <Bar dataKey="Amount" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="lg:col-span-2 bg-card p-4 rounded-lg shadow-lg flex flex-col items-center">
            <h3 className="font-bold mb-4">Property Occupancy</h3>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie data={occupancyData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                        {occupancyData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card p-6 rounded-lg shadow-lg">
            <h3 className="font-bold mb-4">Top Performing Agents</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr>
                            <th className="p-2">Agent</th>
                            <th className="p-2 text-center">Tenants</th>
                            <th className="p-2 text-right">Rent Collected</th>
                            <th className="p-2 text-right">Commission</th>
                        </tr>
                    </thead>
                    <tbody>
                        {topAgents.map(agent => (
                            <tr key={agent.id} className="border-t border-border/50">
                                <td className="p-2">{agent.name}</td>
                                <td className="p-2 text-center">{agent.tenantsManaged}</td>
                                <td className="p-2 text-right">{formatCurrency(agent.rentCollected)}</td>
                                <td className="p-2 text-right text-green-400">{formatCurrency(agent.commission)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
        <div className="bg-card p-4 rounded-lg shadow-lg">
            <h3 className="font-bold mb-4">Unpaid Rent by Department</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={unpaidByDeptData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                    <XAxis type="number" stroke="#9ca3af" tickFormatter={(value) => `₦${Number(value) / 1000}k`} />
                    <YAxis type="category" dataKey="name" stroke="#9ca3af" width={80} />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} formatter={(value: number) => `₦${value.toLocaleString()}`} />
                    <Bar dataKey="Unpaid" fill="#ef4444" radius={[0, 4, 4, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
      </div>

      <TenantListModal 
        isOpen={isTenantModalOpen}
        onClose={() => setIsTenantModalOpen(false)}
        title={modalContent.title}
        tenantsWithDetails={modalContent.tenants}
      />
      <PropertyListModal 
        isOpen={isPropertyModalOpen}
        onClose={() => setIsPropertyModalOpen(false)}
        title={propertyModalContent.title}
        propertiesWithDetails={propertyModalContent.properties}
      />
      <TenantListModal 
        isOpen={isExpiringLeasesModalOpen}
        onClose={() => setIsExpiringLeasesModalOpen(false)}
        title={expiringLeasesModalContent.title}
        tenantsWithDetails={expiringLeasesModalContent.tenants}
      />
      <AgentListModal
        isOpen={isAgentModalOpen}
        onClose={() => setIsAgentModalOpen(false)}
        title={agentModalContent.title}
        agentsWithDetails={agentModalContent.agents}
      />
      <MaintenanceListModal
        isOpen={isMaintenanceModalOpen}
        onClose={() => setIsMaintenanceModalOpen(false)}
        title={maintenanceModalContent.title}
        maintenanceWithDetails={maintenanceModalContent.tasks}
      />
      <CommissionListModal
        isOpen={isCommissionModalOpen}
        onClose={() => setIsCommissionModalOpen(false)}
        title={commissionModalContent.title}
        commissionPaymentsWithDetails={commissionModalContent.payments}
      />
    </div>
  );
};

export default Dashboard;