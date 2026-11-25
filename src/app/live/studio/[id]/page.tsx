import { LiveStudio } from "../LiveStudio";

export default async function StudioSessionPage({ params }: { params: Promise<{ id: string }> }) {
  return <LiveStudio sessionId={(await params).id} />;
}
