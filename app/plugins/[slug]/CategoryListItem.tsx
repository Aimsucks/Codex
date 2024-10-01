import {Category, Preset} from "@prisma/client";
import {ChevronUp, ExternalLink} from "lucide-react"
import {Button} from "@/components/ui/button";
import Add from "@/components/shared/buttons/Add";

type CategoryProps = {
    category: Category & { presets?: Preset[] };
    depth: number;
    onClick: () => void;
    isExpanded: boolean;
    onItemOpen: (item: Preset | Category & { presets?: Preset[] }) => void;
};

export default function CategoryListItem(
    {
        category, depth, isExpanded, onClick, onItemOpen
    }: CategoryProps) {
    return (
        <div className="flex place-items-center space-x-5">

            {/* Category bar, which is clickable element and will expand it to show subcategories and presets */}
            <div
                className={`cursor-pointer place-items-center flex flex-grow bg-slate-700 p-2 
                    ${getIndentationClass(depth)} rounded-xl hover:bg-slate-600 transition duration-200`}
                onClick={onClick}
            >

                {/* Animated arrow and category name */}
                <div className="flex">
                    <ChevronUp
                        className={`transform transition-transform duration-200 
                            ${isExpanded ? 'rotate-180' : 'rotate-0'}`}
                    />
                    <span className="text-md ml-2">{category.name}</span>
                </div>

                {/* "Open" button to display category and preset information on right */}
                <Button variant="ghost" size="icon"
                        className="h-6 w-6 ml-auto rounded"
                        onClick={(e) => {
                            e.stopPropagation();
                            onItemOpen(category)
                        }}>
                    <ExternalLink className="h-4 w-4"/>
                </Button>
            </div>

            {/* Display add button when category is expanded */}
            {isExpanded ? (
                <div>
                    <Add type="subcategory"
                         className="h-10 w-10 rounded-xl bg-slate-700 hover:bg-slate-600"
                         onClick={() => console.log("clicked!")}
                    />
                </div>
            ) : (
                ""
            )}

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
}