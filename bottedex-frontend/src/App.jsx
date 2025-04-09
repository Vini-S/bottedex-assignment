import { useState, useEffect, useRef, useCallback } from 'react'

import './App.css'

function App() {
  const [pokemons, setPokemons] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef(null);
  const [selectedPokemon, setSelectedPokemon] = useState(null);

  const limit = 10;

  const fetchPokemons = async (pageNum) => {
    try {
      const res = await fetch(`http://localhost:3000/pokemons?page=${pageNum}&limit=${limit}`);
      const data = await res.json();

      const basicList = data.results;

      // Fetch full details in parallel
      const detailedData = await Promise.all(
        basicList.map(pokemon =>
          fetch(pokemon.url).then(res => res.json())
        )
      );

      setPokemons(prev => [...prev, ...detailedData]);

      if (basicList.length === 0) setHasMore(false);
    } catch (err) {
      console.error("Error:", err);
    }
  };

  useEffect(() => {
    fetchPokemons(page);
  }, [page]);

  const observer = useRef();
  const lastElementRef = useCallback(node => {
    if (!hasMore) return;

    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        setPage(prev => prev + 1);
      }
    });

    if (node) observer.current.observe(node);
  }, [hasMore]);

  return (
    <>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', width: '80%', margin: 'auto'}}>
        <h1>Bottedex's Pokémons</h1>

          {pokemons.map((pokemon, index) => (
            <div className='pokemon-row' key={index} onClick={() => setSelectedPokemon(pokemon)}>
              <img src={pokemon.sprites.other.dream_world.front_default} alt=""/>
              {pokemon.name}
            </div>
          ))}


        {/* This div is the temporary element that triggers loading the next page */}
        {hasMore && <div ref={lastElementRef} className='loading-div' >Loading more...</div>}
      </div>

      { selectedPokemon && (
        <div className='popup-div' onClick={() => setSelectedPokemon(null)}>
          <div className='popup-content-div' onClick={e => e.stopPropagation()}>
            <h2>{selectedPokemon.name}</h2>
            <img
              src={selectedPokemon.sprites.other['official-artwork'].front_default}
              alt={selectedPokemon.name}
              style={{ width: '150px', height: '150px' }}
            />
            <p>Height: {selectedPokemon.height}</p>
            <p>Weight: {selectedPokemon.weight}</p>
            <p>Types: {selectedPokemon.types.map(t => t.type.name).join(', ')}</p>
            <button onClick={() => setSelectedPokemon(null)} style={{ marginTop: '10px' }}>
              Close
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default App
