import React, { useState, useEffect } from 'react';
import { Agent } from '../types';
import Modal from './Modal';

interface AgentCommissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: Agent | null;
  onSave: (agentId: string, rate: number) => void;
}

const AgentCommissionModal: React.FC<AgentCommissionModalProps> = ({ isOpen, onClose, agent, onSave }) => {
  const [rate, setRate] = useState<number>(0);

  useEffect(() => {
    if (agent) {
      setRate(agent.commissionRate || 0);
    }
  }, [agent]);

  const handleSave = () => {
    if (agent && rate >= 0) {
      onSave(agent.id, rate);
    }
  };

  if (!isOpen || !agent) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Set Commission for ${agent.name}`}>
      <div className="space-y-4">
        <div>
          <label htmlFor="commissionRate" className="block text-sm font-medium text-text-secondary mb-1">
            Commission Rate (%)
          </label>
          <input
            id="commissionRate"
            type="number"
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            className="w-full bg-secondary p-2 rounded border border-border"
            step="0.1"
            min="0"
            max="100"
          />
        </div>
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded"
          >
            Save Commission
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AgentCommissionModal;