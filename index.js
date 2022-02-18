const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000

//Make connection to database
const { Pool } = require('pg');
var pool;
pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:{
    rejectUnauthorized:false
  }
})

var app = express();
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => res.render('pages/index'));
app.get('/database', async (req,res) => {
  //invoke a query that selects all row from the users table
  try {
    const result = await pool.query('SELECT * FROM rect');
    const data = { results : result.rows };
    res.render('pages/db', data);
  }
  catch (error) {
    res.end(error);
  }
})

//Update details of an existing rectangle

//Add a new rectangle
app.post('/addrectangle', async(req,res) => {
  //define variables that allow for changing
  var name = req.body.name;
  var color = req.body.color;
  var width = req.body.width;
  var height = req.body.height;
  var personality = req.body.personality;
  var continent = req.body.continent;
  try {
    //Add
    await pool.query("insert into rect (name, width, height, color, personality, continent) " +
    "values ('"+name+"', "+width+", "+height+", '"+color+"', '"+personality+"', '"+continent+"');" );
    //Redirect to the full list of rectangle
    const result = await pool.query('SELECT * FROM rect');
    const data = { results : result.rows };
    res.render('pages/db', data);
  }
  catch (error) {
    res.end(error);
  }
})

//Diplay details of the selected rectangle
app.get('/rect/:id', async(req,res) => {
  var id = req.params.id;
  //search the database using id
  const result = await pool.query("SELECT * FROM rect WHERE id='" + id + "';");
  const data = { results : result.rows };
  res.render('pages/detail', data);
})

// Delete rectangles by ID
app.post('/rect/:id', async(req,res) => {
  var id = req.params.id; 
  //search the database using id
  await pool.query("DELETE FROM rect WHERE id='" + id + "';");
  //display current database
  const result = await pool.query("SELECT * FROM rect");
  const data = { results : result.rows };
  res.render('pages/db', data);
})

//Edit details of existing rectangl
app.post('/editrect/:id', async(req,res) => {
  var id = req.params.id;
  //define variables that allow for changing
  var name = req.body.name;
  var color = req.body.color;
  var width = req.body.width;
  var height = req.body.height;
  var personality = req.body.personality;
  var continent = req.body.continent;
  //search the database using id
  await pool.query("UPDATE rect SET name = '" + name + 
  "', color ='" + color + "', width = " + width + ", height = " + height + 
  ", personality = '" + personality + "', continent = '" + continent + 
  "' WHERE id='" + id + "';");
  //display current database
  const result = await pool.query("SELECT * FROM rect WHERE id='" + id + "';");
  const data = { results : result.rows };
  res.render('pages/detail', data);
})

app.listen(PORT, () => console.log(`Listening on ${ PORT }`));
