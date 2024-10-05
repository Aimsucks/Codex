import { useFormatter } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { UserPermissionsType } from '@/lib/definitions';
import { PluginType } from '@/prisma';
import { useFormState } from 'react-dom';
import {
    createPresetAction,
    deletePresetAction,
    updatePresetAction,
} from '@/app/_actions/preset';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { presetFormSchema } from '@/app/_validation/preset';
import { useRef, useState } from 'react';
import { Preset } from '@prisma/client';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import Save from '@/components/shared/buttons/Save';
import Cancel from '@/components/shared/buttons/Cancel';
import Edit from '@/components/shared/buttons/Edit';
import ConfirmDelete from '@/components/shared/buttons/ConfirmDelete';

type PresetViewerProps = {
    presetId: number;
    categoryId: number;
    plugin: PluginType;
    userPermissions: UserPermissionsType;
    newPreset?: boolean;
    onCancel?: (id: number) => void;
};

export default function PresetItemViewer({
    presetId,
    categoryId,
    plugin,
    userPermissions,
    newPreset = false,
    onCancel,
}: PresetViewerProps) {
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const format = useFormatter();

    // Find preset to display it
    const preset: Preset | undefined = plugin.presets.find(
        (preset: Preset) => preset.id === presetId
    );

    // Bind extra data to the actions so it gets sent when they're called
    const createPresetActionWithExtras = createPresetAction.bind(
        null,
        plugin.id,
        categoryId
    );
    const updatePresetActionWithExtras = updatePresetAction.bind(
        null,
        plugin.id,
        presetId
    );

    // Use form state to display a message when there are server-side errors with form submission
    // TODO: Show the form state somewhere, maybe in a notification?
    const [state, formAction] = useFormState(
        newPreset ? createPresetActionWithExtras : updatePresetActionWithExtras,
        {
            message: '',
        }
    );

    // Instantiate the form
    const form = useForm<z.output<typeof presetFormSchema>>({
        resolver: zodResolver(presetFormSchema),
        defaultValues: {
            name: preset?.name || '',
            description: preset?.description || '',
            data: preset?.data || '',
        },
    });

    const formRef = useRef<HTMLFormElement>(null);

    if (preset && !isEditing) {
        return (
            <div className='flex flex-auto flex-col space-y-1'>
                <div className='flex'>
                    <span className='text-2xl font-bold'>{preset.name}</span>

                    {/* Edit and delete buttons */}
                    {userPermissions.isCurrentPluginEditor && (
                        <div className='ml-auto flex space-x-2 rounded bg-punish-900'>
                            <Edit onClick={() => setIsEditing(true)} />
                            <ConfirmDelete
                                onClick={() =>
                                    deletePresetAction(plugin.id, presetId)
                                }
                                canDelete={true}
                            />
                        </div>
                    )}
                </div>

                {/* Badges for version number and last updated relative date */}
                <div className='flex justify-items-center space-x-2'>
                    <Badge variant='secondary'>Version {preset.version}</Badge>
                    <Badge variant='secondary'>
                        Updated {format.relativeTime(preset.updatedAt)}
                    </Badge>
                </div>

                <span className='text-md'>{preset.description}</span>

                <div className='relative w-full'>
                    <Textarea
                        readOnly={true}
                        rows={3}
                        placeholder={'Preset data'}
                        className='rounded-xl bg-punish-900'
                        value={preset.data}
                    />
                </div>
            </div>
        );
    } else if (isEditing || newPreset) {
        return (
            <Form {...form}>
                <form
                    ref={formRef}
                    action={formAction}
                    onSubmit={(evt) => {
                        evt.preventDefault();
                        form.handleSubmit(() => {
                            // Turn off isEditing to make it show the actual preset
                            setIsEditing(false);
                            if (onCancel) onCancel(presetId);
                            formAction(new FormData(formRef.current!));
                        })(evt);
                    }}
                    onReset={
                        newPreset && onCancel
                            ? () => onCancel(presetId)
                            : () => setIsEditing(false)
                    }
                    className='flex flex-auto flex-col space-y-1'
                >
                    <div className='flex'>
                        <FormField
                            control={form.control}
                            name='name'
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            className='h-8 rounded-xl bg-punish-950 p-2 text-xl font-bold'
                                            placeholder='Preset name'
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className='ml-auto flex space-x-2 rounded bg-punish-900'>
                            <Save />
                            <Cancel />
                        </div>
                    </div>
                    {!newPreset && preset && (
                        <div className='flex justify-items-center space-x-2'>
                            <Badge variant='secondary'>
                                Version {preset.version}
                            </Badge>
                            <Badge variant='secondary'>
                                Updated {format.relativeTime(preset.updatedAt)}
                            </Badge>
                        </div>
                    )}
                    <FormField
                        control={form.control}
                        name='description'
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Textarea
                                        {...field}
                                        readOnly={false}
                                        rows={3}
                                        placeholder='Preset description'
                                        className='rounded-xl bg-punish-900'
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name='data'
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Textarea
                                        {...field}
                                        readOnly={false}
                                        rows={3}
                                        placeholder='Preset data'
                                        className='rounded-xl bg-punish-900'
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </form>
            </Form>
        );
    } else {
        return <span>Error!</span>;
    }
}
