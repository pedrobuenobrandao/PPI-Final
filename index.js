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
        <h2>Menu Biblioteca</h2>

        <p>Último acesso: ${ultimo || "Primeiro acesso"}</p>

        <a href="/cadastroLivro">Cadastro de Livros</a><br>
        <a href="/cadastroLeitor">Cadastro de Leitores</a><br>
        <a href="/">Sair</a>
    `)
})


// CADASTRO LIVROS
app.get("/cadastroLivro", validarAcesso, (req,res)=>{
    res.send(`
        <h2>Cadastro de Livro</h2>
        <form method="POST">
            Título: <input name="titulo"><br>
            Autor: <input name="autor"><br>
            ISBN: <input name="isbn"><br>
            <button>Cadastrar</button>
        </form>
        <a href="/menu">Voltar</a>
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
    let html = `<h2>Lista de Livros</h2><table border="1">`;

    for(let i=0; i<lista_Livros.length; i++){
        html += `
            <tr>
                <td>${lista_Livros[i].titulo}</td>
                <td>${lista_Livros[i].autor}</td>
                <td>${lista_Livros[i].isbn}</td>
            </tr>
        `;
    }

    html += `</table>
    <a href="/cadastroLivro">Novo Livro</a><br>
    <a href="/menu">Menu</a>
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
        <h2>Cadastro de Leitor</h2>

        <form method="POST">
            Nome: <input name="nome"><br>
            CPF: <input name="cpf"><br>
            Telefone: <input name="telefone"><br>
            Data Empréstimo: <input name="dataEmp"><br>
            Data Devolução: <input name="dataDev"><br>

            Livro:
            <select name="livro">
                ${options}
            </select>

            <button>Cadastrar</button>
        </form>

        <a href="/menu">Voltar</a>
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
    let html = `<h2>Lista de Leitores</h2><table border="1">`;

    for(let i=0; i<lista_Leitores.length; i++){
        html += `
            <tr>
                <td>${lista_Leitores[i].nome}</td>
                <td>${lista_Leitores[i].cpf}</td>
                <td>${lista_Leitores[i].telefone}</td>
                <td>${lista_Leitores[i].dataEmp}</td>
                <td>${lista_Leitores[i].dataDev}</td>
                <td>${lista_Leitores[i].livro}</td>
            </tr>
        `;
    }

    html += `</table>
    <a href="/cadastroLeitor">Novo Leitor</a><br>
    <a href="/menu">Menu</a>
    `;

    res.send(html);
})

app.listen(port, host, ()=>{
    console.log("Servidor rodando...");
})