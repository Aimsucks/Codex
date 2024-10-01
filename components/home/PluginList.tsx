import {prisma} from "@/prisma";
import PluginCard from "@/components/home/PluginCard";

export default async function PluginList() {
    const plugins = await prisma.plugin.findMany({
        include: {
            presets: {
                orderBy: {
                    updatedAt: 'desc'
                },
                select: {
                    updatedAt: true
                }
            },
        }
    })

    const arrayToFill = new Array(9)
    arrayToFill.fill(plugins[0])

    return (
        <div className="grid grid-cols-3 gap-5">
            {arrayToFill.map((plugin) => (
                <PluginCard plugin={plugin} presets={plugin.presets}
                            key={plugin.id}/>
            ))}
        </div>
    )
}