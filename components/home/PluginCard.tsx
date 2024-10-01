import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import type { Plugin, Preset } from '@prisma/client';
import { BookText, Clock, Sparkles } from 'lucide-react';
import { useFormatter } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';

type PluginCardProps = {
    plugin: Plugin;
    presets: Preset[];
};

export default function PluginCard({ plugin, presets }: PluginCardProps) {
    const format = useFormatter();

    return (
        <Card className='h-64 rounded-2xl border-punish-700 bg-punish-900 transition duration-200 hover:bg-punish-800'>
            <Link
                href={'/plugins/' + encodeURIComponent(plugin.name)}
                className='flex h-full items-center justify-between'
            >
                <div className='w-2/3'>
                    <CardHeader>
                        <CardTitle>{plugin.name}</CardTitle>
                        <CardDescription className='line-clamp-3'>
                            {plugin.description || ''}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className='mt-auto space-y-2'>
                        <div className='flex items-center'>
                            <BookText className='mr-2 h-4 w-4' />
                            <span>{presets.length} presets available</span>
                        </div>

                        {presets[0].updatedAt ? (
                            <div className='flex items-center'>
                                <Clock className='mr-2 h-4 w-4' />
                                <span>
                                    Updated{' '}
                                    {format.relativeTime(presets[0].updatedAt)}
                                </span>
                            </div>
                        ) : (
                            <div className='flex items-center'>
                                <Sparkles className='mr-2 h-4 w-4' />
                                <span>
                                    Added{' '}
                                    {format.relativeTime(plugin.createdAt)}
                                </span>
                            </div>
                        )}
                    </CardContent>
                </div>
                <Image
                    src={plugin.icon || '/unknown.svg'}
                    alt={plugin.name + ' Icon'}
                    width={250}
                    height={250}
                    className='ml-auto w-1/3 p-5'
                />
            </Link>
        </Card>
    );
}
