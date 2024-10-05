import PresetItemViewer from '@/app/plugins/[slug]/_components/_viewer/PresetItemViewer';
import CategoryItemViewer from '@/app/plugins/[slug]/_components/_viewer/CategoryItemViewer';
import { ItemViewerType, UserPermissionsType } from '@/lib/definitions';
import { PluginType } from '@/prisma';

type ItemViewerProps = {
    item: ItemViewerType | null;
    plugin: PluginType;
    userPermissions: UserPermissionsType;
    onItemOpen: (item: ItemViewerType | null) => void;
};

export default function ListItemViewer({
    item,
    plugin,
    userPermissions,
    onItemOpen,
}: ItemViewerProps) {
    return (
        <div className='flex w-2/5 rounded-2xl bg-punish-800 p-5'>
            {item?.categoryId != null && !item?.presetId ? (
                <CategoryItemViewer
                    categoryId={item.categoryId}
                    parentCategoryId={item.parentCategoryId || undefined}
                    plugin={plugin}
                    userPermissions={userPermissions}
                    onItemOpen={onItemOpen}
                />
            ) : item?.presetId && item?.categoryId ? (
                <PresetItemViewer
                    presetId={item.presetId}
                    categoryId={item.categoryId}
                    plugin={plugin}
                    userPermissions={userPermissions}
                    newPreset={false}
                />
            ) : (
                <span className='mx-auto my-auto flex-col text-2xl text-punish-500'>
                    Nothing selected!
                </span>
            )}
        </div>
    );
}
