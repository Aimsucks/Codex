import { PluginProvider } from '@/app/plugins/[slug]/_components/PluginContext';
import PresetBrowser from '@/app/plugins/[slug]/_components/PresetBrowser';
import Image from 'next/image';
import { PluginType, prisma, UserType } from '@/prisma';
import { auth } from '@/auth';
import { Session } from 'next-auth';
import PluginInfo from '@/app/plugins/[slug]/_components/_info/PluginInfo';

type PluginPageProps = {
    params: { slug: string };
};

type UserPermissionsType = {
    isAdmin: boolean;
    isCurrentPluginEditor: boolean;
};

export default async function PluginPage({ params }: PluginPageProps) {
    const { plugin, userPermissions } = await getPluginAndUserPermissions(
        params.slug
    );

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
            <PluginProvider plugin={plugin} userPermissions={userPermissions}>
                <PluginInfo plugin={plugin} userPermissions={userPermissions} />
                <PresetBrowser />
            </PluginProvider>
        );
}

const getPluginAndUserPermissions = async (pluginNameOrIdRaw: string) => {
    // Pull current session and get userId for later queries
    const session: Session | null = await auth();
    const userId = session?.user?.id;

    // Parse the URL slug to a plugin ID or name
    const pluginNameOrId: number | string =
        parseInt(pluginNameOrIdRaw) || decodeURI(pluginNameOrIdRaw);

    // Fetch the plugin from the database
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
            user: { include: { user: true } },
        },
    });

    // Set user permissions
    let userPermissions: UserPermissionsType = {
        isAdmin: false,
        isCurrentPluginEditor: false,
    };

    if (userId) {
        const user: UserType | null = await prisma.user.findUnique({
            where: { id: userId || '' },
            include: { plugins: true },
        });

        userPermissions.isAdmin = !!user?.isAdmin;
        userPermissions.isCurrentPluginEditor = !!user?.plugins.filter(
            (userPlugin) =>
                userPlugin.pluginId === plugin?.id &&
                userPlugin.userId === user?.id
        ).length;
    }

    return { plugin, userPermissions };
};

// Recursively iterate through plugin preset categories
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
