var totalValor =0 
var juroTotal =0 
var liquidoTotal =0 

const formatardata = (data) =>{
    data = new Date(data)
    return `${(data.getDay()+1).toString().padStart(2, '0')}/${(data.getMonth()+1).toString().padStart(2, '0')}/${data.getFullYear()}`
}

const formatardatainverso = (data) =>{
    data = new Date(data)
    return `${data.getFullYear()}/${(data.getMonth()+1).toString().padStart(2, '0')}/${(data.getDay()+1).toString().padStart(2, '0')}`
}
const abrirformulario = () => {
    document.getElementById('tabela').classList.add('d-none')
    document.getElementById('formulario').classList.remove('d-none')
}

const formatarValor =(valor) =>{
    var valor = valor
    valor =parseFloat(valor).toLocaleString('pt-br',{style: 'currency', currency: 'BRL'});
    return String(valor)
}

const fecharFormulario = () => {
    atualizarTabela()
    document.getElementById('tabela').classList.remove('d-none')
    document.getElementById('formulario').classList.add('d-none')
    limparFormulario()
}

const limparFormulario = () => {
    // const fields = document.querySelectorAll('.valor')
    // fields.forEach(field => field.value = "0")
    document.getElementById('valor').value=0
    document.getElementById('data').dataset.index = 'new'
}

const deletarDados = () => {
    const response = confirm(`Deseja realmente excluir toda a tabela?`)
        if (response) {
            localStorage.setItem('db_documento', JSON.stringify([]))
            atualizarTabela()
        }
    
}
const lerDocumento = () => getArmazenamentoLocal()
const getArmazenamentoLocal = () => JSON.parse(localStorage.getItem('db_documento')) ?? []
const setArmazenamentoLocal = (dbdocumento) => {
    localStorage.setItem("db_documento", JSON.stringify(dbdocumento))
}
const criar = (documento) => {
    const dbdocumento = lerDocumento()
    dbdocumento.push (documento)
    setArmazenamentoLocal(dbdocumento)
}

const limpaTabela = () => {
    totalValor =0 
    juroTotal =0 
    liquidoTotal =0 
    const rows = document.querySelectorAll('#tabela>tbody tr')
    const rows2 = document.querySelectorAll('#tabela>tfoot tr')
    rows.forEach(row => row.parentNode.removeChild(row))
    rows2.forEach(row => row.parentNode.removeChild(row))
}
const atualizarTabela = () => {
    const dbdocumento = lerDocumento()
    limpaTabela()
    dbdocumento.forEach(criarLinha)
    const newRow = document.createElement('tr')
    newRow.innerHTML = `
    <th  colspan="3">Total</th>
    <th>${formatarValor(totalValor)}</th>
    <th>${formatarValor(juroTotal)}</th>
    <th>${formatarValor(liquidoTotal)}</th>
    <th colspan="2"></th>
       
    `
    document.querySelector('#tabela>tfoot').appendChild(newRow)
}
const calculaLiquido =(valor,juro) =>{
    var valor = valor
    valor =parseFloat(valor)
    var juro =parseFloat(juro)
    return valor-juro
}
const calculaJuro =(valor,juro,dias) =>{
    var valor = valor.replace(".","")
    valor =parseFloat(valor)
    var juro =parseFloat(juro)
    return valor*juro/30*dias/100
}
const contarIntervaloDatas = (futuro, atual) =>{
    const dataFuturo = new Date(String(futuro))
    const dataAtual = new Date(String(atual))
    const diferenca = Math.abs(dataAtual.getTime() - dataFuturo.getTime()); // Subtrai uma data pela outra
    const dias = Math.ceil(diferenca / (1000 * 60 * 60 * 24)); // Divide o total pelo total de milisegundos correspondentes a 1 dia. (1000 milisegundos = 1 segundo).

    return dias+1
}
const criarLinha = (documento, index) => {
    const newRow = document.createElement('tr')
    var dias = contarIntervaloDatas(documento.vencimento,documento.data)
    var juros =calculaJuro(documento.valor,documento.taxa,dias)
    var liquido = calculaLiquido(documento.valor,juros)
    totalValor +=parseFloat(documento.valor) 
    juroTotal +=parseFloat(juros) 
    liquidoTotal +=parseFloat(liquido) 
    // console.log(totalValor);
    newRow.innerHTML = `
    <td>${formatardata(documento.data)}</td>
    <td>${formatardata(documento.vencimento)}</td>
    <td>${dias}</td>
    <td>${formatarValor(documento.valor)}</td>
    <td>${formatarValor(juros)}</td>
    <td>${formatarValor(liquido)}</td>
        <td>
            <button type="button" class="btn btn-primary"  id="edit-${index}" >
                <i class="fa fa-fw fa-1x py-1 fa-pencil-square-o" ></i> 
                Editar
            </button>
        </td>
        <td>  
            <button type="button"  class="btn btn-primary"  id="delete-${index}" >
                <i class="fa fa-fw fa-1x py-1 fa-trash" ></i>
                Excluir
            </button>
        </td>
       
    `
    document.querySelector('#tabela>tbody').appendChild(newRow)
}
const isValidFields = () => {
    return document.getElementById('form').reportValidity()
}

const atualizar = (index, documento) => {
    const dbdocumento = lerDocumento()
    dbdocumento[index] = documento
    setArmazenamentoLocal(dbdocumento)
}
const salvarFormulario = () =>{
    // debugger
    if (isValidFields()) {
        const documento = {
            data: document.getElementById('data').value,
            vencimento: document.getElementById('vencimento').value,
            valor: document.getElementById('valor').value,
            taxa: document.getElementById('taxa').value,
        }
        const index = document.getElementById('data').dataset.index
        if (index == 'new') {
            criar(documento)
            atualizarTabela()
            fecharFormulario()
        } else {
            atualizar(index, documento)
            atualizarTabela()
            fecharFormulario()
        }
    }
}

const setDadosFormulario = (documento) => {
    document.getElementById('data').value = documento.data
    document.getElementById('vencimento').value = documento.vencimento
    document.getElementById('valor').value = documento.valor
    document.getElementById('taxa').value = documento.taxa
    document.getElementById('data').dataset.index = documento.index
}
const editarDocumento = (index) => {
    const documento = lerDocumento()[index]
    console.log(index);
    documento.index = index
    setDadosFormulario(documento)
    abrirformulario()

}
const deletarDocumento = (index) => {
    const dbdocumento = lerDocumento()
    dbdocumento.splice(index, 1)
    setArmazenamentoLocal(dbdocumento)
    
}
const editarDeletar = (event) => {
    if (event.target.type == 'button') {

        const [action, index] = event.target.id.split('-')

        if (action == 'edit') {
            editarDocumento(index)
        } else if (action == 'delete') {
            const funcionario = lerDocumento()[index]
            const response = confirm(`Deseja realmente excluir o documento`)
            if (response) {
                deletarDocumento(index)
                atualizarTabela()
            }
        } 
    }
}
document.getElementById('adicionar')
.addEventListener('click', abrirformulario)


document.getElementById('cancelar')
.addEventListener('click', fecharFormulario)

document.getElementById('salvar')
.addEventListener('click', salvarFormulario)

document.querySelector('#tabela>tbody').addEventListener('click', editarDeletar)


document.getElementById('zerar')
.addEventListener('click', deletarDados)
atualizarTabela() 


document.getElementById('datahoje').innerHTML = formatardata(new Date());
