import { Textarea } from '@/components/ui/textarea';
import { usePluginContext } from '@/app/plugins/[slug]/_components/PluginContext';
import { User } from '@prisma/client';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import MultipleSelector, { Option } from '@/components/ui/multi-select';
import { Button } from '@/components/ui/button';
import { SaveIcon, XCircle } from 'lucide-react';
import { useRef } from 'react';
import { pluginUpdateFormSchema } from '@/app/_validation/plugin';
import { z } from 'zod';
import { useFormState } from 'react-dom';
import { updatePluginAction } from '@/app/_actions/plugin';
import { useSession } from 'next-auth/react';
import { PluginType, UserPluginType } from '@/prisma';

type PluginEditorProps = {
    plugin: PluginType;
    users: User[];
};

export default function PluginEditor({ plugin, users }: PluginEditorProps) {
    const { setIsPluginEditorOpen } = usePluginContext();
    const { data: session } = useSession();

    // Bind the plugin ID to the action so it gets sent when called
    const updatePluginActionWithId = updatePluginAction.bind(null, plugin.id);

    // Use form state to display a message when there are server-side errors with form submission
    const [state, formAction] = useFormState(updatePluginActionWithId, {
        message: '',
    });

    // Generate a list of multi-select options from the provided user list
    const multiSelectOptions: Option[] = users
        .map((u: User) => ({
            label: u.name,
            value: u.id,
        }))
        .filter((u) => u.value !== session?.user?.id);

    // Instantiate the form
    const form = useForm<z.output<typeof pluginUpdateFormSchema>>({
        resolver: zodResolver(pluginUpdateFormSchema),
        defaultValues: {
            description: plugin?.description || '',
            githubLink: plugin?.githubLink || '',
            discordLink: plugin?.discordLink || '',
            approvedUsers: plugin.user
                .map((u: UserPluginType) => ({
                    label: u.user.name,
                    value: u.user.id,
                }))
                .filter((u) => u.value !== session?.user?.id),
        },
    });

    const fileRef = form.register('icon');
    const formRef = useRef<HTMLFormElement>(null);

    return (
        <Form {...form}>
            <form
                ref={formRef}
                action={formAction}
                onSubmit={(evt) => {
                    evt.preventDefault();
                    form.handleSubmit((data) => {
                        const formData = new FormData(formRef.current!);

                        // Append a stringified version of the approvedUsers array because FormData can't handle arrays
                        if (
                            data.approvedUsers &&
                            data.approvedUsers.length > 0
                        ) {
                            data.approvedUsers.forEach((user, index) => {
                                formData.append(
                                    `approvedUsers[${index}]`,
                                    JSON.stringify(user)
                                );
                            });
                        }
                        formAction(formData);
                    })(evt);
                }}
                onReset={() => setIsPluginEditorOpen(false)}
                className='space-y-5 rounded-2xl bg-punish-900 p-5'
            >
                <span className='text-2xl font-bold'>Plugin Editor</span>
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
                    render={() => (
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
                                value, there were also modifications to multi-select.tsx

                                Refer to https://shadcnui-expansions.typeart.cc/docs/multiple-selector*/}
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
                                    // onChange={(options) => console.log(options)}
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
                <div className='flex place-items-center gap-x-5'>
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
                    >
                        <XCircle />
                        Cancel
                    </Button>
                    {state?.message !== '' && (
                        <span
                            className={
                                state?.error ? 'text-red-500' : 'text-punish-50'
                            }
                        >
                            {state.message}
                        </span>
                    )}
                </div>
            </form>
        </Form>
    );
}
