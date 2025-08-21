import { useEffect, useState } from 'react';
import { initStronghold, StrongholdVault } from '../utils/stronghold';
import { invoke } from '@tauri-apps/api/core';

export default function useStronghold() {
    const [vault, setVault] = useState<StrongholdVault>();
    useEffect(() => {
        async function loadVault() {
            setVault(await initStronghold(await invoke('get_vault_password')));
        }
        loadVault();
        console.info('Stronghold vault loaded');
    }, []);
    return vault;
}
