import express from 'express'
import cors from 'cors'
import { pool } from './db.js'
import { PORT } from './config.js'
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const app = express()

app.use(cors({
    origin: 'http://localhost:8080',
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Content-Type,Authorization'
}));
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const imgDir = path.join(__dirname, 'public/img');
if (!fs.existsSync(imgDir)) {
    fs.mkdirSync(imgDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: imgDir,
    filename: function (req, file, cb) {
        let extension = file.originalname.slice(file.originalname.lastIndexOf('.'))
        cb(null, Date.now() + extension)
    }
})
const upload = multer({ storage: storage });


app.get('/ping', async (req, res) => {
    const [result] = await pool.query(`SELECT "hello world" as RESULT`)
    res.json(result[0])
})


app.get('/products', async (req, res) => {
    const [rows] = await pool.query('SELECT * FROM products')
    res.json(rows)
})

app.post('/products', upload.single('image'), async (req, res) => {
    const { name, category, stock, price, description } = req.body;
    const imagePath = req.file ? `/img/${req.file.filename}` : null;

    try {
        const [result] = await pool.query('INSERT INTO products (name, category, stock, price, description, image) VALUES (?, ?, ?, ?, ?, ?)', [name, category, stock, price, description, imagePath]);
        res.json({ id: result.insertId, name, category, stock, price, description, image: imagePath });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Error al crear el producto' });
    }
})

app.get('/products/:id', async (req, res) => {
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id])
    if (rows.length > 0) {
        res.json(rows[0])
    } else {
        res.status(404).json({ message: 'Producto no encontrado' })
    }
})

app.put('/products/:id', async (req, res) => {
    const { id } = req.params
    const { name, category, stock, price, description, image } = req.body
    const [result] = await pool.query('UPDATE products SET name = ?, category = ?, stock = ?, price = ?, description = ?, image = ? WHERE id = ?', [name, category, stock, price, description, image, id])
    if (result.affectedRows > 0) {
        res.json({ id, name, category, stock, price, description, image })
    } else {
        res.status(404).json({ message: 'Error al Editar el Producto' })
    }
})

app.delete('/products/:id', async (req, res) => {
    const [result] = await pool.query('DELETE FROM products WHERE id = ?', [req.params.id])
    if (result.affectedRows > 0) {
        res.json({ message: 'Producto eliminado' })
    } else {
        res.status(404).json({ message: 'Error al Eliminar el Producto' })
    }
});

app.listen(PORT)
console.log('server on port', PORT)
