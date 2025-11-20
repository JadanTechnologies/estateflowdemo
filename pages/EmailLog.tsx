import React, { useState } from 'react';
import { EmailLogEntry } from '../types';
import Modal from '../components/Modal';

const EmailLog: React.FC<{ emailLog: EmailLogEntry[] }> = ({ emailLog }) => {
    const [selectedEmail, setSelectedEmail] = useState<EmailLogEntry | null>(null);

    const sortedLog = [...emailLog].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Automated Email Log</h2>
            <p className="text-text-secondary mb-6 text-sm max-w-3xl">
                This log shows a history of automated emails that would be sent to tenants for events like rent reminders and lease expirations.
                <br />
                <strong>Note:</strong> This is a simulation for demonstration purposes. Actually sending emails requires a secure backend server to handle the logic and protect credentials, which is beyond the scope of this frontend-only application.
            </p>
            
            <div className="bg-card rounded-lg shadow-lg overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="border-b border-border">
                        <tr>
                            <th className="p-4">Timestamp</th>
                            <th className="p-4">Recipient</th>
                            <th className="p-4">Subject</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedLog.map(log => (
                            <tr key={log.id} className="border-b border-border/50 hover:bg-secondary">
                                <td className="p-4 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                                <td className="p-4">
                                    <div>{log.recipientName}</div>
                                    <div className="text-xs text-text-secondary">{log.recipientEmail}</div>
                                </td>
                                <td className="p-4">{log.subject}</td>
                                <td className="p-4">
                                    <button onClick={() => setSelectedEmail(log)} className="text-blue-400 hover:text-blue-300">View Email</button>
                                </td>
                            </tr>
                        ))}
                         {sortedLog.length === 0 && (
                            <tr>
                                <td colSpan={4} className="text-center p-8 text-text-secondary">No emails have been sent yet. The system will send them automatically based on lease and payment dates.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={!!selectedEmail} onClose={() => setSelectedEmail(null)} title={selectedEmail?.subject || 'Email Details'}>
                {selectedEmail && (
                    <div className="space-y-4">
                        <div className="text-sm">
                            <p><strong className="text-text-secondary">To:</strong> {selectedEmail.recipientName} &lt;{selectedEmail.recipientEmail}&gt;</p>
                            <p><strong className="text-text-secondary">Sent:</strong> {new Date(selectedEmail.timestamp).toLocaleString()}</p>
                        </div>
                        <div className="p-4 bg-secondary rounded whitespace-pre-wrap font-mono text-sm">
                            {selectedEmail.body}
                        </div>
                         <div className="flex justify-end pt-4">
                            <button type="button" onClick={() => setSelectedEmail(null)} className="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded">Close</button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default EmailLog;