// import "./home.css";

function Home() {
    return (
        <div className="min-h-screen bg-zinc-950 text-slate-100">
            <title>CO2 sensor</title>
            <main className="px-6 md:px-16 py-10">
                <section className="grid md:grid-cols-2 gap-10 items-center">
                    <div className="demo-text-button">
                        <h1 className="text-3xl md:text-5xl font-bold mb-4">Monitor your CO2 level in real time</h1>
                        <p className="text-slate-300 mb-6">Dashboard designed for ESP32 with a CO2 sensor attached. See your air quality, both past and present, and get alerts for when you need to ventilate your room.</p>
                        <div className="flex flex-wrap gap-3">
                            <a href="/register"><button type="button" className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium">Register</button></a>
                        </div>
                    </div>
                    <div className="bg-zinc-700 border border-zinc-800 rounded-2xl p-6">
                        <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">Example dashboard</p>
                        <div className="h-40 rounded-xl bg-gradient-to-tr from-slate-900 via-indigo-900 to-slate-800 flex items-center justify-center text-slate-200 text-sm">CO2 placeholder</div>
                        <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
                            <div className="rounded-xl bg-slate-900 border border-slate-800 p-3">
                                <p className="text-slate-400">Current CO2 level</p>
                                <p className="text-lg font-semibold">893 ppm</p>
                            </div>
                            <div className="rounded-xl bg-slate-900 border border-slate-800 p-3">
                                <p className="text-slate-400">Temperature</p>
                                <p className="text-lg font-semibold">22.3 °C</p>
                            </div>
                            <div className="rounded-xl bg-slate-900 border border-slate-800 p-3">
                                <p className="text-slate-400">Humidity</p>
                                <p className="text-lg font-semibold">57%</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}

export default Home;
