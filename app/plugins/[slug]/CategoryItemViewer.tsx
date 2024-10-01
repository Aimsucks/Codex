import { Category, Preset } from '@prisma/client';
import PresetItemViewer from '@/app/plugins/[slug]/PresetItemViewer';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { usePluginContext } from '@/app/plugins/[slug]/PluginContext';
import ConfirmDelete from '@/components/shared/buttons/ConfirmDelete';
import Add from '@/components/shared/buttons/Add';
import Cancel from '@/components/shared/buttons/Cancel';
import Edit from '@/components/shared/buttons/Edit';
import Save from '@/components/shared/buttons/Save';
import { Separator } from '@/components/ui/separator';

type CategoryViewerProps = {
    category: Category & { presets?: Preset[] };
    newCategory: boolean;
};

export default function CategoryItemViewer({
    category,
    newCategory,
}: CategoryViewerProps) {
    const { updateCategory, deleteCategory, createPreset, deletePreset } =
        usePluginContext();
    const [isEditing, setIsEditing] = useState(false);
    const [categoryName, setCategoryName] = useState(category.name);
    const [newPresets, setNewPresets] = useState<Preset[]>([]);

    // Reset newPresets whenever the category prop changes
    useEffect(() => {
        setNewPresets([]);
        setIsEditing(false);
        setCategoryName(category.name);
    }, [category.name, category.id]);

    // Handle saving the updated category name
    const handleSaveCategory = async () => {
        try {
            const updatedCategory = await updateCategory(category.id, {
                name: categoryName,
            });
            category.name = updatedCategory.name;
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating category:', error);
        }
    };

    // Handle canceling the edit
    const handleCancelCategory = () => {
        setCategoryName(category.name); // Revert to original name
        setIsEditing(false);
    };

    // Handle adding a new preset
    const handleAddPreset = () => {
        const newPreset = {
            id: Date.now(), // Use a temporary ID for the new preset
            version: 1,
            name: '',
            description: '',
            data: '',
            categoryId: category.id,
            pluginId: category.pluginId,
            updatedAt: new Date(),
            createdAt: new Date(),
        };
        setNewPresets([newPreset, ...newPresets]); // Add the new preset at the top
    };
    // Handle saving a new preset
    const handleSavePreset = async (id: number, data: Partial<Preset>) => {
        const createdPreset = await createPreset({
            name: data.name,
            version: 1,
            description: data.description,
            data: data.data,
            categoryId: category.id,
            pluginId: category.pluginId,
        });
        category.presets?.unshift(createdPreset);
        setNewPresets(newPresets.filter((preset) => preset.id !== id));
    };

    // Handle canceling a new preset
    const handleCancelPreset = (id: number) => {
        setNewPresets(newPresets.filter((preset) => preset.id !== id)); // Remove from list
    };

    // Handle deleting a category
    const handleDeleteCategory = async () => {
        try {
            await deleteCategory(category.id);
            setIsEditing(false);
        } catch (error) {
            console.error('Error deleting category:', error);
        }
    };

    // Handle deleting a preset
    const handleDeletePreset = async (id: number) => {
        try {
            await deletePreset(id);

            category.presets = category.presets?.filter(
                (preset) => preset.id !== id
            );
        } catch (error) {
            console.error('Error deleting preset:', error);
        }
    };

    return (
        <div className='flex flex-auto flex-col'>
            <div className='mb-3 flex items-center'>
                {/* Conditionally render category name or input field based on isEditing */}
                {isEditing ? (
                    <Input
                        className='h-8 w-2/3 rounded-xl bg-punish-950 p-2 text-xl font-bold'
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                    />
                ) : (
                    <span className='text-2xl font-bold'>{category.name}</span>
                )}

                {/* Edit button, or save and cancel buttons in a small box to the right */}
                {/* TODO: Add permissions here for authenticated users for this plugin */}
                <div className='ml-auto flex space-x-2 rounded bg-punish-900'>
                    {isEditing ? (
                        <>
                            <Save onClick={handleSaveCategory} />
                            <Cancel onClick={handleCancelCategory} />
                        </>
                    ) : (
                        <>
                            <Add type='preset' onClick={handleAddPreset} />
                            <Edit onClick={() => setIsEditing(true)} />
                            <ConfirmDelete
                                onClick={handleDeleteCategory}
                                canDelete={category.presets?.length == 0}
                            />
                        </>
                    )}
                </div>
            </div>

            {/* Display new presets first */}
            {newPresets.length > 0 && (
                <div className='space-y-3'>
                    {newPresets.map((preset) => (
                        <div key={preset.id}>
                            <Separator className='mb-3 bg-punish-700' />
                            <PresetItemViewer
                                preset={preset}
                                newPreset={true}
                                onSaveNew={(data: Partial<Preset>) =>
                                    handleSavePreset(preset.id, data)
                                }
                                onCancel={() => handleCancelPreset(preset.id)}
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Display rest of presets */}
            {category.presets?.length ? (
                <div className='space-y-3'>
                    {category.presets?.map((preset: Preset) => (
                        <div key={preset.id}>
                            <Separator
                                className={`bg-punish-700 ${newPresets.length ? 'mt-3' : ''} mb-3`}
                            />
                            <PresetItemViewer
                                preset={preset}
                                onDelete={() => handleDeletePreset(preset.id)}
                            />
                        </div>
                    ))}
                </div>
            ) : (
                ''
            )}
        </div>
    );
}
