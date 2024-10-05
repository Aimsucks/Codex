'use client';

import PluginEditor from '@/app/plugins/[slug]/_components/_plugin-info/PluginEditor';
import { usePluginContext } from '@/app/plugins/[slug]/_components/PluginContext';
import { PluginType } from '@/prisma';
import { User } from '@prisma/client';

type PluginEditorWrapperProps = {
    plugin: PluginType;
    users: User[];
};

function PluginEditorWrapper({ plugin, users }: PluginEditorWrapperProps) {
    const { isPluginEditorOpen } = usePluginContext();

    return isPluginEditorOpen && <PluginEditor plugin={plugin} users={users} />;
}

export default PluginEditorWrapper;
