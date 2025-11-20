import React from 'react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  icon: React.ReactNode;
  colorClass: string;
  onClick?: () => void;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, subValue, icon, colorClass, onClick }) => {
  const cardClasses = `bg-card p-6 rounded-lg shadow-lg flex items-center space-x-4 transition-all duration-200 ${onClick ? 'cursor-pointer hover:ring-2 hover:ring-primary' : ''}`;
  
  return (
    <div className={cardClasses} onClick={onClick}>
      <div className={`p-3 rounded-full ${colorClass}`}>
        {icon}
      </div>
      <div>
        <p className="text-text-secondary text-sm font-medium uppercase">{title}</p>
        <p className="text-2xl font-bold text-text-primary">{value}</p>
        {subValue && <p className="text-lg font-semibold text-text-primary mt-1">{subValue}</p>}
      </div>
    </div>
  );
};

export default DashboardCard;