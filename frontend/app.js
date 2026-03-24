const apiUrl = 'http://localhost:5000/articles';
const form = document.getElementById('articleForm');
const tableBody = document.querySelector('#articlesTable tbody');

const idInput = document.getElementById('articleId');
const nameInput = document.getElementById('name');
const priceInput = document.getElementById('price');
const descriptionInput = document.getElementById('description');
const stockInput = document.getElementById('stock');
const submitBtn = document.getElementById('submitBtn');
const cancelBtn = document.getElementById('cancelBtn');

document.addEventListener('DOMContentLoaded', fetchArticles);

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const articleData = {
        name: nameInput.value,
        price: parseFloat(priceInput.value),
        description: descriptionInput.value,
        stock: parseInt(stockInput.value)
    };

    const id = idInput.value;

    if (id) {
        await fetch(`${apiUrl}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(articleData)
        });
    } else {
        await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(articleData)
        });
    }

    resetForm();
    fetchArticles();
});

async function fetchArticles() {
    const response = await fetch(apiUrl);
    const articles = await response.json();
    
    tableBody.innerHTML = '';
    
    articles.forEach(article => {
        const tr = document.createElement('tr');
        
        tr.innerHTML = `
            <td>${article.name}</td>
            <td>$${article.price.toFixed(2)}</td>
            <td>${article.description}</td>
            <td>${article.stock}</td>
            <td>
                <button class="btn-edit" onclick="editArticle('${article.id}', '${article.name}', ${article.price}, '${article.description}', ${article.stock})">Editar</button>
                <button class="btn-delete" onclick="deleteArticle('${article.id}')">Eliminar</button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

window.editArticle = function(id, name, price, description, stock) {
    idInput.value = id;
    nameInput.value = name;
    priceInput.value = price;
    descriptionInput.value = description;
    stockInput.value = stock;
    
    submitBtn.textContent = 'Actualizar Artículo';
    cancelBtn.style.display = 'inline-block';
};

window.deleteArticle = async function(id) {
    if (confirm('¿Estás seguro de que deseas eliminar este artículo?')) {
        await fetch(`${apiUrl}/${id}`, { method: 'DELETE' });
        fetchArticles();
    }
};

cancelBtn.addEventListener('click', resetForm);

function resetForm() {
    form.reset();
    idInput.value = '';
    submitBtn.textContent = 'Guardar Artículo';
    cancelBtn.style.display = 'none';
}
