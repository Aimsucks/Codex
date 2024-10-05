import { prisma } from '@/prisma';
import { Plugin, Preset } from '@prisma/client';

import PluginCard from '@/components/home/PluginCard';

export default async function PluginList() {
    const plugins: (Plugin & { presets: Partial<Preset>[] })[] =
        await prisma.plugin.findMany({
            where: {},
            include: {
                presets: {
                    orderBy: {
                        updatedAt: 'desc',
                    },
                    select: {
                        updatedAt: true,
                    },
                },
            },
        });

    return (
        <div className='grid grid-cols-3 gap-5'>
            {plugins.map((plugin) => (
                <PluginCard plugin={plugin} key={plugin.id} />
            ))}
        </div>
    );
}
