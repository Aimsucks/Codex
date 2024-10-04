'use client';

import Image from 'next/image';
import { BookText, Clock, EditIcon, Sparkles } from 'lucide-react';
import { useFormatter } from 'next-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiscord, faGithub } from '@fortawesome/free-brands-svg-icons';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { usePluginContext } from '@/app/plugins/[slug]/_components/PluginContext';
import PluginEditor from '@/app/plugins/[slug]/_components/PluginEditor';
import { useState } from 'react';

export default function PluginInfo() {
    const { plugin, userPermissions, updatePlugin } = usePluginContext();

    const [isEditing, setIsEditing] = useState(false);

    const format = useFormatter();

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

    const handleSave = async (data: any) => {
        try {
            const updatedPlugin: any = await updatePlugin(plugin.id, {
                description: data.description,
                icon: data.icon[0],
                githubLink: data.githubLink,
                discordLink: data.discordLink,
                user: data.approvedUsers.map((u: any) => u.value) || [],
            });
            plugin.description = updatedPlugin.description;
            plugin.icon = updatedPlugin.icon;
            plugin.githubLink = updatedPlugin.githubLink;
            plugin.discordLink = updatedPlugin.discordLink;
            plugin.user = updatedPlugin.user;
        } catch (error) {
            console.error('Error updating plugin:', error);
        }

        setIsEditing(false);
    };

    const latestUpdatedDate = plugin.presets.length
        ? plugin.presets?.reduce((latest, current) => {
              return new Date(current.updatedAt) > new Date(latest.updatedAt)
                  ? current
                  : latest;
          }).updatedAt
        : null;

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
                    {/* Top plugin name */}
                    <span className='text-4xl font-bold'>{plugin.name}</span>

                    {/* Middle plugin description */}
                    <span className='line-clamp-2 pt-3 text-xl'>
                        {plugin.description}
                    </span>

                    {/* Bottom plugin links */}
                    <div className='mt-auto flex gap-5'>
                        {plugin.githubLink ? (
                            <Link href={plugin.githubLink} target='_blank'>
                                <Button
                                    variant='secondary'
                                    className='gap-2 rounded-xl bg-punish-800 hover:bg-punish-700'
                                >
                                    <FontAwesomeIcon
                                        icon={faGithub}
                                        size='xl'
                                    />
                                    Project Source
                                </Button>
                            </Link>
                        ) : (
                            ''
                        )}
                        {plugin.discordLink ? (
                            <Link href={plugin.discordLink} target='_blank'>
                                <Button
                                    variant='secondary'
                                    className='gap-2 rounded-xl bg-punish-800 hover:bg-punish-700'
                                >
                                    <FontAwesomeIcon
                                        icon={faDiscord}
                                        size='xl'
                                    />
                                    Support Discord
                                </Button>
                            </Link>
                        ) : (
                            ''
                        )}
                        {userPermissions.isAdmin &&
                        userPermissions.isCurrentPluginEditor ? (
                            <Button
                                variant='secondary'
                                className='gap-2 rounded-xl bg-punish-800 hover:bg-punish-700'
                                onClick={() => setIsEditing(!isEditing)}
                            >
                                <EditIcon />
                                Edit Plugin
                            </Button>
                        ) : (
                            ''
                        )}
                    </div>
                </div>

                {/* Right-side plugin stats */}
                <div className='flex min-w-[250px] flex-col text-xl'>
                    {/* Plugin presets available statistic */}
                    <div className='flex flex-1 items-center whitespace-nowrap'>
                        <BookText className='mr-2 h-6 w-6' />
                        <span>{plugin.presets.length} presets available</span>
                    </div>

                    {/* Plugin last updated relative date statistic */}
                    {latestUpdatedDate ? (
                        <div className='flex flex-1 items-center whitespace-nowrap'>
                            <Clock className='mr-2 h-6 w-6' />
                            <span>
                                Updated {format.relativeTime(latestUpdatedDate)}
                            </span>
                        </div>
                    ) : (
                        ''
                    )}

                    {/* Plugin added to API relative date statistic */}
                    <div className='flex flex-1 items-center whitespace-nowrap'>
                        <Sparkles className='mr-2 h-6 w-6' />
                        <span>
                            Added {format.relativeTime(plugin.createdAt)}
                        </span>
                    </div>
                </div>
            </div>

            {isEditing ? (
                <PluginEditor onCancel={() => setIsEditing(false)} />
            ) : (
                ''
            )}
        </div>
    );
}
