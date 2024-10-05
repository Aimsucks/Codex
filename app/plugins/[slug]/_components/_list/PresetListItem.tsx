import { Preset } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { ItemViewerType } from '@/lib/definitions';

type PresetListItemProps = {
    preset: Preset;
    depth: number;
    onItemOpen: (item: ItemViewerType) => void;
};

export default function PresetListItem({
    preset,
    depth,
    onItemOpen,
}: PresetListItemProps) {
    return (
        // Preset bar
        <div
            className={`flex place-items-center bg-punish-800 p-2 ${getIndentationClass(depth)} rounded-xl`}
        >
            {/* Preset name */}
            <span className='text-md ml-2'>{preset.name}</span>

            {/* "Open" button to display individual preset information on right */}
            <Button
                variant='ghost'
                size='icon'
                className='ml-auto h-6 w-6 rounded'
                onClick={() =>
                    onItemOpen({
                        presetId: preset.id,
                        categoryId: preset.categoryId,
                    })
                }
            >
                <ExternalLink className='h-4 w-4' />
            </Button>
        </div>
    );
}

// As depth goes up, the bar is indented more
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
};
