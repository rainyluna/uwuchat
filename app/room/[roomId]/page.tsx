export default async function RoomPage({ params }: { params: { roomId: string } }) {
    const { roomId } = await params;
    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-4xl font-bold">Room: {roomId}</h1>
        </div>
    );
}
