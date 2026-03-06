import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../services/supabaseClient';

const ChildContext = createContext({
    childData: null as any,
    loading: true,
    refresh: async () => { },
});

export const useChild = () => useContext(ChildContext);

export const ChildProvider = ({ children, userId }: { children: React.ReactNode; userId: string | null }) => {
    const [childData, setChildData] = useState < any > (null);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        if (!userId) { setLoading(false); return; }
        const { data } = await supabase
            .from('profiles')
            .select('child_data, username, role')
            .eq('id', userId)
            .single();

        setChildData(data?.child_data || null);
        setLoading(false);
    };

    useEffect(() => { load(); }, [userId]);

    return (
        <ChildContext.Provider value={{ childData, loading, refresh: load }}>
            {children}
        </ChildContext.Provider>
    );
};
