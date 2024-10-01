"use client"

import {createContext, useContext, useState} from 'react';
import {Category, Plugin, Preset} from "@prisma/client";

type PluginType = Plugin & {
    categories: Category[];
    presets: Preset[];
};

type CategoryWithRelations = Category & {
    presets?: Preset[];
    subcategories?: CategoryWithRelations[];
}

// Define the shape of the context value
interface PluginContextType {
    // Plugin data
    plugin: Plugin & {
        categories: Category[];
        presets: Preset[];
    };

    // Category functions
    createCategory: (newCategoryData: Partial<Category>) => Promise<Category>;
    updateCategory: (categoryId: number, updatedCategoryData: Partial<Category>) => Promise<Category>;
    deleteCategory: (categoryId: number) => Promise<void>;

    // Preset functions
    createPreset: (newPresetData: Partial<Preset>) => Promise<Preset>;
    updatePreset: (presetId: number, updatedPresetData: Partial<Preset>) => Promise<Preset>;
    deletePreset: (presetId: number) => Promise<void>;
}

// Create the context
const PluginContext = createContext<PluginContextType | undefined>(undefined);

// Hook to use the plugin context
export const usePluginContext = () => {
    const context = useContext(PluginContext);
    if (!context) throw new Error("usePluginContext must be used within a PluginProvider");
    return context;
};

// Provider component to wrap the page
export const PluginProvider = ({children, plugin}: {
    children: React.ReactNode,
    plugin: PluginContextType['plugin']
}) => {

    // State to hold plugin data so it can be updated live
    const [currentPlugin, setCurrentPlugin] = useState<PluginType>(plugin)

    // Function to create a new category
    const createCategory = async (newCategoryData: Partial<Category>) => {
        try {
            const response = await fetch(`/api/v1/categories`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(newCategoryData),
            });

            if (response.ok) {
                const createdCategory = await response.json();
                setCurrentPlugin(prevPlugin => ({
                    ...prevPlugin,
                    categories: [...prevPlugin.categories, createdCategory]
                }));
                return createdCategory;
            } else {
                console.error('Error creating category:', await response.text());
            }
        } catch (error) {
            console.error('Error creating category:', error);
        }
    };

    // Function to update a category within the context and database
    const updateCategory = async (categoryId: number, updatedCategoryData: Partial<Category>) => {
        try {
            // Update the category in the backend
            const response = await fetch(`/api/v1/categories/${categoryId}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(updatedCategoryData),
            });

            if (response.ok) {
                const updatedCategory = await response.json();

                // Recursively update the category within the category tree (top-level or subcategories)
                const updatedCategories = updateCategoryInHierarchy(currentPlugin.categories, updatedCategory);

                // Update the plugin state with the new categories array
                setCurrentPlugin(prevPlugin => ({
                    ...prevPlugin,
                    categories: updatedCategories
                }));

                return updatedCategory;

            } else console.error('Error updating category:', await response.text())
        } catch (error) {
            console.error("Error updating category:", error);
        }
    };

    // Recursively go through category list and update the appropriate category in the context
    const updateCategoryInHierarchy = (categories: CategoryWithRelations[], updatedCategory: Category): CategoryWithRelations[] => {
        return categories.map(category => {
            if (category.id === updatedCategory.id) {
                // If it's the category we want to update, return the updated category
                return {...category, ...updatedCategory};
            } else if (category.subcategories && category.subcategories.length > 0) {
                // If the category has subcategories, recursively update the subcategories
                return {
                    ...category,
                    subcategories: updateCategoryInHierarchy(category.subcategories, updatedCategory),
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
                setCurrentPlugin(prevPlugin => ({
                    ...prevPlugin,
                    categories: prevPlugin.categories.filter(category => category.id !== categoryId)
                }));
            } else {
                console.error('Error deleting category:', await response.text());
            }
        } catch (error) {
            console.error('Error deleting category:', error);
        }
    };

    // Function to create a new preset
    const createPreset = async (newPresetData: Partial<Preset>) => {
        try {
            const response = await fetch(`/api/v1/presets`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(newPresetData),
            });

            if (response.ok) {
                const createdPreset = await response.json();
                setCurrentPlugin(prevPlugin => ({
                    ...prevPlugin,
                    presets: [...prevPlugin.presets, createdPreset]
                }));
                return createdPreset;
            } else {
                console.error('Error creating preset:', await response.text());
            }
        } catch (error) {
            console.error('Error creating preset:', error);
        }
    };

    // Function to update a preset
    const updatePreset = async (presetId: number, updatedPresetData: Partial<Preset>) => {
        try {
            const response = await fetch(`/api/v1/presets/${presetId}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(updatedPresetData),
            });

            if (response.ok) {
                const updatedPreset = await response.json();
                const presetIndex = currentPlugin.presets.findIndex(preset => preset.id === updatedPreset.id);
                if (presetIndex !== -1) {
                    const updatedPresets = [...currentPlugin.presets];
                    updatedPresets[presetIndex] = updatedPreset;
                    setCurrentPlugin(prevPlugin => ({
                        ...prevPlugin,
                        presets: updatedPresets
                    }));
                }
                return updatedPreset;
            } else {
                console.error('Error updating preset:', await response.text());
            }
        } catch (error) {
            console.error('Error updating preset:', error);
        }
    };

    // Function to delete a preset
    const deletePreset = async (presetId: number) => {
        try {
            const response = await fetch(`/api/v1/presets/${presetId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setCurrentPlugin(prevPlugin => ({
                    ...prevPlugin,
                    presets: prevPlugin.presets.filter(preset => preset.id !== presetId)
                }));
            } else {
                console.error('Error deleting preset:', await response.text());
            }
        } catch (error) {
            console.error('Error deleting preset:', error);
        }
    };

    return (
        <PluginContext.Provider value={{
            plugin: currentPlugin,
            createCategory,
            updateCategory,
            deleteCategory,
            createPreset,
            updatePreset,
            deletePreset,
        }}>
            {children}
        </PluginContext.Provider>
    );
};