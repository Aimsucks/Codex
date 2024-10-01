import { signIn } from '@/auth';
import { Button } from '@/components/ui/button';

export default function SignIn() {
    return (
        <form
            action={async () => {
                'use server';
                await signIn('discord');
            }}
        >
            <Button className='rounded-xl' variant='default' type='submit'>
                Sign in
            </Button>
        </form>
    );
}
