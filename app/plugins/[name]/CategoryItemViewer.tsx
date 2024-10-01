import {Category, Preset} from "@prisma/client"
import PresetItemViewer from "@/app/plugins/[name]/PresetItemViewer";
import {useState} from "react";
import {Input} from "@/components/ui/input";
import {usePluginContext} from "@/app/plugins/[name]/PluginContext";
import ConfirmDelete from "@/components/shared/buttons/ConfirmDelete";
import Add from "@/components/shared/buttons/Add";
import Cancel from "@/components/shared/buttons/Cancel";
import Edit from "@/components/shared/buttons/Edit";
import Save from "@/components/shared/buttons/Save";
import {Separator} from "@/components/ui/separator";

type CategoryViewerProps = {
    category: Category & {
        presets?: Preset[]
    };
};

export default function CategoryItemViewer({category}: CategoryViewerProps) {
    const {updateCategory, deleteCategory} = usePluginContext()
    const [isEditing, setIsEditing] = useState(false);
    const [categoryName, setCategoryName] = useState(category.name);
    const [newPresets, setNewPresets] = useState<Preset[]>([]);

    // useEffect(() => {
    //     setNewPresets([])
    // })

    // Handle saving the updated category name
    const handleSave = async () => {
        try {
            await updateCategory(category.id, {name: categoryName});
            category.name = categoryName
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating category:', error);
        }
    };

    // Handle canceling the edit
    const handleCancel = () => {
        setCategoryName(category.name); // Revert to original name
        setIsEditing(false);
    };

    // Handle adding a new preset
    const handleAdd = () => {
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
    }

    // Handle canceling a new preset
    const handleCancelNewPreset = (id: number) => {
        setNewPresets(newPresets.filter(preset => preset.id !== id)); // Remove from list
    };

    const handleDelete = async () => {
        try {
            await deleteCategory(category.id);
            category.name = categoryName
            setIsEditing(false);
        } catch (error) {
            console.error('Error deleting category:', error);
        }
    }

    return (
        <div className="flex flex-auto flex-col">
            <div className="flex items-center mb-3">

                {/* Conditionally render category name or input field based on isEditing */}
                {isEditing ? (
                    <Input
                        className="text-xl font-bold bg-punish-950 p-2 rounded-xl h-8 w-2/3"
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                    />
                ) : (
                    <span className="text-2xl font-bold">{category.name}</span>
                )}

                {/* Edit button, or save and cancel buttons in a small box to the right */}
                {/* TODO: Add permissions here for authenticated users for this plugin */}
                <div className="flex space-x-2 ml-auto bg-punish-900 rounded">
                    {isEditing ? (
                        <>
                            <Save onClick={handleSave}/>
                            <Cancel onClick={handleCancel}/>
                        </>
                    ) : (
                        <>
                            <Edit onClick={() => setIsEditing(true)}/>
                            <Add onClick={handleAdd}/>
                            <ConfirmDelete onClick={handleDelete} canDelete={category.presets?.length == 0}/>
                        </>
                    )}
                </div>
            </div>

            {/* Render new presets first */}
            {newPresets.length > 0 && (
                <div className="space-y-3">
                    {newPresets.map((preset) => (
                        <>
                            <Separator className="bg-punish-700"/>
                            <PresetItemViewer
                                preset={preset}
                                newPreset={true}
                                onCancel={() => handleCancelNewPreset(preset.id)}
                            />
                        </>
                    ))}
                </div>
            )}

            {category.presets?.length ? (
                <div className="space-y-3">
                    {category.presets?.map((preset: Preset) => (
                        <>
                            <Separator className={`bg-punish-700 ${newPresets.length ? "mt-3" : ""}`}/>
                            <PresetItemViewer
                                key={preset.id}
                                preset={preset}
                            />
                        </>
                    ))}
                </div>
            ) : (
                ""
            )}

        </div>
    );
}
