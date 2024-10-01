import React from 'react';
import {Button} from "@/components/ui/button"
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";
import {Plus} from "lucide-react";

interface AddProps {
    onClick: () => void;
}

export default function Add({onClick}: AddProps) {
    return (
        <TooltipProvider>
            <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>
                    <Button variant="ghost"
                            size="icon"
                            className={`h-8 w-8 rounded hover:bg-punish-700`}
                            onClick={() => onClick()}>
                        <Plus className="h-6 w-6"/>
                    </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-punish-800 rounded-xl">
                    <span>Add a new preset</span>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}