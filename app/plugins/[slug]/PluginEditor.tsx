import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import ApprovedUserSelector from '@/app/plugins/[slug]/ApprovedUserSelector';
import { useState } from 'react';
import { usePluginContext } from '@/app/plugins/[slug]/PluginContext';
import { Button } from '@/components/ui/button';
import { SaveIcon, XCircle } from 'lucide-react';
import { Plugin, UserPlugin } from '@prisma/client';

type PluginEditorProps = {
    onSave?: (plugin: Partial<Plugin>) => void;
    onCancel?: () => void;
};

export default function PluginEditor({ onSave, onCancel }: PluginEditorProps) {
    const { plugin } = usePluginContext();

    const [description, setDescription] = useState<string | null>(
        plugin.description
    );
    const [iconUrl, setIconUrl] = useState<string | null>(plugin.icon);
    const [githubLink, setGithubLink] = useState<string | null>(
        plugin.githubLink
    );
    const [discordLink, setDiscordLink] = useState<string | null>(
        plugin.discordLink
    );

    const [approvedUsers, setApprovedUsers] = useState<string[]>(
        plugin.user.map((u) => u.userId)
    );

    const handleSave = () => {
        const data: Partial<Plugin & { user: UserPlugin[] }> = {
            description: description,
            icon: iconUrl,
            githubLink: githubLink,
            discordLink: discordLink,
            user: approvedUsers.map((u) => ({
                userId: u,
                pluginId: plugin.id,
            })),
        };

        if (onSave) onSave(data);
    };

    return (
        <div className='flex flex-col space-y-5 rounded-2xl bg-punish-900 p-5'>
            <div className='grid w-full items-center gap-2'>
                <Label className='pl-2'>Plugin Description</Label>
                <Textarea
                    className='h-12 rounded-xl bg-punish-950 p-2 text-xl font-bold'
                    rows={2}
                    value={description || ''}
                    placeholder='GitHub link'
                    onChange={(e) => setDescription(e.target.value)}
                />
            </div>
            <div className='grid w-full items-center gap-2'>
                <Label className='pl-2'>Icon URL</Label>
                <Input
                    className='h-12 rounded-xl bg-punish-950 p-2 text-xl font-bold'
                    value={iconUrl || ''}
                    placeholder='Icon URL'
                    onChange={(e) => setIconUrl(e.target.value)}
                />
            </div>
            <div className='grid w-full items-center gap-2'>
                <Label className='pl-2'>GitHub Link</Label>
                <Input
                    className='h-12 rounded-xl bg-punish-950 p-2 text-xl font-bold'
                    value={githubLink || ''}
                    placeholder='GitHub link'
                    onChange={(e) => setGithubLink(e.target.value)}
                />
            </div>
            <div className='grid w-full items-center gap-2'>
                <Label className='pl-2'>Discord Link</Label>
                <Input
                    className='h-12 rounded-xl bg-punish-950 p-2 text-xl font-bold'
                    value={discordLink || ''}
                    placeholder='Discord link'
                    onChange={(e) => setDiscordLink(e.target.value)}
                />
            </div>
            <div className='grid w-full items-center gap-2'>
                <Label className='pl-2'>Approved Editors</Label>
                <ApprovedUserSelector
                    value={approvedUsers}
                    onValueChange={(users: string[]) => setApprovedUsers(users)}
                />
            </div>
            <div className='flex gap-x-5'>
                <Button
                    variant='secondary'
                    className='gap-2 rounded-xl bg-punish-800 hover:bg-punish-700'
                    onClick={() => handleSave()}
                >
                    <SaveIcon />
                    Save
                </Button>
                <Button
                    variant='secondary'
                    className='gap-2 rounded-xl bg-punish-800 hover:bg-punish-700'
                    onClick={onCancel}
                >
                    <XCircle />
                    Cancel
                </Button>
            </div>
        </div>
    );
}
