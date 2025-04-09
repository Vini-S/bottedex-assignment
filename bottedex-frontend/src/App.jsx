import { useState, useEffect, useRef, useCallback } from 'react'

import './App.css'

function App() {
  const [pokemons, setPokemons] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef(null);
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
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center'}}>
        <h1>Bottedex's Pokémons</h1>
        <div>
          {pokemons.map((pokemon, index) => (

            <div className='pokemon-row' key={index}>
              <img src={pokemon.sprites.other.dream_world.front_default} alt=""/>
              {pokemon.name}
            </div>
          ))}
        </div>

        {/* This div is the sentinel element that triggers loading the next page */}
        {hasMore && <div ref={lastElementRef} className='loading-div' >Loading more...</div>}
        {!hasMore && <p style={{ marginTop: '20px' }}>No more Pokémon to load</p>}
      </div>
    </>
  )
}

export default App
