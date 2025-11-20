import React, { useState, useMemo } from 'react';
import { AuditLogEntry } from '../types';

const AuditLog: React.FC<{ auditLog: AuditLogEntry[] }> = ({ auditLog }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredLog = useMemo(() => {
        if (!searchQuery) {
            return auditLog;
        }
        const lowercasedQuery = searchQuery.toLowerCase();
        return auditLog.filter(log =>
            log.username.toLowerCase().includes(lowercasedQuery) ||
            log.action.toLowerCase().includes(lowercasedQuery) ||
            log.details.toLowerCase().includes(lowercasedQuery)
        );
    }, [auditLog, searchQuery]);

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Audit Log</h2>
            <p className="text-text-secondary mb-6 text-sm max-w-3xl">
                This log tracks significant actions performed by users within the system for accountability and security purposes.
            </p>
            
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Search logs by user, action, or details..."
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
                            <th className="p-4">User</th>
                            <th className="p-4">Action</th>
                            <th className="p-4">Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLog.map(log => (
                            <tr key={log.id} className="border-b border-border/50 hover:bg-secondary">
                                <td className="p-4 whitespace-nowrap text-sm text-text-secondary">{new Date(log.timestamp).toLocaleString()}</td>
                                <td className="p-4">{log.username}</td>
                                <td className="p-4">
                                    <span className="px-2 py-1 text-xs font-mono rounded-full bg-secondary text-text-primary">
                                        {log.action}
                                    </span>
                                </td>
                                <td className="p-4 text-sm">{log.details}</td>
                            </tr>
                        ))}
                         {filteredLog.length === 0 && (
                            <tr>
                                <td colSpan={4} className="text-center p-8 text-text-secondary">
                                    {searchQuery ? 'No logs match your search.' : 'No audit log entries found.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AuditLog;