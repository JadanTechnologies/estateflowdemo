



import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { generateSmartReport } from '../services/geminiService';
import { Property, Payment, Maintenance, Agent, Tenant, PaymentType, User, Role, Department, PaymentStatus } from '../types';

// Add this at the top of the file for jsPDF types
declare global {
  interface Window {
    jspdf: any;
  }
}

// Helper to format currency
const formatCurrency = (amount: number) => `₦${amount.toLocaleString()}`;

// A new component to render the data table
const ReportTable: React.FC<{
    reportType: string;
    data: any[];
    properties: Property[];
    tenants: Tenant[];
    agents: Agent[];
    departments: Department[];
}> = ({ reportType, data, properties, tenants, agents, departments }) => {
    if (!data || data.length === 0) return null;

    const getTenantName = (tenantId: string) => tenants.find(t => t.id === tenantId)?.fullName || 'N/A';
    const getPropertyName = (propertyId: string) => properties.find(p => p.id === propertyId)?.name || 'N/A';
    const getDepartmentName = (departmentId: string) => departments.find(d => d.id === departmentId)?.name || 'N/A';

    const renderHeaders = () => {
        switch (reportType) {
            case 'payments':
                return <tr>
                    <th className="p-3">Tenant</th><th className="p-3">Property</th><th className="p-3 text-right">Amount Paid</th>
                    <th className="p-3">Date</th><th className="p-3">Type</th><th className="p-3">Method</th><th className="p-3">Status</th>
                </tr>;
            case 'unpaid_balances':
                return <tr>
                    <th className="p-3">Tenant</th><th className="p-3">Property</th>
                    <th className="p-3 text-right">Rent Due</th><th className="p-3 text-right">Deposit Due</th>
                    <th className="p-3 text-right">Total Due</th>
                </tr>;
            case 'maintenance':
                return <tr>
                    <th className="p-3">Property</th><th className="p-3">Task</th><th className="p-3 text-right">Cost</th>
                    <th className="p-3">Date</th><th className="p-3">Status</th>
                </tr>;
            case 'agents':
                 return <tr>
                    <th className="p-3">Agent</th><th className="p-3">Department</th><th className="p-3">Tenants</th>
                    <th className="p-3 text-right">Rent Collected</th>
                </tr>;
            case 'properties':
                return <tr>
                    <th className="p-3">Property</th><th className="p-3">Department</th><th className="p-3">Status</th>
                    <th className="p-3 text-right">Rent Amount</th><th className="p-3 text-right">Total Paid</th>
                </tr>
            default: return null;
        }
    };

    const renderRows = () => {
        switch (reportType) {
            case 'payments':
                return data.map((item: Payment) => (
                    <tr key={item.id}><td className="p-3">{getTenantName(item.tenantId)}</td><td className="p-3">{getPropertyName(item.propertyId)}</td>
                    <td className="p-3 text-right">{formatCurrency(item.amountPaid)}</td><td className="p-3">{item.date}</td>
                    <td className="p-3">{item.paymentType}</td><td className="p-3">{item.paymentMethod}</td><td className="p-3">{item.paymentStatus}</td></tr>
                ));
            case 'unpaid_balances':
                return data.map((item: any, index: number) => (
                    <tr key={index}>
                        <td className="p-3">{item.tenantName}</td><td className="p-3">{item.propertyName}</td>
                        <td className="p-3 text-right text-red-400">{formatCurrency(item.rentDue)}</td>
                        <td className="p-3 text-right text-yellow-400">{formatCurrency(item.depositDue)}</td>
                        <td className="p-3 text-right font-bold">{formatCurrency(item.totalDue)}</td>
                    </tr>
                ));
            case 'maintenance':
                 return data.map((item: Maintenance) => (
                    <tr key={item.id}><td className="p-3">{getPropertyName(item.propertyId)}</td><td className="p-3">{item.task}</td>
                    <td className="p-3 text-right">{formatCurrency(item.cost)}</td><td className="p-3">{item.date}</td><td className="p-3">{item.status}</td></tr>
                ));
            case 'agents':
                return data.map((item: any, index: number) => (
                    <tr key={index}><td className="p-3">{item.name}</td><td className="p-3">{getDepartmentName(item.departmentId)}</td>
                    <td className="p-3">{item.tenantsManaged}</td><td className="p-3 text-right">{formatCurrency(item.rentCollected)}</td></tr>
                ));
            case 'properties':
                 return data.map((item: any, index: number) => (
                    <tr key={index}><td className="p-3">{item.name}</td><td className="p-3">{getDepartmentName(item.departmentId)}</td>
                    <td className="p-3">{item.status}</td><td className="p-3 text-right">{formatCurrency(item.rentAmount)}</td>
                    <td className="p-3 text-right">{formatCurrency(item.totalPaid)}</td></tr>
                 ));
            default: return null;
        }
    };

    const renderTotals = () => {
        if (reportType === 'unpaid_balances') {
             const totals = data.reduce((acc, item) => {
                acc.rentDue += item.rentDue || 0;
                acc.depositDue += item.depositDue || 0;
                acc.totalDue += item.totalDue || 0;
                return acc;
             }, { rentDue: 0, depositDue: 0, totalDue: 0 });
            return (
                <tr className="font-bold border-t-2 border-border">
                    <td colSpan={2} className="p-3 text-right">Grand Totals</td>
                    <td className="p-3 text-right">{formatCurrency(totals.rentDue)}</td>
                    <td className="p-3 text-right">{formatCurrency(totals.depositDue)}</td>
                    <td className="p-3 text-right">{formatCurrency(totals.totalDue)}</td>
                </tr>
            );
        }
        // Special case for 'properties' report to show totals for multiple columns
        if (reportType === 'properties') {
            const totals = data.reduce((acc, item) => {
                acc.rentAmount += item.rentAmount || 0;
                acc.totalPaid += item.totalPaid || 0;
                return acc;
            }, { rentAmount: 0, totalPaid: 0 });

            return (
                <tr className="font-bold border-t-2 border-border">
                    <td colSpan={3} className="p-3 text-right">Grand Totals</td>
                    <td className="p-3 text-right">{formatCurrency(totals.rentAmount)}</td>
                    <td className="p-3 text-right">{formatCurrency(totals.totalPaid)}</td>
                </tr>
            );
        }

        let total = 0;
        let totalColumnIndex = 0;
        let totalColumns = 0;

        // Configuration for other report types
        switch (reportType) {
            case 'payments':
                total = data.reduce((sum, item) => sum + (item.amountPaid || 0), 0);
                totalColumns = 7;
                totalColumnIndex = 3;
                break;
            case 'maintenance':
                total = data.reduce((sum, item) => sum + (item.cost || 0), 0);
                totalColumns = 5;
                totalColumnIndex = 3;
                break;
            case 'agents':
                total = data.reduce((sum, item) => sum + (item.rentCollected || 0), 0);
                totalColumns = 4;
                totalColumnIndex = 4;
                break;
            default: return null;
        }

        const labelColSpan = totalColumnIndex - 1;
        const remainingColSpan = totalColumns - totalColumnIndex;

        return (
            <tr className="font-bold border-t-2 border-border">
                {labelColSpan > 0 && <td colSpan={labelColSpan} className="p-3 text-right">Grand Total</td>}
                <td className="p-3 text-right">{formatCurrency(total)}</td>
                {remainingColSpan > 0 && <td colSpan={remainingColSpan} />}
            </tr>
        );
    };
    
    return (
        <div className="bg-secondary rounded-lg shadow-inner overflow-x-auto mt-6">
            <table className="w-full text-left">
                <thead className="border-b border-border bg-card">{renderHeaders()}</thead>
                <tbody className="divide-y divide-border/50">{renderRows()}</tbody>
                <tfoot>{renderTotals()}</tfoot>
            </table>
        </div>
    )
};

interface ReportsProps {
  properties: Property[];
  payments: Payment[];
  maintenance: Maintenance[];
  agents: Agent[];
  tenants: Tenant[];
  departments: Department[];
  currentUser: User;
  roles: Role[];
}

const Reports: React.FC<ReportsProps> = ({ properties, payments, maintenance, agents, tenants, departments, currentUser, roles }) => {
  const [reportType, setReportType] = useState('payments');
  const [reportContent, setReportContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tableData, setTableData] = useState<any[]>([]);
  const [reportTitle, setReportTitle] = useState('');

  // Filter states
  const [dateRange, setDateRange] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedProperty, setSelectedProperty] = useState('all');
  const [selectedTenant, setSelectedTenant] = useState('all');
  const [selectedPaymentType, setSelectedPaymentType] = useState('all');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('all');
  
  const userRole = useMemo(() => roles.find(r => r.id === currentUser.roleId), [roles, currentUser.roleId]);

  const visibleData = useMemo(() => {
    if (userRole?.name === 'Super Admin' || userRole?.name === 'Accountant') {
      return { properties, payments, tenants, agents, maintenance };
    }
    
    let userProperties: Property[];
    if (userRole?.name === 'Property Manager') {
        userProperties = properties.filter(p => p.departmentId === currentUser.departmentId);
    } else { // Agent - Note: Agents can't access reports page by default nav rules
        userProperties = [];
    }

    const propertyIds = new Set(userProperties.map(p => p.id));
    const userTenants = tenants.filter(t => propertyIds.has(t.propertyId));
    const userPayments = payments.filter(p => propertyIds.has(p.propertyId));
    const userMaintenance = maintenance.filter(m => propertyIds.has(m.propertyId));
    const userAgentIds = new Set(userProperties.map(p => p.agentId));
    const userAgents = agents.filter(a => userAgentIds.has(a.id));

    return { properties: userProperties, payments: userPayments, tenants: userTenants, agents: userAgents, maintenance: userMaintenance };
  }, [currentUser, userRole, properties, payments, tenants, agents, maintenance]);

  const availableTenants = useMemo(() => selectedProperty === 'all' 
    ? visibleData.tenants 
    : visibleData.tenants.filter(t => t.propertyId === selectedProperty),
  [selectedProperty, visibleData.tenants]);

  useEffect(() => {
    setSelectedTenant('all');
  }, [selectedProperty]);


  const handleGenerateReport = useCallback(async () => {
    setIsLoading(true);
    setReportContent('');
    setTableData([]);
    setReportTitle('');
    
    const getFilterDates = () => {
        const now = new Date();
        let start: Date | null = null;
        let end: Date | null = new Date();

        switch (dateRange) {
            case 'daily': start = new Date(now.setHours(0, 0, 0, 0)); break;
            case 'weekly': start = new Date(now.setDate(now.getDate() - now.getDay())); start.setHours(0,0,0,0); break;
            case 'monthly': start = new Date(now.getFullYear(), now.getMonth(), 1); break;
            case 'yearly': start = new Date(now.getFullYear(), 0, 1); break;
            case 'custom':
                start = startDate ? new Date(startDate) : null;
                end = endDate ? new Date(endDate) : null;
                if(end) end.setHours(23, 59, 59, 999); // include the whole day
                break;
            default: start = null; end = null;
        }
        return { start, end };
    }

    const { start, end } = getFilterDates();

    const filterByDate = <T extends { date: string }>(items: T[]): T[] => {
        if (!start && !end) return items;
        return items.filter(item => {
            const itemDate = new Date(item.date);
            const afterStart = start ? itemDate >= start : true;
            const beforeEnd = end ? itemDate <= end : true;
            return afterStart && beforeEnd;
        });
    };
    
    // Apply filters
    let finalPayments = filterByDate<Payment>(visibleData.payments);
    if (selectedProperty !== 'all') finalPayments = finalPayments.filter(p => p.propertyId === selectedProperty);
    if (selectedTenant !== 'all') finalPayments = finalPayments.filter(p => p.tenantId === selectedTenant);
    if (reportType === 'payments' && selectedPaymentType !== 'all') finalPayments = finalPayments.filter(p => p.paymentType === selectedPaymentType);
    if (reportType === 'payments' && selectedPaymentStatus !== 'all') {
        finalPayments = finalPayments.filter(p => p.paymentStatus === selectedPaymentStatus);
    }


    let finalMaintenance = filterByDate<Maintenance>(visibleData.maintenance);
    if (selectedProperty !== 'all') finalMaintenance = finalMaintenance.filter(m => m.propertyId === selectedProperty);
    
    let processedData: any[] = [];
    let title = 'Smart Report';

    switch (reportType) {
      case 'payments':
        processedData = finalPayments;
        title = 'Filtered Payment and Rent Report';
        break;
      case 'unpaid_balances':
        title = 'Unpaid Balances Report';
        processedData = visibleData.tenants.map(tenant => {
            const property = visibleData.properties.find(p => p.id === tenant.propertyId);
            if (!property) return null;
            if (selectedProperty !== 'all' && property.id !== selectedProperty) return null;
            if (selectedTenant !== 'all' && tenant.id !== selectedTenant) return null;

            const rentPaid = visibleData.payments
                .filter(p => p.tenantId === tenant.id && p.paymentType === PaymentType.Rent)
                .reduce((sum, p) => sum + p.amountPaid, 0);
            
            const depositPaid = visibleData.payments
                .filter(p => p.tenantId === tenant.id && p.paymentType === PaymentType.Deposit)
                .reduce((sum, p) => sum + p.amountPaid, 0);

            const rentDue = property.rentAmount - rentPaid;
            const depositDue = property.depositAmount - depositPaid;

            if (rentDue <= 0 && depositDue <= 0) return null;

            return {
                tenantName: tenant.fullName,
                propertyName: property.name,
                rentDue: rentDue > 0 ? rentDue : 0,
                depositDue: depositDue > 0 ? depositDue : 0,
                totalDue: (rentDue > 0 ? rentDue : 0) + (depositDue > 0 ? depositDue : 0),
            };
        }).filter(Boolean) as any[];
        break;
      case 'properties':
        const propsToDisplay = selectedProperty !== 'all' ? visibleData.properties.filter(p => p.id === selectedProperty) : visibleData.properties;
        processedData = propsToDisplay.map(prop => ({
            ...prop,
            totalPaid: finalPayments.filter(p => p.propertyId === prop.id).reduce((sum, p) => sum + p.amountPaid, 0)
        }));
        title = 'Filtered Property Occupancy and Financials Report';
        break;
      case 'maintenance':
        processedData = finalMaintenance;
        title = 'Filtered Maintenance Expenses Report';
        break;
      case 'agents':
        processedData = visibleData.agents.map(agent => ({
            ...agent,
            tenantsManaged: visibleData.tenants.filter(t => visibleData.properties.some(p => p.id === t.propertyId && p.agentId === agent.id)).length,
            rentCollected: finalPayments.filter(p => visibleData.properties.some(prop => prop.id === p.propertyId && prop.agentId === agent.id)).reduce((sum, p) => sum + p.amountPaid, 0)
        }));
        title = 'Filtered Agent Performance Report';
        break;
    }
    
    setTableData(processedData);
    setReportTitle(title);

    if (processedData.length === 0) {
        setReportContent("No data available for the selected filters.");
        setIsLoading(false);
        return;
    }

    try {
      const result = await generateSmartReport(processedData, title);
      setReportContent(result);
    } catch (error) {
      console.error(error);
      setReportContent("Failed to generate report.");
    } finally {
      setIsLoading(false);
    }
  }, [reportType, dateRange, startDate, endDate, selectedProperty, selectedTenant, selectedPaymentType, selectedPaymentStatus, visibleData]);
  
  const handleExportPDF = () => {
    if (tableData.length === 0) {
        alert("Please generate a report with data first.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    if (typeof (doc as any).autoTable !== 'function') {
        console.error("jspdf-autotable is not loaded correctly!");
        alert("Could not export to PDF. The autotable plugin is missing.");
        return;
    }
    
    const companyInfo = {
        name: 'EstateFlow Inc.',
        address: '123 Property Lane, Real Estate City',
        phone: '555-123-4567',
    };

    const logoSVG = '<svg viewBox="0 0 24 24" fill="#4f46e5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5-10-5-10 5zM2 12l10 5 10-5-10-5-10 5z"></path></svg>';
    const logoDataURL = 'data:image/svg+xml;base64,' + btoa(logoSVG);
    const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();

    // Define header
    const addHeader = () => {
        doc.addImage(logoDataURL, 'SVG', 15, 12, 12, 12);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text(companyInfo.name, 30, 20);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100);
        doc.text(`${companyInfo.address} | ${companyInfo.phone}`, 30, 25);

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0);
        doc.text(reportTitle, pageWidth - 15, 20, { align: 'right' });
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - 15, 25, { align: 'right' });
        
        doc.setDrawColor(200);
        doc.line(15, 32, pageWidth - 15, 32);
    };

    addHeader();
    const yPos = 42;

    // --- REMOVED AI SUMMARY SECTION FOR PRINTING ---

    let head: any[] = [];
    let body: any[] = [];
    let foot: any[] = [];
    const getTenantName = (tenantId: string) => visibleData.tenants.find(t => t.id === tenantId)?.fullName || 'N/A';
    const getPropertyName = (propertyId: string) => visibleData.properties.find(p => p.id === propertyId)?.name || 'N/A';
    const getDepartmentName = (departmentId: string) => departments.find(d => d.id === departmentId)?.name || 'N/A';

    switch (reportType) {
        case 'payments':
            head = [['Tenant', 'Property', 'Amount', 'Date', 'Type', 'Method', 'Status']];
            body = tableData.map((item: Payment) => [ getTenantName(item.tenantId), getPropertyName(item.propertyId), formatCurrency(item.amountPaid), item.date, item.paymentType, item.paymentMethod, item.paymentStatus ]);
            foot = [['', 'Grand Total', formatCurrency(tableData.reduce((s, i) => s + i.amountPaid, 0)), '', '', '', '']];
            break;
        case 'unpaid_balances':
            head = [['Tenant', 'Property', 'Rent Due', 'Deposit Due', 'Total Due']];
            body = tableData.map((item: any) => [ item.tenantName, item.propertyName, formatCurrency(item.rentDue), formatCurrency(item.depositDue), formatCurrency(item.totalDue) ]);
            const totals_balances = tableData.reduce((acc, item) => {
                acc.rentDue += item.rentDue || 0;
                acc.depositDue += item.depositDue || 0;
                acc.totalDue += item.totalDue || 0;
                return acc;
            }, { rentDue: 0, depositDue: 0, totalDue: 0 });
            foot = [['', 'Grand Totals', formatCurrency(totals_balances.rentDue), formatCurrency(totals_balances.depositDue), formatCurrency(totals_balances.totalDue)]];
            break;
        case 'properties':
            head = [['Property', 'Department', 'Status', 'Rent Amount', 'Total Paid']];
            body = tableData.map((item: any) => [ item.name, getDepartmentName(item.departmentId), item.status, formatCurrency(item.rentAmount), formatCurrency(item.totalPaid) ]);
            const totals = tableData.reduce((acc, item) => { acc.rentAmount += item.rentAmount || 0; acc.totalPaid += item.totalPaid || 0; return acc; }, { rentAmount: 0, totalPaid: 0 });
            foot = [['', '', 'Grand Totals', formatCurrency(totals.rentAmount), formatCurrency(totals.totalPaid)]];
            break;
        case 'maintenance':
            head = [['Property', 'Task', 'Cost', 'Date', 'Status']];
            body = tableData.map((item: Maintenance) => [ getPropertyName(item.propertyId), item.task, formatCurrency(item.cost), item.date, item.status ]);
            foot = ['', 'Grand Total', formatCurrency(tableData.reduce((s, i) => s + i.cost, 0)), '', ''];
            break;
        case 'agents':
            head = [['Agent', 'Department', 'Tenants', 'Rent Collected']];
            body = tableData.map((item: any) => [ item.name, getDepartmentName(item.departmentId), item.tenantsManaged, formatCurrency(item.rentCollected) ]);
            foot = ['', '', 'Grand Total', formatCurrency(tableData.reduce((s, i) => s + i.rentCollected, 0))];
            break;
    }

    (doc as any).autoTable({
        startY: yPos,
        head, body, foot,
        theme: 'grid',
        headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255] },
        footStyles: { fillColor: [31, 41, 55], textColor: [255, 255, 255], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [240, 240, 240] },
        didDrawPage: function (data: any) {
            // Footer
            const pageCount = doc.internal.getNumberOfPages();
            doc.setFontSize(9);
            doc.setTextColor(150);
            doc.text(`Page ${data.pageNumber} of ${pageCount}`, data.settings.margin.left, pageHeight - 10);
            doc.text(`EstateFlow Report`, pageWidth - data.settings.margin.right, pageHeight - 10, { align: 'right' });
        }
    });
    
    const date = new Date().toISOString().split('T')[0];
    doc.save(`EstateFlow_Report_${reportType}_${date}.pdf`);
  };

  // Basic markdown to HTML renderer
  const renderMarkdown = (text: string) => {
    return text
      .split('\n')
      .map((line, index) => {
        if (line.startsWith('### ')) return <h3 key={index} className="text-lg font-semibold mt-4 mb-2">{line.substring(4)}</h3>;
        if (line.startsWith('## ')) return <h2 key={index} className="text-xl font-bold mt-6 mb-3 border-b border-border pb-2">{line.substring(3)}</h2>;
        if (line.startsWith('# ')) return <h1 key={index} className="text-2xl font-extrabold mt-8 mb-4">{line.substring(2)}</h1>;
        if (line.startsWith('* ')) return <li key={index} className="ml-6 list-disc">{line.substring(2)}</li>;
        if (line.trim() === '') return <br key={index} />;
        return <p key={index}>{line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p>;
      });
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Reports & Summaries</h2>

      <div className="bg-card p-6 rounded-lg shadow-lg mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <div>
              <label htmlFor="reportType" className="block text-sm font-medium text-text-secondary mb-1">Report Type</label>
              <select id="reportType" value={reportType} onChange={(e) => setReportType(e.target.value)} className="w-full bg-secondary p-2 rounded border border-border">
                <option value="payments">Rent & Payments</option>
                <option value="unpaid_balances">Unpaid Balances</option>
                <option value="properties">Properties</option>
                <option value="maintenance">Maintenance</option>
                <option value="agents">Agent Performance</option>
              </select>
            </div>
            <div>
              <label htmlFor="dateRange" className="block text-sm font-medium text-text-secondary mb-1">Date Range</label>
              <select id="dateRange" value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="w-full bg-secondary p-2 rounded border border-border">
                <option value="all">All Time</option>
                <option value="daily">Today</option>
                <option value="weekly">This Week</option>
                <option value="monthly">This Month</option>
                <option value="yearly">This Year</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            {dateRange === 'custom' && (
              <div className="sm:col-span-2 lg:col-span-1 xl:col-span-2">
                  <label htmlFor="customDate" className="block text-sm font-medium text-text-secondary mb-1">Custom Date Range</label>
                  <div className="flex items-center space-x-2 bg-secondary p-1 rounded border border-border">
                      <input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-transparent p-1 focus:outline-none" />
                      <span className="text-text-secondary">to</span>
                      <input type="date" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-transparent p-1 focus:outline-none" />
                  </div>
              </div>
            )}
             <div>
              <label htmlFor="property" className="block text-sm font-medium text-text-secondary mb-1">Property</label>
              <select id="property" value={selectedProperty} onChange={(e) => setSelectedProperty(e.target.value)} className="w-full bg-secondary p-2 rounded border border-border">
                <option value="all">All Properties</option>
                {visibleData.properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="tenant" className="block text-sm font-medium text-text-secondary mb-1">Tenant</label>
              <select id="tenant" value={selectedTenant} onChange={(e) => setSelectedTenant(e.target.value)} className="w-full bg-secondary p-2 rounded border border-border" disabled={availableTenants.length === 0}>
                <option value="all">All Tenants</option>
                {availableTenants.map(t => <option key={t.id} value={t.id}>{t.fullName}</option>)}
              </select>
            </div>
            {reportType === 'payments' && (
                <>
                    <div>
                      <label htmlFor="paymentType" className="block text-sm font-medium text-text-secondary mb-1">Payment Type</label>
                      <select id="paymentType" value={selectedPaymentType} onChange={(e) => setSelectedPaymentType(e.target.value)} className="w-full bg-secondary p-2 rounded border border-border">
                        <option value="all">All Types</option>
                        {Object.values(PaymentType).map(pt => <option key={pt} value={pt}>{pt}</option>)}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="paymentStatus" className="block text-sm font-medium text-text-secondary mb-1">Payment Status</label>
                      <select id="paymentStatus" value={selectedPaymentStatus} onChange={(e) => setSelectedPaymentStatus(e.target.value)} className="w-full bg-secondary p-2 rounded border border-border">
                        <option value="all">All Statuses</option>
                        {Object.values(PaymentStatus).map(ps => <option key={ps} value={ps}>{ps}</option>)}
                      </select>
                    </div>
                </>
            )}
        </div>
        <div className="mt-6 flex justify-end">
            <button onClick={handleGenerateReport} disabled={isLoading} className="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded w-full sm:w-auto disabled:bg-opacity-50 disabled:cursor-not-allowed">
              {isLoading ? 'Generating...' : 'Generating Report'}
            </button>
        </div>
      </div>
      
      {tableData.length > 0 && !isLoading && (
        <div className="bg-card p-6 rounded-lg shadow-lg mb-6">
            <h3 className="text-xl font-bold mb-4">Filtered Data</h3>
            <ReportTable 
                reportType={reportType} 
                data={tableData}
                properties={visibleData.properties}
                tenants={visibleData.tenants}
                agents={visibleData.agents}
                departments={departments}
            />
        </div>
      )}

      <div className="bg-card p-6 rounded-lg shadow-lg min-h-[300px]">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">AI-Powered Smart Summary</h3>
            {reportContent && tableData.length > 0 && !isLoading && (
                <button 
                    onClick={handleExportPDF} 
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Export to PDF
                </button>
            )}
        </div>
        {isLoading && <div className="text-center p-10 animate-pulse">Generating your smart report with Gemini...</div>}
        {reportContent && (
          <div id="report-content" className="prose prose-invert max-w-none">
            {renderMarkdown(reportContent)}
          </div>
        )}
         {!isLoading && !reportContent && (
          <div className="text-center text-text-secondary p-10">
            Select your report criteria and click "Generate Report" to see the filtered data and an AI-powered summary.
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
