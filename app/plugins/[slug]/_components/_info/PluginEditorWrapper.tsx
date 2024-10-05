'use client';

import { PluginType } from '@/prisma';
import { User } from '@prisma/client';

import PluginEditor from '@/app/plugins/[slug]/_components/_info/PluginEditor';
import { usePluginContext } from '@/app/plugins/[slug]/_components/PluginContext';

type PluginEditorWrapperProps = {
    plugin: PluginType;
    users: User[];
};

function PluginEditorWrapper({ plugin, users }: PluginEditorWrapperProps) {
    const { isPluginEditorOpen } = usePluginContext();

    return isPluginEditorOpen && <PluginEditor plugin={plugin} users={users} />;
}

export default PluginEditorWrapper;
