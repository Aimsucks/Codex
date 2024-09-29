import TopBar from "@/components/base/HeaderBar";
import PluginList from "@/components/home/PluginList";

export default async function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
            <TopBar/>
            <PluginList/>
        </main>
    );
}
