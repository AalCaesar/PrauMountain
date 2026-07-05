import { supabase } from "./lib/supabaseClient";

export default async function Home() {
  // Mencoba mengambil data dari tabel 'basecamps'
  const { data, error } = await supabase.from('basecamps').select('*');

  return (
    <main className="p-10">
      <h1 className="text-2xl font-bold">Status Koneksi Database</h1>
      {error ? (
        <p className="text-red-500">Error: {error.message}</p>
      ) : (
        <pre className="bg-gray-100 p-4 mt-4">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </main>
  );
}