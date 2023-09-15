window.addEventListener('load', () => {

    // Selection and deselection of cells
    const selectableCells = document.querySelectorAll("td.sel")
    
    selectableCells.forEach(cell => {
        cell.addEventListener('click', (e) => {
            if (cell.classList.contains('selected')) {
                cell.classList.remove('selected')
                cell.style.backgroundColor = "#ffffff"
            } else {
                cell.classList.add('selected')
                cell.style.backgroundColor = "#00ff00"
            }

        })
    })


    // Hiding columns
    document.getElementById('bb8').addEventListener('click', (e) => {
        document.querySelectorAll("td:nth-child(5), th:nth-child(5)").forEach((item) => {
            item.style.display = 'none'
        })
    })
})