import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <title>Bienvenido | Mi Aplicación</title>
        <meta name="description" content="Página de inicio después del login" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden p-8 space-y-6 text-center">
          <h1 className="text-3xl font-bold text-gray-800">¡Bienvenido de vuelta!</h1>
          <p className="text-gray-600">Has iniciado sesión correctamente en nuestra plataforma.</p>
          
          <div className="pt-4">
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition duration-200">
              Continuar al Dashboard
            </button>
          </div>
          
          <div className="text-sm text-gray-500 pt-6 border-t border-gray-100">
            <p>¿No eres tú? <a href="/login" className="text-indigo-600 hover:underline">Cambiar de cuenta</a></p>
          </div>
        </div>
      </div>
    </>
  );
}