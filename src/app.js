import express from 'express'
import cors from 'cors'
import { pool } from './db.js'
import { PORT } from './config.js'

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/ping', async (req, res) => {
    const [result] = await pool.query(`SELECT "hello world" as RESULT`)
    res.json(result[0])
})


app.get('/products', async (req, res) => {
    const [rows] = await pool.query('SELECT * FROM products')
    res.json(rows)
})

app.get('/products/:id', async (req, res) => {
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id])
    if (rows.length > 0) {
        res.json(rows[0])
    } else {
        res.status(404).json({ message: 'Producto no encontrado' })
    }
})

app.post('/products', async (req, res) => {
    const { name, category, stock, price, description, image } = req.body
    const [result] = await pool.query('INSERT INTO products (name, category, stock, price, description, image) VALUES (?, ?, ?, ?, ?, ?)', [name, category, stock, price, description, image])
    res.json({ id: result.insertId, name, category, stock, price, description, image })
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
