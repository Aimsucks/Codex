import { XCircle } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

export default function Cancel() {
    return (
        <TooltipProvider>
            <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>
                    <Button
                        variant='ghost'
                        size='icon'
                        type='reset'
                        className={`h-8 w-8 rounded hover:bg-punish-700`}
                    >
                        <XCircle className='h-6 w-6' />
                    </Button>
                </TooltipTrigger>
                <TooltipContent className='rounded-xl bg-punish-800'>
                    <span>Cancel editing</span>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
