import React from 'react';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { CopyIcon } from 'lucide-react';

interface CopyProps {
    className?: string;
    onClick: () => void;
}

export default function Copy({ className, onClick }: CopyProps) {
    return (
        <TooltipProvider>
            <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>
                    <Button
                        variant='ghost'
                        size='icon'
                        className={
                            className + ` h-6 w-6 rounded hover:bg-punish-700`
                        }
                        onClick={() => onClick()}
                    >
                        <CopyIcon className='h-4 w-4' />
                    </Button>
                </TooltipTrigger>
                <TooltipContent className='rounded-xl bg-punish-800'>
                    <span>Copy the preset data</span>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
