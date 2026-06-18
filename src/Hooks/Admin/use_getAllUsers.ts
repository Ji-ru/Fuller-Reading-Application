import { useState, useCallback } from "react";
import { UserDocument, UserRole } from "../../Interfaces/dataInterfaces";
import { GetUsersResult, getUsers } from "../../Controller/AuthenticationController";
import { QueryDocumentSnapshot } from "firebase/firestore";
import { getAuth } from "@react-native-firebase/auth";

export const useGetUsers = () => {
    const [users, setUsers] = useState<UserDocument[]>([]);
    const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<UserDocument> | undefined>();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);

    const fetchUsers = useCallback(async (
        role?: UserRole,
        searchTerm?: string,
        loadMore: boolean = false
    ) => {
        try {
            setLoading(true);
            setError(null);

            const result: GetUsersResult = await getUsers({
                role,
                searchTerm,
                lastDoc: loadMore ? lastDoc : undefined,
            });

            if (loadMore) {
                setUsers((prev) => [...prev, ...result.users]);
            } else {
                setUsers(result.users);
            }

            setLastDoc(result.lastDoc);
            setHasMore(result.users.length === 60);

        } catch (err: any) {
            setError(err.message);
            console.error("useGetUsers error:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    // WRAP IN useCallback
    const resetUsers = useCallback(() => {
        setUsers([]);
        setLastDoc(undefined);
        setHasMore(true);
        setError(null);
    }, []);

    return {
        users,
        loading,
        error,
        hasMore,
        fetchUsers,
        resetUsers,
    };
};