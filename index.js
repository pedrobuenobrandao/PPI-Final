import express from "express";
import cookieParser from "cookie-parser";
import session from "express-session";

const app = express();
const host = "0.0.0.0";
const port = 5000;

var lista_Livros = [];
var lista_Leitores = [];

app.use(session({
    secret: "biblioteca123",
    resave: true,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 30
    }
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

function validarAcesso(req, res, next){
    if(req.session?.usuario?.logado){
        next();
    }else{
        res.redirect("/");
    }
}

// LOGIN
app.get("/", (req,res)=>{
    res.send(`
        <h2>Login Biblioteca</h2>
        <form method="POST">
            Email: <input name="email"><br>
            Senha: <input type="password" name="senha"><br>
            <button>Entrar</button>
        </form>
        <p>Email: admin@email.com | Senha: 123</p>
    `)
})

app.post("/", (req,res)=>{
    const {email, senha} = req.body;

    if(email === "admin@email.com" && senha === "123"){
        req.session.usuario = {logado:true};
        res.redirect("/menu");
    }else{
        res.send("Login inválido");
    }
})

// MENU
app.get("/menu", validarAcesso, (req,res)=>{
    let ultimo = req.cookies.ultimoAcesso;
    let agora = new Date();

    res.cookie("ultimoAcesso", agora.toLocaleString());

    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Menu Biblioteca</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet">
    </head>
    <body>

    <nav class="navbar navbar-expand-lg navbar-light bg-light">
        <div class="container-fluid">
            <p class="navbar-brand" style="color: green;">Biblioteca</p>
            <div>
                <a class="nav-link" href="/cadastroLivro">Cadastro de Livros</a>
                <a class="nav-link" href="/cadastroLeitor">Cadastro de Leitores</a>
                <a class="nav-link" style="color:red;" href="/">SAIR</a>
            </div>
        </div>
    </nav>

    <div class="container mt-4">
        <p style="color:green;">Último acesso: ${ultimo || "Primeiro acesso"}</p>
    </div>

    </body>
    </html>
    `)
})


// CADASTRO LIVROS
app.get("/cadastroLivro", validarAcesso, (req,res)=>{
    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Cadastro Livro</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet">
    </head>
    <body>

    <h3 style="text-align:center; color:red; text-decoration:underline;">Cadastro de Livros</h3>

    <div style="display:flex; justify-content:center; align-items:center; height:100vh;">
        <form action="/cadastroLivro" method="POST"
        style="width:300px; padding:20px; border:2px solid #444; border-radius:10px;">

            <label class="form-label">Título:</label>
            <input type="text" name="titulo" class="form-control mb-3">

            <label class="form-label">Autor:</label>
            <input type="text" name="autor" class="form-control mb-3">

            <label class="form-label">ISBN:</label>
            <input type="text" name="isbn" class="form-control mb-3">

            <button class="btn btn-primary w-100">Cadastrar</button>

            <br><br>
            <a href="/menu" class="btn btn-secondary w-100">Voltar</a>

        </form>
    </div>

    </body>
    </html>
    `)
})

app.post("/cadastroLivro", validarAcesso, (req,res)=>{
    const {titulo, autor, isbn} = req.body;

    if(titulo && autor && isbn){
        lista_Livros.push({titulo, autor, isbn});
        res.redirect("/listaLivros");
    }else{
        res.send("Preencha todos os campos!");
    }
})

// LISTA LIVROS
app.get("/listaLivros", validarAcesso, (req,res)=>{
    let html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Lista Livros</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet">
    </head>
    <body>

    <table class="table table-dark table-hover">
        <thead>
            <tr>
                <th>Título</th>
                <th>Autor</th>
                <th>ISBN</th>
            </tr>
        </thead>
        <tbody>
    `;

    for(let i=0;i<lista_Livros.length;i++){
        html += `
        <tr>
            <td>${lista_Livros[i].titulo}</td>
            <td>${lista_Livros[i].autor}</td>
            <td>${lista_Livros[i].isbn}</td>
        </tr>`;
    }

    html += `
        </tbody>
    </table>

    <a href="/cadastroLivro" class="btn btn-secondary w-100">Novo Livro</a>
    <br><br>
    <a href="/menu" class="btn btn-secondary w-100">Menu</a>

    </body>
    </html>
    `;

    res.send(html);
})


// CADASTRO LEITOR
app.get("/cadastroLeitor", validarAcesso, (req,res)=>{

    let options = "";

    for(let i=0; i<lista_Livros.length; i++){
        options += `<option value="${lista_Livros[i].titulo}">${lista_Livros[i].titulo}</option>`;
    }

    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Cadastro Leitor</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet">
    </head>
    <body>

    <h3 style="text-align:center; color:red; text-decoration:underline;">Cadastro de Leitores</h3>

    <div style="display:flex; justify-content:center; align-items:center; height:100vh;">
        
        <form action="/cadastroLeitor" method="POST"
        style="width:600px; padding:20px; border:2px solid #444; border-radius:10px;">

            <div class="row">

                <div class="col">
                    <label>Nome:</label>
                    <input name="nome" class="form-control mb-3">

                    <label>CPF:</label>
                    <input name="cpf" class="form-control mb-3">

                    <label>Telefone:</label>
                    <input name="telefone" class="form-control mb-3">
                </div>

                <div class="col">
                    <label>Data Empréstimo:</label>
                    <input name="dataEmp" class="form-control mb-3">

                    <label>Data Devolução:</label>
                    <input name="dataDev" class="form-control mb-3">

                    <label>Livro:</label>
                    <select name="livro" class="form-control">
                        ${options}
                    </select>
                </div>

            </div>

            <button class="btn btn-primary w-100 mt-3">Cadastrar</button>

            <br><br>
            <a href="/menu" class="btn btn-secondary w-100">Voltar</a>

        </form>

    </div>

    </body>
    </html>
    `)
})

app.post("/cadastroLeitor", validarAcesso, (req,res)=>{
    const {nome, cpf, telefone, dataEmp, dataDev, livro} = req.body;

    if(nome && cpf && telefone && dataEmp && dataDev && livro){
        lista_Leitores.push({nome, cpf, telefone, dataEmp, dataDev, livro});
        res.redirect("/listaLeitores");
    }else{
        res.send("Preencha todos os campos!");
    }
})

// LISTA LEITORES
app.get("/listaLeitores", validarAcesso, (req,res)=>{
    let html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Lista Leitores</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet">
    </head>
    <body>

    <table class="table table-dark table-hover">
        <thead>
            <tr>
                <th>Nome</th>
                <th>CPF</th>
                <th>Telefone</th>
                <th>Empréstimo</th>
                <th>Devolução</th>
                <th>Livro</th>
            </tr>
        </thead>
        <tbody>
    `;

    for(let i=0;i<lista_Leitores.length;i++){
        html += `
        <tr>
            <td>${lista_Leitores[i].nome}</td>
            <td>${lista_Leitores[i].cpf}</td>
            <td>${lista_Leitores[i].telefone}</td>
            <td>${lista_Leitores[i].dataEmp}</td>
            <td>${lista_Leitores[i].dataDev}</td>
            <td>${lista_Leitores[i].livro}</td>
        </tr>`;
    }

    html += `
        </tbody>
    </table>

    <a href="/cadastroLeitor" class="btn btn-secondary w-100">Novo Leitor</a>
    <br><br>
    <a href="/menu" class="btn btn-secondary w-100">Menu</a>

    </body>
    </html>
    `;

    res.send(html);
})

app.listen(port, host, ()=>{
    console.log("Servidor rodando...");
})
