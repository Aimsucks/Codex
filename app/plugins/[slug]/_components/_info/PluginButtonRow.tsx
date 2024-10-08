import { faDiscord, faGithub } from '@fortawesome/free-brands-svg-icons';
import React from 'react';

import { PluginType } from '@/prisma';

import PluginButton from '@/app/plugins/[slug]/_components/_info/PluginButton';
import PluginEditButton from '@/app/plugins/[slug]/_components/_info/PluginEditButton';

import { UserPermissionsType } from '@/lib/definitions';

type PluginButtonRowProps = {
    plugin: PluginType;
    userPermissions: UserPermissionsType;
};

function PluginButtonRow({ plugin, userPermissions }: PluginButtonRowProps) {
    return (
        <div className='mt-auto flex gap-5'>
            {plugin.githubLink && (
                <PluginButton
                    icon={faGithub}
                    link={plugin.githubLink}
                    text='Project Source'
                />
            )}
            {plugin.discordLink && (
                <PluginButton
                    icon={faDiscord}
                    link={plugin.discordLink}
                    text='Support Discord'
                />
            )}
            {userPermissions.isAdmin &&
                userPermissions.isCurrentPluginEditor && <PluginEditButton />}
        </div>
    );
}

export default PluginButtonRow;
