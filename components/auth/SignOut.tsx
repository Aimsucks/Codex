import { signOut } from '@/auth';

import { Button } from '@/components/ui/button';

export default function SignOut() {
    return (
        <form
            action={async () => {
                'use server';
                await signOut();
            }}
        >
            <Button className='rounded-xl' variant='secondary' type='submit'>
                Sign out
            </Button>
        </form>
    );
}
