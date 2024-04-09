const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

const app = express()

app.use(express.json())

const databasePath = path.join(__dirname, 'moviesData.db')

let database = null

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () =>
      console.log('Server Running at http://localhost:3000/'),
    )
  } catch (error) {
    console.log(`DB Error: ${error.message}`)
    process.exit(1)
  }
}

initializeDbAndServer()

const converMovieDbObjectToResponseObject = dbObject => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  }
}
const converDirectorDbObjectToResponseObject = dbObject => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  }
}
//api 1

app.get('/movies/', async (request, response) => {
  const getMoviesQuery = `
  SELECT movie_name
  FROM  movie;`
  const moviesArray = await database.all(getMoviesQuery)
  response.send(
    moviesArray.map(eachMovie => ({
      movieName: eachMovie.movie_name,
    })),
  )
})

//api3

app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getMovieQuery = `
  SELECT *
  FROM  movie;
  WHERE movie_id = ${movieId}`
  const movie = await database.get(getMovieQuery)
  response.send(converMovieDbObjectToResponseObject(movie))
})

//api2

app.post('/movies/', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body
  const postQuery = `
    INSERT INTO 
      movie ( director_id, movie_name, lead_actor)
    VALUES (
      ${directorId}, ${movieName},${leadActor}
    );`
  await database.rurn(postQuery)
  response.send('Movie Successfully Added')
})
// api4

app.put('/movies/:movieId/', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body
  const {movieId} = request.params
  const updateMovieQuery = `
    UPDATE movie
    SET
      director_id = ${directorId},
      movie_name = ${movieName},
      lead_actor = ${leadActor}
    WHERE 
      movie_id = ${movieId};`
  await database.run(updateMovieQuery)
  response.send('Movie Details Updated')
})

//api5

app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const deleteMovieQuery = `
    DELETE FROM
      movie
    WHERE 
      movie_id = ${movieId};`
  await database.run(deleteMovieQuery)
  response.send('Movie Removed')
})

//api6

app.get('/directors/', async (request, response) => {
  const getDirectorQuery = `
  SELECT *
  FROM  director;`
  const directorArray = await database.all(getDirectorQuery)
  response.send(
    directorArray.map(eachDirector =>
      converDirectorDbObjectToResponseObject(eachDirector),
    ),
  )
})

//api7
app.get('/directors/:directorId/movies/', async (request, response) => {
  const getDirectorMovieQuery = `
  SELECT movie_name
  FROM  director
  WHERE
    director_id = ${directorId};`
  const moviesArray = await database.all(getDirectorMovieQuery)
  response.send(
    moviesArray.map(eachMovie => ({movieName: eachMovie.movieName})),
  )
})

module.exports = app
