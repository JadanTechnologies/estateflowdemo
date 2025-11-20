import React, { useState } from 'react';
import { PushNotificationLogEntry } from '../types';
import Modal from '../components/Modal';

const PushNotificationLog: React.FC<{ pushLog: PushNotificationLogEntry[] }> = ({ pushLog }) => {
    const [selectedPush, setSelectedPush] = useState<PushNotificationLogEntry | null>(null);

    const sortedLog = [...pushLog].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Automated Push Notification Log</h2>
            <p className="text-text-secondary mb-6 text-sm max-w-3xl">
                This log shows a history of automated push notifications that would be sent to tenants' devices.
                <br />
                <strong>Note:</strong> This is a simulation. Integrating with services like Firebase Cloud Messaging requires a secure backend server.
            </p>
            
            <div className="bg-card rounded-lg shadow-lg overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="border-b border-border">
                        <tr>
                            <th className="p-4">Timestamp</th>
                            <th className="p-4">Recipient</th>
                            <th className="p-4">Title</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedLog.map(log => (
                            <tr key={log.id} className="border-b border-border/50 hover:bg-secondary">
                                <td className="p-4 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                                <td className="p-4">{log.recipientName}</td>
                                <td className="p-4">{log.title}</td>
                                <td className="p-4">
                                    <button onClick={() => setSelectedPush(log)} className="text-blue-400 hover:text-blue-300">View Details</button>
                                </td>
                            </tr>
                        ))}
                         {sortedLog.length === 0 && (
                            <tr>
                                <td colSpan={4} className="text-center p-8 text-text-secondary">No push notifications have been sent yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={!!selectedPush} onClose={() => setSelectedPush(null)} title={selectedPush?.title || 'Push Notification Details'}>
                {selectedPush && (
                    <div className="space-y-4">
                        <div className="text-sm">
                            <p><strong className="text-text-secondary">To:</strong> {selectedPush.recipientName}</p>
                            <p><strong className="text-text-secondary">Sent:</strong> {new Date(selectedPush.timestamp).toLocaleString()}</p>
                        </div>
                        <div className="p-4 bg-secondary rounded">
                             <p className="font-bold">{selectedPush.title}</p>
                             <p className="text-text-secondary mt-1">{selectedPush.body}</p>
                        </div>
                         <div className="flex justify-end pt-4">
                            <button type="button" onClick={() => setSelectedPush(null)} className="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded">Close</button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default PushNotificationLog;