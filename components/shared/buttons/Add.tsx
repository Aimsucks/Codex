import { Plus } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

interface AddProps {
    type: string;
    onClick: () => void;
    className?: string;
}

export default function Add({ type, className, onClick }: AddProps) {
    return (
        <TooltipProvider>
            <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>
                    <Button
                        variant='ghost'
                        size='icon'
                        className={
                            className || `h-8 w-8 rounded hover:bg-punish-700`
                        }
                        onClick={() => onClick()}
                    >
                        <Plus className='h-6 w-6' />
                    </Button>
                </TooltipTrigger>
                <TooltipContent className='rounded-xl bg-punish-800'>
                    <span>Add a new {type}</span>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
