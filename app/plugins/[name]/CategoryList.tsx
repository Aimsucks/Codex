import {Category, Preset} from "@prisma/client";
import {useState} from "react";
import PresetListItem from "@/app/plugins/[name]/PresetListItem";
import CategoryListItem from "@/app/plugins/[name]/CategoryListItem";

type CategoryWithRelations = Category & {
    presets?: Preset[];
    subcategories?: CategoryWithRelations[];
}

export default function CategoryList({categories, depth = 0, onItemOpen}: {
    categories: CategoryWithRelations[];
    depth?: number;
    onItemOpen: (item: Preset | Category & { presets?: Preset[] }) => void;
}) {

    // State to track expanded categories
    const [expandedCategories, setExpandedCategories] = useState<number[]>([]);

    // Toggle category expansion
    const toggleCategory = (categoryId: number) => {
        setExpandedCategories((prevExpandedCategories: number[]): number[] =>
            prevExpandedCategories.includes(categoryId)
                // Collapse if already expanded
                ? prevExpandedCategories.filter((id: number): boolean => id !== categoryId)

                // Expand if not expanded
                : [...prevExpandedCategories, categoryId]
        );
    };

    return (
        // Top-level div to make the categories and presets expand horizontally and appear spaced
        <div className="flex flex-grow flex-col space-y-5">
            {categories.map((category: CategoryWithRelations) => {
                const isExpanded: boolean = expandedCategories.includes(category.id);

                return (
                    <div key={category.id} className="space-y-5">

                        {/* Display a category and make it clickable */}
                        <CategoryListItem category={category} depth={depth} isExpanded={isExpanded}
                                          onClick={() => toggleCategory(category.id)} onItemOpen={onItemOpen}/>

                        {/* Only display presets and subcategories if the category is expanded */}
                        {isExpanded && (
                            
                            // Use a fragment here because the style needs to be inherited
                            <>
                                {/* Display subcategories recursively */}
                                {category.subcategories && category.subcategories.length > 0 && (
                                    <CategoryList categories={category.subcategories}
                                                  depth={depth + 1}
                                                  onItemOpen={onItemOpen}
                                    />
                                )}

                                {/* Display presets */}
                                {category.presets?.map((preset) => (
                                    <PresetListItem key={preset.id}
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
    )
};