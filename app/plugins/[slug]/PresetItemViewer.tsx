import { Preset } from '@prisma/client';
import { useFormatter } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import Edit from '@/components/shared/buttons/Edit';
import Save from '@/components/shared/buttons/Save';
import Cancel from '@/components/shared/buttons/Cancel';
import ConfirmDelete from '@/components/shared/buttons/ConfirmDelete';
import { usePluginContext } from '@/app/plugins/[slug]/PluginContext';
import Copy from '@/components/shared/buttons/Copy';

type PresetViewerProps = {
    preset: Preset;
    newPreset?: boolean;
    onSaveNew?: (data: Partial<Preset>) => void;
    onDelete?: () => void;
    onCancel?: () => void;
};

export default function PresetItemViewer({
    preset,
    newPreset = false,
    onSaveNew,
    onDelete,
    onCancel,
}: PresetViewerProps) {
    const { userPermissions, updatePreset } = usePluginContext();
    const [isEditing, setIsEditing] = useState(false);
    const [presetName, setPresetName] = useState(preset?.name);
    const [presetDescription, setPresetDescription] = useState(
        preset?.description
    );
    const [presetData, setPresetData] = useState(preset?.data);

    useEffect(() => {
        setIsEditing(false);
        setPresetName(preset?.name);
        setPresetDescription(preset?.description);
        setPresetData(preset?.data);
    }, [preset]);

    const format = useFormatter();

    // Handle saving the updated category name
    const handleUpdate = async () => {
        try {
            const updatedPreset = await updatePreset(preset.id, {
                name: presetName,
                version: (preset.version += 1),
                description: presetDescription,
                data: presetData,
            });
            preset.name = updatedPreset.name;
            preset.description = updatedPreset.description;
            preset.data = updatedPreset.data;
            preset.version = updatedPreset.version;
            preset.updatedAt = updatedPreset.updatedAt;
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating preset:', error);
        }

        setIsEditing(false);
    };

    // Handle canceling the edit
    const handleCancel = () => {
        if (newPreset && onCancel) onCancel();
        else {
            setPresetName(preset?.name); // Revert to original name
            setIsEditing(false);
        }
    };

    // Handle saving a new preset
    const handleAdd = async () => {
        const newPreset = {
            name: presetName,
            description: presetDescription,
            data: presetData,
        };
        if (onSaveNew) onSaveNew(newPreset);
        else throw new Error('Failed to add new preset');
    };

    // Handle deleting a preset
    const handleDelete = async () => {
        if (onDelete) onDelete();
        else throw new Error('Failed to delete preset');
    };

    // Handle copying preset data
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(preset.data);
        } catch (error) {
            console.error('Failed to copy preset data:', error);
        }
    };

    return (
        <div className='flex flex-auto flex-col space-y-1'>
            <div className='flex'>
                {/* Conditionally render preset name or input field based on isEditing */}
                {newPreset || (!newPreset && isEditing) ? (
                    <Input
                        className='h-8 w-2/3 rounded-xl bg-punish-950 p-2 text-xl font-bold'
                        value={presetName}
                        placeholder='Preset name'
                        onChange={(e) => setPresetName(e.target.value)}
                    />
                ) : (
                    <span className='text-2xl font-bold'>{preset?.name}</span>
                )}

                {/* Edit button, save and cancel buttons */}
                {userPermissions.isCurrentPluginEditor ? (
                    <div className='ml-auto flex space-x-2 rounded bg-punish-900'>
                        {newPreset || (!newPreset && isEditing) ? (
                            <>
                                <Save
                                    onClick={
                                        newPreset ? handleAdd : handleUpdate
                                    }
                                />
                                <Cancel onClick={handleCancel} />
                            </>
                        ) : (
                            <>
                                <Edit onClick={() => setIsEditing(true)} />
                                {onDelete ? (
                                    <ConfirmDelete
                                        onClick={handleDelete}
                                        canDelete={true}
                                    />
                                ) : (
                                    ''
                                )}
                            </>
                        )}
                    </div>
                ) : (
                    ''
                )}
            </div>

            {/* Badges for version number and last updated relative date */}
            <div className='flex justify-items-center space-x-2'>
                {!newPreset ? (
                    <>
                        <span>
                            <Badge variant='secondary'>
                                Version {preset.version}
                            </Badge>
                        </span>
                        <span>
                            <Badge variant='secondary'>
                                Updated {format.relativeTime(preset.updatedAt)}
                            </Badge>
                        </span>
                    </>
                ) : (
                    ''
                )}
            </div>

            {/* Conditionally render description or textarea input field based on isEditing */}
            {newPreset || (!newPreset && isEditing) ? (
                <Textarea
                    rows={3}
                    placeholder={'Preset description'}
                    className='rounded-xl bg-punish-900'
                    value={presetDescription || ''}
                    onChange={(e) => setPresetDescription(e.target.value)}
                />
            ) : (
                <span className='text-md'>{preset?.description}</span>
            )}

            {/* Conditionally enable textarea for data based on isEditing */}
            <div className='relative w-full'>
                <Textarea
                    readOnly={!(newPreset || (!newPreset && isEditing))}
                    rows={3}
                    placeholder={'Preset data'}
                    className={`rounded-xl bg-punish-900 ${!(newPreset || (!newPreset && isEditing)) ? 'pr-8' : ''}`}
                    value={presetData}
                    onChange={(e) => setPresetData(e.target.value)}
                />
                {!(newPreset || (!newPreset && isEditing)) ? (
                    <Copy
                        className='absolute right-2 top-2'
                        onClick={handleCopy}
                    />
                ) : (
                    ''
                )}
            </div>
        </div>
    );
}
