"use client"

import Image from "next/image";
import {BookText, Clock, Sparkles} from "lucide-react";
import {useFormatter} from "next-intl";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faDiscord, faGithub} from '@fortawesome/free-brands-svg-icons'
import Link from "next/link";
import {Button} from "@/components/ui/button";
import {usePluginContext} from "@/app/plugins/[slug]/PluginContext";

export default function PluginInfo() {
    const {plugin} = usePluginContext()

    const format = useFormatter()

    // If there is an error in accessing the context, display an error message
    if (!plugin) return (
        <div className="h-50 flex justify-center bg-punish-900 p-5 rounded-2xl">

            {/* Unknown plugin icon */}
            <Image src="/unknown.svg" alt="Unknown Plugin Icon" width={250} height={250} className="flex-none w-40"/>

            {/* Top plugin name */}
            <span className="grow px-5 font-bold text-4xl">No plugin found!</span>
        </div>
    )

    const latestUpdatedDate = plugin.presets.reduce((latest, current) => {
        return new Date(current.updatedAt) > new Date(latest.updatedAt) ? current : latest
    }).updatedAt

    return (
        <div className="h-50 flex justify-center bg-punish-900 p-5 rounded-2xl">

            {/* Left-side plugin image */}
            <Image src={plugin.icon || "/unknown.svg"} alt={plugin.name + " Icon"} width={250} height={250}
                   className="flex-none w-40"/>

            {/* Center plugin name, description, and links */}
            <div className="grow px-5 flex flex-col">

                {/* Top plugin name */}
                <span className="font-bold text-4xl">{plugin.name}</span>

                {/* Middle plugin description */}
                <span className="text-xl pt-3 line-clamp-2">{plugin.description}</span>

                {/* Bottom plugin links */}
                <div className="mt-auto flex gap-5">
                    {plugin.githubLink ?
                        <Link href={plugin.githubLink} target="_blank">
                            <Button variant="secondary" className="rounded-xl gap-2 bg-punish-800 hover:bg-punish-700">
                                <FontAwesomeIcon icon={faGithub} size="xl"/>
                                Project GitHub
                            </Button>
                        </Link> : ""}
                    {plugin.discordLink ?
                        <Link href={plugin.discordLink} target="_blank">
                            <Button variant="secondary" className="rounded-xl gap-2 bg-punish-800 hover:bg-punish-700">
                                <FontAwesomeIcon icon={faDiscord} size="xl"/>
                                Support Discord
                            </Button>
                        </Link> : ""}
                </div>
            </div>

            {/* Right-side plugin stats */}
            <div className="flex flex-col text-xl min-w-[250px]">

                {/* Plugin presets available statistic */}
                <div className="flex-1 flex items-center whitespace-nowrap">
                    <BookText className="mr-2 h-6 w-6"/>
                    <span>{plugin.presets.length} presets available</span>
                </div>

                {/* Plugin last updated relative date statistic */}
                <div className="flex-1 flex items-center whitespace-nowrap">
                    <Clock className="mr-2 h-6 w-6"/>
                    <span>Updated {format.relativeTime(latestUpdatedDate)}</span>
                </div>

                {/* Plugin added to API relative date statistic */}
                <div className="flex-1 flex items-center whitespace-nowrap">
                    <Sparkles className="mr-2 h-6 w-6"/>
                    <span>Added {format.relativeTime(plugin.createdAt)}</span>
                </div>
            </div>
        </div>
    )
}