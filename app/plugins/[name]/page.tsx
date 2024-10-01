import PluginInfo from "@/app/plugins/[name]/PluginInfo";
import {PluginProvider} from "@/app/plugins/[name]/PluginContext";
import PresetBrowser from "@/app/plugins/[name]/PresetBrowser";
import Image from "next/image";

export default async function PluginPage({params}: { params: { name: string } }) {
    const response = await fetch(`${process.env.AUTH_URL}/api/v1/plugins/${params.name}`, {});

    if (!response.ok) {
        return (
            <div className="h-50 flex justify-center bg-punish-900 p-5 rounded-2xl">

                {/* Unknown plugin icon */}
                <Image src="/unknown.svg" alt="Unknown Plugin Icon" width={250} height={250}
                       className="flex-none w-40"/>

                {/* Top plugin name */}
                <span className="grow px-5 font-bold text-4xl">Failed to load plugin!</span>
            </div>
        )
    }

    const plugin = await response.json()

    if (!plugin) {
        return (
            <div className="h-50 flex justify-center bg-punish-900 p-5 rounded-2xl">

                {/* Unknown plugin icon */}
                <Image src="/unknown.svg" alt="Unknown Plugin Icon" width={250} height={250}
                       className="flex-none w-40"/>

                {/* Top plugin name */}
                <span className="grow px-5 font-bold text-4xl">No plugin found!</span>
            </div>
        )
    }

    if (plugin) return (
        <PluginProvider plugin={plugin}>
            <PluginInfo/>
            <PresetBrowser/>
        </PluginProvider>
    )
}
