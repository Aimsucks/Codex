import { ComponentType } from 'react';

interface PluginFactProps {
    Icon: ComponentType<{ className?: string }>;
    text: string;
}

export default function PluginFact({ Icon, text }: PluginFactProps) {
    return (
        <div className='flex flex-1 items-center whitespace-nowrap'>
            <Icon className='mr-2 h-6 w-6' />
            <span>{text}</span>
        </div>
    );
}
