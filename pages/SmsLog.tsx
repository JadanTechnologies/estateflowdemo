import React, { useState, useMemo } from 'react';
import { SmsLogEntry } from '../types';
import Modal from '../components/Modal';

const SmsLog: React.FC<{ smsLog: SmsLogEntry[] }> = ({ smsLog }) => {
    const [selectedSms, setSelectedSms] = useState<SmsLogEntry | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredLog = useMemo(() => {
        const sorted = [...smsLog].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        if (!searchQuery) {
            return sorted;
        }
        const lowercasedQuery = searchQuery.toLowerCase();
        return sorted.filter(log =>
            log.recipientName.toLowerCase().includes(lowercasedQuery) ||
            log.recipientPhone.toLowerCase().includes(lowercasedQuery) ||
            log.message.toLowerCase().includes(lowercasedQuery)
        );
    }, [smsLog, searchQuery]);


    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Automated SMS Log</h2>
            <p className="text-text-secondary mb-6 text-sm max-w-3xl">
                This log shows a history of automated SMS messages that would be sent to tenants.
                <br />
                <strong>Note:</strong> This is a simulation. Integrating with an SMS gateway like Twilio requires a secure backend server.
            </p>
            
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Search logs by recipient or message content..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full max-w-lg bg-secondary p-2 rounded border border-border focus:ring-2 focus:ring-primary focus:outline-none"
                />
            </div>

            <div className="bg-card rounded-lg shadow-lg overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="border-b border-border">
                        <tr>
                            <th className="p-4">Timestamp</th>
                            <th className="p-4">Recipient</th>
                            <th className="p-4">Message Snippet</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLog.map(log => (
                            <tr key={log.id} className="border-b border-border/50 hover:bg-secondary">
                                <td className="p-4 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                                <td className="p-4">
                                    <div>{log.recipientName}</div>
                                    <div className="text-xs text-text-secondary">{log.recipientPhone}</div>
                                </td>
                                <td className="p-4 font-mono text-xs">"{log.message.substring(0, 50)}..."</td>
                                <td className="p-4">
                                    <button onClick={() => setSelectedSms(log)} className="text-blue-400 hover:text-blue-300">View Message</button>
                                </td>
                            </tr>
                        ))}
                         {filteredLog.length === 0 && (
                            <tr>
                                <td colSpan={4} className="text-center p-8 text-text-secondary">
                                    {searchQuery ? 'No messages match your search.' : 'No SMS messages have been sent yet.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={!!selectedSms} onClose={() => setSelectedSms(null)} title={`SMS to ${selectedSms?.recipientName}`}>
                {selectedSms && (
                    <div className="space-y-4">
                        <div className="text-sm">
                            <p><strong className="text-text-secondary">To:</strong> {selectedSms.recipientName} ({selectedSms.recipientPhone})</p>
                            <p><strong className="text-text-secondary">Sent:</strong> {new Date(selectedSms.timestamp).toLocaleString()}</p>
                        </div>
                        <div className="p-4 bg-secondary rounded whitespace-pre-wrap font-mono text-sm">
                            {selectedSms.message}
                        </div>
                         <div className="flex justify-end pt-4">
                            <button type="button" onClick={() => setSelectedSms(null)} className="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded">Close</button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default SmsLog;