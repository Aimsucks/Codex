import {Category, Preset} from "@prisma/client";
import {Button} from "@/components/ui/button";
import {ExternalLink} from "lucide-react";

export default function PresetListItem({preset, depth, onItemOpen}: {
    preset: Preset;
    depth: number;
    onItemOpen: (item: Preset | Category) => void;
}) {
    return (
        <div
            className={`flex place-items-center bg-punish-800 p-2 ${getIndentationClass(depth)} rounded-xl`}
        >
            <span className="text-md ml-2">{preset.name}</span>
            <Button variant="ghost" size="icon"
                    className="h-6 w-6 ml-auto rounded"
                    onClick={() => onItemOpen(preset)}><ExternalLink className="h-4 w-4"/></Button>
        </div>
    );
}

const getIndentationClass = (depth: number): string => {
    switch (depth) {
        case 0:
            return 'ml-0';
        case 1:
            return 'ml-8';
        case 2:
            return 'ml-16';
        case 3:
            return 'ml-24';
        case 4:
            return 'ml-32';
        default:
            return 'ml-40';
    }
}