import { BookText, Clock, Sparkles } from 'lucide-react';
import { getFormatter } from 'next-intl/server';
import Image from 'next/image';

import { PluginType, prisma } from '@/prisma';
import { User } from '@prisma/client';

import PluginButtonRow from '@/app/plugins/[slug]/_components/_info/PluginButtonRow';
import PluginEditorWrapper from '@/app/plugins/[slug]/_components/_info/PluginEditorWrapper';
import PluginFact from '@/app/plugins/[slug]/_components/_info/PluginFact';

import { UserPermissionsType } from '@/lib/definitions';

type PluginInfoProps = {
    plugin: PluginType;
    userPermissions: UserPermissionsType;
};

export default async function PluginInfo({
    plugin,
    userPermissions,
}: PluginInfoProps) {
    const format = await getFormatter();

    // If there is an error in accessing the context, display an error message
    if (!plugin)
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

    const latestUpdatedDate: Date | null = plugin.presets.length
        ? plugin.presets?.reduce((latest, current) => {
              return new Date(current.updatedAt) > new Date(latest.updatedAt)
                  ? current
                  : latest;
          }).updatedAt
        : null;

    const users: User[] =
        userPermissions.isAdmin && userPermissions.isCurrentPluginEditor
            ? await getUsers()
            : [];

    return (
        <div className='flex flex-col space-y-5'>
            <div className='h-50 flex justify-center rounded-2xl bg-punish-900 p-5'>
                {/* Left-side plugin image */}
                <Image
                    src={plugin.icon || '/unknown.svg'}
                    alt={plugin.name + ' Icon'}
                    width={250}
                    height={250}
                    className='w-40 flex-none'
                    unoptimized={true}
                />

                {/* Center plugin name, description, and links */}
                <div className='flex grow flex-col px-5'>
                    {/* Plugin name and description */}
                    <span className='text-4xl font-bold'>{plugin.name}</span>
                    <span className='line-clamp-2 pt-3 text-xl'>
                        {plugin.description}
                    </span>

                    {/* Bottom plugin links */}
                    <PluginButtonRow
                        plugin={plugin}
                        userPermissions={userPermissions}
                    />
                </div>

                {/* Right-side plugin stats */}
                <div className='flex min-w-[250px] flex-col text-xl'>
                    {/* Plugin presets available statistic */}
                    <PluginFact
                        Icon={BookText}
                        text={`${plugin.presets.length} presets available`}
                    />

                    {/* Plugin last updated relative date statistic */}
                    {latestUpdatedDate && (
                        <PluginFact
                            Icon={Clock}
                            text={`Updated ${format.relativeTime(latestUpdatedDate)}`}
                        />
                    )}

                    {/* Plugin added to API relative date statistic */}
                    <PluginFact
                        Icon={Sparkles}
                        text={`Added ${format.relativeTime(plugin.createdAt)}`}
                    />
                </div>
            </div>

            {userPermissions.isAdmin &&
                userPermissions.isCurrentPluginEditor && (
                    <PluginEditorWrapper plugin={plugin} users={users} />
                )}
        </div>
    );
}

const getUsers = async () => {
    try {
        return prisma.user.findMany({});
    } catch (e) {
        console.error(e);
        return [];
    }
};
