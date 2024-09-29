import {prisma} from "@/prisma";
import PluginCard from "@/components/home/PluginCard";

export default async function PluginList() {
    const plugins = await prisma.plugin.findMany({
        include: {
            presets: {
                orderBy: {
                    updatedAt: 'desc'
                },
                take: 1,
                select: {
                    updatedAt: true
                }
            },
        }
    })

    return (
        <>
            {plugins.map((plugin) => (
                <PluginCard plugin={plugin} latestUpdate={plugin.presets[0]?.updatedAt || plugin.createdAt}
                            key={plugin.id}/>
            ))}
        </>
    )
}