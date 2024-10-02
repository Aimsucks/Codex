'use client';

import { createContext, useContext, useState } from 'react';
import { Category, Plugin, Preset, UserPlugin } from '@prisma/client';

type PluginType = Plugin & {
    categories: Category[];
    presets: Preset[];
    user: UserPlugin[];
};

type CategoryWithRelations = Category & {
    presets?: Preset[];
    subcategories?: CategoryWithRelations[];
};

// Define the shape of the context value
interface PluginContextType {
    // Plugin data
    plugin: Plugin & {
        categories: Category[];
        presets: Preset[];
        user: UserPlugin[];
    };

    userPermissions: {
        isAdmin: boolean;
        isCurrentPluginEditor: boolean;
    };

    // Plugin functions
    updatePlugin: (
        pluginId: number,
        updatedPluginData: Partial<Plugin & { user: UserPlugin[] }>
    ) => Promise<Plugin & { user: UserPlugin[] }>;

    // Category functions
    createCategory: (newCategoryData: Partial<Category>) => Promise<Category>;
    updateCategory: (
        categoryId: number,
        updatedCategoryData: Partial<Category>
    ) => Promise<Category>;
    deleteCategory: (categoryId: number) => Promise<void>;

    // Preset functions
    createPreset: (newPresetData: Partial<Preset>) => Promise<Preset>;
    updatePreset: (
        presetId: number,
        updatedPresetData: Partial<Preset>
    ) => Promise<Preset>;
    deletePreset: (presetId: number) => Promise<void>;
}

// Create the context
const PluginContext = createContext<PluginContextType | undefined>(undefined);

// Hook to use the plugin context
export const usePluginContext = () => {
    const context = useContext(PluginContext);
    if (!context)
        throw new Error(
            'usePluginContext must be used within a PluginProvider'
        );
    return context;
};

// Provider component to wrap the page
export const PluginProvider = ({
    children,
    plugin,
    userPermissions,
}: {
    children: React.ReactNode;
    plugin: PluginContextType['plugin'];
    userPermissions: PluginContextType['userPermissions'];
}) => {
    // State to hold plugin data so it can be updated live
    const [currentPlugin, setCurrentPlugin] = useState<PluginType>(plugin);

    const updatePlugin = async (
        pluginId: number,
        updatedPluginData: Partial<Plugin & { user: UserPlugin[] }>
    ) => {
        try {
            const response = await fetch(`/api/v1/plugins/${pluginId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedPluginData),
            });

            if (response.ok) {
                const updatedPlugin = await response.json();

                setCurrentPlugin((prevPlugin) => ({
                    ...prevPlugin,
                    description: updatedPlugin.description,
                    icon: updatedPlugin.icon,
                    githubLink: updatedPlugin.githubLink,
                    discordLink: updatedPlugin.discordLink,
                    user: updatedPlugin.user,
                    categories: plugin.categories,
                    presets: plugin.presets,
                }));

                return updatedPlugin;
            } else {
                console.error('Error updating plugin:', await response.text());
            }
        } catch (error) {
            console.error('Error updating plugin:', error);
        }
    };

    // Function to create a new category
    const createCategory = async (newCategoryData: Partial<Category>) => {
        try {
            const response = await fetch(`/api/v1/categories`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCategoryData),
            });

            if (response.ok) {
                const createdCategory = await response.json();

                setCurrentPlugin((prevPlugin) => ({
                    ...prevPlugin,
                    categories: newCategoryData.parentCategoryId
                        ? addCategoryToHierarchy(
                              prevPlugin.categories,
                              createdCategory
                          )
                        : [...prevPlugin.categories, createdCategory], // If no parent, add to top level
                }));

                return createdCategory;
            } else {
                console.error(
                    'Error creating category:',
                    await response.text()
                );
            }
        } catch (error) {
            console.error('Error creating category:', error);
        }
    };

    // Recursively add a new category to the category hierarchy
    const addCategoryToHierarchy = (
        categories: CategoryWithRelations[],
        newCategory: CategoryWithRelations
    ): CategoryWithRelations[] => {
        return categories.map((category) => {
            // If the new category belongs to this category (i.e., parent category)
            if (category.id === newCategory.parentCategoryId) {
                return {
                    ...category,
                    subcategories: category.subcategories
                        ? [...category.subcategories, newCategory]
                        : [newCategory], // Add new category to subcategories
                };
            } else if (
                category.subcategories &&
                category.subcategories.length > 0
            ) {
                // Recursively add the category to the subcategories
                return {
                    ...category,
                    subcategories: addCategoryToHierarchy(
                        category.subcategories,
                        newCategory
                    ),
                };
            }
            return category;
        });
    };

    // Function to update a category within the context and database
    const updateCategory = async (
        categoryId: number,
        updatedCategoryData: Partial<Category>
    ) => {
        try {
            // Update the category in the backend
            const response = await fetch(`/api/v1/categories/${categoryId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedCategoryData),
            });

            if (response.ok) {
                const updatedCategory = await response.json();

                // Recursively update the category within the category tree (top-level or subcategories)
                const updatedCategories = updateCategoryInHierarchy(
                    currentPlugin.categories,
                    updatedCategory
                );

                // Update the plugin state with the new categories array
                setCurrentPlugin((prevPlugin) => ({
                    ...prevPlugin,
                    categories: updatedCategories,
                }));

                return updatedCategory;
            } else
                console.error(
                    'Error updating category:',
                    await response.text()
                );
        } catch (error) {
            console.error('Error updating category:', error);
        }
    };

    // Recursively go through category list and update the appropriate category in the context
    const updateCategoryInHierarchy = (
        categories: CategoryWithRelations[],
        updatedCategory: Category
    ): CategoryWithRelations[] => {
        return categories.map((category) => {
            if (category.id === updatedCategory.id) {
                // If it's the category we want to update, return the updated category
                return { ...category, ...updatedCategory };
            } else if (
                category.subcategories &&
                category.subcategories.length > 0
            ) {
                // If the category has subcategories, recursively update the subcategories
                return {
                    ...category,
                    subcategories: updateCategoryInHierarchy(
                        category.subcategories,
                        updatedCategory
                    ),
                };
            }
            return category;
        });
    };

    // Function to delete a category
    const deleteCategory = async (categoryId: number) => {
        try {
            const response = await fetch(`/api/v1/categories/${categoryId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setCurrentPlugin((prevPlugin) => ({
                    ...prevPlugin,
                    categories: removeCategoryFromHierarchy(
                        prevPlugin.categories,
                        categoryId
                    ),
                }));
            } else {
                console.error(
                    'Error deleting category:',
                    await response.text()
                );
            }
        } catch (error) {
            console.error('Error deleting category:', error);
        }
    };

    // Recursively remove a category and its subcategories from the category hierarchy
    const removeCategoryFromHierarchy = (
        categories: CategoryWithRelations[],
        categoryId: number
    ): CategoryWithRelations[] => {
        return categories
            .filter((category) => category.id !== categoryId) // Filter out the category to be deleted
            .map((category) => {
                if (
                    category.subcategories &&
                    category.subcategories.length > 0
                ) {
                    // Recursively handle subcategories if they exist
                    return {
                        ...category,
                        subcategories: removeCategoryFromHierarchy(
                            category.subcategories,
                            categoryId
                        ),
                    };
                }
                return category;
            });
    };

    // Function to create a new preset
    const createPreset = async (newPresetData: Partial<Preset>) => {
        try {
            const response = await fetch(`/api/v1/presets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newPresetData),
            });

            if (response.ok) {
                const createdPreset = await response.json();
                setCurrentPlugin((prevPlugin) => ({
                    ...prevPlugin,
                    presets: [...prevPlugin.presets, createdPreset],
                    categories: addPresetToCategoryInHierarchy(
                        prevPlugin.categories,
                        createdPreset
                    ),
                }));
                return createdPreset;
            } else {
                console.error('Error creating preset:', await response.text());
            }
        } catch (error) {
            console.error('Error creating preset:', error);
        }
    };

    const addPresetToCategoryInHierarchy = (
        categories: CategoryWithRelations[],
        preset: Preset
    ): CategoryWithRelations[] => {
        return categories.map((category) => {
            if (category.id === preset.categoryId) {
                return {
                    ...category,
                    presets: category.presets
                        ? [...category.presets, preset]
                        : [preset],
                };
            } else if (
                category.subcategories &&
                category.subcategories.length > 0
            ) {
                return {
                    ...category,
                    subcategories: addPresetToCategoryInHierarchy(
                        category.subcategories,
                        preset
                    ),
                };
            }
            return category;
        });
    };

    // Function to update a preset
    const updatePreset = async (
        presetId: number,
        updatedPresetData: Partial<Preset>
    ) => {
        try {
            const response = await fetch(`/api/v1/presets/${presetId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedPresetData),
            });

            if (response.ok) {
                const updatedPreset = await response.json();
                setCurrentPlugin((prevPlugin) => ({
                    ...prevPlugin,
                    presets: prevPlugin.presets.map((preset) =>
                        preset.id === updatedPreset.id ? updatedPreset : preset
                    ),
                    categories: updatePresetInHierarchy(
                        prevPlugin.categories,
                        updatedPreset
                    ),
                }));
                return updatedPreset;
            } else {
                console.error('Error updating preset:', await response.text());
            }
        } catch (error) {
            console.error('Error updating preset:', error);
        }
    };

    // Recursively update preset in the category tree
    const updatePresetInHierarchy = (
        categories: CategoryWithRelations[],
        updatedPreset: Preset
    ): CategoryWithRelations[] => {
        return categories.map((category) => {
            if (category.id === updatedPreset.categoryId) {
                return {
                    ...category,
                    presets: category.presets?.map((preset) =>
                        preset.id === updatedPreset.id ? updatedPreset : preset
                    ),
                };
            } else if (
                category.subcategories &&
                category.subcategories.length > 0
            ) {
                return {
                    ...category,
                    subcategories: updatePresetInHierarchy(
                        category.subcategories,
                        updatedPreset
                    ),
                };
            }
            return category;
        });
    };

    // Function to delete a preset
    const deletePreset = async (presetId: number) => {
        try {
            const response = await fetch(`/api/v1/presets/${presetId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setCurrentPlugin((prevPlugin) => ({
                    ...prevPlugin,
                    presets: prevPlugin.presets.filter(
                        (preset) => preset.id !== presetId
                    ),
                    categories: removePresetFromCategoryInHierarchy(
                        prevPlugin.categories,
                        presetId
                    ),
                }));
            } else {
                console.error('Error deleting preset:', await response.text());
            }
        } catch (error) {
            console.error('Error deleting preset:', error);
        }
    };

    const removePresetFromCategoryInHierarchy = (
        categories: CategoryWithRelations[],
        presetId: number
    ): CategoryWithRelations[] => {
        return categories.map((category) => {
            if (category.presets) {
                return {
                    ...category,
                    presets: category.presets.filter(
                        (preset) => preset.id !== presetId
                    ),
                    // Recursively handle subcategories if they exist
                    subcategories: category.subcategories
                        ? removePresetFromCategoryInHierarchy(
                              category.subcategories,
                              presetId
                          )
                        : [],
                };
            }
            if (category.subcategories && category.subcategories.length > 0) {
                return {
                    ...category,
                    subcategories: removePresetFromCategoryInHierarchy(
                        category.subcategories,
                        presetId
                    ),
                };
            }
            return category;
        });
    };

    return (
        <PluginContext.Provider
            value={{
                plugin: currentPlugin,
                userPermissions: userPermissions,
                updatePlugin,
                createCategory,
                updateCategory,
                deleteCategory,
                createPreset,
                updatePreset,
                deletePreset,
            }}
        >
            {children}
        </PluginContext.Provider>
    );
};
