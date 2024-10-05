import { Check, Trash } from 'lucide-react';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

interface ConfirmDeleteProps {
    onClick: () => void;
    canDelete: boolean;
}

export default function ConfirmDelete({
    onClick,
    canDelete,
}: ConfirmDeleteProps) {
    const [hasConfirmedDelete, setHasConfirmedDelete] = useState(false);

    const handleDeleteClick = () => {
        if (hasConfirmedDelete) {
            onClick();
            setHasConfirmedDelete(false); // Reset the confirmation state after deletion
        } else {
            setHasConfirmedDelete(true);
            setTimeout(() => {
                setHasConfirmedDelete(false); // Reset the confirmation state after a short delay
            }, 1000); // Animation duration
        }
    };

    return (
        <TooltipProvider>
            <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>
                    <Button
                        variant='ghost'
                        size='icon'
                        className={`h-8 w-8 rounded ${canDelete ? 'hover:bg-punish-700' : 'hover:bg-inherit'}`}
                        onClick={canDelete ? handleDeleteClick : undefined}
                    >
                        {hasConfirmedDelete ? (
                            <Check className='h-6 w-6 text-red-500' />
                        ) : (
                            <Trash className='h-6 w-6' />
                        )}
                    </Button>
                </TooltipTrigger>
                <TooltipContent className='rounded-xl bg-punish-800'>
                    {canDelete ? (
                        <span>Click twice to delete the category/preset</span>
                    ) : (
                        <span className='font-bold text-red-500'>
                            Delete all presets before you can delete a category
                        </span>
                    )}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
