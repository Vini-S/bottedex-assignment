import { useState, useEffect } from 'react'

import './App.css'
import axios from 'axios'
function App() {
  const [pokemons, setPokemons] = useState([]);
  const [page, setPage] = useState(1);
  const limit = 10;

  const fetchPokemons = async () => {
    try {
      const response = await fetch(`http://localhost:3000/pokemons?page=${page}&limit=${limit}`);
      const data = await response.json();
      setPokemons(data.results);
    } catch (error) {
      console.error('Error fetching pokemons:', error);
    }
  };

  useEffect(() => {
    fetchPokemons();
  }, [page]);
  return (
    <>
      <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
        <h1>Pokémon List (Page {page})</h1>
        <ul>
          {pokemons.map((pokemon, index) => (
            <li key={index}>{pokemon.name}</li>
          ))}
        </ul>
        <div style={{ marginTop: '20px' }}>
          <button onClick={() => setPage(page => Math.max(1, page - 1))} disabled={page === 1}>
            Previous
          </button>
          <button onClick={() => setPage(page => page + 1)} style={{ marginLeft: '10px' }}>
            Next
          </button>
        </div>
        </div>
    </>
  )
}

export default App
