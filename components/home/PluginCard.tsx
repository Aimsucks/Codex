import {Card, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import type {Plugin} from "@prisma/client"
import {Clock} from "lucide-react"
import {useFormatter} from "next-intl";

type PluginCardProps = {
    plugin: Plugin,
    latestUpdate: Date,
}

export default function PluginCard({plugin, latestUpdate}: PluginCardProps) {
    const format = useFormatter()

    return (
        <Card className="w-1/4 rounded-2xl bg-punish-900 border-punish-700 hover:bg-punish-800 transition duration-100">
            <a href={"/" + encodeURIComponent(plugin.name)}>
                <CardHeader>
                    <CardTitle>
                        {plugin.name}
                    </CardTitle>
                    <CardDescription>
                        {plugin.description || ""}
                    </CardDescription>
                </CardHeader>
                {latestUpdate ?
                    <CardFooter>
                        <Clock className="mr-2 h-4 w-4"/>
                        Updated {format.relativeTime(latestUpdate)}
                    </CardFooter>
                    : ""}
            </a>
        </Card>
    )
}