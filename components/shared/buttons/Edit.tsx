import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { EditIcon } from 'lucide-react';

interface EditProps {
    onClick: () => void;
}

export default function Edit({ onClick }: EditProps) {
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
                        <EditIcon className='h-6 w-6' />
                    </Button>
                </TooltipTrigger>
                <TooltipContent className='rounded-xl bg-punish-800'>
                    <span>Edit the item</span>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
