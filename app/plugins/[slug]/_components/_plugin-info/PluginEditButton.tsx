'use client';

import PluginButton from '@/app/plugins/[slug]/_components/_plugin-info/PluginButton';
import { usePluginContext } from '@/app/plugins/[slug]/_components/PluginContext';
import { faEdit } from '@fortawesome/free-regular-svg-icons';

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
