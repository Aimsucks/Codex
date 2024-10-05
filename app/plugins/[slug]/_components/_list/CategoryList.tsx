import { useState } from 'react';

import { Category, Preset } from '@prisma/client';

import CategoryListItem from '@/app/plugins/[slug]/_components/_list/CategoryListItem';
import PresetListItem from '@/app/plugins/[slug]/_components/_list/PresetListItem';

import Add from '@/components/shared/buttons/Add';

import { ItemViewerType, UserPermissionsType } from '@/lib/definitions';

type CategoryListProps = {
    categories: CategoryWithRelations[];
    userPermissions: UserPermissionsType;
    onItemOpen: (item: ItemViewerType) => void;
    depth?: number;
};

type CategoryWithRelations = Category & {
    presets?: Preset[];
    subcategories?: CategoryWithRelations[];
};

export default function CategoryList({
    categories,
    userPermissions,
    onItemOpen,
    depth = 0,
}: CategoryListProps) {
    // State to track expanded categories
    const [expandedCategories, setExpandedCategories] = useState<number[]>([]);

    // Toggle category expansion
    const toggleCategory = (categoryId: number) => {
        setExpandedCategories((prevExpandedCategories: number[]): number[] =>
            prevExpandedCategories.includes(categoryId)
                ? // Collapse if already expanded
                  prevExpandedCategories.filter(
                      (id: number): boolean => id !== categoryId
                  )
                : // Expand if not expanded
                  [...prevExpandedCategories, categoryId]
        );
    };

    return (
        // Top-level div to make the categories and presets expand horizontally and appear spaced
        <div className='flex flex-grow flex-col space-y-5'>
            {/* Display header with a button to add top level categories */}
            {depth == 0 && userPermissions.isCurrentPluginEditor && (
                <div className='flex space-x-5'>
                    <div className='text-md flex flex-grow place-items-center rounded-xl bg-punish-800 p-2 pl-4 font-bold'>
                        Plugin Category and Preset Editor
                    </div>
                    <Add
                        type='top-level category'
                        className='ml-auto h-10 w-10 rounded-xl bg-punish-800 hover:bg-punish-700'
                        onClick={() => onItemOpen({ categoryId: 0 })}
                    />
                </div>
            )}

            {/* Recursively display categories, and when they're opened, display their presets */}
            {categories.map((category: CategoryWithRelations) => {
                const isExpanded: boolean = expandedCategories.includes(
                    category.id
                );

                return (
                    <div key={category.id} className='space-y-5'>
                        {/* Display a category and make it clickable */}
                        <CategoryListItem
                            category={category}
                            depth={depth}
                            isExpanded={isExpanded}
                            onClick={() => toggleCategory(category.id)}
                            onItemOpen={onItemOpen}
                            userPermissions={userPermissions}
                        />

                        {/* Only display presets and subcategories if the category is expanded */}
                        {isExpanded && (
                            // Use a fragment here because the style needs to be inherited
                            <>
                                {/* Display subcategories recursively */}
                                {category.subcategories &&
                                    category.subcategories.length > 0 && (
                                        <CategoryList
                                            categories={category.subcategories}
                                            userPermissions={userPermissions}
                                            onItemOpen={onItemOpen}
                                            depth={depth + 1}
                                        />
                                    )}

                                {/* Display presets */}
                                {category.presets?.map((preset) => (
                                    <PresetListItem
                                        key={preset.id}
                                        preset={preset}
                                        depth={depth + 1}
                                        onItemOpen={onItemOpen}
                                    />
                                ))}
                            </>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
