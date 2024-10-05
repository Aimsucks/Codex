import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { IconDefinition } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface PluginButtonProps {
    icon: IconDefinition;
    link?: string;
    text: string;
    onClick?: () => void;
}

interface ButtonComponentProps {
    icon: IconDefinition;
    text: string;
    onClick?: () => void;
}

export default function PluginButton({
    icon,
    link,
    text,
    onClick,
}: PluginButtonProps) {
    if (link)
        return (
            <Link href={link} target='_blank'>
                <ButtonComponent icon={icon} text={text} onClick={onClick} />
            </Link>
        );
    else return <ButtonComponent icon={icon} text={text} onClick={onClick} />;
}

function ButtonComponent({ icon, text, onClick }: ButtonComponentProps) {
    return (
        <Button
            variant='secondary'
            className='gap-2 rounded-xl bg-punish-800 hover:bg-punish-700'
            onClick={onClick}
        >
            <FontAwesomeIcon icon={icon} size='xl' />
            {text}
        </Button>
    );
}
