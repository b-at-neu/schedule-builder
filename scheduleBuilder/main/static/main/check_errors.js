export function checkForRowErrors(year, semester) {

    // Check if adding class made it more than 4 per semester
    const row = document.querySelectorAll(`td[data-year="${year}"][data-semester="${semester}"].sel`)

    // Add the total count of selected including hidden
    let count = 0
    document.querySelectorAll(`td[data-year="${year}"][data-semester="${semester}"].sel.selected`).forEach((cell) => {
        if (cell.innerHTML)
            count += parseInt(cell.innerHTML)
        else
            count++
    })

    if (count > 4)
        // Mark entire row red
        row.forEach((cell) => {
            cell.classList.add('row-error')
        })
    else
        // Remove safe cells from error class
        row.forEach((cell) => {
            // Mark safe if cell is error free in all ways
            cell.classList.remove('row-error')
        })    
}

export function checkForColumnError(index) {

    // Check if adding class made it more than 1 per course
    const column = document.querySelectorAll(`td[data-column="${index}"].sel`)
    if (document.querySelectorAll(`td[data-column="${index}"].sel.selected`).length > 1)
        column.forEach((cell) => {
            cell.classList.add('column-error')
        })
    else
        // Remove safe cells from error class
        column.forEach((cell) => {
            cell.classList.remove('column-error')
        })    
}