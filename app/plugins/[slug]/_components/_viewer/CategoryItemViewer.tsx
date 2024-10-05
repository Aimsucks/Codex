import { zodResolver } from '@hookform/resolvers/zod';
import { useRef, useState } from 'react';
import { useFormState } from 'react-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { PluginType } from '@/prisma';
import { Preset } from '@prisma/client';

import {
    createCategoryAction,
    deleteCategoryAction,
    updateCategoryAction,
} from '@/app/_actions/category';
import { categoryFormSchema } from '@/app/_validation/category';
import PresetItemViewer from '@/app/plugins/[slug]/_components/_viewer/PresetItemViewer';

import Add from '@/components/shared/buttons/Add';
import Cancel from '@/components/shared/buttons/Cancel';
import ConfirmDelete from '@/components/shared/buttons/ConfirmDelete';
import Edit from '@/components/shared/buttons/Edit';
import Save from '@/components/shared/buttons/Save';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

import { ItemViewerType, UserPermissionsType } from '@/lib/definitions';

type CategoryViewerProps = {
    categoryId: number;
    parentCategoryId?: number;
    plugin: PluginType;
    userPermissions: UserPermissionsType;
    onItemOpen: (item: ItemViewerType | null) => void;
};

export default function CategoryItemViewer({
    categoryId,
    parentCategoryId,
    plugin,
    userPermissions,
    onItemOpen,
}: CategoryViewerProps) {
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [newPresets, setNewPresets] = useState<{ id: number }[]>([]);

    // Find category to display it
    const category = plugin.categories.find(
        (category) => category.id === categoryId
    );

    // Bind extra data to the actions so it gets sent when they're called
    const createCategoryActionWithExtras = createCategoryAction.bind(
        null,
        plugin.id,
        parentCategoryId || null
    );
    const updateCategoryActionWithExtras = updateCategoryAction.bind(
        null,
        plugin.id,
        categoryId
    );

    // Use form state to display a message when there are server-side errors with form submission
    // TODO: Show the form state somewhere, maybe in a notification?
    const [state, formAction] = useFormState(
        categoryId === 0
            ? createCategoryActionWithExtras
            : updateCategoryActionWithExtras,
        {
            message: '',
        }
    );

    // Instantiate the form
    const form = useForm<z.output<typeof categoryFormSchema>>({
        resolver: zodResolver(categoryFormSchema),
        defaultValues: { name: category?.name || '' },
    });

    const formRef = useRef<HTMLFormElement>(null);

    // Add a new preset with a generated ID when creating new ones, this allows for adding multiple presets at once
    const handleAddPreset = () => {
        setNewPresets([{ id: Date.now() }, ...newPresets]);
    };

    // Close the "new preset" area when cancelling or saving a new preset
    const handleNewPresetCancelOrSave = (id: number) => {
        setNewPresets(newPresets.filter((preset) => preset.id !== id));
    };

    const displayCategoryPresets = () => {
        return (
            <>
                {/* Display new presets first */}
                {newPresets.length > 0 && (
                    <div className='space-y-3'>
                        {newPresets.map((preset) => (
                            <div key={preset.id}>
                                <Separator className='mb-3 bg-punish-700' />
                                <PresetItemViewer
                                    presetId={preset.id}
                                    categoryId={categoryId}
                                    plugin={plugin}
                                    userPermissions={userPermissions}
                                    newPreset={true}
                                    onCancel={handleNewPresetCancelOrSave}
                                />
                            </div>
                        ))}
                    </div>
                )}

                {/* Display rest of presets */}
                {category?.presets && category.presets.length > 0 && (
                    <div className='space-y-3'>
                        {category.presets?.map((preset: Preset) => (
                            <div key={preset.id}>
                                <Separator className={`mb-3 bg-punish-700`} />
                                <PresetItemViewer
                                    presetId={preset.id}
                                    categoryId={categoryId}
                                    plugin={plugin}
                                    userPermissions={userPermissions}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </>
        );
    };

    if (category && !isEditing) {
        return (
            <div className='flex flex-auto flex-col'>
                <div className='mb-3 flex items-center'>
                    <span className='text-2xl font-bold'>{category.name}</span>
                    {userPermissions.isCurrentPluginEditor && (
                        <div className='ml-auto flex space-x-2 rounded bg-punish-900'>
                            <Add type='preset' onClick={handleAddPreset} />
                            <Edit onClick={() => setIsEditing(true)} />
                            <ConfirmDelete
                                onClick={() => {
                                    deleteCategoryAction(plugin.id, categoryId);
                                    onItemOpen(null);
                                }}
                                canDelete={
                                    !category.presets?.length ||
                                    !category.subcategories?.length
                                }
                            />
                        </div>
                    )}
                </div>
                {displayCategoryPresets()}
            </div>
        );
    } else if (isEditing || (!category && categoryId === 0)) {
        return (
            <div className='flex flex-auto flex-col'>
                <Form {...form}>
                    <form
                        ref={formRef}
                        action={formAction}
                        onSubmit={(evt) => {
                            evt.preventDefault();
                            form.handleSubmit(() => {
                                // Turn off isEditing to make it show the actual preset
                                setIsEditing(false);
                                onItemOpen(null);
                                formAction(new FormData(formRef.current!));
                            })(evt);
                        }}
                        onReset={() => {
                            if (categoryId === 0) onItemOpen(null);
                            setIsEditing(false);
                        }}
                    >
                        <div className='mb-3 flex items-center'>
                            <FormField
                                control={form.control}
                                name='name'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                className='h-8 rounded-xl bg-punish-950 p-2 text-xl font-bold'
                                                placeholder='Category name'
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
                    </form>
                </Form>
                {displayCategoryPresets()}
            </div>
        );
    } else return <span>Error!</span>;
}
