'use client';

import { faEdit } from '@fortawesome/free-regular-svg-icons';

import PluginButton from '@/app/plugins/[slug]/_components/_info/PluginButton';
import { usePluginContext } from '@/app/plugins/[slug]/_components/PluginContext';

export default function PluginEditButton() {
    const { isPluginEditorOpen, setIsPluginEditorOpen } = usePluginContext();

    return (
        <PluginButton
            icon={faEdit}
            onClick={() => {
                setIsPluginEditorOpen(!isPluginEditorOpen);
            }}
            text='Edit Plugin'
        />
    );
}
