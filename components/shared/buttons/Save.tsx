import React from 'react';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { SaveIcon } from 'lucide-react';

interface SaveProps {
    onClick: () => void;
}

export default function Save({ onClick }: SaveProps) {
    return (
        <TooltipProvider>
            <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>
                    <Button
                        variant='ghost'
                        size='icon'
                        className={`h-8 w-8 rounded hover:bg-punish-700`}
                        onClick={() => onClick()}
                    >
                        <SaveIcon className='h-6 w-6' />
                    </Button>
                </TooltipTrigger>
                <TooltipContent className='rounded-xl bg-punish-800'>
                    <span>Save the category/preset</span>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
