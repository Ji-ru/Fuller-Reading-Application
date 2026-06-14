import { useState, useEffect, useCallback, useRef } from 'react';
import { useAdminStats } from '../Hooks/use_AdminStats';
import { UserDocument, UserRole } from '../Interfaces/dataInterfaces';

const PAGE_SIZE = 20;

export const useGetUsers = () => {
  const { getAllUsers } = useAdminStats();
  const getAllUsersRef = useRef(getAllUsers);
  getAllUsersRef.current = getAllUsers;

  const [allUsers, setAllUsers] = useState<UserDocument[]>([]);
  const [users, setUsers] = useState<UserDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  const fetchUsers = useCallback(async (role?: UserRole, query?: string, append = false) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllUsersRef.current();

      let filtered = data;
      if (role) {
        filtered = filtered.filter((u: any) => u.role === role);
      }
      if (query?.trim()) {
        const q = query.toLowerCase();
        filtered = filtered.filter((u: any) =>
          (u.firstName || '').toLowerCase().includes(q) ||
          (u.lastName || '').toLowerCase().includes(q) ||
          (u.email || '').toLowerCase().includes(q)
        );
      }

      setAllUsers(filtered);
      setCurrentPage(1);
      setHasMore(filtered.length > PAGE_SIZE);
      setUsers(filtered.slice(0, PAGE_SIZE));
    } catch (e: any) {
      setError(e.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(() => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    setUsers(allUsers.slice(0, nextPage * PAGE_SIZE));
    setHasMore(nextPage * PAGE_SIZE < allUsers.length);
  }, [currentPage, allUsers]);

  const resetUsers = useCallback(() => {
    setUsers([]);
    setAllUsers([]);
    setCurrentPage(0);
    setHasMore(false);
    setError(null);
  }, []);

  return { users, loading, error, hasMore, fetchUsers, resetUsers, loadMore };
};
