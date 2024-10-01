import { Category, Preset } from '@prisma/client';
import PresetItemViewer from '@/app/plugins/[slug]/PresetItemViewer';
import CategoryItemViewer from '@/app/plugins/[slug]/CategoryItemViewer';

type ItemViewerProps = {
    item: (Category & { presets?: Preset[] }) | Preset | null;
};

// Custom type guard to check if item is a Category
function isCategory(item: Category | Preset | null): item is Category {
    return (item as Category)?.parentCategoryId !== undefined;
}

// Custom type guard to check if item is a Preset
function isPreset(item: Category | Preset | null): item is Preset {
    return (item as Preset)?.data !== undefined;
}

export default function ListItemViewer({ item }: ItemViewerProps) {
    return (
        <div className='flex w-2/5 rounded-2xl bg-punish-800 p-5'>
            {isCategory(item) ? (
                <CategoryItemViewer category={item} />
            ) : isPreset(item) ? (
                <PresetItemViewer preset={item} newPreset={false} />
            ) : (
                <h2 className='mx-auto my-auto flex-col text-2xl text-punish-500'>
                    Nothing selected!
                </h2>
            )}
        </div>
    );
}
