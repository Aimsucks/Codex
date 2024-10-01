import {Preset} from "@prisma/client"
import {useFormatter} from "next-intl";
import {Badge} from "@/components/ui/badge"
import {Textarea} from "@/components/ui/textarea";
import {useState} from "react";
import {Input} from "@/components/ui/input";
import Edit from "@/components/shared/buttons/Edit";
import Save from "@/components/shared/buttons/Save";
import Cancel from "@/components/shared/buttons/Cancel";
import ConfirmDelete from "@/components/shared/buttons/ConfirmDelete";
import {usePluginContext} from "@/app/plugins/[name]/PluginContext";

type PresetViewerProps = {
    preset: Preset;
    newPreset?: boolean;
    onCancel?: () => void;
};

export default function PresetItemViewer({preset, newPreset = false, onCancel}: PresetViewerProps) {
    const {createPreset, updatePreset, deletePreset} = usePluginContext()
    const [isEditing, setIsEditing] = useState(false);
    const [presetName, setPresetName] = useState(preset?.name);
    const [presetDescription, setPresetDescription] = useState(preset?.description);
    const [presetData, setPresetData] = useState(preset?.data);

    const format = useFormatter()

    // Handle saving the updated category name
    const handleSave = async () => {
        console.log("saved")
        setIsEditing(false);
        // try {
        //     preset.name = presetName
        //     await updatePreset(preset.id, {name: categoryName});
        //
        //     setIsEditing(false);
        // } catch (error) {
        //     console.error('Error updating category:', error);
        // }
    };

    // Handle canceling the edit
    const handleCancel = () => {
        if (newPreset && onCancel) onCancel()
        else {
            setPresetName(preset?.name); // Revert to original name
            setIsEditing(false);
        }
    };

    const handleAdd = () => {
        console.log("added")
    }

    const handleDelete = async () => {
        console.log("deleted")
    }

    return (
        <div className="flex flex-auto flex-col space-y-1">
            <div className="flex">

                {/* Conditionally render preset name or input field based on isEditing */}
                {(newPreset) || (!newPreset && isEditing) ? (
                    <Input
                        className="text-xl font-bold bg-punish-950 p-2 rounded-xl h-8 w-2/3"
                        value={presetName}
                        onChange={(e) => setPresetName(e.target.value)}
                    />
                ) : (
                    <span className="text-2xl font-bold">{preset?.name}</span>
                )}

                {/* Edit button, save and cancel buttons */}
                <div className="flex space-x-2 ml-auto bg-punish-900 rounded">
                    {(newPreset) || (!newPreset && isEditing) ? (
                        <>
                            <Save onClick={handleSave}/>
                            <Cancel onClick={handleCancel}/>
                        </>
                    ) : (
                        <>
                            <Edit onClick={() => setIsEditing(true)}/>
                            <ConfirmDelete onClick={handleDelete} canDelete={true}
                            />
                        </>
                    )}
                </div>
            </div>

            {/* Badges for version number and last updated relative date */}
            <div className="flex space-x-2 justify-items-center">
                {!newPreset ? (
                    <>
                        <span><Badge variant="secondary">Version {preset.version}</Badge></span>
                        <span><Badge
                            variant="secondary">Updated {format.relativeTime(preset.updatedAt)}</Badge></span>
                    </>
                ) : (
                    ""
                )}
            </div>

            {/* Conditionally render description or textarea input field based on isEditing */}
            {(newPreset) || (!newPreset && isEditing) ? (
                <Textarea
                    rows={3}
                    placeholder={"Preset description"}
                    className="rounded-xl bg-punish-900"
                    value={presetDescription || ""}
                    onChange={(e) => setPresetDescription(e.target.value)}
                />
            ) : (
                <span className="text-md">{preset?.description}</span>
            )}

            {/* Conditionally enable textarea for data based on isEditing */}
            <Textarea
                readOnly={!((newPreset) || (!newPreset && isEditing))}
                rows={3}
                placeholder={"Preset data"}
                className="rounded-xl bg-punish-900"
                value={presetData}
                onChange={(e) => setPresetData(e.target.value)}
            />
        </div>
    );
}