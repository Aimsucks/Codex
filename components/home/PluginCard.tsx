import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import type {Plugin, Preset} from "@prisma/client"
import {BookText, Clock, Sparkles} from "lucide-react"
import {useFormatter} from "next-intl";
import Image from "next/image";
import Link from "next/link";

type PluginCardProps = {
    plugin: Plugin,
    presets: Preset[],
}

export default function PluginCard({plugin, presets}: PluginCardProps) {
    const format = useFormatter()

    return (
        <Card
            className="rounded-2xl h-64 bg-punish-900 border-punish-700 hover:bg-punish-800 transition duration-200">
            <Link href={"/plugins/" + encodeURIComponent(plugin.name)}
                  className="flex items-center justify-between h-full">
                <div className="w-2/3">
                    <CardHeader>
                        <CardTitle>
                            {plugin.name}
                        </CardTitle>
                        <CardDescription className="line-clamp-3">
                            {plugin.description || ""}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 mt-auto">

                        <div className="flex items-center">
                            <BookText className="mr-2 h-4 w-4"/>
                            <span>{presets.length} presets available</span>
                        </div>

                        {presets[0].updatedAt ?
                            <div className="flex items-center">
                                <Clock className="mr-2 h-4 w-4"/>
                                <span>Updated {format.relativeTime(presets[0].updatedAt)}</span>
                            </div>
                            :
                            <div className="flex items-center">
                                <Sparkles className="mr-2 h-4 w-4"/>
                                <span>Added {format.relativeTime(plugin.createdAt)}</span>
                            </div>}

                    </CardContent>
                </div>
                <Image src={plugin.icon || "/unknown.svg"} alt={plugin.name + " Icon"} width={250} height={250}
                       className="p-5 ml-auto w-1/3"/>
            </Link>
        </Card>
    )
}