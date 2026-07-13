import { useState, useEffect, useCallback } from 'react';
import { createClient } from '../utils/supabase/client';
import { getAllUsers, getAdminStats } from '../utils/api';
import { getAllUsers as getLocalUsers, getAllAssessments } from '../utils/storage';
import { User } from '../types';

export function useAdminData() {
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const fetchAdminData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      


      // 1. Fetch from Supabase
      const { data: usersData, error: usersError } = await supabase.from('users').select('*') as { data: any[], error: any };
      if (usersError) {
        console.error('[useAdminData] Supabase fetch error:', usersError);
      }
      const supabaseUsers = usersData || [];

      // 2. Fetch from Deno KV via API (contains legacy/old accounts)
      let apiUsersList: any[] = [];
      try {
        const apiUsers = await getAllUsers();
        if (apiUsers && apiUsers.users) {
          apiUsersList = apiUsers.users;
        }
      } catch (e) {
        console.error('[useAdminData] Deno KV fetch error:', e);
      }

      // 3. Fetch from local storage
      let localUsersList: any[] = [];
      try {
        localUsersList = getLocalUsers() || [];
      } catch (e) {
        console.error('[useAdminData] Local storage fetch error:', e);
      }

      // 4. Merge all sources by ID to ensure completeness
      const userMap = new Map();

      // Add local storage users first (lowest precedence)
      localUsersList.forEach(u => {
        if (u && u.id) userMap.set(u.id, u);
      });

      // Add Deno KV users (medium precedence, overrides local storage)
      apiUsersList.forEach(u => {
        if (u && u.id) {
          const existing = userMap.get(u.id) || {};
          userMap.set(u.id, { ...existing, ...u });
        }
      });

      // Add Supabase users (highest precedence, overrides KV and local storage)
      supabaseUsers.forEach(u => {
        if (u && u.id) {
          const existing = userMap.get(u.id) || {};
          userMap.set(u.id, { ...existing, ...u });
        }
      });

      const finalUsers = Array.from(userMap.values());

      let localStats: any = {};
      try {
        const statsData = await getAdminStats();
        if (statsData && statsData.stats) {
          localStats = statsData.stats;
        }
      } catch (e) {
        console.log('Failed to fetch stats from API, calculating locally');
      }
      
      // Always calculate stats from users array to ensure accuracy
      if (finalUsers.length > 0) {
         localStats.totalUsers = finalUsers.length;
         
         const byRole: Record<string, number> = {};
         finalUsers.forEach((u: any) => {
            let role = u.role || 'Unknown';
            role = role.toLowerCase();
            
            // Map legacy/internal roles to UI labels
            if (role === 'school') role = 'organization';
            if (role === 'school_admin') role = 'organization';
            if (role === 'professional/organization') role = 'professional';
            
            // Capitalize role to match OverviewMetrics
            role = role.charAt(0).toUpperCase() + role.slice(1);
            byRole[role] = (byRole[role] || 0) + 1;
         });
         localStats.usersByRole = byRole;
         
         // Calculate total assessments globally from Supabase
         try {
           const { count } = await supabase.from('assessments').select('*', { count: 'exact', head: true });
           const supabaseCount = count || 0;
           
           // Fallback to local storage or API stats if Supabase fails or is empty
           const allAssessments = getAllAssessments();
           const localCount = allAssessments ? allAssessments.length : 0;
           const apiCount = localStats.totalAssessments || 0;
           
           localStats.totalAssessments = Math.max(supabaseCount, localCount, apiCount);
         } catch (e) {
           console.error('Supabase assessments fetch error:', e);
           localStats.totalAssessments = localStats.totalAssessments || 0;
         }
      }

      setUsers(finalUsers || []);
      setStats(localStats);
    } catch (err) {
      console.error('[useAdminData] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  const toggleUserActivation = async (userId: string, currentStatus: boolean | undefined) => {
    try {
      const newStatus = currentStatus === undefined ? false : !currentStatus;
      
      // Optimistic update
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isActive: newStatus } : u));
      
      const { error } = await (supabase.from('users') as any)
        .update({ isActive: newStatus })
        .eq('id', userId);
        
      if (error) throw error;
      return { success: true };
    } catch (err) {
      console.error('Failed to toggle activation:', err);
      await fetchAdminData(); // revert
      return { success: false, error: err };
    }
  };

  const updateSubscription = async (userId: string, status: string) => {
    try {
      // Optimistic update
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, subscriptionStatus: status } : u));
      
      const { error } = await (supabase.from('users') as any)
        .update({ subscriptionStatus: status })
        .eq('id', userId);
        
      if (error) throw error;
      return { success: true };
    } catch (err) {
      console.error('Failed to update subscription:', err);
      await fetchAdminData(); // revert
      return { success: false, error: err };
    }
  };

  return {
    users,
    stats,
    loading,
    error,
    refresh: fetchAdminData,
    toggleUserActivation,
    updateSubscription
  };
}
