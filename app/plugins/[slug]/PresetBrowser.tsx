'use client';

import CategoryList from '@/app/plugins/[slug]/CategoryList';
import ListItemViewer from '@/app/plugins/[slug]/ListItemViewer';
import { Category, Preset } from '@prisma/client';
import { useState } from 'react';
import { usePluginContext } from '@/app/plugins/[slug]/PluginContext';

export default function PresetBrowser() {
    // State to track opened categories
    const [openedItem, setOpenedItem] = useState<
        | Preset
        | (Category & { presets?: Preset[]; newCategory: boolean })
        | null
    >(null);

    // Get plugin details from context
    const { plugin } = usePluginContext();

    const categories = plugin.categories;

    // Handler for opening and closing categories
    const handleItemOpen = (
        item:
            | Preset
            | ((Category & { presets?: Preset[]; newCategory: boolean }) | null)
    ) => {
        setOpenedItem(item);
    };

    return (
        <>
            {/* Full-width browser */}
            <div className='mt-5 flex h-full space-x-5 rounded-2xl bg-punish-900 p-5'>
                {/* Left-side category and preset browser */}
                <CategoryList
                    categories={categories}
                    onItemOpen={handleItemOpen}
                />

                {/* Right-side category and preset viewer */}
                <ListItemViewer item={openedItem} onItemOpen={handleItemOpen} />
            </div>
        </>
    );
}
