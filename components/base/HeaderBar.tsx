import {auth} from "@/auth";
import Image from 'next/image'
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import SignIn from "@/components/auth/SignIn";
import SignOut from "@/components/auth/SignOut";

export default async function TopBar() {
    const session = await auth();

    return (
        <div className="w-full h-20 fixed top-0"> {/* Full-width fixed-height area */}
            <div className="container mx-auto px-4 h-full"> {/* Contain all items to the container width */}
                <div className="flex justify-between items-center h-full"> {/* Left- and right-align items */}

                    {/* Left-side items */}
                    <div className="flex items-center space-x-4">
                        <Image
                            src="/icon.svg"
                            alt="Codex Icon"
                            width={200}
                            height={200}
                            className="h-12 w-12"
                        />
                        <span className="font-bold text-codex text-2xl">Codex</span>
                    </div>

                    {/* Right-side items */}
                    <div className="flex items-center space-x-4">
                        {!session ? (
                            <SignIn/>
                        ) : (
                            <>
                                <div className="flex items-center space-x-2">
                                    <Avatar className="w-8 h-8">
                                        <AvatarImage src={session.user?.image || undefined}/>
                                        <AvatarFallback>?</AvatarFallback>
                                    </Avatar>
                                    <span
                                        className="font-bold">{session.user?.name ?? "User"}</span>
                                </div>
                                <SignOut/>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
