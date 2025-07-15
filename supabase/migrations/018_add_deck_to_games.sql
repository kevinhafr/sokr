-- Add deck columns to games table
ALTER TABLE games 
ADD COLUMN deck_a UUID REFERENCES saved_decks(id),
ADD COLUMN deck_b UUID REFERENCES saved_decks(id);

-- Add comment
COMMENT ON COLUMN games.deck_a IS 'Deck used by player A';
COMMENT ON COLUMN games.deck_b IS 'Deck used by player B';