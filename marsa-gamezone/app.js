const { useState } = React;

const characterImages = {
  "Grain Lord": {
    1: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
    2: "https://images.unsplash.com/photo-1506794778202-c1f8d3f9e1b6?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
    3: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80"
  },
  "Seller Star": {
    1: "https://images.unsplash.com/photo-1573496359142-b8d877993ecb?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
    2: "https://images.unsplash.com/photo-1573497019236-17f8177b81e8?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
    3: "https://images.unsplash.com/photo-1573496130407-3b5b7f4e8e4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80"
  }
};

const App = () => {
  const [characters, setCharacters] = useState([
    { id: 1, name: "Grain Lord", level: 1, price: 100, owned: false },
    { id: 2, name: "Seller Star", level: 1, price: 150, owned: false }
  ]);
  const [money, setMoney] = useState(500);
  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState("catalogue");

  const buyCharacter = (id) => {
    setCharacters(characters.map(char => {
      if (char.id === id && !char.owned && money >= char.price) {
        setMoney(money - char.price);
        return { ...char, owned: true };
      }
      return char;
    }));
  };

  const levelUpCharacter = (id) => {
    setCharacters(characters.map(char => {
      if (char.id === id && char.owned && char.level < 3) {
        return { ...char, level: char.level + 1 };
      }
      return char;
    }));
  };

  const filteredCharacters = characters.filter(char =>
    char.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container">
      <h1>Marsa GameZone</h1>
      <p>Money: ${money}</p>
      <div>
        <button onClick={() => setView("catalogue")}>Catalogue</button>
        <button onClick={() => setView("office")}>Owner's Office</button>
      </div>

      {view === "catalogue" && (
        <div>
          <h2>Catalogue</h2>
          <input
            type="text"
            placeholder="Search characters..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="catalogue-grid">
            {filteredCharacters.map(char => (
              <div key={char.id} className="character-card">
                <img
                  src={characterImages[char.name][char.level]}
                  alt={char.name}
                  style={{ width: "100px", height: "100px", borderRadius: "10px" }}
                />
                <h3>{char.name} (Level {char.level})</h3>
                <p>Price: ${char.price}</p>
                {char.owned ? (
                  <button onClick={() => levelUpCharacter(char.id)} disabled={char.level >= 3}>
                    Level Up (to Level {char.level + 1})
                  </button>
                ) : (
                  <button onClick={() => buyCharacter(char.id)} disabled={money < char.price}>
                    Buy
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {view === "office" && (
        <div className="owner-office">
          <h2>Owner's Office</h2>
          <h3>Owned Characters</h3>
          {characters.filter(char => char.owned).length > 0 ? (
            characters.filter(char => char.owned).map(char => (
              <div key={char.id}>
                <img
                  src={characterImages[char.name][char.level]}
                  alt={char.name}
                  style={{ width: "50px", height: "50px", borderRadius: "10px" }}
                />
                <p>{char.name} (Level {char.level})</p>
              </div>
            ))
          ) : (
            <p>No characters owned yet.</p>
          )}
        </div>
      )}
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);