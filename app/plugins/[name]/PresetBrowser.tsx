"use client"

import CategoryList from "@/app/plugins/[name]/CategoryList";
import ListItemViewer from "@/app/plugins/[name]/ListItemViewer";
import {Category, Preset} from "@prisma/client"
import {useState} from 'react';
import {usePluginContext} from "@/app/plugins/[name]/PluginContext";

export default function PresetBrowser() {
    // State to track opened categories
    const [openedItem, setOpenedItem] = useState<Preset | Category & { presets?: Preset[] } | null>(null);

    // Get plugin details from context
    const {plugin} = usePluginContext()

    const categories = plugin.categories

    // Handler for opening and closing categories
    const handleItemOpen = (item: Preset | Category & { presets?: Preset[] }) => {
        setOpenedItem(item)
    }

    return (
        <>
            {/* Full-width browser */}
                <div className="flex h-full space-x-5 bg-punish-900 p-5 mt-5 rounded-2xl">

                    {/* Left-side category and preset browser */}
                    <CategoryList categories={categories} onItemOpen={handleItemOpen}/>

                    {/* Right-side category and preset viewer */}
                    <ListItemViewer item={openedItem}/>
                </div>
        </>
    )
}