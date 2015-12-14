# Balderdash
## My final project for the class 67-328
This multiplayer game was written in Node.js using Socket.IO with a Mongo database.
You can find a version of this available at http://balderdash-llodewyk.rhcloud.com:8000/balderdash

### The Game
Balderdash is a fun game played with four players. In the game, the players are presented with an obscure word. They each create a definition for the word. When everyone has submitted a guess, the players vote on their favorite description. Players get points based on how many people vote for their definition.  When a player reaches 25 points, they win!

### To Install
1. Make sure you have Node.js and Mongo installed
2. Clone this repo: git clone https://github.com/llodewyk/balderdash
3. Move into your cloned repo: cd balderdash
4. Install the dependencies: npm install
5. Run Mongo: mongod
6. Start the server: node server.js
7. Navigate to http://localhost:50000/balderdash