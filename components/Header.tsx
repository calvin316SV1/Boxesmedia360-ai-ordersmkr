import React from 'react';

interface HeaderProps {
  onAddNewOrder: () => void;
  onExport: () => void;
}

const Header: React.FC<HeaderProps> = ({ onAddNewOrder, onExport }) => {
  return (
    <header className="bg-[#1a1a2e] text-white py-4 px-6 flex items-center justify-between">
      <h1 className="text-2xl font-semibold">
        <span className="text-fuchsia-400">B</span>OXES<span className="text-fuchsia-400">M</span>EDIA<span className="text-fuchsia-400">360</span>
      </h1>
      <div className="flex items-center space-x-4">
        <button
          className="bg-transparent hover:bg-fuchsia-500 text-white py-2 px-4 border border-fuchsia-500 hover:border-transparent rounded"
          onClick={onExport}
        >
          Exportar
        </button>
        <button
          className="bg-fuchsia-500 hover:bg-fuchsia-700 text-white font-bold py-2 px-4 rounded"
          onClick={onAddNewOrder}
        >
          Nuevo Pedido
        </button>
      </div>
    </header>
  );
};

export default Header;