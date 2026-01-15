export default function Home() {
  return (
    <div className="w-full h-full w-full background-home --font-jbm">
      {/* center box */}
      <div className="rounded-lg w-[500px] h-[500px] bg-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 background-mirror flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold">UwUChat</h1>
        <br />
        <br />
        <p></p>
        <br />
        <p className="text-xl text-center">Hi!! Welcome to an IRC-Like, realtime chat app</p>
        <br />
        <div className="flex flex-col items-center justify-center pt-10">
          <p className="text-xl text-center">Select a room: </p>
          <br />
          <input type="text" placeholder="Room name" />
          <br />
          <p className="text-xl text-center">and your username: </p>
          <br />
          <input type="text" placeholder="Username" />
          <br />
          <button className="bg-black-500 hover:bg-black text-white font-bold pt-4 py-2 px-4 rounded">
            Join
          </button>
        </div>

      </div>
    </div>
  )
}
