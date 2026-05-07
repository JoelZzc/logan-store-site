import './bootstrap';
import React from 'react';
import ReactDOM from 'react-dom/client';

function App() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="p-8 bg-white shadow-xl rounded-2xl">
                <h1 className="text-3xl font-bold text-blue-600">
                    ¡Logan Store con React!
                </h1>
                <p className="mt-4 text-gray-500">
                    Si ves este texto con diseño y fondo gris, React y Tailwind v4 están funcionando.
                </p>
                <button className="px-4 py-2 mt-6 text-white bg-blue-500 rounded-lg hover:bg-blue-700">
                    Botón de prueba
                </button>
            </div>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('app'));
root.render(<App />);