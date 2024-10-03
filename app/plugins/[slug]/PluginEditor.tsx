import { Textarea } from '@/components/ui/textarea';
import { usePluginContext } from '@/app/plugins/[slug]/PluginContext';
import { User, UserPlugin } from '@prisma/client';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import MultipleSelector, { Option } from '@/components/ui/multi-select';
import { Button } from '@/components/ui/button';
import { SaveIcon, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

const maximumFileSize = 1024 * 1024 * 5; // 5 MB
const acceptedFileTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/svg',
];

const optionSchema = z.object({
    label: z.string(),
    value: z.string(),
    disable: z.boolean().optional(),
});

// Something to explore in the future:
// https://www.codu.co/articles/validate-an-image-file-with-zod-jjhied8p
const formSchema = z.object({
    description: z.string().max(300).optional().or(z.literal('')),
    icon: z
        .unknown()
        .transform((value) => {
            return value as FileList;
        })
        .optional()
        .refine(
            (fileList) =>
                !fileList ||
                fileList?.length == 0 ||
                fileList[0].size <= maximumFileSize,
            `Maximum image size is ${maximumFileSize / 1024 / 1024} MB`
        )
        .refine(
            (fileList) =>
                !fileList ||
                fileList?.length == 0 ||
                acceptedFileTypes.includes(fileList[0].type),
            'Only .jpg, .jpeg, .png, .webp, and .svg formats are supported'
        ),
    githubLink: z.string().url().optional().or(z.literal('')),
    discordLink: z.string().url().optional().or(z.literal('')),
    approvedUsers: z.array(optionSchema).optional(),
});

type PluginEditorProps = {
    onSave?: (data: z.infer<typeof formSchema>) => void;
    onCancel?: () => void;
};

export default function PluginEditor({ onSave, onCancel }: PluginEditorProps) {
    const { data: session } = useSession();
    const { plugin } = usePluginContext();

    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch('/api/v1/users', {});
                if (response.ok) {
                    const users: User[] = await response.json();
                    setUsers(users);
                }
            } catch (error) {
                console.error(error);
            }
        };

        fetchUsers().catch((error) => console.error(error));
    }, []);

    const multiSelectOptions: Option[] = users
        .map((u: User) => ({
            label: u.name,
            value: u.id,
        }))
        .filter((u) => u.value !== session?.user?.id);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            description: plugin?.description || '',
            // icon: plugin?.icon || '',
            githubLink: plugin?.githubLink || '',
            discordLink: plugin?.discordLink || '',
            approvedUsers: plugin.user
                .map((u: UserPlugin & { user: User }) => ({
                    label: u.user.name,
                    value: u.user.id,
                }))
                .filter((u) => u.value !== session?.user?.id),
        },
    });

    const fileRef = form.register('icon');

    function onSubmit(values: z.infer<typeof formSchema>) {
        if (onSave) onSave(values);
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className='space-y-5 rounded-2xl bg-punish-900 p-5'
            >
                <FormField
                    control={form.control}
                    name='description'
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Plugin Description</FormLabel>
                            <FormControl>
                                <Textarea
                                    {...field}
                                    className='rounded-xl bg-punish-950'
                                    rows={2}
                                    placeholder='Plugin description'
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name='icon'
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Plugin Icon</FormLabel>
                            <FormControl>
                                <Input
                                    {...fileRef}
                                    type='file'
                                    className='rounded-xl bg-punish-950 file:text-punish-50'
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name='githubLink'
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>GitHub Link</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    type='url'
                                    className='rounded-xl bg-punish-950'
                                    placeholder='GitHub link'
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name='discordLink'
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Discord Link</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    type='url'
                                    className='rounded-xl bg-punish-950'
                                    placeholder='Discord link'
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name='approvedUsers'
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Approved Editors</FormLabel>
                            <FormControl>
                                {/* Some custom filtering in the command props to filter based on label and not
                                value, there were also modifications to multi-select.tsx*/}
                                <MultipleSelector
                                    {...field}
                                    className='rounded-xl bg-punish-950'
                                    badgeClassName='rounded-xl bg-punish-800 text-punish-50'
                                    options={multiSelectOptions}
                                    placeholder="Users who can edit the plugin's categories and presets"
                                    hidePlaceholderWhenSelected={true}
                                    emptyIndicator={
                                        <p className='text-center text-lg leading-10 text-punish-50'>
                                            No results found
                                        </p>
                                    }
                                    commandProps={{
                                        filter: (
                                            value: string,
                                            search: string,
                                            keywords?: string[]
                                        ) => {
                                            const extendValue = keywords
                                                ? keywords[0]
                                                : value;
                                            if (
                                                extendValue
                                                    .toLowerCase()
                                                    .includes(
                                                        search.toLowerCase()
                                                    )
                                            ) {
                                                return 1;
                                            }
                                            return 0;
                                        },
                                    }}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className='flex gap-x-5'>
                    <Button
                        variant='secondary'
                        className='gap-2 rounded-xl bg-punish-800 hover:bg-punish-700'
                        type='submit'
                    >
                        <SaveIcon />
                        Save
                    </Button>
                    <Button
                        variant='secondary'
                        className='gap-2 rounded-xl bg-punish-800 hover:bg-punish-700'
                        type='reset'
                        onClick={onCancel}
                    >
                        <XCircle />
                        Cancel
                    </Button>
                </div>
            </form>
        </Form>
    );
}
