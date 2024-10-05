'use client';

import CategoryList from '@/app/plugins/[slug]/_components/_list/CategoryList';
import ListItemViewer from '@/app/plugins/[slug]/_components/_viewer/ListItemViewer';
import { useState } from 'react';
import { PluginType } from '@/prisma';
import { ItemViewerType, UserPermissionsType } from '@/lib/definitions';

type PresetBrowserProps = {
    plugin: PluginType;
    userPermissions: UserPermissionsType;
};

export default function PresetBrowser({
    plugin,
    userPermissions,
}: PresetBrowserProps) {
    // State to track opened categories
    const [openedItem, setOpenedItem] = useState<ItemViewerType | null>(null);

    return (
        <>
            {/* Full-width browser */}
            <div className='mt-5 flex h-full space-x-5 rounded-2xl bg-punish-900 p-5'>
                {/* Left-side category and preset browser */}
                <CategoryList
                    categories={plugin.categories.filter(
                        (category) => category.parentCategoryId === null
                    )}
                    userPermissions={userPermissions}
                    onItemOpen={(item) => setOpenedItem(item)}
                />

                {/* Right-side category and preset viewer */}
                <ListItemViewer
                    item={openedItem}
                    plugin={plugin}
                    userPermissions={userPermissions}
                    onItemOpen={(item) => setOpenedItem(item)}
                />
            </div>
        </>
    );
}
