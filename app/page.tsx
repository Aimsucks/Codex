import SignIn from "@/components/auth/SignIn";
import {auth} from "@/auth";
import SignOut from "@/components/auth/SignOut";

export default async function Home() {
    const session = await auth();

    if (!session)
        return (
            <main className="flex min-h-screen flex-col items-center justify-between p-24">
                <SignIn/>
            </main>
        );

    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
            Hello, {session.user?.name}
            <br/>
            <SignOut/>
        </main>
    );
}
