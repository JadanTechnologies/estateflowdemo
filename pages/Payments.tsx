import React, { useState, useMemo } from 'react';
import { Payment, Tenant, Property, Permission, User, Role, PaymentType, PaymentStatus, PaymentMethod, AuditLogEntry } from '../types';
import Modal from '../components/Modal';
import PaymentForm from '../components/PaymentForm';
import { PAYMENT_METHOD_ICONS } from '../constants';


const RejectionModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  tenantName: string;
}> = ({ isOpen, onClose, onConfirm, tenantName }) => {
    const [reason, setReason] = useState('');

    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm(reason || "No reason provided.");
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Reject Payment from ${tenantName}`}>
            <div className="space-y-4">
                <p className="text-text-secondary">Please provide a reason for rejecting this payment. This will be added to the payment notes and the status will be set to 'Unpaid'.</p>
                <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full bg-secondary p-2 rounded border border-border h-24"
                    placeholder="e.g., Amount does not match, unclear proof of payment..."
                />
                <div className="flex justify-end space-x-4">
                    <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">Cancel</button>
                    <button type="button" onClick={handleConfirm} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">Confirm Rejection</button>
                </div>
            </div>
        </Modal>
    );
};


const Payments: React.FC<{
    payments: Payment[];
    tenants: Tenant[];
    properties: Property[];
    setPayments: React.Dispatch<React.SetStateAction<Payment[]>>;
    currentUser: User;
    roles: Role[];
    userHasPermission: (permission: Permission) => boolean;
    onPrintReceipt: (payment: Payment) => void;
    addAuditLog: (action: string, details: string, targetId?: string) => void;
}> = ({ payments, tenants, properties, setPayments, currentUser, roles, userHasPermission, onPrintReceipt, addAuditLog }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [paymentTypeFilter, setPaymentTypeFilter] = useState('all');
  const [viewingProofUrl, setViewingProofUrl] = useState<string | null>(null);
  const [rejectingPayment, setRejectingPayment] = useState<Payment | null>(null);
  
  const userRole = useMemo(() => roles.find(r => r.id === currentUser.roleId), [roles, currentUser.roleId]);
  const canManageGlobally = userHasPermission(Permission.MANAGE_PAYMENTS);
  const canManageOwn = userRole?.name === 'Agent' && userHasPermission(Permission.AGENT_CAN_RECORD_PAYMENTS_FOR_OWN_TENANTS);

  const { approvedPayments, pendingPayments } = useMemo(() => {
      const approved = payments.filter(p => p.paymentStatus !== PaymentStatus.PendingApproval);
      const pending = payments.filter(p => p.paymentStatus === PaymentStatus.PendingApproval);
      return { approvedPayments: approved, pendingPayments: pending };
  }, [payments]);

  const filteredPayments = useMemo(() => {
    let basePayments = approvedPayments;
    if (paymentTypeFilter !== 'all') {
        return basePayments.filter(p => p.paymentType === paymentTypeFilter);
    }
    return basePayments;
  }, [approvedPayments, paymentTypeFilter]);

  const getTenantName = (tenantId: string) => tenants.find(t => t.id === tenantId)?.fullName || 'N/A';
  const getPropertyName = (propertyId: string) => properties.find(p => p.id === propertyId)?.name || 'N/A';
  
  const handleSave = (payment: Payment) => {
    const isNewPayment = !selectedPayment;
    const tenantName = getTenantName(payment.tenantId);
    const amountStr = `₦${payment.amountPaid.toLocaleString()}`;

    if (isNewPayment) {
      setPayments(prevPayments => [...prevPayments, { ...payment, receiptPrinted: false }]);
      addAuditLog('CREATED_PAYMENT', `Recorded payment of ${amountStr} for ${tenantName}`, payment.id);
    } else {
      setPayments(prevPayments => prevPayments.map(p => p.id === payment.id ? payment : p));
      addAuditLog('UPDATED_PAYMENT', `Updated payment of ${amountStr} for ${tenantName}`, payment.id);
    }
    
    setIsModalOpen(false);
    setSelectedPayment(null);

    // Use a timeout to allow the modal to close before showing the confirm dialog.
    setTimeout(() => {
      if(payment.paymentStatus !== PaymentStatus.PendingApproval) {
        const message = isNewPayment 
          ? "Payment saved successfully! Would you like to print a receipt?" 
          : "Payment updated successfully! Would you like to print an updated receipt?";
          
        if (window.confirm(message)) {
          onPrintReceipt(payment);
        }
      }
    }, 100);
  };
  
  const getStatusColor = (status: PaymentStatus) => {
    switch(status) {
        case PaymentStatus.Paid: return 'bg-green-500/20 text-green-400';
        case PaymentStatus.Deposit: return 'bg-blue-500/20 text-blue-400';
        case PaymentStatus.Unpaid: return 'bg-red-500/20 text-red-400';
        case PaymentStatus.PendingApproval: return 'bg-yellow-500/20 text-yellow-400';
    }
  }

  const canEditThisPayment = (payment: Payment) => {
    if (canManageGlobally) return true;
    if (!canManageOwn) return false;
    const property = properties.find(p => p.id === payment.propertyId);
    return property?.agentId === currentUser.id;
  }

  const handleApproval = (paymentId: string, isApproved: boolean) => {
      const paymentToUpdate = payments.find(p => p.id === paymentId);
      if (!paymentToUpdate) return;
      
      const tenantName = getTenantName(paymentToUpdate.tenantId);
      const amountStr = `₦${paymentToUpdate.amountPaid.toLocaleString()}`;

      if (isApproved) {
        setPayments(prev => prev.map(p => 
            p.id === paymentId ? { ...p, paymentStatus: PaymentStatus.Paid } : p
        ));
        addAuditLog('APPROVED_PAYMENT', `Approved payment of ${amountStr} from ${tenantName}`, paymentId);
    } else {
        setRejectingPayment(paymentToUpdate);
    }
  };

  const handleConfirmReject = (reason: string) => {
    if (!rejectingPayment) return;
    
    const tenantName = getTenantName(rejectingPayment.tenantId);
    const amountStr = `₦${rejectingPayment.amountPaid.toLocaleString()}`;

    setPayments(prev => prev.map(p => 
        p.id === rejectingPayment.id 
            ? { ...p, paymentStatus: PaymentStatus.Unpaid, notes: `${p.notes || ''}\nRejection Reason: ${reason}`.trim() }
            : p
    ));
    
    addAuditLog('REJECTED_PAYMENT', `Rejected payment of ${amountStr} from ${tenantName}. Reason: ${reason}`, rejectingPayment.id);
    setRejectingPayment(null);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Payments</h2>
        {(canManageGlobally || canManageOwn) && (
            <button onClick={() => { setSelectedPayment(null); setIsModalOpen(true); }} className="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded">
              Add Payment
            </button>
        )}
      </div>

      {canManageGlobally && pendingPayments.length > 0 && (
          <div className="bg-card p-6 rounded-lg shadow-lg mb-6">
              <h3 className="text-lg font-bold mb-4">Pending Approvals</h3>
              <div className="overflow-x-auto">
                  <table className="w-full text-left">
                      <thead className="border-b border-border">
                          <tr>
                              <th className="p-3">Tenant</th>
                              <th className="p-3">Amount</th>
                              <th className="p-3">Method</th>
                              <th className="p-3">Date</th>
                              <th className="p-3">Notes</th>
                              <th className="p-3">Proof</th>
                              <th className="p-3">Actions</th>
                          </tr>
                      </thead>
                      <tbody>
                          {pendingPayments.map(p => (
                              <tr key={p.id} className="border-b border-border/50">
                                  <td className="p-3">{getTenantName(p.tenantId)}</td>
                                  <td className="p-3">₦{p.amountPaid.toLocaleString()}</td>
                                  <td className="p-3">{p.paymentMethod}</td>
                                  <td className="p-3">{new Date(p.date).toLocaleDateString()}</td>
                                  <td className="p-3 text-sm italic text-text-secondary">{p.notes}</td>
                                  <td className="p-3">
                                      {p.proofOfPayment ? (
                                          <button onClick={() => setViewingProofUrl(p.proofOfPayment!)} className="text-blue-400 hover:underline text-xs">View Proof</button>
                                      ) : (
                                          <span className="text-xs text-text-secondary">N/A</span>
                                      )}
                                  </td>
                                  <td className="p-3 space-x-2">
                                      <button onClick={() => handleApproval(p.id, true)} className="bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-xs">Approve</button>
                                      <button onClick={() => handleApproval(p.id, false)} className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-xs">Reject</button>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>
      )}
      
      <div className="mb-6 flex items-center space-x-4 bg-card p-4 rounded-lg">
        <label htmlFor="paymentTypeFilter" className="text-sm font-medium text-text-secondary">Filter by Payment Type:</label>
        <select
            id="paymentTypeFilter"
            value={paymentTypeFilter}
            onChange={(e) => setPaymentTypeFilter(e.target.value)}
            className="bg-secondary p-2 rounded border border-border focus:ring-2 focus:ring-primary focus:outline-none"
        >
            <option value="all">All Types</option>
            {Object.values(PaymentType).map(type => (
                <option key={type} value={type}>{type}</option>
            ))}
        </select>
      </div>

      <div className="bg-card rounded-lg shadow-lg overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b border-border">
            <tr>
              <th className="p-4">Tenant</th>
              <th className="p-4">Property</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Date & Time</th>
              <th className="p-4">Method</th>
              <th className="p-4">Status</th>
              <th className="p-4">Receipt Status</th>
              {(canManageGlobally || canManageOwn) && <th className="p-4">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredPayments.map(payment => (
              <tr key={payment.id} className="border-b border-border/50 hover:bg-secondary">
                <td className="p-4">{getTenantName(payment.tenantId)}</td>
                <td className="p-4">{getPropertyName(payment.propertyId)}</td>
                <td className="p-4">₦{payment.amountPaid.toLocaleString()}</td>
                <td className="p-4">{new Date(payment.date).toLocaleString()}</td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <span className="text-text-secondary">{PAYMENT_METHOD_ICONS[payment.paymentMethod]}</span>
                    <span>{payment.paymentMethod}</span>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.paymentStatus)}`}>
                    {payment.paymentStatus}
                  </span>
                </td>
                <td className="p-4">
                  {payment.receiptPrinted && (
                     <span className="flex items-center gap-1 text-xs text-green-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                        Printed
                    </span>
                  )}
                </td>
                 {(canManageGlobally || canManageOwn) && (
                    <td className="p-4 space-x-2 whitespace-nowrap">
                      {canEditThisPayment(payment) && (
                        <button onClick={() => { setSelectedPayment(payment); setIsModalOpen(true); }} className="text-blue-400 hover:text-blue-300">Edit</button>
                      )}
                      <button onClick={() => onPrintReceipt(payment)} className="text-green-400 hover:text-green-300">{payment.receiptPrinted ? 'Reprint' : 'Print'}</button>
                    </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedPayment ? 'Edit Payment' : 'Record New Payment'}>
        <PaymentForm payment={selectedPayment} tenants={tenants} properties={properties} payments={payments} onSave={handleSave} onClose={() => setIsModalOpen(false)} />
      </Modal>
      
      <Modal isOpen={!!viewingProofUrl} onClose={() => setViewingProofUrl(null)} title="Proof of Payment">
          {viewingProofUrl && <img src={viewingProofUrl} alt="Proof of payment" className="max-w-full h-auto rounded-lg" />}
      </Modal>

      <RejectionModal 
          isOpen={!!rejectingPayment}
          onClose={() => setRejectingPayment(null)}
          onConfirm={handleConfirmReject}
          tenantName={rejectingPayment ? getTenantName(rejectingPayment.tenantId) : ''}
      />
    </div>
  );
};

export default Payments;