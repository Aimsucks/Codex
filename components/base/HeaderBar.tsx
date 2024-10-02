import { auth } from '@/auth';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import SignIn from '@/components/auth/SignIn';
import SignOut from '@/components/auth/SignOut';
import Link from 'next/link';

export default async function TopBar() {
    const session = await auth();

    return (
        <div className='top-0 h-20 w-full bg-punish-950 bg-opacity-50 backdrop-blur-sm'>
            {/* Full-width fixed-height area */}
            <div className='container mx-auto h-full px-0'>
                {/* Contain all items to the container width */}
                <div className='flex h-full items-center justify-between'>
                    {/* Left- and right-align items */}
                    {/* Left-side items */}
                    <Link href='/' className='flex items-center space-x-4'>
                        <Image
                            src='/icon.svg'
                            alt='Codex Icon'
                            width={200}
                            height={200}
                            className='h-12 w-12'
                        />
                        <span className='text-2xl font-bold text-codex hover:underline'>
                            Codex
                        </span>
                    </Link>
                    {/* Right-side items */}
                    <div className='flex items-center space-x-4'>
                        {!session ? (
                            <SignIn />
                        ) : (
                            <>
                                <div className='flex items-center space-x-2'>
                                    <Avatar className='h-8 w-8 border-2 border-punish-700'>
                                        <AvatarImage
                                            src={
                                                session.user?.image || undefined
                                            }
                                        />
                                        <AvatarFallback>?</AvatarFallback>
                                    </Avatar>
                                    <span className='font-bold'>
                                        {session.user?.name ?? 'User'}
                                    </span>
                                </div>
                                <SignOut />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
