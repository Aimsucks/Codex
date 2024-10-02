import { useEffect, useState } from 'react';
import { MultiSelect } from '@/components/ui/multi-select';
import { User } from '@prisma/client';
import { useSession } from 'next-auth/react';

type ApprovedUserSelectorProps = {
    value: string[];
    onValueChange: (users: string[]) => void;
};

export default function ApprovedUserSelector({
    value,
    onValueChange,
}: ApprovedUserSelectorProps) {
    const [users, setUsers] = useState<User[]>([]);
    const { data: session, status } = useSession();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch('/api/v1/users', {});
                if (response.ok) {
                    const users: User[] = await response.json();
                    setUsers(users);
                } else throw new Error('Failed to fetch items');
            } catch (error) {
                console.error(error);
            }
        };

        fetchUsers();
    }, []);

    const userList = users
        .filter((u: User) => u.name !== session?.user?.name)
        .map((u: User) => {
            return {
                value: u.id,
                label: u.name,
                // icon: UserIcon(u),
            };
        });

    return (
        <div className='h-12 w-full'>
            <MultiSelect
                className='h-12 rounded-xl bg-punish-950 p-2 text-xl font-bold hover:bg-punish-950'
                options={userList}
                onValueChange={onValueChange}
                defaultValue={value}
                placeholder='Select users'
                variant='secondary'
                // animation={2}
                // maxCount={3}
            />
        </div>
    );
}

// function UserIcon(u: User) {
//     return (
//         <Avatar className='border-1 border-punish-700'>
//             <AvatarImage src={u.image || undefined} />
//             <AvatarFallback>?</AvatarFallback>
//         </Avatar>
//     );
// }
