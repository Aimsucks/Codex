import PluginInfo from '@/app/plugins/[slug]/PluginInfo';
import { PluginProvider } from '@/app/plugins/[slug]/PluginContext';
import PresetBrowser from '@/app/plugins/[slug]/PresetBrowser';
import Image from 'next/image';

export default async function PluginPage({
    params,
}: {
    params: { slug: string };
}) {
    const response = await fetch(
        `${process.env.AUTH_URL}/api/v1/plugins/${params.slug}`,
        {}
    );

    if (!response.ok) {
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
                    Failed to load plugin!
                </span>
            </div>
        );
    }

    const plugin = await response.json();

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
