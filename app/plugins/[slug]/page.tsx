import PluginInfo from '@/app/plugins/[slug]/PluginInfo';
import { PluginProvider } from '@/app/plugins/[slug]/PluginContext';
import PresetBrowser from '@/app/plugins/[slug]/PresetBrowser';
import Image from 'next/image';
import { Category, Plugin, Preset, UserPlugin } from '@prisma/client';
import { prisma } from '@/prisma';
import { auth } from '@/auth';
import { Session } from 'next-auth';

type PluginType = Plugin & {
    categories: Category[];
    presets: Preset[];
    user: UserPlugin[];
};

export default async function PluginPage({
    params,
}: {
    params: { slug: string };
}) {
    const plugin = await getPlugin(params.slug);

    if (!plugin) {
        return (
            <div className='h-50 flex justify-center rounded-2xl bg-punish-900 p-5'>
                {/* Unknown plugin icon */}
                <Image
                    src='/unknown.svg'
                    alt='Unknown Plugin Icon'
                    width={250}
                    height={250}
                    className='w-40 flex-none'
                />

                {/* Top plugin name */}
                <span className='grow px-5 text-4xl font-bold'>
                    No plugin found!
                </span>
            </div>
        );
    }

    if (plugin)
        return (
            <PluginProvider plugin={plugin}>
                <PluginInfo />
                <PresetBrowser />
            </PluginProvider>
        );
}

const getPlugin = async (pluginNameOrIdRaw: string) => {
    const session: Session | null = await auth();
    const userId = session?.user?.id;

    const pluginNameOrId: number | string =
        parseInt(pluginNameOrIdRaw) || decodeURI(pluginNameOrIdRaw);

    const plugin: PluginType | null = await prisma.plugin.findFirst({
        where:
            typeof pluginNameOrId === 'number'
                ? { id: pluginNameOrId }
                : { name: { equals: pluginNameOrId, mode: 'insensitive' } },
        include: {
            categories: {
                include: {
                    presets: true,
                    subcategories: recursiveCategories(2),
                },
                where: { parentCategoryId: null },
            },
            presets: true,
            user: { where: { NOT: { userId } } },
        },
    });

    return plugin;
};

const recursiveCategories: any = (level: number) => {
    if (level === 0) {
        return {
            include: {
                subcategories: false,
                presets: { include: true },
            },
        };
    }

    return {
        include: {
            subcategories: recursiveCategories(level - 1),
            presets: {
                include: true,
                orderBy: { name: 'asc' },
            },
        },
    };
};
