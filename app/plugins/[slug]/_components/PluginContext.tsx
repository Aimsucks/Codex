'use client';

import { createContext, useContext, useState } from 'react';

// Define the shape of the context value
interface PluginContextType {
    // Plugin editor area
    isPluginEditorOpen: boolean;
    setIsPluginEditorOpen: (arg: boolean) => void;
}

// Create the context
const PluginContext = createContext<PluginContextType | undefined>(undefined);

// Hook to use the plugin context
export const usePluginContext = () => {
    const context = useContext(PluginContext);
    if (!context) {
        throw new Error(
            'usePluginContext must be used within a PluginProvider'
        );
    }
    return context;
};

// Provider component to wrap the page
export const PluginProvider = ({ children }: { children: React.ReactNode }) => {
    const [isPluginEditorOpen, setIsPluginEditorOpen] =
        useState<boolean>(false);

    return (
        <PluginContext.Provider
            value={{
                isPluginEditorOpen,
                setIsPluginEditorOpen,
            }}
        >
            {children}
        </PluginContext.Provider>
    );
};
