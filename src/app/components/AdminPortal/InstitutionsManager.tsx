import React from 'react';
import { OrganizationManager } from '../OrganizationManager';
import { User } from '../../types';

interface InstitutionsManagerProps {
  users?: User[];
}

// Currently wraps the OrganizationManager but represents the dedicated Institutions tab.
export const InstitutionsManager: React.FC<InstitutionsManagerProps> = ({ users = [] }) => {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Educational Institutions</h2>
        <p className="text-slate-500">Manage K-12 schools, districts, and universities as platform tenants.</p>
      </div>
      <OrganizationManager mode="institutions" users={users} />
    </div>
  );
};
