import { getMyMeetings } from "../actions"
import { MyMeetingsClient } from "./MyMeetingsClient"

export default async function MyMeetingsPage() {
    const meetings = await getMyMeetings()

    return <MyMeetingsClient meetings={meetings} />
}
